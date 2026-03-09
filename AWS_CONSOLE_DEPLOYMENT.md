# Deploy to AWS Using Console Only (No CLI Required!)

Deploy your Medical Consultation App to AWS Elastic Beanstalk using only your web browser. Perfect for using your AWS credits!

## 🎯 What You'll Get

- ✅ Uses your AWS credits
- ✅ No Python/pip installation needed
- ✅ No command-line tools required
- ✅ Everything done in AWS Console (browser)
- ✅ Professional AWS infrastructure
- ✅ Auto-scaling and load balancing

---

## 📋 Prerequisites

1. AWS Account with credits
2. Your GitHub repository: `https://github.com/uditshah9497/medical-app`
3. Gmail App Password (for email sending)

---

## 🚀 Step-by-Step Deployment

### Step 1: Download Your Code as ZIP

Since we can't use CLI, we'll upload a ZIP file:

1. Go to your GitHub repository:
   ```
   https://github.com/uditshah9497/medical-app
   ```

2. Click the green **"Code"** button

3. Click **"Download ZIP"**

4. Save the file (e.g., `medical-app-main.zip`)

5. **Extract the ZIP file** to a folder

---

### Step 2: Prepare the ZIP for AWS

1. Open the extracted folder: `medical-app-main`

2. **Delete these folders/files** (to reduce size):
   - `node_modules/` (if exists)
   - `.git/` folder
   - `infrastructure/` folder
   - `cdk.out/` folder
   - All `.md` files except `README.md`

3. **Select all remaining files and folders**

4. **Right-click** → **Send to** → **Compressed (zipped) folder**

5. Name it: `medical-app-deploy.zip`

**Important:** The ZIP should contain files at the root level (not inside a folder)

---

### Step 3: Sign in to AWS Console

1. Go to: https://console.aws.amazon.com/

2. Sign in with your AWS account

3. Make sure you're in the **us-east-1** region (top right corner)

---

### Step 4: Go to Elastic Beanstalk

1. In the AWS Console search bar (top), type: **Elastic Beanstalk**

2. Click on **"Elastic Beanstalk"** service

3. You'll see the Elastic Beanstalk dashboard

---

### Step 5: Create New Application

1. Click the orange **"Create Application"** button

2. Fill in the form:

**Application name:**
```
medical-consultation-app
```

**Application tags:** (optional, leave empty)

**Platform:**
- Platform: **Node.js**
- Platform branch: **Node.js 18 running on 64bit Amazon Linux 2023**
- Platform version: **Recommended**

**Application code:**
- Select: **Upload your code**
- Version label: `v1`
- Click **"Choose file"**
- Select your `medical-app-deploy.zip`

**Presets:**
- Select: **Single instance (free tier eligible)**

3. Click **"Next"** at the bottom

---

### Step 6: Configure Service Access

**Service role:**
- Select: **Create and use new service role**
- Service role name: `aws-elasticbeanstalk-service-role` (auto-filled)

**EC2 key pair:** (optional)
- Select: **Proceed without an EC2 key pair**

**EC2 instance profile:**
- Select: **Create and use new instance profile**
- Instance profile name: `aws-elasticbeanstalk-ec2-role` (auto-filled)

Click **"Next"**

---

### Step 7: Set Up Networking (Optional)

**VPC:** Use default VPC

**Public IP address:** ✅ Activated

**Instance subnets:** Select at least one subnet

Click **"Next"**

---

### Step 8: Configure Instance

**Root volume type:** General Purpose (SSD)

**Size:** 10 GB

**EC2 security groups:** (leave default)

Click **"Next"**

---

### Step 9: Configure Updates and Monitoring

**Monitoring:** Basic (free)

**Managed updates:** Disabled (for now)

Click **"Next"**

---

### Step 10: Review and Submit

1. Review all settings

2. Click **"Submit"** at the bottom

3. **Wait 5-10 minutes** for environment creation

You'll see:
```
Creating environment...
✓ Creating resources
✓ Launching instances
✓ Deploying application
```

---

### Step 11: Add Environment Variables

Once the environment is created (status shows green checkmark):

1. In the left sidebar, click **"Configuration"**

2. Find **"Software"** section

3. Click **"Edit"**

4. Scroll down to **"Environment properties"**

5. Add these variables:

| Name | Value |
|------|-------|
| `EMAIL_USER` | your-email@gmail.com |
| `EMAIL_PASS` | your-16-char-app-password |
| `NODE_ENV` | production |
| `PORT` | 8080 |

6. Click **"Apply"** at the bottom

7. Wait 2-3 minutes for the environment to update

---

### Step 12: Access Your Application

1. In the Elastic Beanstalk dashboard

2. You'll see your environment URL:
   ```
   http://medical-consultation-app.us-east-1.elasticbeanstalk.com
   ```

3. Click the URL to open your live app! 🎉

---

## 🔄 Updating Your Application

When you make changes to your code:

### Method 1: Upload New Version

1. Download updated code from GitHub as ZIP

2. Prepare ZIP file (same as Step 2)

3. Go to Elastic Beanstalk dashboard

4. Click **"Upload and deploy"** button

5. Choose your new ZIP file

6. Version label: `v2` (or v3, v4, etc.)

