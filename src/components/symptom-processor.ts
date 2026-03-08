/**
 * Symptom Processor Component
 * Validates and normalizes patient symptom input
 * Requirements: 1.1, 1.4
 */

import * as crypto from 'crypto';
import { SymptomInput, ProcessedSymptom, ValidationResult } from '../types/models';

/**
 * SNOMED CT code mapping for common symptoms
 * In production, this would be a comprehensive database lookup
 */
const SNOMED_CT_MAPPING: Record<string, string> = {
  // Pain symptoms
  'headache': '25064002',
  'head pain': '25064002',
  'chest pain': '29857009',
  'abdominal pain': '21522001',
  'stomach pain': '21522001',
  'back pain': '161891005',
  'joint pain': '57676002',
  'muscle pain': '68962001',
  
  // Fever and temperature
  'fever': '386661006',
  'high temperature': '386661006',
  'chills': '43724002',
  
  // Respiratory
  'cough': '49727002',
  'shortness of breath': '267036007',
  'difficulty breathing': '267036007',
  'wheezing': '56018004',
  'sore throat': '162397003',
  
  // Gastrointestinal
  'nausea': '422587007',
  'vomiting': '422400008',
  'diarrhea': '62315008',
  'constipation': '14760008',
  
  // General
  'fatigue': '84229001',
  'weakness': '13791008',
  'dizziness': '404640003',
  'rash': '271807003',
  'itching': '418290006',
};

/**
 * Severity keywords for extraction
 */
const SEVERITY_KEYWORDS = {
  mild: ['mild', 'slight', 'minor', 'little', 'barely'],
  moderate: ['moderate', 'medium', 'noticeable', 'considerable'],
  severe: ['severe', 'intense', 'extreme', 'unbearable', 'excruciating', 'terrible', 'awful'],
};

/**
 * Duration keywords for extraction
 */
const DURATION_PATTERNS = [
  { pattern: /(\d+)\s*(day|days)/i, unit: 'days' },
  { pattern: /(\d+)\s*(week|weeks)/i, unit: 'weeks' },
  { pattern: /(\d+)\s*(month|months)/i, unit: 'months' },
  { pattern: /(\d+)\s*(hour|hours)/i, unit: 'hours' },
  { pattern: /(\d+)\s*(year|years)/i, unit: 'years' },
];

/**
 * Validates symptom input
 * @param symptoms - Raw symptom text
 * @returns ValidationResult indicating if input is valid
 */
