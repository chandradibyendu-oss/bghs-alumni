# 🧪 Payment System - Testing Guide

## 🎯 Complete Step-by-Step Testing Instructions

This guide walks you through testing the payment system with RazorPay test cards.

---

## 📋 **Prerequisites Checklist**

Before testing, ensure:

- [x] Dev server is running (`npm run dev`)
- [x] RazorPay test keys configured in `.env.local`
- [x] You have a test user account
- [x] You're logged into the website

---

## 🚀 **Quick Start - Test in 5 Minutes**

### **Step 1: Login to Your Website**

1. Open: http://localhost:3000/login
2. Login with any test user credentials
3. You should see the dashboard

### **Step 2: Open Test Payment Page**

Open this URL in your browser:
```
http://localhost:3000/test-payment
```

You'll see a payment testing interface with:
- ✅ Amount input field
- ✅ Description field
- ✅ "Pay ₹500 (Test)" button
- ✅ Test card details shown on right

### **Step 3: Make a Test Payment**

1. **Keep default amount:** ₹500 (or change to any amount)
2. **Click** "Pay ₹500 (Test)" button
3. **RazorPay modal opens** (payment gateway)

### **Step 4: Enter Test Card Details**

In the RazorPay modal:

1. **Select:** "Card" as payment method
2. **Enter Card Number:** `4111 1111 1111 1111`
3. **Enter CVV:** Any 3 digits (e.g., `123`)
4. **Enter Expiry:** Any future date (e.g., `12/25`)
5. **Enter Name:** Any name (e.g., `Test User`)
6. **Click:** "Pay Now" in RazorPay modal

### **Step 5: See the Result**

- ✅ **Success message** appears
- ✅ **Transaction ID** is displayed
- ✅ Payment is recorded in database

---

## 💳 **RazorPay Test Cards**

### **Test Card #1: Successful Payment**

```
Card Number: 4111 1111 1111 1111
CVV: 123 (or any 3 digits)
Expiry: 12/25 (or any future date)
Name: Test User (or any name)
Result: ✅ Payment Success
```

### **Test Card #2: Failed Payment**

```
Card Number: 4000 0000 0000 0002
CVV: 123
Expiry: 12/25
Name: Test User
Result: ❌ Payment Failed
```

### **Test Card #3: Authentication Required**

```
Card Number: 4000 0035 2000 0008
CVV: 123
Expiry: 12/25
Name: Test User
OTP: 1234 (when prompted)
Result: ✅ Payment Success (after OTP)
```

### **UPI Test Payment**

```
1. In RazorPay modal, select "UPI"
2. Enter UPI ID: success@razorpay
3. Click "Pay"
Result: ✅ Immediate Success
```

### **NetBanking Test**

```
1. In RazorPay modal, select "NetBanking"
2. Choose any test bank
3. It will redirect to test bank page
4. Click "Success" on test bank page
Result: ✅ Payment Success
```

---

## 📊 **View Payment History**

After making test payments, view your history:

**URL:** http://localhost:3000/test-payment/history

You'll see:
- ✅ All your test transactions
- ✅ Status badges (Success/Failed/Pending)
- ✅ Amount, date, payment method
- ✅ Transaction IDs
- ✅ Pagination (if more than 10 transactions)

---

## 🗄️ **Verify in Database**

### **Check Transactions in Supabase:**

1. Open Supabase Dashboard
2. Go to **Table Editor**
3. Select **payment_transactions** table
4. You should see your test transactions

**Example record:**
```
id: uuid
user_id: your-user-id
amount: 500.00
currency: INR
payment_status: success
razorpay_order_id: order_xxx
razorpay_payment_id: pay_xxx
payment_method: card
created_at: timestamp
completed_at: timestamp
```

---

## 🧪 **Testing Scenarios**

### **Scenario 1: Successful Payment Flow**

1. ✅ Click "Pay Now"
2. ✅ RazorPay modal opens
3. ✅ Enter success test card (4111...)
4. ✅ Complete payment
5. ✅ See success message
6. ✅ Check database - status: "success"

