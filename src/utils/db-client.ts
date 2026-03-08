/**
 * DynamoDB client configuration and utilities
 * Supports both AWS and LocalStack endpoints
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const isLocalStack = process.env.USE_LOCALSTACK === 'true';
const endpoint = isLocalStack ? process.env.LOCALSTACK_ENDPOINT : undefined;
const region = process.env.AWS_REGION || 'us-east-1';

// Create base DynamoDB client
const dynamoDBClient = new DynamoDBClient({
  region,
  ...(endpoint && { endpoint }),
});

// Create document client for easier data manipulation
export const docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// Table name constants
export const TABLE_NAMES = {
  PATIENTS: process.env.PATIENTS_TABLE_NAME || 'medical-consultation-patients',
  CONSULTATIONS: process.env.CONSULTATIONS_TABLE_NAME || 'medical-consultation-consultations',
  SYMPTOM_LOGS: process.env.SYMPTOM_LOGS_TABLE_NAME || 'medical-consultation-symptom-logs',
  DOCUMENT_METADATA: process.env.DOCUMENT_METADATA_TABLE_NAME || 'medical-consultation-document-metadata',
};

export default docClient;
