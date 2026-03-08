# Node.js App Deployment Guide

Your app is a **Node.js server application**, not a static site. AWS Amplify is designed for static sites, so it won't work directly. Here are 3 easy deployment options:

---

## ✅ Option 1: Render.com (RECOMMENDED - FREE TIER)

**Why Render?**
- ✅ Free tier available
- ✅ Automatic deployments from GitHub
- ✅ Built-in SSL certificates
- ✅ Easy setup (5 minutes)
- ✅ Perfect for Node.js apps

### Steps:

1. **Go to Render.com**
   - Visit: https://render.com
   - Click "Get Started for Free"
   - Sign up with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `uditshah9497/medical-app`
   - Click "Connect"

3. **Configure Service**
   ```
   Name: medical-consultation-app
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Select Free Plan**
   - Choose "Free" plan
   - Click "Create Web Service"

5. **Wait for Deployment**
   - Render will automatically deploy your app
   - Takes 2-3 minutes
   - You'll get a URL like: `https://medical-consultation-app.onrender.com`

6. **Your App is Live!**
   - Visit the URL provided by Render
   - Test login: patient@demo.com / password123

### Important Notes:
- Free tier apps sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- Upgrade to paid plan ($7/month) for always-on service

---

## ✅ Option 2: Heroku (EASY - $5/month)

**Why Heroku?**
- ✅ Very popular and reliable
- ✅ Automatic deployments from GitHub
- ✅ Great documentation
- ✅ $5/month for basic plan

### Steps:

1. **Sign Up for Heroku**
   - Visit: https://heroku.com
   - Create free account

2. **Install Heroku CLI** (Optional)
   ```powershell
   # Download from: https://devcenter.heroku.com/articles/heroku-cli
   ```

3. **Create New App via Dashboard**
   - Go to: https://dashboard.heroku.com/apps
   - Click "New" → "Create new app"
   - App name: `medical-consultation-app`
   - Region: United States or Europe
   - Click "Create app"

4. **Connect GitHub**
   - In "Deploy" tab, select "GitHub"
   - Connect to your repository: `uditshah9497/medical-app`
   - Enable "Automatic Deploys" from main branch

5. **Deploy**
   - Click "Deploy Branch"
   - Wait 2-3 minutes
   - Click "View" to see your live app

6. **Your App is Live!**
   - URL: `https://medical-consultation-app.herokuapp.com`

### Cost:
- Free tier (with sleep): $0
- Eco plan (always-on): $5/month
- Basic plan (better performance): $7/month

---

## ✅ Option 3: AWS Elastic Beanstalk (AWS Native)

**Why Elastic Beanstalk?**
- ✅ Native AWS service
- ✅ Auto-scaling
- ✅ Integrates with other AWS services
- ✅ Production-ready

### Steps:

1. **Install EB CLI**
   ```powershell
   pip install awsebcli
   ```

2. **Initialize EB**
   ```powershell
   cd path/to/medical-app
   eb init
   ```
   - Select region: us-east-1
   - Application name: medical-consultation-app
   - Platform: Node.js
   - Use CodeCommit: No

3. **Create Environment**
   ```powershell
   eb create medical-app-env
   ```
   - Wait 5-10 minutes for environment creation

4. **Deploy**
   ```powershell
   eb deploy
   ```

5. **Open App**
   ```powershell
   eb open
   ```

### Cost:
- t2.micro instance: ~$10-15/month
- Covered by AWS free tier for first year

---

## 🚀 Quick Comparison

| Platform | Cost | Setup Time | Always-On | SSL | Auto-Deploy |
|----------|------|------------|-----------|-----|-------------|
| **Render.com** | Free | 5 min | No (sleeps) | ✅ | ✅ |
| **Heroku** | $5/mo | 5 min | Yes ($5 plan) | ✅ | ✅ |
| **AWS EB** | $10/mo | 15 min | Yes | ✅ | Manual |

---

## 📝 After Deployment

Once your app is deployed, you'll need to:

1. **Update Demo Credentials**
   - Login as patient: patient@demo.com / password123
   - Login as doctor: doctor@demo.com / password123

2. **Test Features**
   - Symptom analysis
   - Doctor consultation booking
   - Prescription viewing
   - Pharmacy finder

3. **Monitor Usage**
   - Check deployment logs
   - Monitor response times
   - Track errors

---

## 🔧 Troubleshooting

### App Not Starting
- Check logs in your deployment platform
- Verify `npm start` works locally
- Ensure all dependencies are in package.json

### Database Issues
- App uses in-memory database (data resets on restart)
- For production, migrate to DynamoDB (see AWS_DEPLOYMENT_GUIDE.md)

### Email Not Working
- Emails are console logs in demo mode
- For production, set up AWS SES (see AWS_DEPLOYMENT_GUIDE.md)

---

## 🎯 Recommended Path

**For Quick Demo:**
1. Use Render.com (free)
2. Deploy in 5 minutes
3. Share URL with users
4. Collect feedback

**For Production:**
1. Use Heroku ($5/month) or AWS EB
2. Set up DynamoDB for persistent data
3. Configure AWS SES for real emails
4. Add custom domain

---

## 📞 Need Help?

If you're still having issues:
1. Check deployment logs in your platform
2. Verify the app runs locally: `npm start`
3. Ensure GitHub repository is up to date
4. Check that PORT environment variable is set correctly

---

**Next Steps:** Choose one of the options above and follow the steps. Render.com is the easiest and fastest!