**Expected:**
- Transaction created with status "initiated"
- RazorPay order created
- User completes payment
- Status updated to "success"
- Completed timestamp recorded

### **Scenario 2: Failed Payment**

1. Click "Pay Now"
2. Enter failure test card (4000 0000 0000 0002)
3. Complete payment
4. See failure message
5. Check database - status: "failed"

**Expected:**
- Transaction created
- Payment attempted
- RazorPay returns failure
- Status updated to "failed"
- Failure reason recorded

### **Scenario 3: Cancelled Payment**

1. Click "Pay Now"
2. RazorPay modal opens
3. Click "X" to close modal (don't complete payment)
4. See "Payment cancelled" message

**Expected:**
- Transaction created with status "initiated"
- No payment completed
- Status remains "initiated" or "cancelled"

### **Scenario 4: Multiple Payments**

1. Make 3-4 test payments
2. Use different test cards
3. Go to history page
4. See all transactions listed

**Expected:**
- All transactions visible
- Correct status badges
- Proper sorting (newest first)
- Pagination works if > 10

---

## 🔍 **What to Check**

### **✅ Frontend:**
- [ ] Payment button appears
- [ ] RazorPay modal opens smoothly
- [ ] Test cards work as expected
- [ ] Success/failure messages show correctly
- [ ] UI is responsive (try on mobile view)

### **✅ Backend:**
- [ ] Transactions created in database
- [ ] Status updates correctly
- [ ] Amounts match (INR to paise conversion correct)
- [ ] Timestamps recorded properly
- [ ] RazorPay IDs saved correctly

### **✅ Security:**
- [ ] Can only see your own transactions
- [ ] Can't access other user's payment history
- [ ] Signature verification works
- [ ] Authentication required for all operations

---

## 🔧 **Test API Routes Directly**

### **Using Browser Dev Tools:**

Open browser console (F12) and run:

```javascript
// 1. Create order
const token = 'your-session-token-here'; // Get from Application > Storage

fetch('/api/payments/create-order', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 100,
    currency: 'INR',
  }),
})
.then(r => r.json())
.then(console.log);

// 2. Check history
fetch('/api/payments/history', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})
.then(r => r.json())
.then(console.log);
```

### **Using PowerShell:**

```powershell
# Test connection (should return success)
curl http://localhost:3000/api/payments/test-connection

# Expected: Configuration verified message
```

---

## 📱 **Mobile Testing**

### **Test on Mobile View:**

1. Open browser dev tools (F12)
2. Click "Toggle device toolbar" (phone icon)
3. Select a mobile device (iPhone/Android)
4. Test payment flow
5. Verify:
   - RazorPay modal works on mobile
   - Buttons are touchable
   - Forms are easy to fill
   - Success page looks good

---

## 🎯 **Expected Results**

### **Success Payment:**
1. ✅ Transaction created in database
2. ✅ Status: "success"
3. ✅ RazorPay payment ID recorded
4. ✅ Completed timestamp set
5. ✅ Payment method recorded (card/upi/netbanking)
6. ✅ Success message shown to user

### **Failed Payment:**
1. ✅ Transaction created
2. ✅ Status: "failed"
3. ✅ Failure reason recorded
4. ✅ Error message shown to user
5. ✅ User can retry

### **Payment History:**
1. ✅ All transactions visible
2. ✅ Sorted by date (newest first)
3. ✅ Status badges colored correctly
4. ✅ Pagination works
5. ✅ Details accurate

---

## 🐛 **Troubleshooting**

### **Issue: Payment button doesn't appear**

**Check:**
- Is user logged in?
- Check browser console for errors
- Verify RazorPayCheckout component imported

**Fix:**
- Login first at `/login`
- Refresh the page

---

### **Issue: RazorPay modal doesn't open**

**Check:**
- Browser console for errors
- Internet connection (RazorPay script loads from CDN)
- Ad blockers (might block RazorPay)

**Fix:**
- Check console for error messages
- Disable ad blockers
- Try different browser

---

### **Issue: Payment verification fails**

**Check:**
- RazorPay keys in `.env.local`
- Server logs for errors
- Database transaction record

**Fix:**
- Verify `RAZORPAY_KEY_SECRET` is correct
- Check server console logs
- Try test again with correct keys

---

### **Issue: Transaction not in database**

**Check:**
- Supabase connection
- Server logs
- API response

**Fix:**
- Check Supabase credentials
- Verify service role key is set
- Check database RLS policies

---

## 📊 **Database Verification**

### **Check Payment Transactions:**

Run this in Supabase SQL Editor:

```sql
-- View all payment transactions
SELECT 
  id,
  user_id,
  amount,
  currency,
  payment_status,
  razorpay_payment_id,
  payment_method,
  created_at,
  completed_at
FROM payment_transactions
ORDER BY created_at DESC
LIMIT 10;
```

**Expected:**
- See your test transactions
- Status: "success" or "failed"
- Amounts match what you paid
- Timestamps are recent

### **Check User Payment Summary:**

```sql
-- Get your payment summary
SELECT * FROM get_user_payment_summary('your-user-id-here');
```

**Expected:**
- Total paid amount
- Total pending amount
- Failed payment count
- Last payment date

---

## 🎉 **Success Criteria**

You've successfully tested the payment system when:

- [x] Created test payment order
- [x] RazorPay modal opened
- [x] Completed payment with test card
- [x] Saw success message
- [x] Transaction recorded in database
- [x] Payment history shows transaction
- [x] All statuses correct
- [x] No errors in console

---

## 🚀 **Next Steps After Testing**

Once testing is successful:

### **1. Integration Options:**

**Event Registration:**
- Add payment to event registration flow
- Users pay when registering for paid events

**User Approval:**
- Send payment link after admin approves registration
- Users complete registration by paying

**Donations:**
- Replace static donation page with live payments
- Track all donations in database

### **2. Optional Enhancements:**

- Receipt PDF generation
- Email notifications on payment success
- Admin payment dashboard
- Refund management

### **3. Production Deployment:**

- Complete RazorPay KYC
- Get live API keys
- Update `.env.local` with live keys
- Change `RAZORPAY_MODE=live`
- Test with real card (small amount)
- Deploy to production

---

## 📞 **Getting Help**

### **If Payment Test Fails:**

1. Check browser console (F12 → Console tab)
2. Check server logs (terminal where `npm run dev` is running)
3. Check Supabase logs (Supabase Dashboard → Logs)
4. Check RazorPay dashboard (https://dashboard.razorpay.com)

### **Common Error Messages:**

| Error | Cause | Fix |
|-------|-------|-----|
| "Unauthorized" | Not logged in | Login first |
| "Invalid amount" | Amount <= 0 | Enter valid amount |
| "Configuration error" | Missing env vars | Check `.env.local` |
| "Verification failed" | Wrong signature | Check RazorPay secret key |
| "Network error" | API issue | Check server logs |

---

## 🎓 **Learning Resources**

- **RazorPay Test Mode:** https://razorpay.com/docs/payment-gateway/test-mode/
- **Test Cards:** https://razorpay.com/docs/payments/payments/test-card-details/
- **API Docs:** https://razorpay.com/docs/api/

---

## ✅ **Testing Checklist**

Complete this checklist to ensure everything works:

- [ ] Logged into website
- [ ] Opened test payment page
- [ ] Made successful payment (4111...)
- [ ] Saw success message
- [ ] Made failed payment (4000 0000...)
- [ ] Saw failure message
- [ ] Viewed payment history
- [ ] Verified in database
- [ ] Tested on mobile view
- [ ] No console errors

---

## 🎉 **You're Ready!**

Once all tests pass, your payment system is:
- ✅ Fully functional
- ✅ Production ready (in test mode)
- ✅ Ready to integrate into your flows

**Happy Testing!** 🚀

---

**Test Page:** http://localhost:3000/test-payment  
**History Page:** http://localhost:3000/test-payment/history  
**Test Cards:** See sections above
