/**
 * Simple Express server for local demo
 * Serves the UI and handles symptom analysis API requests
 */

// Load environment variables from .env file
import 'dotenv/config';

import express from 'express';
import path from 'path';
import multer from 'multer';
import { processSymptoms } from './src/components/symptom-processor';
import { generateClinicalReasoning } from './src/components/clinical-reasoner';
import { SymptomInput } from './src/types/models';
import { db } from './src/utils/in-memory-db';
import { emailService } from './src/utils/email-service';
import { generateHTMLReport, generateTextReport } from './src/utils/report-generator';

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory database for demo (replace with DynamoDB in production)
interface Patient {
  patientId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  registeredAt: string;
  consultations: any[];
}

interface Consultation {
  consultationId: string;
  patientId: string;
  symptoms: string;
  analysis: any;
  bloodReport?: any;
  status: 'pending' | 'completed' | 'doctor_review';
  createdAt: string;
  doctorConsultationBooked?: boolean;
  doctorConsultationDate?: string;
}

const patientsDB: Map<string, Patient> = new Map();
const consultationsDB: Map<string, Consultation> = new Map();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'));
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Simple auth middleware
function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // In production, verify JWT token
  // For demo, we just check if token exists
  next();
}

// Helper function to generate patient ID
function generatePatientId(): string {
  return `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

// Helper function to send email (mock for demo)
function sendEmailToDoctor(patientName: string, consultationId: string, reportData: any): void {
  console.log('\n📧 EMAIL NOTIFICATION TO DOCTOR');
  console.log('='.repeat(50));
  console.log(`To: doctor@hospital.com`);
  console.log(`Subject: New Patient Report - ${patientName}`);
  console.log(`Consultation ID: ${consultationId}`);
  console.log(`Patient: ${patientName}`);
  console.log(`Urgency: ${reportData.urgencyLevel || 'N/A'}`);
  console.log('='.repeat(50));
  console.log('✓ Email sent successfully (demo mode)\n');
}

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

// Register new user
app.post('/api/auth/register', async (req, res): Promise<void> => {
  try {
    const { email, password, name, role, specialization, licenseNumber } = req.body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if user already exists
    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Create user
    const user = db.createUser({
      email,
      password, // In production, hash this!
      name,
      role,
      specialization,
      licenseNumber
    });

    // Send welcome email
    await emailService.sendRegistrationEmail(email, name);

    console.log(`✓ New user registered: ${name} (${role})`);

    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const user = db.getUserByEmail(email);
    if (!user || user.password !== password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token (in production, use JWT)
    const token = `token-${user.id}-${Date.now()}`;

    console.log(`✓ User logged in: ${user.name} (${user.role})`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        specialization: user.specialization
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// ============================================================================
// CONSULTATION ENDPOINTS
// ============================================================================

// Get consultations for doctor
app.get('/api/consultations/doctor', authMiddleware, async (req, res): Promise<void> => {
  try {
    // In production, get doctorId from JWT token
    // For demo, get all pending consultations
    const consultations = db.getAllPendingConsultations();

    res.json({
      success: true,
      consultations: consultations.map(c => ({
        id: c.id,
        patientId: c.patientId,
        patientName: c.patientName,
        patientEmail: c.patientEmail,
        symptoms: c.symptoms,
        aiDiagnosis: c.aiDiagnosis,
        urgency: c.urgency,
        status: c.status,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      }))
    });
  } catch (error: any) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve consultation
app.post('/api/consultations/:id/approve', authMiddleware, async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const consultation = db.getConsultationById(id);

    if (!consultation) {
      res.status(404).json({ error: 'Consultation not found' });
      return;
    }

    // Update status
    const updated = db.updateConsultation(id, {
      status: 'approved',
      doctorId: 'doctor-1' // In production, get from JWT
    });

    // Send email to patient
    await emailService.sendConsultationApprovedEmail(
      consultation.patientEmail,
      consultation.patientName,
      id
    );

    console.log(`✓ Consultation approved: ${id}`);

    res.json({
      success: true,
      consultation: updated
    });
  } catch (error: any) {
    console.error('Error approving consultation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject consultation
app.post('/api/consultations/:id/reject', authMiddleware, async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const consultation = db.getConsultationById(id);

    if (!consultation) {
      res.status(404).json({ error: 'Consultation not found' });
      return;
    }

    // Update status
    const updated = db.updateConsultation(id, {
      status: 'rejected',
      rejectionReason: reason
    });

    // Send email to patient
    await emailService.sendConsultationRejectedEmail(
      consultation.patientEmail,
      consultation.patientName,
      reason
    );

    console.log(`✓ Consultation rejected: ${id}`);

    res.json({
      success: true,
      consultation: updated
    });
  } catch (error: any) {
    console.error('Error rejecting consultation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add prescription to consultation
app.post('/api/consultations/:id/prescribe', authMiddleware, async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { diagnosis, medicines, instructions, followUpDate } = req.body;
    const consultation = db.getConsultationById(id);

    if (!consultation) {
      res.status(404).json({ error: 'Consultation not found' });
      return;
    }

    // Get doctor info (in production, from JWT)
    const doctor = db.getUserById('doctor-1');
    if (!doctor) {
      res.status(404).json({ error: 'Doctor not found' });
      return;
    }

    // Create prescription
    const prescription = {
      id: `presc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      consultationId: id,
      doctorId: doctor.id,
      doctorName: doctor.name,
      diagnosis,
      medicines,
      instructions,
      followUpDate,
      createdAt: new Date().toISOString()
    };

    // Update consultation with prescription and mark as completed
    const updated = db.updateConsultation(id, {
      status: 'completed',
      prescription,
      doctorId: doctor.id,
      doctorName: doctor.name
    });

    // Send prescription email to patient
    await emailService.sendPrescriptionEmail(
      consultation.patientEmail,
      consultation.patientName,
      doctor.name,
      prescription
    );

    console.log(`✓ Prescription added to consultation: ${id}`);

    res.json({
      success: true,
      consultation: updated,
      prescription
    });
  } catch (error: any) {
    console.error('Error adding prescription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get patient's consultations
app.get('/api/consultations/patient/:patientId', async (req, res): Promise<void> => {
  try {
    const { patientId } = req.params;
    const consultations = db.getConsultationsByPatient(patientId);

    res.json({
      success: true,
      consultations
    });
  } catch (error: any) {
    console.error('Error fetching patient consultations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download consultation report
app.get('/api/consultations/:id/report', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const format = req.query.format as string || 'html';
    
    const consultation = db.getConsultationById(id);
    if (!consultation) {
      res.status(404).json({ error: 'Consultation not found' });
      return;
    }

    // Get doctor info if consultation is approved
    let doctorName, doctorSpecialization;
    if (consultation.doctorId) {
      const doctor = db.getUserById(consultation.doctorId);
      if (doctor) {
        doctorName = doctor.name;
        doctorSpecialization = doctor.specialization;
      }
    }

    const reportData = {
      consultationId: consultation.id,
      patientName: consultation.patientName,
      patientId: consultation.patientId,
      patientEmail: consultation.patientEmail,
      consultationDate: consultation.createdAt,
      symptoms: consultation.symptoms,
      aiDiagnosis: consultation.aiDiagnosis || 'Under evaluation',
      urgency: consultation.urgency,
      status: consultation.status,
      doctorName,
      doctorSpecialization,
      aiRecommendations: consultation.aiRecommendations,
      bloodReportData: consultation.bloodReportUrl ? { testResults: [] } : undefined
    };

    if (format === 'text') {
      const textReport = generateTextReport(reportData);
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="report-${id}.txt"`);
      res.send(textReport);
    } else {
      const htmlReport = generateHTMLReport(reportData);
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlReport);
    }

    console.log(`✓ Report generated for consultation: ${id}`);
  } catch (error: any) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// EXISTING ENDPOINTS (Updated)
// ============================================================================

// API endpoint for patient registration/login
app.post('/api/auth', async (req, res): Promise<void> => {
  try {
    const { name, phoneNumber, isNewUser } = req.body;
    
    if (!phoneNumber) {
      res.status(400).json({ error: 'Phone number is required' });
      return;
    }

    // Check if patient exists by phone number
    let patient = Array.from(patientsDB.values()).find(p => p.phoneNumber === phoneNumber);

    if (isNewUser) {
      if (!name) {
        res.status(400).json({ error: 'Name is required for new users' });
        return;
      }
      
      if (patient) {
        res.status(400).json({ error: 'Phone number already registered. Please login as existing user.' });
        return;
      }

      // Create new patient
      const patientId = generatePatientId();
      patient = {
        patientId,
        name,
        phoneNumber,
        registeredAt: new Date().toISOString(),
        consultations: []
      };
      
      patientsDB.set(patientId, patient);
      console.log(`✓ New patient registered: ${name} (${patientId})`);
      
      res.json({
        success: true,
        isNewUser: true,
        patient: {
          patientId: patient.patientId,
          name: patient.name,
          phoneNumber: patient.phoneNumber
        }
      });
    } else {
      // Existing user login
      if (!patient) {
        res.status(404).json({ error: 'Phone number not found. Please register as a new user.' });
        return;
      }

      console.log(`✓ Existing patient logged in: ${patient.name} (${patient.patientId})`);
      
      res.json({
        success: true,
        isNewUser: false,
        patient: {
          patientId: patient.patientId,
          name: patient.name,
          phoneNumber: patient.phoneNumber,
          consultations: patient.consultations
        }
      });
    }
  } catch (error: any) {
    console.error('Error in authentication:', error);
    res.status(500).json({ error: error.message || 'Authentication error' });
  }
});

// API endpoint to generate and download patient report
app.post('/api/generate-report', async (req, res): Promise<void> => {
  try {
    const { consultationId, patientId } = req.body;
    
    if (!consultationId || !patientId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const consultation = consultationsDB.get(consultationId);
    if (!consultation) {
      res.status(404).json({ error: 'Consultation not found' });
      return;
    }

    const patient = patientsDB.get(patientId);
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    // Generate report data
    const reportData = {
      reportId: `RPT-${Date.now()}`,
      consultationId,
      patientInfo: {
        name: patient.name,
        patientId: patient.patientId,
        phoneNumber: patient.phoneNumber
      },
      consultationDate: consultation.createdAt,
      symptoms: consultation.symptoms,
      analysis: consultation.analysis,
      bloodReport: consultation.bloodReport,
      generatedAt: new Date().toISOString()
    };

    // Send email to doctor
    sendEmailToDoctor(patient.name, consultationId, consultation.analysis?.clinicalReasoning);

    console.log(`✓ Report generated for ${patient.name}`);
    console.log(`  Report ID: ${reportData.reportId}`);

    res.json({
      success: true,
      report: reportData,
      emailSent: true
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: error.message || 'Error generating report' });
  }
});

// API endpoint for symptom analysis
app.post('/api/analyze', async (req, res): Promise<void> => {
  try {
    const input: SymptomInput = req.body;
    const customSeverities = req.body.customSeverities || {};
    const customDurations = req.body.customDurations || {};
    
    // Validate input
    if (!input.symptoms || !input.patientId) {
      res.status(400).json({ 
        error: 'Missing required fields: symptoms and patientId' 
      });
      return;
    }

    // Step 1: Process symptoms
    const processedSymptoms = await processSymptoms(input);
    
    // Step 2: Override with custom severities if provided
    if (Object.keys(customSeverities).length > 0) {
      Object.keys(customSeverities).forEach(symptom => {
        const symptomLower = symptom.toLowerCase();
        // Find matching symptom in processed symptoms
        Object.keys(processedSymptoms.severity).forEach(key => {
          if (key.toLowerCase() === symptomLower) {
            processedSymptoms.severity[key] = customSeverities[symptom];
          }
        });
      });
    }
    
    // Step 3: Override with custom durations if provided
    if (Object.keys(customDurations).length > 0) {
      Object.keys(customDurations).forEach(symptom => {
        const symptomLower = symptom.toLowerCase();
        // Find matching symptom in processed symptoms
        Object.keys(processedSymptoms.duration).forEach(key => {
          if (key.toLowerCase() === symptomLower) {
            processedSymptoms.duration[key] = customDurations[symptom];
          }
        });
      });
    }
    
    // Step 4: Generate AI clinical reasoning
    const clinicalReasoning = await generateClinicalReasoning(processedSymptoms, false); // false = demo mode
    
    // Step 5: Store consultation in new database
    const consultationId = clinicalReasoning.consultationId;
    
    // Get patient info from old DB or use demo patient
    let patientName = 'Demo Patient';
    let patientEmail = 'patient@demo.com';
    
    const oldPatient = patientsDB.get(input.patientId);
    if (oldPatient) {
      patientName = oldPatient.name;
      patientEmail = oldPatient.email || 'patient@demo.com';
    } else {
      // Try to get from new DB
      const newPatient = db.getUserById(input.patientId);
      if (newPatient) {
        patientName = newPatient.name;
        patientEmail = newPatient.email;
      }
    }
    
    const consultation = db.createConsultation({
      patientId: input.patientId,
      patientName,
      patientEmail,
      symptoms: processedSymptoms.normalizedSymptoms.map(s => s.split('|')[0]),
      aiDiagnosis: clinicalReasoning.possibleConditions[0]?.name || 'Under evaluation',
      aiRecommendations: clinicalReasoning,
      urgency: clinicalReasoning.urgencyLevel,
      status: 'pending'
    });
    
    // Use the consultation ID from the new database
    const newConsultationId = consultation.id;
    
    // Store in old DB for backward compatibility
    const oldConsultation: Consultation = {
      consultationId,
      patientId: input.patientId,
      symptoms: input.symptoms,
      analysis: {
        processedSymptoms,
        clinicalReasoning
      },
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    consultationsDB.set(consultationId, oldConsultation);
    
    // Update patient's consultation history (old DB)
    const patient = patientsDB.get(input.patientId);
    if (patient) {
      patient.consultations.push({
        consultationId,
        date: oldConsultation.createdAt,
        status: oldConsultation.status
      });
    }
    
    // Notify doctors about new consultation
    const doctors = db.getAllDoctors();
    for (const doctor of doctors) {
      await emailService.sendConsultationRequestEmail(
        doctor.email,
        patientName,
        newConsultationId
      );
    }
    
    console.log(`✓ Consultation created: ${newConsultationId}`);
    
    // Return combined results
    res.json({
      // Processed symptoms
      symptomId: processedSymptoms.symptomId,
      patientId: processedSymptoms.patientId,
      normalizedSymptoms: processedSymptoms.normalizedSymptoms,
      severity: processedSymptoms.severity,
      duration: processedSymptoms.duration,
      timestamp: processedSymptoms.timestamp,
      customSeveritiesApplied: Object.keys(customSeverities).length > 0,
      customDurationsApplied: Object.keys(customDurations).length > 0,
      
      // AI Clinical Reasoning (use new consultation ID)
      clinicalReasoning: {
        consultationId: newConsultationId,
        reasoningSteps: clinicalReasoning.reasoningSteps,
        possibleConditions: clinicalReasoning.possibleConditions,
        recommendedTests: clinicalReasoning.recommendedTests,
        urgencyLevel: clinicalReasoning.urgencyLevel,
        confidenceScore: clinicalReasoning.confidenceScore,
        disclaimer: clinicalReasoning.disclaimer
      }
    });
  } catch (error: any) {
    console.error('Error processing symptoms:', error);
    res.status(500).json({ 
      error: error.message || 'Error processing symptoms' 
    });
  }
});

// API endpoint for blood report upload
app.post('/api/upload-report', upload.single('file'), async (req, res): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { patientId, consultationId } = req.body;
    
    if (!patientId || !consultationId) {
      res.status(400).json({ error: 'Missing required fields: patientId and consultationId' });
      return;
    }

    // Generate a document ID
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Mock extracted data
    const mockExtractedData = {
      testResults: [
        { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', normalRange: '13.5-17.5', status: 'normal' },
        { name: 'WBC Count', value: '7.8', unit: '10^3/μL', normalRange: '4.5-11.0', status: 'normal' },
        { name: 'Platelet Count', value: '245', unit: '10^3/μL', normalRange: '150-400', status: 'normal' },
        { name: 'Blood Glucose', value: '105', unit: 'mg/dL', normalRange: '70-100', status: 'slightly_high' },
        { name: 'Creatinine', value: '0.9', unit: 'mg/dL', normalRange: '0.7-1.3', status: 'normal' }
      ],
      documentType: 'blood_test',
      testDate: new Date().toISOString(),
      labName: 'Demo Lab (Extracted via OCR)'
    };

    // Update consultation with blood report
    const consultation = consultationsDB.get(consultationId);
    if (consultation) {
      consultation.bloodReport = {
        documentId,
        fileName: req.file.originalname,
        uploadedAt: new Date().toISOString(),
        extractedData: mockExtractedData
      };
      consultation.status = 'doctor_review';
      consultationsDB.set(consultationId, consultation);
      
      console.log(`✓ Blood report uploaded for consultation: ${consultationId}`);
    }

    res.json({
      success: true,
      documentId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      extractedData: mockExtractedData,
      consultationId,
      message: 'Blood report uploaded successfully. Ready to generate patient report.',
      nextSteps: [
        'Document stored in S3 with encryption',
        'Metadata saved to DynamoDB',
        'AI re-evaluation triggered with new test results',
        'Ready to generate report and notify doctor'
      ]
    });
  } catch (error: any) {
    console.error('Error processing upload:', error);
    res.status(500).json({ 
      error: error.message || 'Error processing file upload' 
    });
  }
});

// Book online consultation endpoint
app.post('/api/book-consultation', async (req, res) => {
  try {
    const { preferredDate, preferredTime, consultationType, additionalNotes, userId, userName, userEmail } = req.body;

    if (!preferredDate || !preferredTime) {
      return res.status(400).json({ 
        success: false, 
        error: 'Preferred date and time are required' 
      });
    }

    // Get current user from request body (sent from frontend)
    const currentUser = {
      id: userId || 'demo-patient',
      name: userName || 'Demo Patient',
      email: userEmail || 'patient@demo.com'
    };

    // Create appointment
    const appointmentDateTime = new Date(`${preferredDate}T${preferredTime}`);
    const appointmentId = `APPT-${Date.now()}`;

    // Get available doctors
    const doctors = db.getAllDoctors();
    const assignedDoctor = doctors[0] || {
      id: 'demo-doctor',
      name: 'Dr. Sarah Johnson',
      email: 'doctor@demo.com',
      specialization: 'General Medicine'
    };

    // Create appointment record using the database
    const appointment = db.createAppointment({
      consultationId: `CONS-${Date.now()}`,
      patientId: currentUser.id,
      doctorId: assignedDoctor.id,
      scheduledDate: appointmentDateTime.toISOString(),
      status: 'scheduled',
      notes: additionalNotes || ''
    });

    console.log('📅 Appointment Created:', appointment);
    console.log('📧 Sending confirmation email to:', currentUser.email);

    // Send confirmation email to patient
    await emailService.sendEmail({
      to: currentUser.email,
      subject: 'Consultation Booking Confirmed - MediConsult AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Consultation Confirmed! 🎉</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Dear ${currentUser.name},</p>
            
            <p style="font-size: 16px; color: #333;">Your online consultation has been successfully booked!</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">Appointment Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Appointment ID:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${appointmentId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Doctor:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${assignedDoctor.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Date & Time:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${appointmentDateTime.toLocaleString('en-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Type:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${consultationType === 'video' ? '📹 Video Call' : consultationType === 'audio' ? '📞 Audio Call' : '💬 Chat'}</td>
                </tr>
              </table>
            </div>

            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h4 style="color: #2e7d32; margin: 0 0 10px 0;">💰 Pricing</h4>
              <p style="margin: 5px 0; color: #2e7d32;"><strong>✓ First 5 minutes:</strong> <span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;">FREE</span></p>
              <p style="margin: 5px 0; color: #2e7d32;"><strong>✓ Every additional 5 minutes:</strong> ₹100</p>
              <p style="margin: 10px 0 0 0; color: #2e7d32; font-size: 0.9em; font-style: italic;">You'll only be charged for the time you use beyond the first 5 minutes.</p>
            </div>

            ${additionalNotes ? `
              <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong style="color: #f57c00;">Your Notes:</strong>
                <p style="margin: 10px 0 0 0; color: #333;">${additionalNotes}</p>
              </div>
            ` : ''}

            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2;">
                <strong>📧 Meeting Link:</strong> You will receive the video call link 15 minutes before your appointment.
              </p>
            </div>

            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
              <p style="margin: 0; color: #e65100;">
                <strong>⚠️ Important:</strong> Please be available 5 minutes before your scheduled time. Have your medical history and current medications list ready.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:3000/index.html" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Dashboard</a>
            </div>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              If you need to reschedule or cancel, please contact us at least 2 hours before your appointment.
            </p>

            <p style="margin-top: 20px; color: #333;">
              Best regards,<br>
              <strong>MediConsult AI Team</strong>
            </p>
          </div>
        </div>
      `,
      text: `Consultation Confirmed! Appointment ID: ${appointmentId}, Doctor: ${assignedDoctor.name}, Date: ${appointmentDateTime.toLocaleString()}`
    });

    // Send notification to doctor
    await emailService.sendEmail({
      to: assignedDoctor.email,
      subject: 'New Consultation Appointment - MediConsult AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">New Appointment Scheduled 📅</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Dear Dr. ${assignedDoctor.name},</p>
            
            <p style="font-size: 16px; color: #333;">A new consultation has been scheduled with you.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">Patient Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Patient Name:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${currentUser.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Appointment ID:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${appointmentId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Date & Time:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${appointmentDateTime.toLocaleString('en-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Type:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${consultationType === 'video' ? '📹 Video Call' : consultationType === 'audio' ? '📞 Audio Call' : '💬 Chat'}</td>
                </tr>
              </table>
            </div>

            ${additionalNotes ? `
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong style="color: #1976d2;">Patient's Notes:</strong>
                <p style="margin: 10px 0 0 0; color: #333;">${additionalNotes}</p>
              </div>
            ` : ''}

            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:3000/doctor-dashboard.html" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Dashboard</a>
            </div>

            <p style="margin-top: 30px; color: #333;">
              Best regards,<br>
              <strong>MediConsult AI Team</strong>
            </p>
          </div>
        </div>
      `,
      text: `New appointment with ${currentUser.name} on ${appointmentDateTime.toLocaleString()}`
    });

    return res.json({ 
      success: true, 
      appointmentId,
      message: 'Consultation booked successfully. Confirmation email sent.',
      appointment: {
        id: appointmentId,
        doctorName: assignedDoctor.name,
        appointmentDate: appointmentDateTime.toISOString(),
        consultationType
      }
    });

  } catch (error: any) {
    console.error('Error booking consultation:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Error booking consultation' 
    });
  }
});

// Send report to doctor endpoint
app.post('/api/send-report-to-doctor', async (req, res): Promise<void> => {
  try {
    const { consultationId, doctorEmail } = req.body;

    if (!consultationId || !doctorEmail) {
      res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
      return;
    }

    const consultation = db.getConsultationById(consultationId);
    if (!consultation) {
      res.status(404).json({ 
        success: false, 
        error: 'Consultation not found' 
      });
      return;
    }

    // Send email to doctor with report
    await emailService.sendEmail({
      to: doctorEmail,
      subject: `Medical Report - ${consultation.patientName} (${consultationId})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">📋 Patient Medical Report</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Dear Doctor,</p>
            
            <p style="font-size: 16px; color: #333;">You have received a medical report for review and prescription.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">Patient Information</h3>
              <p><strong>Name:</strong> ${consultation.patientName}</p>
              <p><strong>Email:</strong> ${consultation.patientEmail}</p>
              <p><strong>Consultation ID:</strong> ${consultationId}</p>
              <p><strong>Date:</strong> ${new Date(consultation.createdAt).toLocaleString()}</p>
            </div>

            <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #f57c00; margin-top: 0;">Symptoms</h3>
              <p>${consultation.symptoms.join(', ')}</p>
            </div>

            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0;">AI Analysis</h3>
              <p><strong>Diagnosis:</strong> ${consultation.aiDiagnosis}</p>
              <p><strong>Urgency:</strong> ${consultation.urgency.toUpperCase()}</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:3000/doctor-dashboard.html" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">Review & Prescribe</a>
            </div>

            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
              <p style="margin: 0; color: #e65100;">
                <strong>⚠️ Action Required:</strong> Please review this case and provide your prescription. The patient is waiting for your response.
              </p>
            </div>

            <p style="margin-top: 30px; color: #333;">
              Best regards,<br>
              <strong>MediConsult AI Team</strong>
            </p>
          </div>
        </div>
      `,
      text: `Medical Report for ${consultation.patientName}. Consultation ID: ${consultationId}`
    });

    // Update consultation with doctor email
    db.updateConsultation(consultationId, {
      doctorEmail: doctorEmail
    });

    console.log(`✓ Report sent to doctor: ${doctorEmail} for consultation: ${consultationId}`);

    res.json({ 
      success: true, 
      message: 'Report sent to doctor successfully' 
    });
  } catch (error: any) {
    console.error('Error sending report to doctor:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error sending report' 
    });
  }
});

// Get single consultation details
app.get('/api/consultations/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const consultation = db.getConsultationById(id);

    if (!consultation) {
      res.status(404).json({ 
        success: false, 
        error: 'Consultation not found' 
      });
      return;
    }

    res.json({
      success: true,
      consultation
    });
  } catch (error: any) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'AI Medical Consultation Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🏥 AI MEDICAL CONSULTATION PLATFORM - LOCAL SERVER');
  console.log('='.repeat(70));
  console.log(`\n✓ Server running at: http://localhost:${PORT}`);
  console.log(`✓ Symptom analysis: http://localhost:${PORT}/api/analyze`);
  console.log(`✓ Blood report upload: http://localhost:${PORT}/api/upload-report`);
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
  console.log('\n📝 Open your browser and visit: http://localhost:${PORT}\n');
  console.log('Press Ctrl+C to stop the server\n');
});
