/**
 * Core data models for AI Medical Consultation Platform
 * These types define the structure of data stored in DynamoDB and S3
 */

// ============================================================================
// Patient Models
// ============================================================================

export interface Surgery {
  name: string;
  date: Date;
  notes?: string;
}

export interface MedicalHistory {
  chronicConditions: string[];
  pastSurgeries: Surgery[];
  familyHistory: string[];
}

export interface Patient {
  patientId: string; // Primary Key
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  gender: string;
  medicalHistory: MedicalHistory;
  allergies: string[];
  currentMedications: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Symptom Models
// ============================================================================

export interface SymptomInput {
  patientId: string;
  symptoms: string;
  inputType: 'text' | 'voice';
  timestamp: Date;
  language?: string;
}

export interface ProcessedSymptom {
  symptomId: string;
  patientId: string;
  normalizedSymptoms: string[];
  severity: Record<string, number>;
  duration: Record<string, string>;
  timestamp: Date;
}

export interface SymptomLog {
  logId: string; // Primary Key
  consultationId: string; // Sort Key
  patientId: string;
  symptoms: string[];
  severity: Record<string, number>;
  notes: string;
  logType: 'initial' | 'daily_update' | 'follow_up';
  timestamp: Date;
}

// ============================================================================
// Clinical Reasoning Models
// ============================================================================

export interface MedicalSource {
  title: string;
  source: string;
  url?: string;
  publicationDate?: Date;
}

export interface ReasoningStep {
  stepNumber: number;
  observation: string;
  inference: string;
  confidence: number;
  sources: MedicalSource[];
}

export interface ClinicalReasoning {
  reasoningId: string;
  patientId: string;
  steps: ReasoningStep[];
  overallConfidence: number;
  timestamp: Date;
  modelUsed: string;
}

export interface ClinicalReasoningRequest {
  patientId: string;
  symptoms: ProcessedSymptom[];
  patientHistory?: Patient;
  previousReasoningId?: string;
}

// ============================================================================
// Condition Ranking Models
// ============================================================================

export interface Evidence {
  type: 'symptom' | 'test_result' | 'patient_history';
  description: string;
  weight: number;
  source: string;
}

export interface Condition {
  conditionId: string;
  name: string;
  icdCode: string;
  probability: number;
  supportingEvidence: Evidence[];
  contradictingEvidence: Evidence[];
}

export interface RankedConditions {
  consultationId: string;
  conditions: Condition[];
  timestamp: Date;
  reasoningId: string;
}

// ============================================================================
// Test Recommendation Models
// ============================================================================

export interface BloodTest {
  testId: string;
  name: string;
  loincCode: string;
  purpose: string;
  estimatedCost: number;
  urgency: 'routine' | 'urgent' | 'stat';
}

export interface TestRecommendation {
  recommendationId: string;
  consultationId: string;
  tests: BloodTest[];
  rationale: string;
  priorityOrder: number[];
  estimatedTotalCost: number;
  doctorApprovalStatus: 'pending' | 'approved' | 'modified' | 'rejected';
}

// ============================================================================
// Document Models
// ============================================================================

export interface DocumentUpload {
  patientId: string;
  consultationId: string;
  documentType: 'blood_report' | 'imaging' | 'prescription';
  file: Buffer;
  mimeType: string;
}

export interface ExtractedTestResult {
  testName: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  abnormalFlag?: 'high' | 'low' | 'critical';
}

export interface ProcessedDocument {
  documentId: string;
  s3Key: string;
  extractedData: ExtractedTestResult[];
  extractionConfidence: number;
  requiresManualReview: boolean;
  timestamp: Date;
}

export interface DocumentMetadata {
  documentId: string; // Primary Key
  consultationId: string;
  patientId: string;
  s3Bucket: string;
  s3Key: string;
  documentType: string;
  uploadedAt: Date;
  extractedData: ExtractedTestResult[];
  extractionConfidence: number;
  reviewedBy?: string;
  reviewedAt?: Date;
}

// ============================================================================
// Consultation Models
// ============================================================================

export interface Prescription {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface DoctorDecision {
  consultationId: string;
  doctorId: string;
  decision: 'approve' | 'modify' | 'reject';
  modifications?: string;
  prescription?: Prescription;
  notes: string;
  timestamp: Date;
}

export interface Consultation {
  consultationId: string; // Primary Key
  patientId: string; // Sort Key
  status: 'active' | 'pending_doctor' | 'completed' | 'cancelled';
  symptoms: ProcessedSymptom[];
  reasoningHistory: ClinicalReasoning[];
  conditionRankings: RankedConditions[];
  testRecommendations: TestRecommendation[];
  testResults: ProcessedDocument[];
  doctorReview?: DoctorDecision;
  prescription?: Prescription;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// ============================================================================
// Re-Evaluation Models
// ============================================================================

export interface ReEvaluationTrigger {
  consultationId: string;
  triggerType: 'new_symptoms' | 'test_results' | 'daily_update';
  newData: ProcessedSymptom | ProcessedDocument;
}

export interface ReEvaluationResult {
  consultationId: string;
  previousReasoning: ClinicalReasoning;
  updatedReasoning: ClinicalReasoning;
  changesExplanation: string;
  significantChange: boolean;
  notifyDoctor: boolean;
  timestamp: Date;
}

// ============================================================================
// Medicine Recommendation Models
// ============================================================================

export interface PharmacyAvailability {
  pharmacyName: string;
  price: number;
  inStock: boolean;
  orderUrl: string;
}

export interface GenericAlternative {
  genericName: string;
  brandEquivalent: string;
  costSavings: number;
  availability: PharmacyAvailability[];
  therapeuticEquivalence: string;
}

export interface MedicineRecommendation {
  prescriptionId: string;
  originalPrescription: Prescription;
  genericAlternatives: GenericAlternative[];
  pharmacyLinks: string[];
}

// ============================================================================
// Doctor Review Models
// ============================================================================

export interface PatientSummary {
  patientId: string;
  name: string;
  age: number;
  gender: string;
  relevantHistory: string[];
}

export interface ConsultationReview {
  consultationId: string;
  patient: PatientSummary;
  symptoms: ProcessedSymptom[];
  clinicalReasoning: ClinicalReasoning;
  rankedConditions: RankedConditions;
  testRecommendations: TestRecommendation;
  testResults?: ProcessedDocument[];
  aiConfidence: number;
}

// ============================================================================
// RAG Knowledge Base Models
// ============================================================================

export interface MedicalKnowledgeEntry {
  entryId: string;
  title: string;
  content: string;
  source: string;
  publicationDate: Date;
  embedding: number[];
  metadata: {
    specialty: string;
    evidenceLevel: string;
    keywords: string[];
  };
}

// ============================================================================
// Validation Result Models
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
