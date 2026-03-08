# Setup Guide - AI Medical Consultation Platform

This guide walks you through setting up the development environment and deploying the infrastructure.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **AWS CLI** configured with appropriate credentials
- **Docker** and **Docker Compose** (for local development)
- **AWS CDK CLI**: Install globally with `npm install -g aws-cdk`

## Quick Start (Local Development)

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and set USE_LOCALSTACK=true for local development
```

### 3. Start LocalStack

```bash
# Start LocalStack services
npm run local

# In a new terminal, initialize LocalStack resources
npm run local:init
```

### 4. Validate Infrastructure

```bash
# Verify all resources are created
npm run validate
```

You should see output like:

```
=== Infrastructure Validation Results ===

DynamoDB:
  ✓ medical-consultation-patients: OK
  ✓ medical-consultation-consultations: OK
  ✓ medical-consultation-symptom-logs: OK
  ✓ medical-consultation-document-metadata: OK

S3:
  ✓ medical-consultation-documents: OK

Cognito:
  ✓ medical-consultation-users: OK

✓ All infrastructure resources are properly configured!
```

### 5. Run Tests

```bash
# Run all tests including property-based tests
npm test
```

## AWS Deployment

### 1. Configure AWS Credentials

```bash
# Configure AWS CLI with your credentials
aws configure

# Verify credentials
aws sts get-caller-identity
```

### 2. Update Environment

```bash
# Edit .env and set:
USE_LOCALSTACK=false
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=your-account-id
```

### 3. Bootstrap CDK (First Time Only)

```bash
# Bootstrap CDK in your AWS account
cdk bootstrap aws://ACCOUNT-ID/REGION
```

### 4. Deploy Infrastructure

```bash
# Build TypeScript
npm run build

# Synthesize CloudFormation template
npm run cdk:synth

# Deploy to AWS
npm run cdk:deploy
```

The deployment will create:
- 4 DynamoDB tables with encryption
- 1 S3 bucket with encryption and lifecycle policies
- 1 Cognito User Pool with 3 user groups
- 1 KMS key for encryption

### 5. Verify Deployment

```bash
# Run validation against AWS
npm run validate
```

### 6. Note the Outputs

After deployment, CDK will output important values:

```
Outputs:
MedicalConsultationStack.PatientsTableName = medical-consultation-patients
MedicalConsultationStack.ConsultationsTableName = medical-consultation-consultations
MedicalConsultationStack.SymptomLogsTableName = medical-consultation-symptom-logs
MedicalConsultationStack.DocumentMetadataTableName = medical-consultation-document-metadata
MedicalConsultationStack.DocumentBucketName = medical-consultation-documents-123456789012
MedicalConsultationStack.UserPoolId = us-east-1_XXXXXXXXX
MedicalConsultationStack.UserPoolClientId = XXXXXXXXXXXXXXXXXXXXXXXXXX
MedicalConsultationStack.EncryptionKeyId = xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Update your `.env` file with these values.

## Project Structure

```
ai-medical-consultation-platform/
├── infrastructure/              # AWS CDK infrastructure code
│   ├── app.ts                  # CDK app entry point
│   └── stacks/
│       └── medical-consultation-stack.ts  # Main stack definition
├── src/
│   ├── types/
│   │   └── models.ts           # TypeScript data models
│   ├── utils/
│   │   ├── db-client.ts        # DynamoDB client
│   │   ├── s3-client.ts        # S3 client
│   │   ├── encryption.test.ts  # Encryption property tests
│   │   └── validate-infrastructure.ts  # Infrastructure validator
│   ├── components/             # Business logic (to be implemented)
│   └── handlers/               # Lambda handlers (to be implemented)
├── scripts/
│   └── init-localstack.sh      # LocalStack initialization script
├── docker-compose.yml          # LocalStack configuration
├── package.json
├── tsconfig.json
├── jest.config.js
├── cdk.json
├── .env.example
├── .gitignore
├── README.md
└── SETUP.md
```

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- encryption.test.ts
```

### Building

```bash
# Compile TypeScript
npm run build
```

### Deploying Changes

```bash
# After making infrastructure changes
npm run build
npm run cdk:deploy
```

### Cleaning Up

```bash
# Destroy all AWS resources (WARNING: This deletes data!)
npm run cdk:destroy

# Stop LocalStack
docker-compose down

# Remove LocalStack data
rm -rf localstack-data/
```

## Troubleshooting

### LocalStack Issues

**Problem**: Tables not created in LocalStack

```bash
# Check LocalStack logs
docker-compose logs localstack

# Restart LocalStack
docker-compose down
docker-compose up -d

# Re-run initialization
npm run local:init
```

**Problem**: Connection refused to LocalStack

```bash
# Verify LocalStack is running
docker ps

# Check endpoint in .env
LOCALSTACK_ENDPOINT=http://localhost:4566
```

### AWS Deployment Issues

**Problem**: CDK bootstrap fails

```bash
# Ensure AWS credentials are configured
aws sts get-caller-identity

# Try bootstrapping with explicit account/region
cdk bootstrap aws://123456789012/us-east-1
```

**Problem**: Insufficient permissions

Ensure your AWS user/role has permissions for:
- DynamoDB (CreateTable, DescribeTable)
- S3 (CreateBucket, PutBucketEncryption)
- Cognito (CreateUserPool)
- KMS (CreateKey, DescribeKey)
- CloudFormation (CreateStack, UpdateStack)

### Test Failures

**Problem**: Encryption tests fail in LocalStack

LocalStack has limited support for encryption features. Some tests are skipped in LocalStack mode. Run tests against AWS for full validation.

**Problem**: Tests timeout

Increase Jest timeout in `jest.config.js` or individual tests:

```typescript
test('my test', async () => {
  // test code
}, 60000); // 60 second timeout
```

## Next Steps

After completing Task 1 (infrastructure setup), you can proceed to:

1. **Task 2**: Implement Symptom Processor component
2. **Task 3**: Implement AI Clinical Reasoner with Amazon Bedrock
3. **Task 4**: Implement Condition Ranker

See `tasks.md` for the complete implementation plan.

## Security Notes

- Never commit `.env` files to version control
- Rotate AWS credentials regularly
- Use IAM roles with least privilege
- Enable MFA for AWS console access
- Review CloudTrail logs for audit trail
- Keep dependencies updated for security patches

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review AWS CloudWatch logs
3. Check LocalStack logs: `docker-compose logs`
4. Refer to the design document for architecture details
