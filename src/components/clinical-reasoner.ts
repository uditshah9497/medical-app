/**
 * AI Clinical Reasoner Component
 * Uses Amazon Bedrock to provide AI-powered clinical reasoning
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

import { ProcessedSymptom } from '../types/models';

/**
 * Clinical reasoning result from AI
 */
export interface ClinicalReasoning {
  consultationId: string;
  patientId: string;
  reasoningSteps: ReasoningStep[];
  possibleConditions: PossibleCondition[];
  recommendedTests: RecommendedTest[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  confidenceScore: number;
  timestamp: Date;
  disclaimer: string;
}

export interface ReasoningStep {
  stepNumber: number;
  observation: string;
  reasoning: string;
  medicalReferences: string[];
  confidence: number;
}

export interface PossibleCondition {
  name: string;
  icd10Code: string;
  probability: number;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  severity: 'mild' | 'moderate' | 'severe';
}

export interface RecommendedTest {
  testName: string;
  loincCode: string;
  rationale: string;
  priority: 'high' | 'medium' | 'low';
  estimatedCost: string;
}

/**
 * Generates clinical reasoning using AI (Amazon Bedrock)
 * In demo mode, uses rule-based logic. In production, calls Bedrock API.
 */
export async function generateClinicalReasoning(
  processedSymptom: ProcessedSymptom,
  useAI: boolean = false
): Promise<ClinicalReasoning> {
  
  if (useAI) {
    // Production: Use Amazon Bedrock
    return await generateBedrockReasoning(processedSymptom);
  } else {
    // Demo: Use rule-based reasoning
    return generateDemoReasoning(processedSymptom);
  }
}

/**
 * Demo reasoning using rule-based logic
 */
function generateDemoReasoning(processedSymptom: ProcessedSymptom): ClinicalReasoning {
  const consultationId = `consult-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Extract symptoms and their severities
  const symptoms = processedSymptom.normalizedSymptoms.map(s => {
    const [name] = s.split('|');
    return {
      name,
      severity: processedSymptom.severity[name] || 5,
      duration: processedSymptom.duration[name] || 'unknown'
    };
  });

  // Sort by severity
  symptoms.sort((a, b) => b.severity - a.severity);
  
  // Determine urgency based on highest severity
  const maxSeverity = Math.max(...symptoms.map(s => s.severity));
  let urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  if (maxSeverity >= 9) urgencyLevel = 'emergency';
  else if (maxSeverity >= 7) urgencyLevel = 'high';
  else if (maxSeverity >= 5) urgencyLevel = 'medium';
  else urgencyLevel = 'low';

  // Generate reasoning steps
  const reasoningSteps: ReasoningStep[] = [];
  
  // Step 1: Symptom Analysis
  reasoningSteps.push({
    stepNumber: 1,
    observation: `Patient presents with ${symptoms.length} symptom(s): ${symptoms.map(s => s.name).join(', ')}`,
    reasoning: `The primary symptom is ${symptoms[0].name} with severity ${symptoms[0].severity}/10. ` +
               `Duration: ${symptoms[0].duration}. This severity level indicates ${urgencyLevel} urgency.`,
    medicalReferences: [
      'Clinical Practice Guidelines for Symptom Assessment (2023)',
      'WHO International Classification of Diseases (ICD-11)'
    ],
    confidence: 0.85
  });

  // Step 2: Pattern Recognition
  const conditions = identifyPossibleConditions(symptoms);
  reasoningSteps.push({
    stepNumber: 2,
    observation: `Symptom pattern suggests ${conditions.length} possible condition(s)`,
    reasoning: `Based on symptom combination, severity, and duration, the following conditions are being considered: ` +
               conditions.map(c => `${c.name} (${Math.round(c.probability * 100)}% probability)`).join(', '),
    medicalReferences: [
      'Differential Diagnosis in Primary Care (Harrison\'s Principles)',
      'Evidence-Based Clinical Decision Making (UpToDate 2024)'
    ],
    confidence: 0.78
  });

  // Step 3: Risk Assessment
  reasoningSteps.push({
    stepNumber: 3,
    observation: `Risk stratification indicates ${urgencyLevel} priority`,
    reasoning: `Given the severity (${maxSeverity}/10) and symptom duration, immediate medical evaluation is ` +
               (urgencyLevel === 'emergency' || urgencyLevel === 'high' ? 'strongly recommended' : 'recommended') + '. ' +
               `Red flags: ${maxSeverity >= 8 ? 'severe pain level' : 'none identified'}.`,
    medicalReferences: [
      'Emergency Medicine Triage Guidelines (2024)',
      'Clinical Risk Assessment Protocols'
    ],
    confidence: 0.90
  });

  // Generate test recommendations
  const recommendedTests = generateTestRecommendations(conditions, symptoms);

  return {
    consultationId,
    patientId: processedSymptom.patientId,
    reasoningSteps,
    possibleConditions: conditions,
    recommendedTests,
    urgencyLevel,
    confidenceScore: calculateOverallConfidence(reasoningSteps),
    timestamp: new Date(),
    disclaimer: '⚠️ IMPORTANT: This is a preliminary AI-assisted analysis and NOT a medical diagnosis. ' +
                'All recommendations must be reviewed and approved by a licensed physician before any action is taken. ' +
                'If you are experiencing a medical emergency, call emergency services immediately.'
  };
}

/**
 * Identifies possible conditions based on symptoms
 */
function identifyPossibleConditions(symptoms: Array<{name: string, severity: number, duration: string}>): PossibleCondition[] {
  const conditions: PossibleCondition[] = [];
  
  // Rule-based condition identification
  const symptomNames = symptoms.map(s => s.name.toLowerCase());
  const maxSeverity = Math.max(...symptoms.map(s => s.severity));
  
  // Headache-related conditions
  if (symptomNames.includes('headache') || symptomNames.includes('head pain')) {
    const headacheSeverity = symptoms.find(s => s.name.toLowerCase().includes('head'))?.severity || 5;
    
    if (headacheSeverity >= 8) {
      conditions.push({
        name: 'Migraine (Severe)',
        icd10Code: 'G43.909',
        probability: 0.65,
        supportingEvidence: [
          'Severe headache intensity (8+/10)',
          'Consistent with migraine presentation'
        ],
        contradictingEvidence: [],
        severity: 'severe'
      });
      
      conditions.push({
        name: 'Tension Headache',
        icd10Code: 'G44.209',
        probability: 0.25,
        supportingEvidence: ['Headache present'],
        contradictingEvidence: ['Severity too high for typical tension headache'],
        severity: 'moderate'
      });
    } else {
      conditions.push({
        name: 'Tension Headache',
        icd10Code: 'G44.209',
        probability: 0.70,
        supportingEvidence: ['Moderate headache intensity', 'Common condition'],
        contradictingEvidence: [],
        severity: 'mild'
      });
    }
  }
  
  // Respiratory conditions
  if (symptomNames.includes('cough')) {
    const hasFever = symptomNames.includes('fever');
    const hasChestPain = symptomNames.includes('chest pain');
    
    if (hasFever || hasChestPain) {
      conditions.push({
        name: 'Upper Respiratory Infection',
        icd10Code: 'J06.9',
        probability: 0.60,
        supportingEvidence: [
          'Cough present',
          hasFever ? 'Fever present' : '',
          hasChestPain ? 'Chest discomfort' : ''
        ].filter(Boolean),
        contradictingEvidence: [],
        severity: hasFever ? 'moderate' : 'mild'
      });
    } else {
      conditions.push({
        name: 'Acute Bronchitis',
        icd10Code: 'J20.9',
        probability: 0.55,
        supportingEvidence: ['Persistent cough'],
        contradictingEvidence: ['No fever reported'],
        severity: 'mild'
      });
    }
  }
  
  // Chest pain conditions
  if (symptomNames.includes('chest pain')) {
    const chestPainSeverity = symptoms.find(s => s.name.toLowerCase().includes('chest'))?.severity || 5;
    
    if (chestPainSeverity >= 7) {
      conditions.push({
        name: 'Acute Coronary Syndrome (requires immediate evaluation)',
        icd10Code: 'I24.9',
        probability: 0.40,
        supportingEvidence: ['Severe chest pain'],
        contradictingEvidence: [],
        severity: 'severe'
      });
    }
    
    conditions.push({
      name: 'Costochondritis',
      icd10Code: 'M94.0',
      probability: 0.45,
      supportingEvidence: ['Chest pain present'],
      contradictingEvidence: [],
      severity: 'mild'
    });
  }
  
  // Fever-related conditions
  if (symptomNames.includes('fever')) {
    conditions.push({
      name: 'Viral Infection',
      icd10Code: 'B34.9',
      probability: 0.70,
      supportingEvidence: ['Fever present', 'Common presentation'],
      contradictingEvidence: [],
      severity: 'mild'
    });
  }
  
  // Gastrointestinal conditions
  if (symptomNames.includes('nausea') || symptomNames.includes('vomiting')) {
    conditions.push({
      name: 'Gastroenteritis',
      icd10Code: 'K52.9',
      probability: 0.65,
      supportingEvidence: ['GI symptoms present'],
      contradictingEvidence: [],
      severity: 'moderate'
    });
  }
  
  // Default if no specific patterns matched
  if (conditions.length === 0) {
    conditions.push({
      name: 'Undifferentiated Symptoms (requires clinical evaluation)',
      icd10Code: 'R69',
      probability: 0.50,
      supportingEvidence: ['Symptoms present but pattern unclear'],
      contradictingEvidence: [],
      severity: maxSeverity >= 7 ? 'severe' : maxSeverity >= 5 ? 'moderate' : 'mild'
    });
  }
  
  // Normalize probabilities to sum to 1.0
  const totalProb = conditions.reduce((sum, c) => sum + c.probability, 0);
  conditions.forEach(c => c.probability = c.probability / totalProb);
  
  // Sort by probability
  conditions.sort((a, b) => b.probability - a.probability);
  
  return conditions.slice(0, 5); // Return top 5
}

/**
 * Generates test recommendations based on conditions
 */
function generateTestRecommendations(
  conditions: PossibleCondition[],
  symptoms: Array<{name: string, severity: number, duration: string}>
): RecommendedTest[] {
  const tests: RecommendedTest[] = [];
  const symptomNames = symptoms.map(s => s.name.toLowerCase());
  
  // Complete Blood Count - almost always useful
  tests.push({
    testName: 'Complete Blood Count (CBC)',
    loincCode: '58410-2',
    rationale: 'Screens for infection, anemia, and blood disorders. Essential baseline test.',
    priority: 'high',
    estimatedCost: '₹300-500'
  });
  
  // C-Reactive Protein for inflammation
  if (symptoms.some(s => s.severity >= 6)) {
    tests.push({
      testName: 'C-Reactive Protein (CRP)',
      loincCode: '1988-5',
      rationale: 'Measures inflammation level. Elevated in infections and inflammatory conditions.',
      priority: 'medium',
      estimatedCost: '₹200-400'
    });
  }
  
  // Chest pain specific tests
  if (symptomNames.includes('chest pain')) {
    tests.push({
      testName: 'Troponin I',
      loincCode: '10839-9',
      rationale: 'Critical for ruling out heart attack. Required for chest pain evaluation.',
      priority: 'high',
      estimatedCost: '₹500-800'
    });
    
    tests.push({
      testName: 'Electrocardiogram (ECG)',
      loincCode: '11524-6',
      rationale: 'Evaluates heart rhythm and detects cardiac abnormalities.',
      priority: 'high',
      estimatedCost: '₹150-300'
    });
  }
  
  // Fever/infection tests
  if (symptomNames.includes('fever')) {
    tests.push({
      testName: 'Blood Culture',
      loincCode: '600-7',
      rationale: 'Identifies bacterial infections in bloodstream.',
      priority: 'medium',
      estimatedCost: '₹800-1200'
    });
  }
  
  // Metabolic panel
  tests.push({
    testName: 'Basic Metabolic Panel (BMP)',
    loincCode: '51990-0',
    rationale: 'Assesses kidney function, electrolytes, and blood sugar. Important baseline.',
    priority: 'medium',
    estimatedCost: '₹400-600'
  });
  
  // Liver function if GI symptoms
  if (symptomNames.includes('nausea') || symptomNames.includes('vomiting') || symptomNames.includes('abdominal pain')) {
    tests.push({
      testName: 'Liver Function Tests (LFT)',
      loincCode: '24325-3',
      rationale: 'Evaluates liver health. Important for GI symptoms.',
      priority: 'medium',
      estimatedCost: '₹500-800'
    });
  }
  
  return tests;
}

/**
 * Calculates overall confidence from reasoning steps
 */
function calculateOverallConfidence(steps: ReasoningStep[]): number {
  if (steps.length === 0) return 0;
  const avgConfidence = steps.reduce((sum, step) => sum + step.confidence, 0) / steps.length;
  return Math.round(avgConfidence * 100) / 100;
}

/**
 * Production implementation using Amazon Bedrock
 * This would be called when deployed to AWS
 */
async function generateBedrockReasoning(processedSymptom: ProcessedSymptom): Promise<ClinicalReasoning> {
  // TODO: Implement actual Bedrock API call
  // This requires AWS credentials and Bedrock model access
  
  throw new Error('Amazon Bedrock integration requires AWS deployment. Use demo mode for local testing.');
}
