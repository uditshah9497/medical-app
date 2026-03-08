// In-memory database for demo purposes
// Can be replaced with DynamoDB in production

export interface User {
    id: string;
    email: string;
    password: string; // In production, this should be hashed
    name: string;
    role: 'patient' | 'doctor' | 'admin';
    specialization?: string;
    licenseNumber?: string;
    createdAt: string;
}

export interface Consultation {
    id: string;
    patientId: string;
    patientName: string;
    patientEmail: string;
    doctorId?: string;
    doctorName?: string;
    doctorEmail?: string;
    symptoms: string[];
    aiDiagnosis?: string;
    aiRecommendations?: any;
    urgency: 'low' | 'medium' | 'high' | 'emergency';
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    createdAt: string;
    updatedAt: string;
    rejectionReason?: string;
    bloodReportUrl?: string;
    bloodReportData?: any;
    prescription?: Prescription;
}

export interface Prescription {
    id: string;
    consultationId: string;
    doctorId: string;
    doctorName: string;
    diagnosis: string;
    medicines: Medicine[];
    instructions: string;
    followUpDate?: string;
    createdAt: string;
}

export interface Medicine {
    name: string;
    genericName?: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    estimatedCost?: string;
}

export interface Appointment {
    id: string;
    consultationId: string;
    patientId: string;
    doctorId: string;
    scheduledDate: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
    createdAt: string;
}

class InMemoryDatabase {
    private users: Map<string, User> = new Map();
    private consultations: Map<string, Consultation> = new Map();
    private appointments: Map<string, Appointment> = new Map();
    private emailToUserId: Map<string, string> = new Map();

    constructor() {
        this.seedDemoData();
    }

    private seedDemoData() {
        // Demo patient 1
        const patient1: User = {
            id: 'patient-1',
            email: 'patient@demo.com',
            password: 'password123',
            name: 'John Doe',
            role: 'patient',
            createdAt: new Date().toISOString()
        };
        this.users.set(patient1.id, patient1);
        this.emailToUserId.set(patient1.email, patient1.id);

        // Demo patient 2
        const patient2: User = {
            id: 'patient-2',
            email: 'jane.smith@demo.com',
            password: 'password123',
            name: 'Jane Smith',
            role: 'patient',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        this.users.set(patient2.id, patient2);
        this.emailToUserId.set(patient2.email, patient2.id);

        // Demo patient 3
        const patient3: User = {
            id: 'patient-3',
            email: 'robert.johnson@demo.com',
            password: 'password123',
            name: 'Robert Johnson',
            role: 'patient',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        };
        this.users.set(patient3.id, patient3);
        this.emailToUserId.set(patient3.email, patient3.id);

        // Demo doctor 1
        const doctor1: User = {
            id: 'doctor-1',
            email: 'doctor@demo.com',
            password: 'password123',
            name: 'Dr. Sarah Smith',
            role: 'doctor',
            specialization: 'General Physician',
            licenseNumber: 'MED-12345',
            createdAt: new Date().toISOString()
        };
        this.users.set(doctor1.id, doctor1);
        this.emailToUserId.set(doctor1.email, doctor1.id);

        // Demo doctor 2
        const doctor2: User = {
            id: 'doctor-2',
            email: 'dr.patel@demo.com',
            password: 'password123',
            name: 'Dr. Rajesh Patel',
            role: 'doctor',
            specialization: 'Cardiologist',
            licenseNumber: 'MED-67890',
            createdAt: new Date().toISOString()
        };
        this.users.set(doctor2.id, doctor2);
        this.emailToUserId.set(doctor2.email, doctor2.id);

        // Demo doctor 3
        const doctor3: User = {
            id: 'doctor-3',
            email: 'dr.williams@demo.com',
            password: 'password123',
            name: 'Dr. Emily Williams',
            role: 'doctor',
            specialization: 'Neurologist',
            licenseNumber: 'MED-11223',
            createdAt: new Date().toISOString()
        };
        this.users.set(doctor3.id, doctor3);
        this.emailToUserId.set(doctor3.email, doctor3.id);

        // Create some demo consultations
        const consultation1: Consultation = {
            id: 'consult-demo-1',
            patientId: patient2.id,
            patientName: patient2.name,
            patientEmail: patient2.email,
            symptoms: ['headache', 'fever', 'fatigue'],
            aiDiagnosis: 'Viral Infection (Upper Respiratory)',
            urgency: 'medium',
            status: 'pending',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        };
        this.consultations.set(consultation1.id, consultation1);

        const consultation2: Consultation = {
            id: 'consult-demo-2',
            patientId: patient3.id,
            patientName: patient3.name,
            patientEmail: patient3.email,
            symptoms: ['chest pain', 'shortness of breath'],
            aiDiagnosis: 'Possible Cardiac Issue - Requires Immediate Attention',
            urgency: 'high',
            status: 'pending',
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
            updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        };
        this.consultations.set(consultation2.id, consultation2);

        const consultation3: Consultation = {
            id: 'consult-demo-3',
            patientId: patient1.id,
            patientName: patient1.name,
            patientEmail: patient1.email,
            symptoms: ['cough', 'sore throat'],
            aiDiagnosis: 'Common Cold',
            urgency: 'low',
            status: 'approved',
            doctorId: doctor1.id,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
        };
        this.consultations.set(consultation3.id, consultation3);

        const consultation4: Consultation = {
            id: 'consult-demo-4',
            patientId: patient2.id,
            patientName: patient2.name,
            patientEmail: patient2.email,
            symptoms: ['nausea', 'vomiting', 'abdominal pain'],
            aiDiagnosis: 'Gastroenteritis',
            urgency: 'medium',
            status: 'pending',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
            updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        };
        this.consultations.set(consultation4.id, consultation4);

        const consultation5: Consultation = {
            id: 'consult-demo-5',
            patientId: patient3.id,
            patientName: patient3.name,
            patientEmail: patient3.email,
            symptoms: ['back pain', 'muscle pain'],
            aiDiagnosis: 'Musculoskeletal Pain',
            urgency: 'low',
            status: 'approved',
            doctorId: doctor1.id,
            createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
            updatedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() // 1.5 days ago
        };
        this.consultations.set(consultation5.id, consultation5);

        // Create demo appointments
        const appointment1: Appointment = {
            id: 'appt-demo-1',
            consultationId: consultation3.id,
            patientId: patient1.id,
            doctorId: doctor1.id,
            scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
            status: 'scheduled',
            notes: 'Follow-up consultation for cold symptoms',
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        };
        this.appointments.set(appointment1.id, appointment1);

        const appointment2: Appointment = {
            id: 'appt-demo-2',
            consultationId: consultation5.id,
            patientId: patient3.id,
            doctorId: doctor1.id,
            scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
            status: 'scheduled',
            notes: 'Physical therapy consultation',
            createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
        };
        this.appointments.set(appointment2.id, appointment2);

        console.log('✓ Demo database seeded with:');
        console.log(`  - ${this.users.size} users (3 patients, 3 doctors)`);
        console.log(`  - ${this.consultations.size} consultations`);
        console.log(`  - ${this.appointments.size} appointments`);
    }

    // User operations
    createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
        const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const user: User = {
            ...userData,
            id,
            createdAt: new Date().toISOString()
        };
        
        this.users.set(id, user);
        this.emailToUserId.set(user.email, id);
        return user;
    }

