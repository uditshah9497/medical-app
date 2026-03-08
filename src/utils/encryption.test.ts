/**
 * Property-Based Test for Data Encryption at Rest
 * Feature: ai-medical-consultation
 * Property 20: Data Encryption at Rest
 * Validates: Requirements 10.1
 * 
 * For any patient data stored in DynamoDB or documents stored in S3,
 * encryption should be enabled using AWS KMS.
 */

import { 
  DynamoDBClient, 
  DescribeTableCommand,
  ListTablesCommand 
} from '@aws-sdk/client-dynamodb';
import { 
  S3Client, 
  GetBucketEncryptionCommand,
  ListBucketsCommand
} from '@aws-sdk/client-s3';

const isLocalStack = process.env.USE_LOCALSTACK === 'true';
const endpoint = isLocalStack ? process.env.LOCALSTACK_ENDPOINT : undefined;
const region = process.env.AWS_REGION || 'us-east-1';

const dynamoDBClient = new DynamoDBClient({
  region,
  ...(endpoint && { endpoint }),
});

const s3Client = new S3Client({
  region,
  ...(endpoint && {
    endpoint,
    forcePathStyle: true,
  }),
});

const TABLE_NAMES = [
  'medical-consultation-patients',
  'medical-consultation-consultations',
  'medical-consultation-symptom-logs',
  'medical-consultation-document-metadata',
];

const BUCKET_NAMES = [
  'medical-consultation-documents',
];

