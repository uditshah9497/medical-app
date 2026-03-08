# Deployment Guide - AI Medical Consultation Platform

## 🎯 Goal

Get your AI Medical Consultation Platform running with a live URL you can access.

## 📋 Prerequisites Checklist

Before deploying, ensure you have:

- [x] Node.js installed (you have v11.9.0 ✅)
- [x] npm packages installed (454 packages ✅)
- [ ] AWS Account (free tier available)
- [ ] AWS CLI installed
- [ ] AWS CDK CLI installed
- [ ] AWS credentials configured

## 🚀 Deployment Steps

### Step 1: Create AWS Account (if you don't have one)

1. Go to: https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the signup process (requires credit card, but free tier available)
4. Verify your email and phone number

### Step 2: Install AWS CLI

**Option A: Using winget (recommended)**
```powershell
winget install Amazon.AWSCLI
```

**Option B: Manual download**
1. Download from: https://aws.amazon.com/cli/
2. Run the installer
3. Restart your terminal

**Verify installation:**
```powershell
aws --version
```

### Step 3: Configure AWS Credentials

```powershell
aws configure
```

You'll be prompted for:
- **AWS Access Key ID**: Get from AWS Console → IAM → Users → Security credentials
- **AWS Secret Access Key**: Shown when you create the access key
- **Default region**: Enter `us-east-1` (or your preferred region)
- **Default output format**: Enter `json`

**To get Access Keys:**
1. Log into AWS Console: https://console.aws.amazon.com/
2. Click your name (top right) → Security credentials
3. Scroll to "Access keys" → Create access key
4. Choose "Command Line Interface (CLI)"
5. Copy the Access Key ID and Secret Access Key

### Step 4: Install AWS CDK

```powershell
# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Install CDK globally
npm install -g aws-cdk

# Verify installation
cdk --version
```

### Step 5: Bootstrap CDK (First Time Only)

```powershell
# This creates necessary AWS resources for CDK
cdk bootstrap
```

You should see:
```
✅  Environment aws://123456789012/us-east-1 bootstrapped.
```

### Step 6: Build the Project

```powershell
.\run.ps1 build
```

This compiles TypeScript to JavaScript.

### Step 7: Preview What Will Be Created

```powershell
.\run.ps1 cdk:synth
```

This shows you the CloudFormation template that will be deployed.

### Step 8: Deploy to AWS! 🚀

```powershell
.\run.ps1 cdk:deploy
```

**What happens:**
1. CDK creates a CloudFormation stack
2. AWS provisions all resources:
   - 4 DynamoDB tables
   - 1 S3 bucket
   - 1 Cognito User Pool
   - 1 KMS encryption key
3. Takes ~5-10 minutes

**You'll see progress like:**
```
MedicalConsultationStack: deploying...
MedicalConsultationStack: creating CloudFormation changeset...
 0/12 | 10:30:45 AM | CREATE_IN_PROGRESS   | AWS::CloudFormation::Stack | MedicalConsultationStack
 1/12 | 10:30:50 AM | CREATE_IN_PROGRESS   | AWS::KMS::Key | EncryptionKey
 2/12 | 10:31:00 AM | CREATE_IN_PROGRESS   | AWS::DynamoDB::Table | PatientsTable
...
```

### Step 9: Save the Outputs

After deployment completes, you'll see outputs like:

```
✅  MedicalConsultationStack

Outputs:
MedicalConsultationStack.PatientsTableName = medical-consultation-patients
MedicalConsultationStack.ConsultationsTableName = medical-consultation-consultations
MedicalConsultationStack.SymptomLogsTableName = medical-consultation-symptom-logs
MedicalConsultationStack.DocumentMetadataTableName = medical-consultation-document-metadata
MedicalConsultationStack.DocumentBucketName = medical-consultation-documents-123456789012
MedicalConsultationStack.UserPoolId = us-east-1_XXXXXXXXX
MedicalConsultationStack.UserPoolClientId = XXXXXXXXXXXXXXXXXXXXXXXXXX
MedicalConsultationStack.EncryptionKeyId = xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

Stack ARN:
arn:aws:cloudformation:us-east-1:123456789012:stack/MedicalConsultationStack/...
```

**IMPORTANT:** Copy these values! You'll need them for:
- Environment variables
- Frontend configuration
- API integration

### Step 10: Verify Deployment

```powershell
# Check if resources were created
aws dynamodb list-tables
aws s3 ls
aws cognito-idp list-user-pools --max-results 10
```

You should see your tables, bucket, and user pool listed!

### Step 11: Create a Test User

```powershell
# Create a patient user
aws cognito-idp admin-create-user `
  --user-pool-id us-east-1_XXXXXXXXX `
  --username testpatient@example.com `
  --user-attributes Name=email,Value=testpatient@example.com Name=given_name,Value=Test Name=family_name,Value=Patient `
  --temporary-password TempPass123! `
  --message-action SUPPRESS