7. Click **"Deploy"**

8. Wait 2-3 minutes

### Method 2: Use GitHub Actions (Advanced)

Set up automatic deployments from GitHub - see `AWS_EB_DEPLOYMENT.md` for details.

---

## 📊 Monitoring Your Application

### View Application Logs:

1. Go to your environment dashboard

2. Click **"Logs"** in the left sidebar

3. Click **"Request Logs"** → **"Last 100 Lines"**

4. Click **"Download"** to view logs

### Check Application Health:

1. Dashboard shows health status:
   - 🟢 **Green** = Healthy
   - 🟡 **Yellow** = Warning
   - 🔴 **Red** = Error

2. Click **"Health"** in sidebar for details

### View Metrics:

1. Click **"Monitoring"** in sidebar

2. See CPU, network, and request metrics

---

## 💰 Cost with AWS Credits

**Free Tier (First 12 months):**
- ✅ 750 hours/month of t2.micro or t3.micro
- ✅ Your app runs FREE!

**With Your AWS Credits:**
- ✅ All costs covered by credits
- ✅ No charges to your card

**Estimated Monthly Cost (without credits):**
- t3.micro instance: ~$7-10/month
- Load balancer: ~$16/month (if using)
- Data transfer: ~$1-5/month
- **Total:** ~$25-30/month

**Your credits will cover this!**

---

## 🐛 Troubleshooting

### Application Health is Red:

1. Click **"Logs"** → **"Request Logs"** → **"Last 100 Lines"**

2. Download and check for errors

3. Common issues:
   - Missing environment variables
   - Port configuration (should be 8080)
   - Dependencies not installed

### Application Not Starting:

1. Check logs for errors

2. Verify `package.json` has correct start script:
   ```json
   "start": "ts-node server.ts"
   ```

3. Make sure all dependencies are in `package.json`

### Environment Variables Not Working:

1. Go to **Configuration** → **Software** → **Edit**

2. Verify all 4 variables are set correctly

3. Click **"Apply"** and wait for update

### High Costs:

1. Use t3.micro instance (free tier eligible)

2. Disable load balancer if not needed:
   - Configuration → Capacity → Edit
   - Environment type: Single instance

3. Terminate environment when not in use:
   - Actions → Terminate environment

---

## 🔒 Security Best Practices

### Enable HTTPS (Free):

1. Go to **Configuration** → **Load balancer** → **Edit**

2. Add listener:
   - Port: 443
   - Protocol: HTTPS
   - SSL certificate: Request from ACM (free)

3. Apply changes

### Set Up Custom Domain:

1. Go to Route 53 (AWS DNS service)

2. Register domain or use existing

3. Create A record pointing to EB environment

4. Update EB configuration with custom domain

---

## 📱 Mobile-Friendly Monitoring

### AWS Console Mobile App:

1. Download "AWS Console" app (iOS/Android)

2. Sign in with your AWS account

3. Monitor your application on the go

4. View logs and metrics

5. Get alerts for issues

---

## ✅ Post-Deployment Checklist

- [ ] Application is accessible via URL
- [ ] Health status is green
- [ ] Environment variables are set
- [ ] Email sending works (test it!)
- [ ] All features work correctly
- [ ] Logs show no errors
- [ ] Set up billing alerts (to monitor credit usage)

---

## 🎯 Next Steps

1. **Test your application:**
   - Register a new user
   - Book a consultation
   - Test all features

2. **Set up monitoring:**
   - Enable CloudWatch alarms
   - Set up SNS notifications

3. **Optimize costs:**
   - Use t3.micro (free tier)
   - Single instance (no load balancer)
   - Terminate when not testing

4. **Production readiness:**
   - Set up DynamoDB (persistent data)
   - Configure AWS SES (email sending)
   - Enable HTTPS
   - Add custom domain

---

## 📞 Support

**AWS Documentation:**
- Elastic Beanstalk: https://docs.aws.amazon.com/elasticbeanstalk/
- Free Tier: https://aws.amazon.com/free/

**AWS Support:**
- Basic support included with all accounts
- Community forums: https://forums.aws.amazon.com/

**Check Your Credits:**
- Go to: https://console.aws.amazon.com/billing/
- Click "Credits" to see remaining balance

---

## 🎉 Summary

You've deployed your Medical Consultation App to AWS using only your browser!

**Your URL:** Check in Elastic Beanstalk dashboard

**Cost:** FREE (using AWS credits and free tier)

**Time:** 15-20 minutes

**No CLI tools needed!** ✅

---

## 🔄 Quick Reference

**Update app:**
1. Download code from GitHub as ZIP
2. EB Dashboard → Upload and deploy
3. Choose ZIP file → Deploy

**View logs:**
1. EB Dashboard → Logs
2. Request Logs → Last 100 Lines
3. Download

**Change environment variables:**
1. Configuration → Software → Edit
2. Update Environment properties
3. Apply

**Terminate (to save credits):**
1. Actions → Terminate environment
2. Confirm termination

---

**Deployment Method:** AWS Console (Browser Only)  
**Time Required:** 15-20 minutes  
**Cost:** FREE with AWS credits  
**Difficulty:** ⭐⭐ Moderate

🎉 Your app is now running on AWS!
