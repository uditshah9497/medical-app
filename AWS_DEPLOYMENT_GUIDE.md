# AWS Deployment Guide - AI Medical Consultation Platform

This guide will help you deploy your application to AWS using your credits.

## 🎯 Deployment Options

### Option 1: Quick Deploy with AWS Amplify (Recommended for Beginners)
**Cost:** ~$5-10/month | **Time:** 15 minutes | **Difficulty:** Easy

### Option 2: Full AWS Infrastructure with CDK (Production-Ready)
**Cost:** ~$20-50/month | **Time:** 1-2 hours | **Difficulty:** Intermediate

---

## 🚀 Option 1: AWS Amplify Deployment (Recommended)

### Prerequisites
1. AWS Account with credits
2. GitHub account (to host your code)

### Step 1: Prepare Your Application

1. **Create a production build script** - Add to `package.json`:
```json
{
  "scripts": {
    "build": "tsc",
    "start:prod": "node dist/server.js"
  }
}
```

2. **Create `.gitignore`** (if not exists):
```
node_modules/
dist/
.env
*.log
```

3. **Push code to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/medical-consultation.git
git push -u origin main
```

### Step 2: Deploy to AWS Amplify

1. **Go to AWS Console** → Search for "Amplify"

2. **Click "New app" → "Host web app"**

3. **Connect GitHub**:
   - Authorize AWS Amplify
   - Select your repository
   - Select `main` branch

4. **Configure build settings**:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: public
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
backend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
```

5. **Click "Save and Deploy"**

6. **Wait 5-10 minutes** - Amplify will:
   - Build your application
   - Deploy to CloudFront CDN
   - Provide you with a URL like: `https://main.d1234567890.amplifyapp.com`

### Step 3: Configure Environment Variables

In Amplify Console:
1. Go to "Environment variables"
2. Add:
   - `NODE_ENV` = `production`
   - `PORT` = `3000`

---

## 🏗️ Option 2: Full AWS Infrastructure Deployment

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │   Route 53   │─────▶│ CloudFront   │                     │
│  │     DNS      │      │     CDN      │                     │
│  └──────────────┘      └──────┬───────┘                     │
│                               │                              │
│                               ▼                              │
│  ┌──────────────────────────────────────────┐               │
│  │         Application Load Balancer         │               │
│  └──────────────┬───────────────────────────┘               │
│                 │                                            │
│                 ▼                                            │
│  ┌──────────────────────────────────────────┐               │
│  │         ECS Fargate (Containers)         │               │
│  │  ┌────────────┐      ┌────────────┐     │               │
│  │  │  Node.js   │      │  Node.js   │     │               │
│  │  │  Server    │      │  Server    │     │               │
│  │  └────────────┘      └────────────┘     │               │
│  └──────────────────────────────────────────┘               │
│                 │                                            │
│                 ▼                                            │
│  ┌──────────────────────────────────────────┐               │
│  │            DynamoDB Tables                │               │
│  │  • Users  • Consultations  • Appointments│               │
│  └──────────────────────────────────────────┘               │
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │   S3 Bucket  │      │  Amazon SES  │                     │
│  │ (Reports)    │      │   (Email)    │                     │
│  └──────────────┘      └──────────────┘                     │
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │   Cognito    │      │   Bedrock    │                     │
│  │    (Auth)    │      │     (AI)     │                     │
│  └──────────────┘      └──────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

### Prerequisites

1. **Install AWS CLI**:
```bash
# Windows (PowerShell as Administrator)
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Verify installation
aws --version
```

2. **Configure AWS CLI**:
```bash
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1
# - Default output format: json
```

3. **Install AWS CDK**:
```bash
npm install -g aws-cdk
cdk --version
```

### Step 1: Bootstrap CDK

```bash
cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1
```

### Step 2: Update CDK Stack

Your infrastructure code is already in `infrastructure/stacks/medical-consultation-stack.ts`

