# AWS Elastic Beanstalk Deployment Guide

Complete guide to deploy your Medical Consultation App to AWS Elastic Beanstalk.

## Why Elastic Beanstalk?

- ✅ Perfect for Node.js applications
- ✅ Auto-scaling and load balancing
- ✅ Easy environment management
- ✅ Integrated with other AWS services
- ✅ Free tier eligible (first year)

## Prerequisites

1. AWS Account with credits
2. AWS CLI installed and configured
3. EB CLI installed
4. Your app code (already on GitHub)

---

## Step 1: Install AWS CLI (if not installed)

### Windows:
```powershell
# Download and install from:
https://awscli.amazonaws.com/AWSCLIV2.msi

# Verify installation
aws --version
```

### Configure AWS CLI:
```powershell
aws configure
```

Enter:
- AWS Access Key ID: (from AWS Console → IAM → Security Credentials)
- AWS Secret Access Key: (from AWS Console)
- Default region: `us-east-1`
- Default output format: `json`

---

## Step 2: Install Elastic Beanstalk CLI

```powershell
pip install awsebcli --upgrade --user
```

Verify installation:
```powershell
eb --version
```

If `eb` command not found, add to PATH:
```powershell
$env:Path += ";$env:USERPROFILE\AppData\Roaming\Python\Python311\Scripts"
```

---

## Step 3: Initialize Elastic Beanstalk

Navigate to your project directory:
```powershell
cd C:\Users\Adit\OneDrive\Desktop\Project_AWS_Hackathon
```

Initialize EB:
```powershell
eb init
```

Answer the prompts:
1. **Select a default region:** `1) us-east-1`
2. **Select an application to use:** `[ Create new Application ]`
3. **Enter Application Name:** `medical-consultation-app`
4. **Platform:** `Node.js`
5. **Platform version:** `Node.js 18 running on 64bit Amazon Linux 2023`
6. **Do you wish to continue with CodeCommit?** `n` (No)
7. **Do you want to set up SSH?** `y` (Yes, recommended)

---

## Step 4: Create Environment

Create a new environment:
```powershell
eb create medical-app-env
```

Options:
1. **Environment name:** `medical-app-env` (press Enter)
2. **DNS CNAME prefix:** `medical-app-env` (press Enter)
3. **Load balancer type:** `2) application` (recommended)

This will take 5-10 minutes. EB will:
- Create EC2 instance
- Set up load balancer
- Configure security groups
- Deploy your application

---

## Step 5: Set Environment Variables

Set your email credentials and other config:

```powershell
eb setenv EMAIL_USER=your-email@gmail.com EMAIL_PASS=your-app-password NODE_ENV=production PORT=8080
```

**Important:** Replace with your actual Gmail credentials!

---

## Step 6: Deploy Your Application

Deploy the current code:
```powershell
eb deploy
```

This will:
- Package your application
- Upload to S3
- Deploy to EC2 instance
- Restart the application

Takes 2-3 minutes.

---

## Step 7: Open Your Application

```powershell
eb open
```

This opens your app in the browser!

Your URL will be: `http://medical-app-env.eba-xxxxxxxx.us-east-1.elasticbeanstalk.com`

---

## Step 8: Check Application Health

```powershell
# Check environment status
eb status

# View logs
eb logs

# SSH into instance (if needed)
eb ssh
```

---

## Updating Your Application

When you make changes:

```powershell
# 1. Commit changes to git
git add .
git commit -m "Your changes"
git push

# 2. Deploy to EB
eb deploy
```

---

## Environment Management

### View all environments:
```powershell
eb list
```

### Switch environment:
```powershell
eb use medical-app-env
```

### Terminate environment (to save costs):
```powershell
eb terminate medical-app-env
```

**Warning:** This deletes everything! Only do this when you're done testing.

---

## Monitoring & Logs

### View recent logs:
```powershell
eb logs
```

