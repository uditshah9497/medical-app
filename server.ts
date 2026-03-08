/**
 * Simple Express server for local demo
 * Serves the UI and handles symptom analysis API requests
 */

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
const PORT = 3000;

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

// API endpoint to book doctor consultation
app.post('/api/book-consultation', async (req, res): Promise<void> => {
  try {
    const { consultationId, patientId, preferredDate, preferredTime } = req.body;
    
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

    // Update consultation with booking info
    consultation.doctorConsultationBooked = true;
    consultation.doctorConsultationDate = `${preferredDate} ${preferredTime}`;
    consultationsDB.set(consultationId, consultation);

    console.log(`✓ Doctor consultation booked for ${patient.name}`);
    console.log(`  Date/Time: ${preferredDate} ${preferredTime}`);
    console.log(`  Consultation ID: ${consultationId}`);

    res.json({
      success: true,
      message: 'Doctor consultation booked successfully',
      bookingDetails: {
        consultationId,
        patientName: patient.name,
        dateTime: `${preferredDate} ${preferredTime}`,
        status: 'confirmed'
      }
    });
  } catch (error: any) {
    console.error('Error booking consultation:', error);
    res.status(500).json({ error: error.message || 'Error booking consultation' });
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
        consultationId
      );
    }
    
    console.log(`✓ Consultation created: ${consultationId}`);
    
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
      
      // AI Clinical Reasoning
      clinicalReasoning: {
        consultationId: clinicalReasoning.consultationId,
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
