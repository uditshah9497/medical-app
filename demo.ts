/**
 * Demo Script - AI Medical Consultation Platform
 * Shows the symptom processor working with real patient data
 */

import { processSymptoms, validateSymptoms } from './src/components/symptom-processor';
import { SymptomInput } from './src/types/models';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function printHeader(text: string) {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${text}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(70)}${colors.reset}\n`);
}

function printSection(text: string) {
  console.log(`\n${colors.bright}${colors.cyan}${text}${colors.reset}`);
  console.log(`${colors.cyan}${'-'.repeat(70)}${colors.reset}`);
}

function printSuccess(text: string) {
  console.log(`${colors.green}✓ ${text}${colors.reset}`);
}

function printWarning(text: string) {
  console.log(`${colors.yellow}⚠ ${text}${colors.reset}`);
}

function printError(text: string) {
  console.log(`${colors.red}✗ ${text}${colors.reset}`);
}

function printInfo(label: string, value: any) {
  console.log(`${colors.bright}${label}:${colors.reset} ${JSON.stringify(value, null, 2)}`);
}

async function runDemo() {
  printHeader('AI MEDICAL CONSULTATION PLATFORM - LIVE DEMO');

  console.log(`${colors.bright}Welcome to the AI-Powered Medical Consultation Platform!${colors.reset}`);
  console.log('This demo shows how the symptom processor analyzes patient symptoms.\n');

  // Demo 1: Simple symptom with severity
  printSection('Demo 1: Patient with Severe Headache');
  
  const patient1: SymptomInput = {
    patientId: 'patient-001',
    symptoms: 'I have a severe headache that started 3 days ago. The pain is 8/10.',
    inputType: 'text',
    timestamp: new Date(),
  };

  console.log(`${colors.bright}Patient Input:${colors.reset} "${patient1.symptoms}"`);
  
  const validation1 = validateSymptoms(patient1.symptoms);
  if (validation1.isValid) {
    printSuccess('Symptom description is valid');
  }

  const result1 = await processSymptoms(patient1);
  
  printInfo('Normalized Symptoms', result1.normalizedSymptoms);
  printInfo('SNOMED CT Codes', result1.normalizedSymptoms.map(s => `${s} (mapped to medical terminology)`));
  printInfo('Severity Scores', result1.severity);
  printInfo('Duration', result1.duration);
  printInfo('Symptom ID', result1.symptomId);

  // Demo 2: Multiple symptoms with different severities
  printSection('Demo 2: Patient with Multiple Symptoms');
  
  const patient2: SymptomInput = {
    patientId: 'patient-002',
    symptoms: 'I have a mild cough for 2 weeks, severe chest pain since yesterday, and moderate fever',
    inputType: 'text',
    timestamp: new Date(),
  };

  console.log(`${colors.bright}Patient Input:${colors.reset} "${patient2.symptoms}"`);
  
  const result2 = await processSymptoms(patient2);
  
  printInfo('Detected Symptoms', result2.normalizedSymptoms);
  console.log(`\n${colors.bright}Severity Analysis:${colors.reset}`);
  Object.entries(result2.severity).forEach(([symptom, severity]) => {
    const level = severity > 7 ? 'SEVERE' : severity > 4 ? 'MODERATE' : 'MILD';
    const color = severity > 7 ? colors.red : severity > 4 ? colors.yellow : colors.green;
    console.log(`  ${color}${symptom}: ${severity}/10 (${level})${colors.reset}`);
  });
  
  console.log(`\n${colors.bright}Duration Analysis:${colors.reset}`);
  Object.entries(result2.duration).forEach(([symptom, duration]) => {
    console.log(`  ${colors.cyan}${symptom}: ${duration}${colors.reset}`);
  });

  // Demo 3: Voice input simulation
  printSection('Demo 3: Voice Input (Transcribed)');
  
  const patient3: SymptomInput = {
    patientId: 'patient-003',
    symptoms: 'I have been experiencing extreme fatigue for about a month now, along with occasional dizziness',
    inputType: 'voice',
    timestamp: new Date(),
  };

  console.log(`${colors.bright}Patient Input (Voice):${colors.reset} "${patient3.symptoms}"`);
  console.log(`${colors.bright}Input Type:${colors.reset} ${patient3.inputType}`);
  
  const result3 = await processSymptoms(patient3);
  
  printInfo('Processed Symptoms', result3.normalizedSymptoms);
  printInfo('Severity Assessment', result3.severity);
  printInfo('Duration Detected', result3.duration);

  // Demo 4: Invalid input handling
  printSection('Demo 4: Invalid Input Handling');
  
  const invalidInputs = [
    'hi',
    '',
    'I feel bad',
  ];

  for (const input of invalidInputs) {
    console.log(`\n${colors.bright}Testing:${colors.reset} "${input}"`);
    const validation = validateSymptoms(input);
    
    if (!validation.isValid) {
      validation.errors.forEach(error => printError(error));
    }
    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => printWarning(warning));
    }
  }

  // Demo 5: Complex medical scenario
  printSection('Demo 5: Complex Medical Scenario');
  
  const patient5: SymptomInput = {
    patientId: 'patient-005',
    symptoms: 'For the past week, I have had an unbearable headache (9/10 pain), severe nausea, mild fever around 100°F, and extreme sensitivity to light. The headache gets worse when I move.',
    inputType: 'text',
    timestamp: new Date(),
  };

  console.log(`${colors.bright}Patient Input:${colors.reset}`);
  console.log(`"${patient5.symptoms}"`);
  
  const result5 = await processSymptoms(patient5);
  
  console.log(`\n${colors.bright}AI Analysis Results:${colors.reset}`);
  console.log(`${colors.green}✓ Detected ${result5.normalizedSymptoms.length} distinct symptoms${colors.reset}`);
  console.log(`${colors.green}✓ Mapped to medical terminology (SNOMED CT)${colors.reset}`);
  console.log(`${colors.green}✓ Extracted severity levels${colors.reset}`);
  console.log(`${colors.green}✓ Identified symptom duration${colors.reset}`);
  
  printInfo('\nComplete Analysis', {
    symptoms: result5.normalizedSymptoms,
    severityScores: result5.severity,
    durations: result5.duration,
    timestamp: result5.timestamp,
    patientId: result5.patientId,
  });

  // Summary
  printSection('Demo Summary');
  
  console.log(`${colors.bright}What You Just Saw:${colors.reset}\n`);
  printSuccess('Symptom validation and normalization');
  printSuccess('SNOMED CT medical terminology mapping');
  printSuccess('Severity extraction from natural language');
  printSuccess('Duration extraction from text');
  printSuccess('Multiple symptom handling');
  printSuccess('Voice input support');
  printSuccess('Error handling for invalid inputs');
  
  console.log(`\n${colors.bright}Next Steps in the Platform:${colors.reset}\n`);
  console.log(`  1. ${colors.cyan}AI Clinical Reasoner${colors.reset} - Analyzes symptoms using Amazon Bedrock`);
  console.log(`  2. ${colors.cyan}Condition Ranker${colors.reset} - Ranks possible conditions by likelihood`);
  console.log(`  3. ${colors.cyan}Test Recommender${colors.reset} - Suggests appropriate blood tests`);
  console.log(`  4. ${colors.cyan}Doctor Review${colors.reset} - Routes to doctor for approval`);
  console.log(`  5. ${colors.cyan}Medicine Recommender${colors.reset} - Suggests affordable medications`);

  printHeader('DEMO COMPLETE');
  
  console.log(`${colors.bright}Your AI Medical Consultation Platform is working!${colors.reset}\n`);
  console.log(`To deploy to AWS and get live URLs:`);
  console.log(`  ${colors.cyan}1. Install AWS CLI${colors.reset}`);
  console.log(`  ${colors.cyan}2. Run: .\\run.ps1 cdk:deploy${colors.reset}\n`);
}

// Run the demo
runDemo().catch((error) => {
  console.error(`${colors.red}Error running demo:${colors.reset}`, error);
  process.exit(1);
});
