# AI-Powered Medical Consultation Platform

An AI-powered medical consultation platform that uses AWS Generative AI services to provide intelligent medical consultation support while maintaining strict doctor oversight.

## Architecture

The platform implements a "doctor-in-the-loop" architecture where AI serves as a decision-support tool rather than an autonomous diagnostic system. Key components include:

- **Frontend**: AWS Amplify-hosted responsive web applications for patients and doctors
- **API Layer**: Amazon API Gateway with AWS Lambda functions
- **AI/ML**: Amazon Bedrock for clinical reasoning, RAG system for medical knowledge
- **Data Storage**: Amazon DynamoDB for structured data, S3 for documents
- **Authentication**: AWS Cognito with role-based access control
- **Security**: KMS encryption, audit logging, HIPAA compliance

## Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with appropriate credentials
- Docker and Docker Compose (for local development)
- AWS CDK CLI (`npm install -g aws-cdk`)

## Project Structure

```
.
├── infrastructure/          # AWS CDK infrastructure code
│   ├── app.ts              # CDK app entry point
│   └── stacks/             # CDK stack definitions
├── src/
│   ├── types/              # TypeScript type definitions
│   ├── components/         # Business logic components
│   ├── handlers/           # Lambda function handlers
│   └── utils/              # Utility functions
├── tests/                  # Test files
├── docker-compose.yml      # LocalStack configuration
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

### 3. Local Development with LocalStack

Start LocalStack for local AWS service emulation:

```bash
npm run local
```

This starts LocalStack with DynamoDB, S3, Cognito, KMS, Lambda, and API Gateway.

### 4. Deploy Infrastructure

For local development:

```bash
# Set LocalStack endpoint
export AWS_ENDPOINT_URL=http://localhost:4566

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy stack
npm run cdk:deploy
```

For AWS deployment:

```bash
# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy to AWS
npm run cdk:deploy
```

### 5. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Data Models

### Core Tables

1. **Patients Table** (`medical-consultation-patients`)
   - Partition Key: `patientId`
   - GSI: `email-index` for login lookup
   - Stores patient demographics and medical history

2. **Consultations Table** (`medical-consultation-consultations`)
   - Partition Key: `consultationId`
   - Sort Key: `patientId`
   - GSI: `patientId-status-index` for patient history
   - GSI: `status-createdAt-index` for doctor queue
   - Stores consultation records with AI reasoning and doctor reviews

3. **Symptom Logs Table** (`medical-consultation-symptom-logs`)
   - Partition Key: `consultationId`
   - Sort Key: `timestamp`
   - GSI: `patientId-timestamp-index` for patient timeline
   - Stores symptom entries and daily updates

4. **Document Metadata Table** (`medical-consultation-document-metadata`)
   - Partition Key: `documentId`
   - GSI: `consultationId-uploadedAt-index`
   - Stores metadata for blood reports and medical documents

### S3 Buckets

- **Document Bucket**: Encrypted storage for blood reports and medical documents
  - Lifecycle policy: Archive to Glacier after 1 year
  - Versioning enabled for audit trail

## Security Features

- **Encryption at Rest**: All DynamoDB tables and S3 buckets encrypted with KMS
- **Encryption in Transit**: TLS 1.2+ for all API communications
- **Authentication**: AWS Cognito with MFA support
- **Authorization**: Role-based access control (Patient, Doctor, Admin)
- **Audit Logging**: All data access and modifications logged
- **HIPAA Compliance**: Architecture designed for HIPAA compliance

## User Roles

1. **Patients**: Can submit symptoms, upload documents, view approved recommendations
2. **Doctors**: Can review AI recommendations, approve/modify/reject, prescribe medications
3. **Admins**: Can manage users, monitor system health, access audit logs

## Development Workflow

1. Make code changes in `src/`
2. Write tests in corresponding `.test.ts` files
3. Run tests: `npm test`
4. Build: `npm run build`
5. Deploy infrastructure changes: `npm run cdk:deploy`

## Testing Strategy

The project uses a dual testing approach:

- **Unit Tests**: Test specific examples and edge cases
- **Property-Based Tests**: Verify universal properties across all inputs

See the design document for detailed testing requirements.

## License

MIT
