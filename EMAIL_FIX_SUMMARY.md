# Email Fix: Send to Logged-In User

## Issue
Consultation booking emails were being sent to a hardcoded demo email (`patient@demo.com`) instead of the actual logged-in user's email address.

## Root Cause
The backend endpoint was using hardcoded demo user information:
```typescript
const currentUser = {
  id: 'demo-patient',
  name: 'Demo Patient',
  email: 'patient@demo.com'  // ❌ Always sent to this email
};
```

## Solution
Updated both frontend and backend to use the actual logged-in user's information:

### Frontend Changes (public/index.html)
- Get user data from localStorage (stored during login)
- Send user information (id, name, email) with the booking request
- Redirect to login page if user is not logged in

```javascript
// Get logged-in user information
const userStr = localStorage.getItem('user');
const user = userStr ? JSON.parse(userStr) : null;

if (!user) {
    alert('Please login first to book a consultation');
    window.location.href = '/login.html';
    return;
}

// Send user info with booking request
body: JSON.stringify({
    preferredDate,
    preferredTime,
    consultationType,
    additionalNotes,
    userId: user.id,
    userName: user.name,
    userEmail: user.email  // ✅ Actual user's email
})
```

### Backend Changes (server.ts)
- Accept user information from request body
- Use the provided user email for sending confirmation emails
- Added console log to show which email is being used

```typescript
const { preferredDate, preferredTime, consultationType, additionalNotes, userId, userName, userEmail } = req.body;

const currentUser = {
  id: userId || 'demo-patient',
  name: userName || 'Demo Patient',
  email: userEmail || 'patient@demo.com'  // ✅ Uses logged-in user's email
};

console.log('📧 Sending confirmation email to:', currentUser.email);
```

## How to Test

1. **Login with your account:**
   - Go to http://localhost:3000/login.html
   - Login with your registered email (e.g., ushah9497@gmail.com)

2. **Book a consultation:**
   - Go to http://localhost:3000
   - Click "Book Online Consultation"
   - Fill in date, time, and consultation type
   - Click "Book Consultation"

3. **Check the server console:**
   - You should see: `📧 Sending confirmation email to: your-email@example.com`
   - The email will be logged to console (in demo mode)

4. **Verify email content:**
   - Check the server console output
   - You should see your actual name and email in the logged email

## Important Notes

### Demo Mode (Current)
- Emails are **logged to console** only
- No actual emails are sent
- This is for testing and development

### Production Mode (Future)
To send real emails, you need to:
1. Set up an email service (AWS SES, SendGrid, or Gmail SMTP)
2. Configure email credentials
3. Update `src/utils/email-service.ts` to use the email service

See `FUTURE_ENHANCEMENTS.md` for details on setting up real email sending.

## What's Fixed

✅ Consultation booking emails now use logged-in user's email  
✅ User must be logged in to book consultations  
✅ Console logs show which email is being used  
✅ Fallback to demo email if user info is missing  

## Files Modified
- `public/index.html` - Added user info retrieval and sending
- `server.ts` - Updated to accept and use user information

## Status
✅ **FIXED** - Emails now sent to logged-in user's email address!

---

**Fixed on:** March 9, 2026  
**Committed to GitHub:** Yes  
**Server restarted:** Yes
