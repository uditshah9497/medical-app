/**
 * S3 client configuration and utilities
 * Supports both AWS and LocalStack endpoints
 */

import { S3Client } from '@aws-sdk/client-s3';

const isLocalStack = process.env.USE_LOCALSTACK === 'true';
const endpoint = isLocalStack ? process.env.LOCALSTACK_ENDPOINT : undefined;
const region = process.env.AWS_REGION || 'us-east-1';

// Create S3 client
export const s3Client = new S3Client({
  region,
  ...(endpoint && {
    endpoint,
    forcePathStyle: true, // Required for LocalStack
  }),
});

// Bucket name constants
export const BUCKET_NAMES = {
  DOCUMENTS: process.env.DOCUMENT_BUCKET_NAME || 'medical-consultation-documents',
};

export default s3Client;