# Add user to Patients group
aws cognito-idp admin-add-user-to-group `
  --user-pool-id us-east-1_XXXXXXXXX `
  --username testpatient@example.com `
  --group-name Patients
```

Replace `us-east-1_XXXXXXXXX` with your actual User Pool ID from the outputs.

## 🌐 What You Have Now

After deployment, you have:

✅ **Backend Infrastructure:**
- DynamoDB tables for storing patient data, consultations, symptoms, documents
- S3 bucket for blood reports and medical documents
- Cognito User Pool for authentication
- KMS encryption for all data

❌ **Not Yet Deployed:**
- API Gateway endpoints (Task 13)
- Lambda functions (Tasks 2-18)
- Frontend applications (Task 19)
- AI integration with Bedrock (Task 3)

## 🎯 Next Steps

### Option 1: Continue Building (Recommended)

Let me implement the remaining tasks so you have a complete, working application:

**What I'll build:**
- REST API endpoints
- Lambda functions for all business logic
- AI integration with Amazon Bedrock
- Patient web portal
- Doctor web portal
- Complete testing suite

**Result:** A fully functional platform with URLs you can access

### Option 2: Test Current Infrastructure

You can test what's deployed now:

```powershell
# Run validation tests
.\run.ps1 validate

# Run encryption tests
.\run.ps1 test -- encryption.test.ts
```

### Option 3: Deploy Frontend Only

If you want to see something visual now, I can create a simple frontend that connects to your deployed infrastructure.

## 💰 Cost Breakdown

**What you're paying for now:**

| Service | Cost (Monthly) | Notes |
|---------|---------------|-------|
| DynamoDB | $0-2 | Free tier: 25 GB storage, 25 WCU, 25 RCU |
| S3 | $0-1 | Free tier: 5 GB storage, 20,000 GET requests |
| Cognito | $0 | Free tier: 50,000 MAUs |
| KMS | $1 | $1/month per key |
| **Total** | **$1-3/month** | Very minimal! |

**When you add AI (Task 3):**
- Amazon Bedrock: ~$0.01-0.03 per request
- Estimate: $50-200/month with moderate usage

## 🔧 Troubleshooting

### "Unable to resolve AWS account"
**Solution:** Run `aws configure` and enter your credentials

### "CDK bootstrap required"
**Solution:** Run `cdk bootstrap`

### "Access Denied" errors
**Solution:** Ensure your AWS user has these permissions:
- DynamoDB: CreateTable, DescribeTable
- S3: CreateBucket, PutBucketEncryption
- Cognito: CreateUserPool
- KMS: CreateKey
- CloudFormation: CreateStack, UpdateStack

### Deployment fails
**Solution:** Check CloudFormation console for detailed error:
1. Go to: https://console.aws.amazon.com/cloudformation/
2. Find "MedicalConsultationStack"
3. Click "Events" tab to see what failed

## 🗑️ How to Delete Everything (Clean Up)

If you want to remove all AWS resources:

```powershell
.\run.ps1 cdk:destroy
```

**WARNING:** This deletes all data! Make sure you have backups.

## 📊 Monitoring Your Deployment

### View Resources in AWS Console

1. **DynamoDB Tables:**
   https://console.aws.amazon.com/dynamodbv2/

2. **S3 Buckets:**
   https://console.aws.amazon.com/s3/

3. **Cognito User Pools:**
   https://console.aws.amazon.com/cognito/

4. **CloudFormation Stack:**
   https://console.aws.amazon.com/cloudformation/

5. **Billing Dashboard:**
   https://console.aws.amazon.com/billing/

## 🎉 Success Checklist

After deployment, you should have:

- [x] CloudFormation stack created successfully
- [x] 4 DynamoDB tables visible in AWS Console
- [x] 1 S3 bucket visible in AWS Console
- [x] 1 Cognito User Pool visible in AWS Console
- [x] Stack outputs saved for reference
- [ ] Test user created (optional)
- [ ] Validation tests passing

## 📞 Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Look at CloudFormation events in AWS Console
3. Ask me! I can help debug any deployment issues

## 🚀 Ready for the Next Phase?

Once infrastructure is deployed, we can:

1. **Build the API layer** (Tasks 13-14)
2. **Implement AI components** (Tasks 3-5)
3. **Create frontend applications** (Task 19)
4. **Deploy complete platform** (Tasks 20-21)

**Want me to continue?** Just say "continue building" and I'll implement all remaining tasks!

---

**Quick Deploy Command:**
```powershell
.\run.ps1 cdk:deploy
```

**Quick Destroy Command:**
```powershell
.\run.ps1 cdk:destroy
```