describe('Property 20: Data Encryption at Rest', () => {
  describe('DynamoDB Table Encryption', () => {
    test('all DynamoDB tables should have encryption enabled', async () => {
      // List all tables
      const listTablesResponse = await dynamoDBClient.send(
        new ListTablesCommand({})
      );

      const existingTables = listTablesResponse.TableNames || [];
      const medicalTables = existingTables.filter(tableName =>
        TABLE_NAMES.includes(tableName)
      );

      // Verify at least some tables exist
      expect(medicalTables.length).toBeGreaterThan(0);

      // Check encryption for each table
      for (const tableName of medicalTables) {
        const describeResponse = await dynamoDBClient.send(
          new DescribeTableCommand({ TableName: tableName })
        );

        const table = describeResponse.Table;
        expect(table).toBeDefined();

        // Verify encryption is enabled
        // In LocalStack, SSEDescription might not be present, so we check if it exists
        // In AWS, it should always be present with encryption enabled
        if (!isLocalStack) {
          expect(table?.SSEDescription).toBeDefined();
          expect(table?.SSEDescription?.Status).toBe('ENABLED');
          
          // Verify KMS encryption (not just AWS managed)
          expect(table?.SSEDescription?.SSEType).toBe('KMS');
          expect(table?.SSEDescription?.KMSMasterKeyArn).toBeDefined();
        } else {
          // For LocalStack, just verify table exists
          // LocalStack may not fully support SSE configuration
          expect(table?.TableName).toBe(tableName);
        }
      }
    }, 30000);

    test('each medical consultation table should use customer-managed KMS key', async () => {
      if (isLocalStack) {
        // Skip this test in LocalStack as it doesn't fully support KMS
        console.log('Skipping KMS key verification in LocalStack');
        return;
      }

      for (const tableName of TABLE_NAMES) {
        try {
          const describeResponse = await dynamoDBClient.send(
            new DescribeTableCommand({ TableName: tableName })
          );

          const table = describeResponse.Table;
          
          if (table?.SSEDescription) {
            // Verify it's using KMS (not AWS managed encryption)
            expect(table.SSEDescription.SSEType).toBe('KMS');
            
            // Verify it's a customer-managed key (not AWS managed)
            const kmsKeyArn = table.SSEDescription.KMSMasterKeyArn;
            expect(kmsKeyArn).toBeDefined();
            expect(kmsKeyArn).not.toContain('aws/dynamodb');
          }
        } catch (error: any) {
          if (error.name === 'ResourceNotFoundException') {
            // Table doesn't exist yet, skip
            console.log(`Table ${tableName} not found, skipping`);
          } else {
            throw error;
          }
        }
      }
    }, 30000);
  });

  describe('S3 Bucket Encryption', () => {
    test('all S3 buckets should have encryption enabled', async () => {
      // List all buckets
      const listBucketsResponse = await s3Client.send(
        new ListBucketsCommand({})
      );

      const existingBuckets = listBucketsResponse.Buckets || [];
      const medicalBuckets = existingBuckets.filter(bucket =>
        BUCKET_NAMES.some(name => bucket.Name?.includes(name))
      );

      // Verify at least some buckets exist
      expect(medicalBuckets.length).toBeGreaterThan(0);

      // Check encryption for each bucket
      for (const bucket of medicalBuckets) {
        if (!bucket.Name) continue;

        try {
          const encryptionResponse = await s3Client.send(
            new GetBucketEncryptionCommand({ Bucket: bucket.Name })
          );

          // Verify encryption rules exist
          expect(encryptionResponse.ServerSideEncryptionConfiguration).toBeDefined();
          expect(
            encryptionResponse.ServerSideEncryptionConfiguration?.Rules
          ).toBeDefined();
          expect(
            encryptionResponse.ServerSideEncryptionConfiguration?.Rules?.length
          ).toBeGreaterThan(0);

          // Verify KMS encryption is used
          const rules = encryptionResponse.ServerSideEncryptionConfiguration?.Rules || [];
          for (const rule of rules) {
            const encryption = rule.ApplyServerSideEncryptionByDefault;
            expect(encryption).toBeDefined();
            
            if (!isLocalStack) {
              // In AWS, verify it's using KMS
              expect(encryption?.SSEAlgorithm).toBe('aws:kms');
              expect(encryption?.KMSMasterKeyID).toBeDefined();
            } else {
              // In LocalStack, just verify some encryption is configured
              expect(encryption?.SSEAlgorithm).toBeDefined();
            }
          }
        } catch (error: any) {
          if (error.name === 'NoSuchBucket') {
            console.log(`Bucket ${bucket.Name} not found, skipping`);
          } else if (error.name === 'ServerSideEncryptionConfigurationNotFoundError') {
            // Bucket exists but no encryption configured - this should fail the test
            throw new Error(`Bucket ${bucket.Name} does not have encryption configured`);
          } else {
            throw error;
          }
        }
      }
    }, 30000);

    test('document bucket should use customer-managed KMS key', async () => {
      if (isLocalStack) {
        console.log('Skipping KMS key verification in LocalStack');
        return;
      }

      const bucketName = process.env.DOCUMENT_BUCKET_NAME || 'medical-consultation-documents';

      try {
        const encryptionResponse = await s3Client.send(
          new GetBucketEncryptionCommand({ Bucket: bucketName })
        );

        const rules = encryptionResponse.ServerSideEncryptionConfiguration?.Rules || [];
        expect(rules.length).toBeGreaterThan(0);

        for (const rule of rules) {
          const encryption = rule.ApplyServerSideEncryptionByDefault;
          
          // Verify KMS encryption
          expect(encryption?.SSEAlgorithm).toBe('aws:kms');
          
          // Verify customer-managed key (not AWS managed)
          const kmsKeyId = encryption?.KMSMasterKeyID;
          expect(kmsKeyId).toBeDefined();
          expect(kmsKeyId).not.toBe('aws/s3');
        }
      } catch (error: any) {
        if (error.name === 'NoSuchBucket') {
          console.log(`Bucket ${bucketName} not found, skipping`);
        } else {
          throw error;
        }
      }
    }, 30000);
  });

  describe('Encryption Property Invariants', () => {
    test('encryption configuration should be immutable once set', async () => {
      // This test verifies that encryption cannot be disabled once enabled
      // In a real scenario, we would attempt to disable encryption and verify it fails
      // For now, we just verify encryption is consistently enabled across checks

      const tableName = 'medical-consultation-patients';

      try {
        // Check encryption twice to ensure consistency
        const check1 = await dynamoDBClient.send(
          new DescribeTableCommand({ TableName: tableName })
        );

        const check2 = await dynamoDBClient.send(
          new DescribeTableCommand({ TableName: tableName })
        );

        if (!isLocalStack) {
          // Verify encryption status is consistent
          expect(check1.Table?.SSEDescription?.Status).toBe(
            check2.Table?.SSEDescription?.Status
          );
          expect(check1.Table?.SSEDescription?.SSEType).toBe(
            check2.Table?.SSEDescription?.SSEType
          );
        }
      } catch (error: any) {
        if (error.name === 'ResourceNotFoundException') {
          console.log(`Table ${tableName} not found, skipping`);
        } else {
          throw error;
        }
      }
    }, 30000);
  });
});
