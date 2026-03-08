/**
 * Infrastructure validation utility
 * Verifies that all required AWS resources are properly configured
 */

import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { CognitoIdentityProviderClient, ListUserPoolsCommand } from '@aws-sdk/client-cognito-identity-provider';

const isLocalStack = process.env.USE_LOCALSTACK === 'true';
const endpoint = isLocalStack ? process.env.LOCALSTACK_ENDPOINT : undefined;
const region = process.env.AWS_REGION || 'us-east-1';

interface ValidationResult {
  service: string;
  resource: string;
  status: 'OK' | 'MISSING' | 'ERROR';
  message?: string;
}

export async function validateInfrastructure(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  // Validate DynamoDB tables
  try {
    const dynamoDBClient = new DynamoDBClient({
      region,
      ...(endpoint && { endpoint }),
    });

    const listTablesResponse = await dynamoDBClient.send(new ListTablesCommand({}));
    const tables = listTablesResponse.TableNames || [];

    const requiredTables = [
      'medical-consultation-patients',
      'medical-consultation-consultations',
      'medical-consultation-symptom-logs',
      'medical-consultation-document-metadata',
    ];

    for (const tableName of requiredTables) {
      if (tables.includes(tableName)) {
        results.push({
          service: 'DynamoDB',
          resource: tableName,
          status: 'OK',
        });
      } else {
        results.push({
          service: 'DynamoDB',
          resource: tableName,
          status: 'MISSING',
          message: 'Table not found',
        });
      }
    }
  } catch (error: any) {
    results.push({
      service: 'DynamoDB',
      resource: 'All Tables',
      status: 'ERROR',
      message: error.message,
    });
  }

  // Validate S3 buckets
  try {
    const s3Client = new S3Client({
      region,
      ...(endpoint && {
        endpoint,
        forcePathStyle: true,
      }),
    });

    const listBucketsResponse = await s3Client.send(new ListBucketsCommand({}));
    const buckets = listBucketsResponse.Buckets?.map(b => b.Name) || [];

    const requiredBuckets = ['medical-consultation-documents'];

    for (const bucketName of requiredBuckets) {
      const found = buckets.some(b => b?.includes(bucketName));
      if (found) {
        results.push({
          service: 'S3',
          resource: bucketName,
          status: 'OK',
        });
      } else {
        results.push({
          service: 'S3',
          resource: bucketName,
          status: 'MISSING',
          message: 'Bucket not found',
        });
      }
    }
  } catch (error: any) {
    results.push({
      service: 'S3',
      resource: 'All Buckets',
      status: 'ERROR',
      message: error.message,
    });
  }

  // Validate Cognito User Pool
  try {
    const cognitoClient = new CognitoIdentityProviderClient({
      region,
      ...(endpoint && { endpoint }),
    });

    const listUserPoolsResponse = await cognitoClient.send(
      new ListUserPoolsCommand({ MaxResults: 60 })
    );
    const userPools = listUserPoolsResponse.UserPools || [];

    const found = userPools.some(pool => 
      pool.Name?.includes('medical-consultation-users')
    );

    if (found) {
      results.push({
        service: 'Cognito',
        resource: 'medical-consultation-users',
        status: 'OK',
      });
    } else {
      results.push({
        service: 'Cognito',
        resource: 'medical-consultation-users',
        status: 'MISSING',
        message: 'User pool not found',
      });
    }
  } catch (error: any) {
    results.push({
      service: 'Cognito',
      resource: 'User Pool',
      status: 'ERROR',
      message: error.message,
    });
  }

  return results;
}

export function printValidationResults(results: ValidationResult[]): void {
  console.log('\n=== Infrastructure Validation Results ===\n');

  const grouped = results.reduce((acc, result) => {
    if (!acc[result.service]) {
      acc[result.service] = [];
    }
    acc[result.service].push(result);
    return acc;
  }, {} as Record<string, ValidationResult[]>);

  for (const [service, serviceResults] of Object.entries(grouped)) {
    console.log(`${service}:`);
    for (const result of serviceResults) {
      const icon = result.status === 'OK' ? '✓' : result.status === 'MISSING' ? '✗' : '⚠';
      const message = result.message ? ` (${result.message})` : '';
      console.log(`  ${icon} ${result.resource}: ${result.status}${message}`);
    }
    console.log('');
  }

  const allOk = results.every(r => r.status === 'OK');
  if (allOk) {
    console.log('✓ All infrastructure resources are properly configured!\n');
  } else {
    console.log('✗ Some infrastructure resources are missing or have errors.\n');
  }
}

// CLI execution
if (require.main === module) {
  validateInfrastructure()
    .then(printValidationResults)
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}
