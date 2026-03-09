# 🚀 Deployment Guide - AWS & Render (FIXED!)

## What Was Fixed

### Issues Resolved:
1. ✅ Removed `postinstall` script (causes issues on some platforms)
2. ✅ Updated `Procfile` to build before starting
3. ✅ Fixed `.ebignore` to include `dist/` folder
4. ✅ Added Node.js version requirements
5. ✅ Ensured TypeScript compiles before deployment

### Files Changed:
- `package.json` - Removed postinstall, added engines
- `Procfile` - Now runs `npm run build && npm start`
- `.ebignore` - Includes dist/ folder

---

## 🎯 Choose Your Platform

### Option 1: AWS Elastic Beanstalk (You Have Credits!)
- ✅ More control and configuration
- ✅ Better for production workloads
- ✅ Free tier available
- ⏱️ Takes 5-10 minutes

**[Jump to AWS Instructions](#aws-elastic-beanstalk-deployment)**

### Option 2: Render.com (Easiest!)
- ✅ Simplest deployment (no CLI needed)
- ✅ Auto-deploys from GitHub
- ✅ Free tier available
- ⏱️ Takes 3-5 minutes

**[Jump to Render Instructions](#rendercom-deployment)**

---

# AWS Elastic Beanstalk Deployment

## Prerequisites
- AWS account with credits
- Your environment already created: `medical-consultation-ap-env`

## Step 1: Build the Project Locally

```powershell
# Make sure you're in the project directory
cd path\to\medical-app

# Build TypeScript to JavaScript
npm run build
```

You should see:
```
> ai-medical-consultation-platform@1.0.0 build
> tsc
```

## Step 2: Verify Build Output

```powershell
# Check that dist folder exists
ls dist
```

You should see:
```
dist/server.js
dist/server.d.ts
dist/src/
```

## Step 3: Create Deployment Package

```powershell
# Create a zip file with ALL files (including dist/)
Compress-Archive -Path * -DestinationPath aws-deployment.zip -Force
```

**Important:** This includes:
- ✅ `dist/` folder (compiled JavaScript)
- ✅ `public/` folder (HTML files)
- ✅ `package.json` (dependencies)
- ✅ `Procfile` (start command)
- ✅ `.ebignore` (exclusion rules)
- ✅ All source files

## Step 4: Upload to AWS

1. **Go to AWS Console:**
   - Navigate to: https://console.aws.amazon.com/elasticbeanstalk
   - Region: `ap-southeast-2` (Sydney)

2. **Select Your Environment:**
   - Click on: `medical-consultation-ap-env`

3. **Upload and Deploy:**
   - Click **"Upload and deploy"** button
   - Click **"Choose file"**
   - Select: `aws-deployment.zip`
   - Version label: `v1.0-fixed` (or any name)
   - Click **"Deploy"**

## Step 5: Wait for Deployment

AWS will now:
1. ✅ Upload your code (30 seconds)
2. ✅ Extract files (10 seconds)
3. ✅ Run `npm install` (2-3 minutes)
4. ✅ Run `npm run build` (30 seconds)
5. ✅ Start server with `npm start` (10 seconds)
6. ✅ Health check (30 seconds)

**Total time:** 5-7 minutes

Watch the deployment progress in the console. You'll see:
- "Environment update is starting"
- "Running command npm install"
- "Running command npm run build"
- "Application deployment completed"

## Step 6: Configure Environment Variables

1. **Go to Configuration:**
   - Click **"Configuration"** in left menu
   - Click **"Edit"** in "Software" section

2. **Add Environment Properties:**
   ```
   NODE_ENV = production
   EMAIL_USER = your-gmail@gmail.com
   EMAIL_PASS = your-app-password
   ```

3. **Click "Apply"**

This will restart your environment (takes 2-3 minutes).

## Step 7: Test Your App

Your app is now live at:
```
http://medical-consultation-ap-env.eba-dm72n26j.ap-southeast-2.elasticbeanstalk.com
```

**Test these features:**
1. ✅ Open the URL in browser
2. ✅ Register a new user
3. ✅ Analyze symptoms
4. ✅ Book consultation
5. ✅ Check email notifications

## Troubleshooting AWS

### Still Getting 502 Error?

**Check the logs:**
1. Go to your environment
2. Click **"Logs"** in left menu
3. Click **"Request Logs"** → **"Last 100 Lines"**
4. Click **"Download"** when ready
5. Open the log file and search for "error"

**Common issues:**

**Error: "Cannot find module"**
```
Solution: Make sure typescript is in dependencies (not devDependencies)
```

**Error: "ENOENT: no such file or directory, open 'dist/server.js'"**
```
Solution: The build didn't run. Check that Procfile has: npm run build && npm start
```

**Error: "Port 3000 already in use"**
```
Solution: Already fixed - server uses process.env.PORT || 3000
```

### View Real-Time Logs

```powershell
# Install EB CLI (optional)
pip install awsebcli

# View logs
eb logs
```

---

# Render.com Deployment

## Step 1: Push Your Code to GitHub

```powershell
# Make sure all changes are committed
git add .
git commit -m "Fix deployment configuration"
git push origin main
```

## Step 2: Go to Render.com

1. Open: https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub

## Step 3: Create New Web Service

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your repository: `uditshah9497/medical-app`
4. Click **"Connect"**

## Step 4: Configure Service

**Name:**
```
medical-consultation-app
```

**Environment:**
```
Node
```

**Region:**
```
Oregon (US West)
```

**Branch:**
```
main
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

## Step 5: Add Environment Variables

Click **"Add Environment Variable"** and add:

```
NODE_ENV = production
EMAIL_USER = your-gmail@gmail.com
EMAIL_PASS = your-app-password
PORT = 10000
```

## Step 6: Select Free Plan

Scroll down to **"Instance Type"**

Select: **"Free"**

## Step 7: Create Web Service

Click **"Create Web Service"**

Render will now:
1. ✅ Clone your repository (30 seconds)
2. ✅ Run `npm install && npm run build` (2-3 minutes)
3. ✅ Start server with `npm start` (10 seconds)
4. ✅ Health check (30 seconds)

**Total time:** 3-5 minutes

## Step 8: Your App is Live!

Once deployment completes, you'll see:

**Status:** ✅ Live

**URL:** `https://medical-consultation-app.onrender.com`

Click the URL to test your app!

## Troubleshooting Render

### App Shows "Service Unavailable"

**Check the logs:**
1. Go to your service dashboard
2. Click **"Logs"** tab
3. Look for errors

**Common issues:**

**Error: "Cannot find module 'typescript'"**
```
Solution: Move typescript from devDependencies to dependencies in package.json
```

**Error: "Build failed"**
```
Solution: Check that build command is: npm install && npm run build
```

**Error: "Application failed to respond"**
```
Solution: Check that start command is: npm start
Solution: Verify PORT environment variable is set to 10000
```

### App is Slow to Wake Up

This is normal for free tier:
- App sleeps after 15 minutes of inactivity
- First request takes 30-60 seconds to wake up
- Subsequent requests are fast

**Solution:** Upgrade to $7/month for always-on service

---

# Verification Checklist

After deployment, verify these work:

## ✅ Basic Functionality
- [ ] Homepage loads
- [ ] Can register new user
- [ ] Can login
- [ ] Can analyze symptoms
- [ ] Results display correctly

## ✅ Advanced Features
- [ ] Can book consultation
- [ ] Can upload blood report
- [ ] Can view consultation history
- [ ] Doctor dashboard works
- [ ] Prescription feature works

## ✅ Email Notifications
- [ ] Registration email received
- [ ] Consultation booking email received
- [ ] Doctor notification email received
- [ ] Prescription email received

---

# Deployment Comparison

| Feature | AWS Elastic Beanstalk | Render.com |
|---------|----------------------|------------|
| **Setup Time** | 10 minutes | 5 minutes |
| **Difficulty** | Medium | Easy |
| **Free Tier** | ✅ Yes | ✅ Yes |
| **Auto Deploy** | ❌ Manual | ✅ From GitHub |
| **Custom Domain** | ✅ Yes | ✅ Yes |
| **SSL/HTTPS** | ✅ Yes | ✅ Yes |
| **Logs** | ✅ Full access | ✅ Real-time |
| **Scaling** | ✅ Advanced | ✅ Simple |
| **Sleep Mode** | ❌ No | ✅ Yes (free tier) |
| **Best For** | Production | Quick demos |

---

# Next Steps

## After Successful Deployment:

1. **Test thoroughly:**
   - Register multiple users
   - Test all features
   - Check email notifications

2. **Monitor logs:**
   - Check for errors
   - Monitor performance
   - Track user activity

3. **Set up custom domain (optional):**
   - Buy domain (e.g., mediconsult.com)
   - Configure DNS
   - Add to platform

4. **Enable real emails:**
   - Set EMAIL_USER and EMAIL_PASS
   - Test email delivery
   - Check spam folder

5. **Share with users:**
   - Send URL to testers
   - Collect feedback
   - Make improvements

---

# Support

**AWS Issues:**
- AWS Documentation: https://docs.aws.amazon.com/elasticbeanstalk
- AWS Support: https://console.aws.amazon.com/support

**Render Issues:**
- Render Docs: https://render.com/docs
- Community: https://community.render.com

**App Issues:**
- Check logs first
- Review error messages
- Test locally with `npm run dev`

---

# Summary

## What You Need to Do:

### For AWS:
```powershell
npm run build
Compress-Archive -Path * -DestinationPath aws-deployment.zip -Force
# Then upload to AWS Console
```

### For Render:
```powershell
git add .
git commit -m "Fix deployment"
git push origin main
# Then create service on Render.com
```

Both platforms should now work! 🎉

**Your URLs:**
- AWS: `http://medical-consultation-ap-env.eba-dm72n26j.ap-southeast-2.elasticbeanstalk.com`
- Render: `https://medical-consultation-app.onrender.com`

Choose the one that works best for you!
