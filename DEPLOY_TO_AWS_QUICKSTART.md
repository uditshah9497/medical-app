# 🚀 Deploy to AWS - Quick Start

## Option 1: Automated Script (Easiest)

Run the PowerShell script:

```powershell
.\deploy-to-aws.ps1
```

Follow the menu:
1. Initialize EB (first time)
2. Create environment
3. Deploy
4. Set email credentials
5. Open in browser

---

## Option 2: Manual Commands

### First Time Setup:

```powershell
# 1. Install EB CLI
pip install awsebcli --upgrade --user

# 2. Initialize
eb init
# Select: us-east-1, medical-consultation-app, Node.js 18

# 3. Create environment
eb create medical-app-env

# 4. Set environment variables
eb setenv EMAIL_USER=your-email@gmail.com EMAIL_PASS=your-app-password NODE_ENV=production

# 5. Open app
eb open
```

### Deploy Updates:

```powershell
# Commit changes
git add .
git commit -m "Update"

# Deploy to AWS
eb deploy

# Open app
eb open
```

---

## What You Get

✅ **Live URL:** `http://medical-app-env.eba-xxxxxxxx.us-east-1.elasticbeanstalk.com`  
✅ **Auto-scaling:** Handles traffic spikes automatically  
✅ **Load balancer:** Distributes traffic  
✅ **Health monitoring:** AWS monitors your app  
✅ **Easy updates:** Just run `eb deploy`  

---

## Cost

**With AWS Credits & Free Tier:**
- ✅ **FREE** for first 12 months
- ✅ 750 hours/month of t3.micro instance
- ✅ Your AWS credits cover any additional costs

**After Free Tier:**
- ~$25-30/month (covered by your credits)

---

## Time Required

- **First deployment:** 15-20 minutes
- **Subsequent deployments:** 2-3 minutes

---

## Troubleshooting

### EB CLI not found:
```powershell
pip install awsebcli --upgrade --user
$env:Path += ";$env:USERPROFILE\AppData\Roaming\Python\Python311\Scripts"
```

### Deployment fails:
```powershell
eb logs  # Check error logs
eb status  # Check environment status
```

### App not working:
```powershell
eb setenv EMAIL_USER=your-email@gmail.com EMAIL_PASS=your-app-password
eb deploy  # Redeploy
```

---

## Next Steps

After deployment:
1. Test your live app
2. Set up custom domain (optional)
3. Enable HTTPS (free with AWS Certificate Manager)
4. Monitor in AWS Console: `eb console`

---

## Full Documentation

See `AWS_EB_DEPLOYMENT.md` for complete step-by-step guide.

---

**Ready to deploy?** Run: `.\deploy-to-aws.ps1`