    getUserByEmail(email: string): User | undefined {
        const userId = this.emailToUserId.get(email);
        return userId ? this.users.get(userId) : undefined;
    }

    getUserById(id: string): User | undefined {
        return this.users.get(id);
    }

    getAllDoctors(): User[] {
        return Array.from(this.users.values()).filter(u => u.role === 'doctor');
    }

    // Consultation operations
    createConsultation(data: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>): Consultation {
        const id = `consult-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const consultation: Consultation = {
            ...data,
            id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.consultations.set(id, consultation);
        return consultation;
    }

    getConsultationById(id: string): Consultation | undefined {
        return this.consultations.get(id);
    }

    getConsultationsByPatient(patientId: string): Consultation[] {
        return Array.from(this.consultations.values())
            .filter(c => c.patientId === patientId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    getConsultationsByDoctor(doctorId: string): Consultation[] {
        return Array.from(this.consultations.values())
            .filter(c => c.doctorId === doctorId || c.status === 'pending')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    getAllPendingConsultations(): Consultation[] {
        return Array.from(this.consultations.values())
            .filter(c => c.status === 'pending')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    updateConsultation(id: string, updates: Partial<Consultation>): Consultation | undefined {
        const consultation = this.consultations.get(id);
        if (!consultation) return undefined;

        const updated = {
            ...consultation,
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        this.consultations.set(id, updated);
        return updated;
    }

    // Appointment operations
    createAppointment(data: Omit<Appointment, 'id' | 'createdAt'>): Appointment {
        const id = `appt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const appointment: Appointment = {
            ...data,
            id,
            createdAt: new Date().toISOString()
        };
        
        this.appointments.set(id, appointment);
        return appointment;
    }

    getAppointmentsByPatient(patientId: string): Appointment[] {
        return Array.from(this.appointments.values())
            .filter(a => a.patientId === patientId)
            .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
    }

    getAppointmentsByDoctor(doctorId: string): Appointment[] {
        return Array.from(this.appointments.values())
            .filter(a => a.doctorId === doctorId)
            .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
    }

    // Statistics
    getStats() {
        return {
            totalUsers: this.users.size,
            totalPatients: Array.from(this.users.values()).filter(u => u.role === 'patient').length,
            totalDoctors: Array.from(this.users.values()).filter(u => u.role === 'doctor').length,
            totalConsultations: this.consultations.size,
            pendingConsultations: Array.from(this.consultations.values()).filter(c => c.status === 'pending').length,
            totalAppointments: this.appointments.size
        };
    }
}

// Singleton instance
export const db = new InMemoryDatabase();
