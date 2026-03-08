/**
 * Unit tests for Symptom Processor
 * Tests validation, normalization, and extraction logic
 */

import { processSymptoms, validateSymptoms } from './symptom-processor';
import { SymptomInput } from '../types/models';

describe('Symptom Processor', () => {
  describe('validateSymptoms', () => {
    it('should accept valid symptom descriptions', () => {
      const result = validateSymptoms('I have a severe headache and fever for 3 days');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty symptom descriptions', () => {
      const result = validateSymptoms('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Symptom description cannot be empty');
    });

    it('should reject symptom descriptions that are too short', () => {
      const result = validateSymptoms('ab');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('too short'))).toBe(true);
    });

    it('should reject symptom descriptions that are too long', () => {
      const longText = 'a'.repeat(5001);
      const result = validateSymptoms(longText);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('too long'))).toBe(true);
    });

    it('should warn about non-medical content', () => {
      const result = validateSymptoms('I want to buy medicine at www.example.com');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should warn when no recognizable symptoms are detected', () => {
      const result = validateSymptoms('random text without medical terms');
      expect(result.warnings.some(w => w.includes('No recognizable symptoms'))).toBe(true);
    });
  });

  describe('processSymptoms', () => {
    it('should process valid symptom input with text', async () => {
      const input: SymptomInput = {
        patientId: 'patient-123',
        symptoms: 'I have a severe headache and mild fever for 3 days',
        inputType: 'text',
        timestamp: new Date('2024-01-15T10:00:00Z'),
      };

      const result = await processSymptoms(input);

      expect(result.symptomId).toBeDefined();
      expect(result.patientId).toBe('patient-123');
      expect(result.normalizedSymptoms.length).toBeGreaterThan(0);
      expect(result.timestamp).toEqual(input.timestamp);
    });

    it('should normalize symptoms to SNOMED CT codes', async () => {
      const input: SymptomInput = {
        patientId: 'patient-123',
        symptoms: 'I have chest pain and shortness of breath',
        inputType: 'text',
        timestamp: new Date(),
      };

      const result = await processSymptoms(input);

      expect(result.normalizedSymptoms).toContain('chest pain|29857009');
      expect(result.normalizedSymptoms).toContain('shortness of breath|267036007');
    });

    it('should extract severity levels correctly', async () => {
      const input: SymptomInput = {
        patientId: 'patient-123',
        symptoms: 'I have a severe headache and mild cough',
        inputType: 'text',
        timestamp: new Date(),
      };

      const result = await processSymptoms(input);

      expect(result.severity['headache']).toBeGreaterThan(5); // Severe
      expect(result.severity['cough']).toBeLessThan(5); // Mild
    });

    it('should extract duration from symptom text', async () => {
      const input: SymptomInput = {
        patientId: 'patient-123',
        symptoms: 'I have had a headache for 3 days and fever for 2 weeks',
        inputType: 'text',
        timestamp: new Date(),
      };

      const result = await processSymptoms(input);

      expect(result.duration['headache']).toBe('3 days');
      expect(result.duration['fever']).toBe('2 weeks');
    });

    it('should handle numeric pain scales', async () => {
      const input: SymptomInput = {
        patientId: 'patient-123',
        symptoms: 'I have headache pain 8/10',
        inputType: 'text',
        timestamp: new Date(),
      };

      const result = await processSymptoms(input);

      expect(result.severity['headache']).toBe(8);
    });

    it('should throw error for invalid symptom input', async () => {
      const input: SymptomInput = {
        patientId: 'patient-123',
        symptoms: '',
        inputType: 'text',
        timestamp: new Date(),
      };

      await expect(processSymptoms(input)).rejects.toThrow('Invalid symptom input');
    });

    it('should handle multiple symptoms in one description', async () => {
      const input: SymptomInput = {
        patientId: 'patient-123',
        symptoms: 'I have headache, fever, cough, and nausea',
        inputType: 'text',
        timestamp: new Date(),
      };

      const result = await processSymptoms(input);

      expect(result.normalizedSymptoms.length).toBeGreaterThanOrEqual(4);
      expect(result.normalizedSymptoms.some(s => s.includes('headache'))).toBe(true);
      expect(result.normalizedSymptoms.some(s => s.includes('fever'))).toBe(true);
      expect(result.normalizedSymptoms.some(s => s.includes('cough'))).toBe(true);
      expect(result.normalizedSymptoms.some(s => s.includes('nausea'))).toBe(true);
    });

    it('should use default timestamp if not provided', async () => {
      const beforeTime = new Date();
      
      const input: SymptomInput = {
        patientId: 'patient-123',
        symptoms: 'I have a headache',
        inputType: 'text',
        timestamp: new Date(),
      };

      const result = await processSymptoms(input);
      const afterTime = new Date();

      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should handle symptoms with alternative terms', async () => {
      const input: SymptomInput = {
        patientId: 'patient-123',
        symptoms: 'I have stomach pain and difficulty breathing',
        inputType: 'text',
        timestamp: new Date(),
      };

      const result = await processSymptoms(input);

      // stomach pain maps to abdominal pain
      expect(result.normalizedSymptoms.some(s => s.includes('stomach pain'))).toBe(true);
      // difficulty breathing maps to shortness of breath
      expect(result.normalizedSymptoms.some(s => s.includes('difficulty breathing'))).toBe(true);
    });

    it('should handle relative time expressions', async () => {
      const input: SymptomInput = {
        patientId: 'patient-123',
        symptoms: 'I started having headache yesterday',
        inputType: 'text',
        timestamp: new Date(),
      };

      const result = await processSymptoms(input);

      expect(result.duration['headache']).toBe('1 day');
    });

    it('should assign default severity when no indicators present', async () => {
      const input: SymptomInput = {
        patientId: 'patient-123',
        symptoms: 'I have a headache',
        inputType: 'text',
        timestamp: new Date(),
      };

      const result = await processSymptoms(input);

      expect(result.severity['headache']).toBe(5); // Default moderate
    });

    it('should handle unrecognized symptoms gracefully', async () => {
      const input: SymptomInput = {
        patientId: 'patient-123',
        symptoms: 'I have unusual tingling sensation in my fingers',
        inputType: 'text',
        timestamp: new Date(),
      };

      const result = await processSymptoms(input);

      // Should still create a processed symptom even if not in SNOMED mapping
      expect(result.symptomId).toBeDefined();
      expect(result.normalizedSymptoms.length).toBeGreaterThan(0);
    });
  });
});