### Step 3: Deploy Infrastructure

```bash
# Synthesize CloudFormation template
cdk synth

# Deploy to AWS
cdk deploy

# This will create:
# - DynamoDB tables
# - S3 bucket
# - Cognito User Pool
# - KMS encryption keys
```

### Step 4: Deploy Application to ECS

1. **Create Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

2. **Build and push Docker image**:
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Create ECR repository
aws ecr create-repository --repository-name medical-consultation

# Build image
docker build -t medical-consultation .

# Tag image
docker tag medical-consultation:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/medical-consultation:latest

# Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/medical-consultation:latest
```

3. **Create ECS Cluster and Service** (via AWS Console or CDK)

---

## 💰 Cost Estimation

### AWS Amplify (Option 1)
- **Hosting**: $0.01 per GB served (~$5/month for 500GB)
- **Build minutes**: $0.01 per minute (first 1000 free)
- **Total**: ~$5-10/month

### Full Infrastructure (Option 2)
- **ECS Fargate**: ~$15/month (2 tasks)
- **DynamoDB**: ~$5/month (on-demand)
- **S3**: ~$1/month (first 5GB free)
- **CloudFront**: ~$5/month
- **SES**: $0.10 per 1000 emails
- **Bedrock**: Pay per use (~$0.01 per request)
- **Total**: ~$20-50/month

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Enable HTTPS/SSL certificates
- [ ] Set up AWS WAF (Web Application Firewall)
- [ ] Enable CloudWatch logging
- [ ] Set up AWS Secrets Manager for sensitive data
- [ ] Enable DynamoDB encryption at rest
- [ ] Configure S3 bucket policies
- [ ] Set up IAM roles with least privilege
- [ ] Enable MFA for AWS root account
- [ ] Set up CloudTrail for audit logging
- [ ] Configure backup policies

---

## 📊 Monitoring & Logging

### CloudWatch Setup

1. **Create Log Groups**:
```bash
aws logs create-log-group --log-group-name /aws/medical-consultation/app
```

2. **Set up Alarms**:
- High error rate
- High latency
- Low disk space
- High CPU usage

3. **Enable X-Ray** for distributed tracing

---

## 🚀 Quick Start Commands

### For AWS Amplify:
```bash
# 1. Push to GitHub
git push origin main

# 2. Deploy via Amplify Console (web interface)
# Visit: https://console.aws.amazon.com/amplify
```

### For CDK Deployment:
```bash
# 1. Install dependencies
npm install

# 2. Bootstrap CDK
cdk bootstrap

# 3. Deploy infrastructure
cdk deploy

# 4. Build and deploy application
npm run build
# Then deploy to ECS/Elastic Beanstalk
```

---

## 🆘 Troubleshooting

### Issue: CDK Deploy Fails
**Solution**: Check AWS credentials and permissions
```bash
aws sts get-caller-identity
```

### Issue: Application Not Accessible
**Solution**: Check security groups and load balancer settings

### Issue: Database Connection Errors
**Solution**: Verify DynamoDB table names and IAM permissions

---

## 📚 Additional Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [AWS Cost Calculator](https://calculator.aws/)

---

## 🎓 Recommended Approach

**For your first deployment with AWS credits:**

1. ✅ Start with **AWS Amplify** (Option 1)
   - Easiest and fastest
   - Automatic scaling
   - Built-in CI/CD
   - Perfect for demos and MVPs

2. 📈 Later migrate to **Full Infrastructure** (Option 2)
   - When you need more control
   - For production workloads
   - Better cost optimization
   - Advanced features (Bedrock AI, etc.)

---

## 🎯 Next Steps

1. Choose your deployment option
2. Follow the step-by-step guide
3. Test your deployed application
4. Set up monitoring and alerts
5. Configure custom domain (optional)

**Need help?** Check the AWS documentation or AWS Support (included with credits).

Good luck with your deployment! 🚀
