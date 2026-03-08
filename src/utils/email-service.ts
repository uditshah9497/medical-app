// Mock email service for demo
// In production, integrate with AWS SES or similar service

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

class EmailService {
    private emailLog: Array<{ timestamp: string; email: EmailOptions }> = [];

    async sendEmail(options: EmailOptions): Promise<boolean> {
        // Mock email sending - log to console and store in memory
        console.log('\n📧 EMAIL SENT:');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Body:', options.text || options.html);
        console.log('---\n');

        this.emailLog.push({
            timestamp: new Date().toISOString(),
            email: options
        });

        return true;
    }

    async sendRegistrationEmail(email: string, name: string): Promise<boolean> {
        return this.sendEmail({
            to: email,
            subject: 'Welcome to MediConsult AI',
            html: `
                <h2>Welcome ${name}!</h2>
                <p>Thank you for registering with MediConsult AI.</p>
                <p>You can now access our intelligent medical consultation platform.</p>
                <p>Best regards,<br>MediConsult AI Team</p>
            `,
            text: `Welcome ${name}! Thank you for registering with MediConsult AI.`
        });
    }

    async sendConsultationRequestEmail(doctorEmail: string, patientName: string, consultationId: string): Promise<boolean> {
        return this.sendEmail({
            to: doctorEmail,
            subject: 'New Consultation Request',
            html: `
                <h2>New Consultation Request</h2>
                <p>Patient: ${patientName}</p>
                <p>Consultation ID: ${consultationId}</p>
                <p>Please review the consultation request in your dashboard.</p>
                <p><a href="http://localhost:3000/doctor-dashboard.html">View Dashboard</a></p>
            `,
            text: `New consultation request from ${patientName}. ID: ${consultationId}`
        });
    }

    async sendConsultationApprovedEmail(patientEmail: string, patientName: string, consultationId: string): Promise<boolean> {
        return this.sendEmail({
            to: patientEmail,
            subject: 'Consultation Approved',
            html: `
                <h2>Your Consultation Has Been Approved</h2>
                <p>Dear ${patientName},</p>
                <p>Your consultation request (ID: ${consultationId}) has been approved by our doctor.</p>
                <p>You can now view the detailed report and recommendations.</p>
                <p><a href="http://localhost:3000/index.html">View Report</a></p>
                <p>Best regards,<br>MediConsult AI Team</p>
            `,
            text: `Your consultation ${consultationId} has been approved.`
        });
    }

    async sendConsultationRejectedEmail(patientEmail: string, patientName: string, reason: string): Promise<boolean> {
        return this.sendEmail({
            to: patientEmail,
            subject: 'Consultation Update',
            html: `
                <h2>Consultation Update</h2>
                <p>Dear ${patientName},</p>
                <p>Your consultation request requires additional information.</p>
                <p><strong>Doctor's Note:</strong> ${reason}</p>
                <p>Please contact us for further assistance.</p>
                <p>Best regards,<br>MediConsult AI Team</p>
            `,
            text: `Consultation update: ${reason}`
        });
    }

    async sendAppointmentConfirmationEmail(
        patientEmail: string,
        patientName: string,
        doctorName: string,
        appointmentDate: string
    ): Promise<boolean> {
        return this.sendEmail({
            to: patientEmail,
            subject: 'Appointment Confirmed',
            html: `
                <h2>Appointment Confirmed</h2>
                <p>Dear ${patientName},</p>
                <p>Your appointment has been scheduled:</p>
                <ul>
                    <li><strong>Doctor:</strong> ${doctorName}</li>
                    <li><strong>Date & Time:</strong> ${new Date(appointmentDate).toLocaleString()}</li>
                </ul>
                <p>Please arrive 10 minutes early.</p>
                <p>Best regards,<br>MediConsult AI Team</p>
            `,
            text: `Appointment confirmed with ${doctorName} on ${appointmentDate}`
        });
    }

    async sendPrescriptionEmail(
        patientEmail: string,
        patientName: string,
        doctorName: string,
        prescription: any
    ): Promise<boolean> {
        const medicineList = prescription.medicines.map((med: any) => 
            `<li><strong>${med.name}</strong> ${med.genericName ? `(${med.genericName})` : ''} - ${med.dosage}, ${med.frequency} for ${med.duration}</li>`
        ).join('');

        return this.sendEmail({
            to: patientEmail,
            subject: 'Prescription from Dr. ' + doctorName,
            html: `
                <h2>Your Prescription</h2>
                <p>Dear ${patientName},</p>
                <p>Dr. ${doctorName} has reviewed your case and prescribed the following:</p>
                
                <h3>Diagnosis:</h3>
                <p>${prescription.diagnosis}</p>
                
                <h3>Prescribed Medicines:</h3>
                <ul>${medicineList}</ul>
                
                <h3>Instructions:</h3>
                <p>${prescription.instructions}</p>
                
                ${prescription.followUpDate ? `<p><strong>Follow-up Date:</strong> ${new Date(prescription.followUpDate).toLocaleDateString()}</p>` : ''}
                
                <p style="margin-top: 20px; padding: 15px; background: #fff3e0; border-left: 4px solid #ff9800;">
                    <strong>Important:</strong> Take medicines as prescribed. Do not stop or change dosage without consulting your doctor.
                </p>
                
                <p>Best regards,<br>MediConsult AI Team</p>
            `,
            text: `Prescription from Dr. ${doctorName}. Diagnosis: ${prescription.diagnosis}`
        });
    }

    async sendDoctorNotificationEmail(
        doctorEmail: string,
        patientName: string,
        consultationId: string,
        hasBloodReport: boolean
    ): Promise<boolean> {
        return this.sendEmail({
            to: doctorEmail,
            subject: 'New Patient Case - Action Required',
            html: `
                <h2>New Patient Case Requires Your Review</h2>
                <p><strong>Patient:</strong> ${patientName}</p>
                <p><strong>Consultation ID:</strong> ${consultationId}</p>
                <p><strong>Blood Report:</strong> ${hasBloodReport ? '✓ Uploaded' : '✗ Not uploaded'}</p>
                
                <p>Please review the patient's symptoms and ${hasBloodReport ? 'blood test results' : 'AI recommendations'} to provide your diagnosis and prescription.</p>
                
                <p><a href="http://localhost:3000/doctor-dashboard.html" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px;">View Dashboard</a></p>
                
                <p>Best regards,<br>MediConsult AI Team</p>
            `,
            text: `New patient case from ${patientName}. ID: ${consultationId}`
        });
    }

    getEmailLog() {
        return this.emailLog;
    }
}

export const emailService = new EmailService();
