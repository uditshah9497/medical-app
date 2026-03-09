# Render.com Deployment - Step by Step

## ✨ Deploy in 5 Minutes (No CLI Required!)

### Step 1: Go to Render.com

Open your browser and go to: **https://render.com**

Click the **"Get Started for Free"** button

---

### Step 2: Sign Up with GitHub

1. Click **"Sign up with GitHub"**
2. Authorize Render to access your GitHub account
3. You'll be redirected to Render dashboard

---

### Step 3: Create New Web Service

1. Click the **"New +"** button (top right corner)
2. Select **"Web Service"** from the dropdown

---

### Step 4: Connect Your Repository

1. You'll see a list of your GitHub repositories
2. Find: **`uditshah9497/medical-app`**
3. Click the **"Connect"** button next to it

If you don't see your repository:
- Click "Configure account" to grant access
- Select your GitHub account
- Grant access to the repository

---

### Step 5: Configure Your Service

Fill in these fields:

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
(or choose Frankfurt if you're in Europe)

**Branch:**
```
main
```

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

---

### Step 6: Select Free Plan

Scroll down to **"Instance Type"**

Select: **"Free"**

---

### Step 7: Add Environment Variables (IMPORTANT!)

Scroll down to **"Environment Variables"**

Click **"Add Environment Variable"**

Add these 4 variables:

**Variable 1:**
```
Key: EMAIL_USER
Value: your-email@gmail.com
```
(Replace with your actual Gmail)

**Variable 2:**
```
Key: EMAIL_PASS
Value: your-16-char-app-password
```
(Your Gmail App Password from Google)

**Variable 3:**
```
Key: NODE_ENV
Value: production
```

**Variable 4:**
```
Key: PORT
Value: 10000
```

---

### Step 8: Create Web Service

Click the big **"Create Web Service"** button at the bottom

---

### Step 9: Wait for Deployment

Render will now:
1. ✅ Clone your repository
2. ✅ Install dependencies (npm install)
3. ✅ Start your application (npm start)

This takes **2-3 minutes**

You'll see a live log showing the deployment progress:
```
==> Cloning from https://github.com/uditshah9497/medical-app...
==> Running 'npm install'
==> Starting service with 'npm start'
==> Your service is live 🎉
```

---

### Step 10: Your App is Live! 🎉

Once deployment completes, you'll see:

**Status:** ✅ Live

**URL:** `https://medical-consultation-app.onrender.com`

Click the URL to open your live app!

---

## 🔄 Automatic Deployments

Render automatically deploys when you push to GitHub!

Every time you run:
```powershell
git push
```

Render will automatically:
1. Detect the changes
2. Rebuild your app
3. Deploy the new version

No manual deployment needed!

---

## 📊 Monitoring Your App

### View Logs:
1. Go to your service dashboard
2. Click **"Logs"** tab
3. See real-time application logs

### Check Status:
- **Green dot** = App is running
- **Yellow dot** = App is deploying
- **Red dot** = App has errors

### View Metrics:
- Click **"Metrics"** tab
- See CPU, memory, and request stats

---

## 🐛 Troubleshooting

### App shows "Service Unavailable":
- Check the "Logs" tab for errors
- Verify environment variables are set
- Make sure `npm start` works locally

### Emails not sending:
- Go to "Environment" tab
- Verify EMAIL_USER and EMAIL_PASS are correct
- Check logs for email errors

### App is slow to wake up:
- This is normal for free tier
- First request after 15 min takes 30-60 seconds
- Upgrade to $7/month for always-on

---

## 💰 Free Tier Limitations

**What's Included:**
- ✅ 750 hours/month (enough for 1 app running 24/7)
- ✅ Automatic SSL (HTTPS)
- ✅ Automatic deployments
- ✅ Custom domains

**Limitations:**
- ⏸️ App sleeps after 15 minutes of inactivity
- 🐌 First request after sleep takes 30-60 seconds
- 💾 Limited to 512 MB RAM

**Upgrade to Paid ($7/month):**
- ✅ Always on (no sleeping)
- ✅ More RAM (1 GB)
- ✅ Faster performance

---

## 🎯 Testing Your Live App

1. **Open your app URL:**
   ```
   https://medical-consultation-app.onrender.com
   ```

2. **Register a new user:**
   - Go to Login page
   - Click "Register"
   - Use your email

3. **Test features:**
   - Symptom analysis
   - Book consultation
   - Check email (if configured)

4. **Check logs:**
   - Go to Render dashboard
   - Click "Logs"
   - Verify no errors

---

## 🔧 Updating Environment Variables

If you need to change EMAIL_USER or EMAIL_PASS:

1. Go to your service dashboard
2. Click **"Environment"** tab
3. Click on the variable you want to change
4. Update the value
5. Click **"Save Changes"**
6. Render will automatically redeploy

---

## 📱 Custom Domain (Optional)

To use your own domain (e.g., mediconsult.com):

1. Go to **"Settings"** tab
2. Scroll to **"Custom Domain"**
3. Click **"Add Custom Domain"**
4. Enter your domain
5. Follow DNS configuration instructions

**Cost:** FREE (included in all plans)

---

## 🎉 You're Done!

Your Medical Consultation App is now live on the internet!

**Your URL:** `https://medical-consultation-app.onrender.com`

**What works:**
- ✅ User registration and login
- ✅ Symptom analysis
- ✅ Doctor consultations
- ✅ Prescription management
- ✅ Pharmacy finder
- ✅ Email notifications (if configured)

**Next steps:**
1. Share your URL with users
2. Collect feedback
3. Make improvements
4. Push to GitHub (auto-deploys!)

---

## 📞 Support

**Render Documentation:** https://render.com/docs  
**Render Status:** https://status.render.com  
**Community Forum:** https://community.render.com

---

**Deployment Time:** 5 minutes  
**Cost:** FREE  
**Difficulty:** ⭐ Very Easy

🎉 Congratulations! Your app is live!
