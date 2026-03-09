# Setup Real Email Sending

Your app now supports **real email sending** using Gmail SMTP! Follow these steps to enable it.

## Why Emails Weren't Being Sent

The app was in **demo mode** which only logs emails to the console for testing purposes. To send real emails, you need to:
1. Configure an email service (Gmail, AWS SES, SendGrid, etc.)
2. Provide email credentials
3. The app will automatically switch to real email mode

## Option 1: Gmail SMTP (Easiest - FREE)

### Step 1: Enable Gmail App Password

1. **Go to your Google Account:**
   - Visit: https://myaccount.google.com/
   - Sign in with your Gmail account

2. **Enable 2-Step Verification** (if not already enabled):
   - Go to Security → 2-Step Verification
   - Follow the setup process

3. **Create App Password:**
   - Go to Security → 2-Step Verification → App passwords
   - Or visit directly: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Windows Computer" (or your device)
   - Click "Generate"
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 2: Create .env File

Create a file named `.env` in your project root:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here

# Example:
# EMAIL_USER=ushah9497@gmail.com
# EMAIL_PASS=abcd efgh ijkl mnop
```

**Important:**
- Use your Gmail address for `EMAIL_USER`
- Use the 16-character App Password (not your regular Gmail password) for `EMAIL_PASS`
- Remove spaces from the app password

### Step 3: Install dotenv Package

```powershell
npm install dotenv
```

### Step 4: Update server.ts

Add this at the very top of `server.ts` (before any other imports):

```typescript
import 'dotenv/config';
```

### Step 5: Restart Server

```powershell
# Stop current server (Ctrl+C)
# Start again
npm start
```

You should see:
```
✅ Real email sending enabled with: your-email@gmail.com
```

### Step 6: Test It!

1. Login to your app
2. Book a consultation
3. Check your email inbox - you should receive a real email!

---

## Option 2: AWS SES (Production - Scalable)

For production deployment, AWS SES is recommended:

### Benefits:
- More reliable for high volume
- Better deliverability
- Integrated with AWS ecosystem
- Cost: $0.10 per 1,000 emails

### Setup:

1. **Verify your email in AWS SES:**
   ```bash
   aws ses verify-email-identity --email-address your-email@example.com
   ```

2. **Get SMTP credentials:**
   - Go to AWS SES Console → SMTP Settings
   - Create SMTP credentials
   - Note the username and password

3. **Update .env:**
   ```env
   EMAIL_SERVICE=ses
   EMAIL_USER=your-ses-smtp-username
   EMAIL_PASS=your-ses-smtp-password
   EMAIL_REGION=us-east-1
   ```

4. **Update email-service.ts** to use AWS SES SDK (see code below)

---

## Option 3: SendGrid (Alternative - FREE tier)

SendGrid offers 100 emails/day for free:

### Setup:

1. **Sign up:** https://sendgrid.com/
2. **Create API Key:** Settings → API Keys → Create API Key
3. **Update .env:**
   ```env
   SENDGRID_API_KEY=your-api-key-here
   ```

4. **Install SendGrid:**
   ```powershell
   npm install @sendgrid/mail
   ```

---

## Troubleshooting

### "Invalid login" error with Gmail
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify 2-Step Verification is enabled
- Remove spaces from the app password

### Emails going to spam
- Add a proper "From" name and email
- Verify your domain (for production)
- Use AWS SES or SendGrid for better deliverability

### "Less secure app access" error
- Google deprecated this in 2022
- You MUST use App Passwords now (see Step 1 above)

### Environment variables not loading
- Make sure `.env` file is in the project root
- Make sure you installed `dotenv` package
- Make sure you added `import 'dotenv/config';` at the top of server.ts
- Restart the server after creating .env file

---

## Security Best Practices

### ⚠️ IMPORTANT: Never commit .env file to Git!

Add `.env` to your `.gitignore`:

```
# .gitignore
.env
node_modules/
```

### For Production Deployment:

1. **Render.com / Heroku:**
   - Add environment variables in the dashboard
   - Settings → Environment Variables
   - Add `EMAIL_USER` and `EMAIL_PASS`

2. **AWS Elastic Beanstalk:**
   ```bash
   eb setenv EMAIL_USER=your-email@gmail.com EMAIL_PASS=your-app-password
   ```

3. **Docker:**
   ```bash
   docker run -e EMAIL_USER=your-email@gmail.com -e EMAIL_PASS=your-app-password ...
   ```

---

## Email Limits

### Gmail SMTP:
- **Free:** 500 emails/day
- **Google Workspace:** 2,000 emails/day
- Good for: Small apps, testing, personal projects

### AWS SES:
- **Sandbox:** 200 emails/day (to verified emails only)
- **Production:** 50,000 emails/day (request limit increase)
- **Cost:** $0.10 per 1,000 emails
- Good for: Production apps, high volume

### SendGrid:
- **Free:** 100 emails/day
- **Paid:** Starting at $15/month for 40,000 emails
- Good for: Medium-sized apps

---

## Quick Start (TL;DR)

```powershell
# 1. Install packages
npm install dotenv nodemailer @types/nodemailer

# 2. Create .env file
echo "EMAIL_USER=your-email@gmail.com" > .env
echo "EMAIL_PASS=your-app-password" >> .env

# 3. Add to top of server.ts
# import 'dotenv/config';

# 4. Restart server
npm start

# 5. Test by booking a consultation!
```

---

## Status Check

After setup, you should see in the console:

✅ **Real emails enabled:**
```
✅ Real email sending enabled with: your-email@gmail.com
📧 EMAIL:
To: patient@example.com
Subject: Consultation Booking Confirmed
---
✅ Real email sent successfully! Message ID: <...>
```

❌ **Demo mode (no real emails):**
```
📝 Email service in DEMO MODE (console logging only)
💡 To enable real emails, set EMAIL_USER and EMAIL_PASS environment variables
```

---

**Need help?** Check the troubleshooting section above or create an issue on GitHub!
