# Quick Start Guide - AI Medical Consultation Platform

## ✅ Current Status

- ✅ Node.js installed (npm 11.9.0)
- ✅ Project dependencies installed (454 packages)
- ✅ Infrastructure code ready
- ✅ Core data models defined
- ✅ Encryption tests implemented

## 🚀 Next Steps to Run the Project

### Option 1: Local Development (Recommended for Testing)

**Step 1: Install Docker Desktop**
- Download from: https://www.docker.com/products/docker-desktop/
- Install and start Docker Desktop
- This is needed for LocalStack (local AWS simulation)

**Step 2: Start LocalStack**
```powershell
# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Start LocalStack
npm run local
```

**Step 3: Initialize Infrastructure (in a new terminal)**
```powershell
# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Initialize LocalStack resources
npm run local:init

# Validate infrastructure
npm run validate
```

**Step 4: Run Tests**
```powershell
# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Run all tests
npm test

# Or run specific test
npm test -- encryption.test.ts
```

### Option 2: Deploy to AWS (Production)

**Prerequisites:**
- AWS Account with billing enabled
- AWS CLI installed and configured
- AWS CDK CLI installed globally

**Step 1: Install AWS CLI**
```powershell
# Download from: https://aws.amazon.com/cli/
# Or use winget:
winget install Amazon.AWSCLI
```

**Step 2: Configure AWS Credentials**
```powershell
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Output format (json)
```

**Step 3: Install AWS CDK**
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

npm install -g aws-cdk
```

**Step 4: Bootstrap CDK (First Time Only)**
```powershell
cdk bootstrap
```

**Step 5: Deploy Infrastructure**
```powershell
# Build TypeScript
npm run build

# Deploy to AWS
npm run cdk:deploy
```

**Step 6: Note the Outputs**
After deployment, you'll see outputs like:
```
Outputs:
MedicalConsultationStack.PatientsTableName = medical-consultation-patients
MedicalConsultationStack.DocumentBucketName = medical-consultation-documents-123456789012
MedicalConsultationStack.UserPoolId = us-east-1_XXXXXXXXX
...
```

Save these values - you'll need them for the frontend!

## 📋 Available Commands

### Development
```powershell
# Always refresh PATH first in new terminals:
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Build TypeScript
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Start LocalStack
npm run local

# Initialize LocalStack
npm run local:init

# Validate infrastructure
npm run validate
```

### AWS Deployment
```powershell
# Synthesize CloudFormation template
npm run cdk:synth

# Deploy to AWS
npm run cdk:deploy

# Destroy AWS resources (WARNING: Deletes data!)
npm run cdk:destroy
```

## 🏗️ Project Structure

```
Project_AWS_Hackathon/
├── .kiro/specs/              # Specification documents
├── infrastructure/           # AWS CDK infrastructure code
│   ├── app.ts               # CDK entry point
│   └── stacks/              # Stack definitions
├── src/
│   ├── types/               # TypeScript type definitions
│   ├── components/          # Business logic (being implemented)
│   ├── handlers/            # Lambda handlers (to be implemented)
│   └── utils/               # Utility functions
├── scripts/                 # Helper scripts
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── jest.config.js           # Test configuration
└── docker-compose.yml       # LocalStack configuration
```

## 🎯 What's Implemented So Far

### ✅ Completed (Tasks 1 & 1.1)
- Project infrastructure setup
- TypeScript configuration
- AWS CDK infrastructure code:
  - 4 DynamoDB tables with KMS encryption
  - S3 bucket with encryption and lifecycle policies
  - Cognito User Pool with 3 user groups
  - KMS encryption key
- Core data models (20+ TypeScript interfaces)
- Property-based test for encryption validation
- LocalStack configuration
- Development utilities

### 🚧 In Progress (Tasks 2-21)
The remaining 80+ tasks are queued and ready to be implemented:
- Symptom Processor component
- AI Clinical Reasoner (Amazon Bedrock integration)
- Condition Ranker
- Test Recommender
- Document Processor (Amazon Textract)
- Re-Evaluation Engine
- Doctor Review workflow
- Medicine Recommender
- API Gateway & Lambda functions
- Security & compliance features
- Frontend applications (Patient & Doctor portals)
- Integration & performance testing

## 🔧 Troubleshooting

### npm not recognized
**Solution:** Close and reopen your terminal, or run:
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

### Docker not running
**Solution:** Start Docker Desktop application

### AWS credentials not configured
**Solution:** Run `aws configure` and enter your credentials

### Tests failing
**Solution:** Ensure infrastructure is deployed (LocalStack or AWS)

## 📚 Documentation

- `README.md` - Project overview and architecture
- `SETUP.md` - Detailed setup instructions
- `RUN_TESTS.md` - Testing guide
- `.kiro/specs/ai-medical-consultation/requirements.md` - Requirements
- `.kiro/specs/ai-medical-consultation/design.md` - Design document
- `.kiro/specs/ai-medical-consultation/tasks.md` - Implementation tasks

## 🎓 Learning Resources

- AWS CDK: https://docs.aws.amazon.com/cdk/
- Amazon Bedrock: https://aws.amazon.com/bedrock/
- LocalStack: https://docs.localstack.cloud/
- TypeScript: https://www.typescriptlang.org/docs/

## 💰 Cost Estimate (AWS Deployment)

**Development/Testing:**
- DynamoDB (on-demand): ~$1-5/month
- S3: ~$0.50/month
- Cognito: Free tier (50,000 MAUs)
- Lambda: Free tier (1M requests/month)
- **Total: ~$2-10/month**

**Production (with AI):**
- Amazon Bedrock: ~$0.01-0.03 per request
- API Gateway: ~$3.50 per million requests
- Additional compute and storage costs
- **Estimate: $50-500/month depending on usage**

## 🚨 Important Notes

1. **This is a healthcare application** - Ensure HIPAA compliance before production use
2. **Amazon Bedrock requires special access** - Request access in AWS Console
3. **Costs can add up** - Monitor your AWS billing dashboard
4. **LocalStack is for development only** - Not for production
5. **Keep credentials secure** - Never commit .env files

## 🎉 Ready to Continue?

You have two options:

1. **Continue building locally** - I can implement all remaining tasks (2-21) so the complete codebase is ready
2. **Deploy what we have** - Deploy the current infrastructure to AWS and test it

Which would you like to do?