export function validateSymptoms(symptoms: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if symptoms is empty or only whitespace
  if (!symptoms || symptoms.trim().length === 0) {
    errors.push('Symptom description cannot be empty');
  }

  // Check minimum length
  if (symptoms.trim().length < 3) {
    errors.push('Symptom description is too short. Please provide more details.');
  }

  // Check maximum length
  if (symptoms.length > 5000) {
    errors.push('Symptom description is too long. Please limit to 5000 characters.');
  }

  // Check for non-medical content (basic heuristic)
  const nonMedicalPatterns = [
    /\b(buy|sell|purchase|order|price|cost|payment)\b/i,
    /\b(http|www\.|\.com|\.org)\b/i,
  ];

  for (const pattern of nonMedicalPatterns) {
    if (pattern.test(symptoms)) {
      warnings.push('Input may contain non-medical content. Please focus on describing your symptoms.');
    }
  }

  // Check if at least one recognizable symptom is present
  const lowerSymptoms = symptoms.toLowerCase();
  const hasRecognizableSymptom = Object.keys(SNOMED_CT_MAPPING).some(
    symptom => lowerSymptoms.includes(symptom)
  );

  if (!hasRecognizableSymptom && symptoms.trim().length > 0) {
    warnings.push('No recognizable symptoms detected. Please use common medical terms.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Extracts severity level from symptom text
 * @param text - Symptom description text
 * @param symptom - Specific symptom to check
 * @returns Severity score (0-10)
 */
function extractSeverity(text: string, symptom: string): number {
  const lowerText = text.toLowerCase();
  
  // Look for severity keywords near the symptom
  const symptomIndex = lowerText.indexOf(symptom.toLowerCase());
  if (symptomIndex === -1) return 5; // Default moderate severity
  
  // Check context around the symptom (50 chars before, 30 chars after for pain scales)
  const contextStart = Math.max(0, symptomIndex - 50);
  const contextEnd = Math.min(lowerText.length, symptomIndex + symptom.length + 30);
  const fullContext = lowerText.substring(contextStart, contextEnd);
  
  // Check for numeric pain scales first (e.g., "headache pain 8/10" or "8/10 headache")
  const painScaleMatch = fullContext.match(/(\d+)\s*\/\s*10/);
  if (painScaleMatch) {
    return parseInt(painScaleMatch[1], 10);
  }
  
  // Check context BEFORE the symptom for severity adjectives (they typically come before the noun)
  const beforeContext = lowerText.substring(contextStart, symptomIndex + symptom.length);
  
  // Check for severity keywords - prioritize those closest to the symptom
  let closestSeverity = 5; // Default
  let closestDistance = Infinity;
  
  for (const [level, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    for (const keyword of keywords) {
      const keywordIndex = beforeContext.lastIndexOf(keyword);
      if (keywordIndex !== -1) {
        const distance = symptomIndex - (contextStart + keywordIndex);
        if (distance < closestDistance) {
          closestDistance = distance;
          switch (level) {
            case 'mild': closestSeverity = 3; break;
            case 'moderate': closestSeverity = 5; break;
            case 'severe': closestSeverity = 8; break;
          }
        }
      }
    }
  }
  
  return closestSeverity;
}

/**
 * Extracts duration from symptom text
 * @param text - Symptom description text
 * @param symptom - Specific symptom to check
 * @returns Duration string (e.g., "3 days", "2 weeks")
 */
function extractDuration(text: string, symptom: string): string {
  const lowerText = text.toLowerCase();
  
  // Look for duration patterns near the symptom
  const symptomIndex = lowerText.indexOf(symptom.toLowerCase());
  if (symptomIndex === -1) return 'unknown';
  
  // Check context AFTER the symptom (duration typically follows the symptom)
  // Look up to 100 characters after the symptom
  const contextStart = symptomIndex;
  const contextEnd = Math.min(lowerText.length, symptomIndex + symptom.length + 100);
  const context = lowerText.substring(contextStart, contextEnd);
  
  // Try to match duration patterns
  for (const { pattern, unit } of DURATION_PATTERNS) {
    const match = context.match(pattern);
    if (match) {
      return `${match[1]} ${unit}`;
    }
  }
  
  // Check for relative time expressions
  if (context.includes('today') || context.includes('this morning')) {
    return '< 1 day';
  }
  if (context.includes('yesterday')) {
    return '1 day';
  }
  if (context.includes('last week')) {
    return '1 week';
  }
  if (context.includes('last month')) {
    return '1 month';
  }
  
  return 'unknown';
}

/**
 * Normalizes symptoms to SNOMED CT codes
 * @param symptoms - Raw symptom text
 * @returns Array of normalized symptom terms
 */
function normalizeSymptoms(symptoms: string): string[] {
  const lowerSymptoms = symptoms.toLowerCase();
  const normalized: string[] = [];
  
  // Find all matching symptoms in the text
  for (const [symptomTerm, snomedCode] of Object.entries(SNOMED_CT_MAPPING)) {
    if (lowerSymptoms.includes(symptomTerm)) {
      // Store as "term|code" format
      normalized.push(`${symptomTerm}|${snomedCode}`);
    }
  }
  
  // If no recognized symptoms, extract potential symptom phrases
  if (normalized.length === 0) {
    // Extract noun phrases that might be symptoms (basic heuristic)
    const words = symptoms.toLowerCase().split(/\s+/);
    const potentialSymptoms = words.filter(word => 
      word.length > 3 && !['have', 'been', 'feel', 'feeling', 'experiencing'].includes(word)
    );
    
    // Add as unrecognized symptoms
    potentialSymptoms.forEach(symptom => {
      normalized.push(`${symptom}|unknown`);
    });
  }
  
  return normalized;
}

/**
 * Processes symptom input and returns structured data
 * @param input - SymptomInput containing patient ID and symptom description
 * @returns ProcessedSymptom with normalized data
 */
export async function processSymptoms(input: SymptomInput): Promise<ProcessedSymptom> {
  // Validate input
  const validation = validateSymptoms(input.symptoms);
  if (!validation.isValid) {
    throw new Error(`Invalid symptom input: ${validation.errors.join(', ')}`);
  }
  
  // Normalize symptoms to SNOMED CT codes
  const normalizedSymptoms = normalizeSymptoms(input.symptoms);
  
  // Extract severity for each symptom
  const severity: Record<string, number> = {};
  for (const normalizedSymptom of normalizedSymptoms) {
    const [symptomTerm] = normalizedSymptom.split('|');
    severity[symptomTerm] = extractSeverity(input.symptoms, symptomTerm);
  }
  
  // Extract duration for each symptom
  const duration: Record<string, string> = {};
  for (const normalizedSymptom of normalizedSymptoms) {
    const [symptomTerm] = normalizedSymptom.split('|');
    duration[symptomTerm] = extractDuration(input.symptoms, symptomTerm);
  }
  
  // Create processed symptom object
  const processedSymptom: ProcessedSymptom = {
    symptomId: crypto.randomUUID(),
    patientId: input.patientId,
    normalizedSymptoms,
    severity,
    duration,
    timestamp: input.timestamp || new Date(),
  };
  
  return processedSymptom;
}