### Stream logs in real-time:
```powershell
eb logs --stream
```

### View in AWS Console:
```powershell
eb console
```

This opens the EB dashboard in your browser.

---

## Cost Estimation

### Free Tier (First 12 months):
- ✅ 750 hours/month of t2.micro or t3.micro instance
- ✅ 5 GB of S3 storage
- ✅ Your app should run FREE for the first year!

### After Free Tier:
- t3.micro instance: ~$7-10/month
- Load balancer: ~$16/month
- Data transfer: ~$1-5/month
- **Total:** ~$25-30/month

### Your AWS Credits:
Your AWS credits will cover these costs!

---

## Troubleshooting

### Application not starting:
```powershell
# Check logs
eb logs

# Common issues:
# 1. Missing dependencies - check package.json
# 2. Wrong Node version - check .elasticbeanstalk/config.yml
# 3. Port issues - EB expects port 8080
```

### Environment variables not working:
```powershell
# List current env vars
eb printenv

# Set again
eb setenv EMAIL_USER=your-email@gmail.com EMAIL_PASS=your-app-password
```

### Deployment fails:
```powershell
# Check status
eb status

# View health
eb health

# Rebuild environment
eb rebuild
```

### High costs:
```powershell
# Use t3.micro instead of t3.small
eb scale 1 --instance-type t3.micro

# Terminate when not in use
eb terminate
```

---

## Production Checklist

Before going live:

- [ ] Set up custom domain (Route 53)
- [ ] Enable HTTPS (AWS Certificate Manager - FREE)
- [ ] Set up DynamoDB for persistent data
- [ ] Configure AWS SES for email sending
- [ ] Set up CloudWatch alarms
- [ ] Enable auto-scaling
- [ ] Set up backup strategy
- [ ] Configure security groups properly

---

## Custom Domain Setup (Optional)

### Step 1: Get a domain
- Use Route 53 or any domain registrar
- Example: mediconsult.com

### Step 2: Configure in EB
```powershell
# In EB Console:
# Environment → Configuration → Load Balancer
# Add listener on port 443 (HTTPS)
# Add SSL certificate from ACM
```

### Step 3: Update Route 53
- Create A record pointing to EB environment
- Create CNAME for www subdomain

---

## Useful Commands Cheat Sheet

```powershell
# Initialize
eb init

# Create environment
eb create medical-app-env

# Deploy
eb deploy

# Open in browser
eb open

# View status
eb status

# View logs
eb logs

# Set environment variables
eb setenv KEY=value

# SSH into instance
eb ssh

# Terminate environment
eb terminate

# View all environments
eb list

# Open EB console
eb console
```

---

## Next Steps After Deployment

1. **Test your live app:**
   - Register a new user
   - Book a consultation
   - Check if emails are being sent

2. **Monitor performance:**
   - Check CloudWatch metrics
   - Review application logs
   - Monitor costs in AWS Billing

3. **Set up production database:**
   - Migrate from in-memory to DynamoDB
   - See `AWS_DEPLOYMENT_GUIDE.md` for details

4. **Enable HTTPS:**
   - Get SSL certificate from ACM (free)
   - Configure load balancer

5. **Set up CI/CD:**
   - Automate deployments from GitHub
   - Use AWS CodePipeline

---

## Support

If you encounter issues:
1. Check logs: `eb logs`
2. Check AWS Console: `eb console`
3. Review EB documentation: https://docs.aws.amazon.com/elasticbeanstalk/
4. Check AWS Service Health Dashboard

---

## Summary

Your app is now running on AWS Elastic Beanstalk! 🎉

- **URL:** Check with `eb open`
- **Monitoring:** `eb console`
- **Logs:** `eb logs`
- **Updates:** `eb deploy`

**Estimated time:** 15-20 minutes for first deployment
**Cost:** FREE (with AWS credits and free tier)

---

**Created:** March 9, 2026  
**Last Updated:** March 9, 2026
