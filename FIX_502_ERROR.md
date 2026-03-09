# Fix 502 Bad Gateway Error - AWS Deployment

## What Was Wrong?

The 502 error happened because:
1. AWS Elastic Beanstalk couldn't run TypeScript files directly (ts-node)
2. The app needed to be compiled to JavaScript first
3. Missing Procfile to tell AWS how to start the app

## What I Fixed

✅ Updated `tsconfig.json` to include server.ts in compilation
✅ Changed start script from `ts-node server.ts` to `node dist/server.js`
✅ Added `Procfile` for AWS to know how to start the app
✅ Created automated deployment script `prepare-aws-deploy.ps1`
✅ Built and packaged everything into `aws-deployment.zip`

## Deploy the Fixed Version NOW

### Step 1: Upload to AWS

1. Open AWS Elastic Beanstalk Console: https://ap-southeast-2.console.aws.amazon.com/elasticbeanstalk/home?region=ap-southeast-2#/applications

2. Click on your application: **medical-consultation-ap**

3. Click on your environment: **medical-consultation-ap-env**

4. Click the **"Upload and deploy"** button

5. Click **"Choose file"** and select: `aws-deployment.zip` (it's in your project folder)

6. Click **"Deploy"**

### Step 2: Set Environment Variables

While deployment is running, set up environment variables:

1. In your environment page, click **"Configuration"** (left sidebar)

2. Find **"Software"** section and click **"Edit"**

3. Scroll down to **"Environment properties"**

4. Add these variables:

| Name | Value |
|------|-------|
| PORT | 8080 |
| NODE_ENV | production |
| EMAIL_USER | ushah9497@gmail.com |
| EMAIL_PASS | (your Gmail app password) |

5. Click **"Apply"** at the bottom

### Step 3: Wait and Test

1. Wait 5-10 minutes for deployment to complete

2. You'll see "Environment update completed successfully" in green

3. Test your URL: http://medical-consultation-ap-env.eba-dm72n26j.ap-southeast-2.elasticbeanstalk.com

4. The app should now work! ✅

## If You Still Get Errors

Check the logs:
1. Go to your environment page
2. Click "Logs" in the left sidebar
3. Click "Request Logs" → "Last 100 Lines"
4. Download and check for errors

## Alternative: Deploy to Render.com (Easier!)

If AWS is still giving you trouble, Render.com is much simpler:

1. Go to https://render.com (sign up with GitHub)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo: uditshah9497/medical-app
4. Settings:
   - Name: medical-consultation
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables (same as above)
5. Click "Create Web Service"
6. Done in 5 minutes! Free tier available.

## Files Changed

- `tsconfig.json` - Fixed to compile server.ts
- `package.json` - Changed start script to use compiled code
- `Procfile` - Added for AWS to know how to start
- `prepare-aws-deploy.ps1` - Automated deployment packaging

All changes pushed to GitHub: https://github.com/uditshah9497/medical-app
