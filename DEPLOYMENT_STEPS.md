# Deployment Steps to AWS Amplify

## ✅ Step 1: GitHub Push - COMPLETED
Your code is now on GitHub at: https://github.com/uditshah9497/medical-app

## Step 2: Deploy to AWS Amplify

### Option A: AWS Amplify Console (Recommended - Easiest)

1. **Go to AWS Amplify Console**
   - Visit: https://console.aws.amazon.com/amplify/
   - Sign in with your AWS account

2. **Create New App**
   - Click "New app" → "Host web app"
   - Select "GitHub" as the source
   - Click "Authorize AWS Amplify" (if needed)

3. **Connect Repository**
   - Select repository: `uditshah9497/medical-app`
   - Select branch: `main`
   - Click "Next"

4. **Configure Build Settings**
   Amplify should auto-detect your settings. If not, use this configuration:

   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build || echo "No build script"
     artifacts:
       baseDirectory: /
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

5. **Environment Variables** (Important!)
   Add these environment variables in Amplify:
   - `NODE_ENV` = `production`
   - `PORT` = `3000`

6. **Review and Deploy**
   - Review all settings
   - Click "Save and deploy"
   - Wait 5-10 minutes for deployment

7. **Your App Will Be Live At:**
   - URL format: `https://main.xxxxx.amplifyapp.com`
   - Amplify will show you the exact URL

### Important Notes:

**Current Limitations:**
- The app uses an in-memory database (data resets on restart)
- Email notifications are console logs (not real emails)
- For production, you'll need to:
  - Set up AWS SES for real email notifications
  - Use DynamoDB for persistent data storage
  - Configure AWS Cognito for authentication

**Estimated AWS Costs:**
- AWS Amplify: ~$5-10/month
- Build minutes: Free tier includes 1000 build minutes/month
- Data transfer: First 15 GB/month free
- Your AWS credits will cover these costs

### Option B: Full AWS Infrastructure (Advanced)

If you want to use the full AWS infrastructure with DynamoDB, S3, Cognito, etc., follow the guide in `AWS_DEPLOYMENT_GUIDE.md`.

## Step 3: After Deployment

1. **Test Your Live App**
   - Visit your Amplify URL
   - Test login: patient@demo.com / password123
   - Test symptom analysis
   - Test doctor consultation booking

2. **Update URLs in Code** (Optional)
   - Replace `http://localhost:3000` with your Amplify URL in:
     - Email templates in `src/utils/email-service.ts`
     - Email templates in `server.ts`

3. **Set Up Custom Domain** (Optional)
   - In Amplify Console → Domain management
   - Add your custom domain
   - Follow DNS configuration steps

## Troubleshooting

**If deployment fails:**
1. Check build logs in Amplify Console
2. Ensure all dependencies are in `package.json`
3. Check that `npm install` works locally
4. Verify Node.js version compatibility

**If app doesn't work after deployment:**
1. Check browser console for errors
2. Verify environment variables are set
3. Check Amplify logs for server errors
4. Ensure all API endpoints are accessible

## Next Steps

After successful deployment:
1. Share your live URL with users
2. Monitor usage in AWS Console
3. Set up AWS SES for real email notifications
4. Migrate to DynamoDB for persistent storage
5. Configure AWS Cognito for production authentication

## Support

If you encounter issues:
- Check AWS Amplify documentation: https://docs.aws.amazon.com/amplify/
- Review build logs in Amplify Console
- Check AWS service health dashboard
