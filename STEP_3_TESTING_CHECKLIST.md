# Step 3: Testing Checklist

## 🎯 After RazorPay Setup

Once you've completed the RazorPay setup guide, follow these steps to verify everything works.

---

## ✅ Pre-Test Checklist

Before testing, confirm:

- [ ] RazorPay account created
- [ ] Test mode enabled in RazorPay dashboard
- [ ] Test API keys copied from dashboard
- [ ] `.env.local` file updated with keys
- [ ] Development server restarted

---

## 🧪 Test 1: Verify Environment Variables

### Check your .env.local file has:

```bash
RAZORPAY_KEY_ID=rzp_test_...           # Should start with 'rzp_test_'
RAZORPAY_KEY_SECRET=...                 # Should be a long string
RAZORPAY_MODE=test                      # Should say 'test'
```

### Quick terminal check:

```bash
# Windows PowerShell
echo $env:RAZORPAY_KEY_ID
echo $env:RAZORPAY_MODE

# Or check if .env.local exists
ls .env.local
```

**Expected:** File exists and has the RazorPay variables

---

## 🧪 Test 2: Test Connection API

### 1. Make sure dev server is running:

```bash
npm run dev
```

**Expected output:**
```
> bghs-alumni-website@0.1.0 dev
> next dev

  ▲ Next.js 14.2.32
  - Local:        http://localhost:3000
```

### 2. Test the connection endpoint:

**Option A: Using Browser**
- Open: http://localhost:3000/api/payments/test-connection
- You should see a JSON response

**Option B: Using PowerShell**
```powershell
curl http://localhost:3000/api/payments/test-connection
```

**Option C: Using browser console**
```javascript
fetch('/api/payments/test-connection')
  .then(r => r.json())
  .then(console.log)
```

### 3. Expected Response:

#### If Configured Correctly:
```json
{
  "success": true,
  "message": "Payment system configuration verified",
  "configuration": {
    "razorpay": {
      "keyIdConfigured": true,
      "keyIdPrefix": "rzp_test_...",
      "keySecretConfigured": true,
      "mode": "test",
      "isTestMode": true
    },
    "defaults": {
      "currency": "INR"
    }
  },
  "razorpaySDK": {
    "installed": false,
    "status": "⏳ RazorPay SDK not installed yet"
  },
  "nextSteps": [
    "✅ Configuration verified",
    "⏳ Need to install RazorPay SDK: npm install razorpay",
    "⏳ Then build payment service layer"
  ]
}
```

✅ This is **good!** - Configuration is working, just need to install SDK (next step)

#### If NOT Configured:
```json
{
  "success": false,
  "error": "Payment system not configured",
  "required": [
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET"
  ]
}
```

❌ This means:
- Keys not in `.env.local`, OR
- Server not restarted after adding keys

**Fix:**
1. Double-check `.env.local` has the keys
2. Restart dev server (Ctrl+C, then `npm run dev`)
3. Try again

---

## 🧪 Test 3: Install RazorPay SDK

Once test connection shows config is verified:

```bash
npm install razorpay
```

**Expected output:**
```
added 1 package, and audited XXX packages in Xs
```

### Test again:

```powershell
curl http://localhost:3000/api/payments/test-connection
```

**Expected now:**
```json
{
  "success": true,
  "razorpaySDK": {
    "installed": true,
    "status": "✅ RazorPay SDK installed and initialized"
  },
  "nextSteps": [
    "✅ RazorPay credentials verified",
    "✅ Configuration loaded successfully",
    "🚀 Ready to build payment service layer"
  ]
}
```

✅ **Perfect!** You're ready for the next step!

---

## 🧪 Test 4: Build Still Works

Make sure adding RazorPay didn't break anything:

```bash
npm run build
```

**Expected:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (47/47)
```

✅ Build successful = ready to proceed!

---

## 📋 Completion Checklist

Before moving to Step 4, confirm all these are ✅:

- [ ] `.env.local` has RazorPay keys
- [ ] Test connection API returns success
- [ ] RazorPay SDK installed (`npm install razorpay`)
- [ ] Test connection shows SDK installed
- [ ] `npm run build` succeeds
- [ ] Dev server runs without errors
- [ ] No TypeScript errors

---

## 🚨 Troubleshooting

### Problem: "Payment system not configured"
**Solution:**
1. Check `.env.local` exists in project root
2. Check it has `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
3. Restart dev server
4. Try test connection again

### Problem: Keys in .env.local but still not working
**Solution:**
```bash
# Stop server (Ctrl+C)
# Delete .next folder
rmdir /s .next

# Restart
npm run dev
```

### Problem: "Module not found: razorpay"
**Solution:**
```bash
npm install razorpay
```

### Problem: Build fails after adding RazorPay
**Solution:**
Check the error message, but likely:
- Syntax error in `.env.local`
- Missing closing quote in environment variable
- Extra spaces in variable names

---

## ✅ Success Criteria

You're ready for Step 4 when:

1. ✅ Test connection API returns `"success": true`
2. ✅ RazorPay SDK shows as installed
3. ✅ Build completes successfully
4. ✅ No console errors in dev server

---

## 🚀 What's Next (Step 4)

Once all tests pass:
1. **Build Payment Service Layer** - Core business logic
2. **Create Payment API Routes** - Order creation, verification
3. **Test with RazorPay Test Cards** - Verify actual payments work

---

## 📞 Report Your Status

Reply with one of these:

### ✅ All Tests Passed
```
✅ RazorPay configured
✅ Test connection successful
✅ SDK installed
✅ Build successful
Ready for Step 4!
```

### ⚠️ Some Issues
```
❌ Issue: [describe what's not working]
📋 Error message: [paste any error]
🔍 What I tried: [what you did]
```

Then I'll help troubleshoot or proceed to Step 4! 🚀
