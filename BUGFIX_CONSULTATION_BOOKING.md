# Bug Fix: Online Consultation Booking Error

## Problem
When trying to book an online consultation, users were getting the error:
```
Error booking consultation: Missing required fields
```

## Root Cause
There were **two duplicate `/api/book-consultation` endpoints** in `server.ts`:

### Endpoint 1 (Line 500 - OLD, REMOVED)
```typescript
app.post('/api/book-consultation', async (req, res) => {
  const { consultationId, patientId, preferredDate, preferredTime } = req.body;
  
  if (!consultationId || !patientId) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  // ...
});
```
This endpoint expected: `consultationId` and `patientId`

### Endpoint 2 (Line 822 - KEPT)
```typescript
app.post('/api/book-consultation', async (req, res) => {
  const { preferredDate, preferredTime, consultationType, additionalNotes } = req.body;
  
  if (!preferredDate || !preferredTime) {
    return res.status(400).json({ 
      success: false, 
      error: 'Preferred date and time are required' 
    });
  }
  // ...
});
```
This endpoint expected: `preferredDate`, `preferredTime`, `consultationType`, `additionalNotes`

### The Conflict
- Frontend was sending: `preferredDate`, `preferredTime`, `consultationType`, `additionalNotes`
- Express was using the **first endpoint** it found (line 500)
- First endpoint expected: `consultationId` and `patientId`
- Result: "Missing required fields" error

## Solution
Removed the duplicate old endpoint (line 500) and kept only the working new endpoint (line 822).

## What Changed
- ✅ Removed old `/api/book-consultation` endpoint that expected `consultationId` and `patientId`
- ✅ Kept new `/api/book-consultation` endpoint that works with the frontend
- ✅ Server restarted with the fix

## Testing
To test the fix:
1. Go to http://localhost:3000
2. Click "Book Online Consultation"
3. Fill in:
   - Preferred Date
   - Preferred Time
   - Consultation Type (Video/Audio/Chat)
   - Additional Notes (optional)
4. Click "Book Consultation"
5. Should see: "✓ Consultation booked successfully!"

## Files Modified
- `server.ts` - Removed duplicate endpoint

## Status
✅ **FIXED** - Online consultation booking now works correctly!

---

**Fixed on:** March 9, 2026  
**Committed to GitHub:** Yes  
**Server restarted:** Yes
