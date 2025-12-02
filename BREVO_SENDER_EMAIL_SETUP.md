# Brevo Sender Email Setup Guide

## ⚠️ Important: API Key Typo Found

You have: `BREVO_APY_KEY=OGzTB1vUd4Wjp6IZ`

**Should be**: `BREVO_API_KEY=OGzTB1vUd4Wjp6IZ` (note: API not APY)

Please correct this when setting up your environment variables.

---

## Sender Email Options in Brevo

### Option 1: Verify Placeholder Email (Recommended if you control the domain)

**Use**: `noreply@alumnibghs.org`

**Requirements**:
- You must have access to the inbox at `noreply@alumnibghs.org` to verify it
- OR you must own the domain `alumnibghs.org` to set up domain authentication

**Steps**:

1. **If you have inbox access to noreply@alumnibghs.org**:
   - Go to Brevo Dashboard → Senders & IP → Senders
   - Click "Add a sender"
   - Enter: `noreply@alumnibghs.org`
   - Name: `BGHS Alumni`
   - Check inbox at `noreply@alumnibghs.org` for verification email
   - Click verification link

2. **If you own the domain (Better for production)**:
   - Go to Brevo Dashboard → Senders & IP → Domains
   - Click "Add a domain"
   - Enter: `alumnibghs.org`
   - Add DNS records (SPF, DKIM) as instructed by Brevo
   - Once verified, you can use ANY email from that domain (e.g., `noreply@alumnibghs.org`, `admin@alumnibghs.org`)

---

### Option 2: Use Your Personal Email with Display Name (Quick Setup)

**Use**: Your personal email (e.g., `yourname@gmail.com`) but users will see "BGHS Alumni" as the sender name.

**How it works**:
- **FROM Email**: `yourname@gmail.com` (verified in Brevo)
- **Display Name**: `BGHS Alumni`
- **What recipients see**: `BGHS Alumni <yourname@gmail.com>`

**Steps**:

1. In Brevo Dashboard → Senders & IP → Senders
2. Add your personal email: `yourname@gmail.com`
3. Verify it (check your inbox)
4. In code, we'll set it up as: `BGHS Alumni <yourname@gmail.com>`
5. Recipients will see "BGHS Alumni" as the sender, not your personal email

**Advantages**:
- ✅ Quick setup (no domain DNS configuration needed)
- ✅ Hides your personal email behind "BGHS Alumni" name
- ✅ Works immediately

**Disadvantages**:
- ⚠️ Email address is still visible in email headers (if users inspect)
- ⚠️ Some email clients may show the email address

---

### Option 3: Create a Dedicated Email Account (Best Practice)

**Use**: Create a dedicated Gmail/Outlook account for the alumni website

**Steps**:

1. Create a new email account: `bghs.alumni.website@gmail.com` (or similar)
2. Verify this email in Brevo
3. Set display name as "BGHS Alumni"
4. Recipients see: `BGHS Alumni <bghs.alumni.website@gmail.com>`

**Advantages**:
- ✅ Separates personal email from website email
- ✅ Professional appearance
- ✅ Easy to manage

---

## Recommended Setup for Your Case

Since you want to use `noreply@alumnibghs.org`:

### **Scenario A: You own/control `alumnibghs.org` domain**

**Best Option**: Domain Authentication
- Authenticate the entire domain in Brevo
- Then you can use `noreply@alumnibghs.org`, `admin@alumnibghs.org`, etc.
- Most professional approach
- Better email deliverability

### **Scenario B: You don't own the domain but have access to `noreply@alumnibghs.org` inbox**

**Option**: Verify the specific email address
- Add `noreply@alumnibghs.org` as sender in Brevo
- Verify it via email confirmation
- Use it as FROM_EMAIL

### **Scenario C: You don't have access to `noreply@alumnibghs.org`**

**Option**: Use your personal email with display name
- Verify your personal email in Brevo
- Set FROM_EMAIL to your personal email
- Code will format it as: `BGHS Alumni <your.email@gmail.com>`
- Recipients see "BGHS Alumni" as sender name

---

## How Display Name Works in Our Code

Our current code already handles this:

```typescript
const rawFrom = process.env.FROM_EMAIL || 'admin@alumnibghs.org'
const fromWithName = rawFrom.includes('<') ? rawFrom : `BGHS Alumni <${rawFrom}>`
```

So if you set:
```
FROM_EMAIL=yourname@gmail.com
```

The code will automatically format it as:
```
BGHS Alumni <yourname@gmail.com>
```

And recipients will see:
- **From**: BGHS Alumni
- **Email**: yourname@gmail.com (visible in headers, but display name is prominent)

---

## What Recipients Will See

### Using Display Name Format:
```
FROM_EMAIL=yourname@gmail.com
```

**What recipients see in email client**:
- **From**: BGHS Alumni
- **Email**: (may show `yourname@gmail.com` in some clients, but "BGHS Alumni" is the primary display)

**What recipients see in email headers** (if they inspect):
- `From: BGHS Alumni <yourname@gmail.com>`

### Using Placeholder Email:
```
FROM_EMAIL=noreply@alumnibghs.org
```

**What recipients see**:
- **From**: BGHS Alumni (if we set display name)
- **Email**: noreply@alumnibghs.org

---

## My Recommendation

**For Quick Setup (Today)**:
1. Use your personal email (or create a dedicated Gmail account)
2. Verify it in Brevo
3. Set `FROM_EMAIL=your.email@gmail.com`
4. Code will automatically show "BGHS Alumni" as the sender name
5. Your personal email address will be hidden behind the display name

**For Production (Later)**:
1. Set up domain authentication for `alumnibghs.org` (if you own it)
2. Then switch to `FROM_EMAIL=noreply@alumnibghs.org`
3. Most professional and better deliverability

---

## Action Items

**Right Now**:
1. ✅ Fix API key typo: `BREVO_API_KEY` (not APY_KEY)
2. Choose one:
   - **Option A**: Verify `noreply@alumnibghs.org` in Brevo (if you have access)
   - **Option B**: Verify your personal/dedicated email in Brevo
3. Set `FROM_EMAIL` accordingly

**Environment Variables**:
```bash
# Corrected (note: API not APY)
BREVO_API_KEY=OGzTB1vUd4Wjp6IZ

# Choose one:
# Option 1: Placeholder (if verified in Brevo)
FROM_EMAIL=noreply@alumnibghs.org

# Option 2: Personal email with display name
FROM_EMAIL=yourname@gmail.com
```

---

## Verification Status Check

After adding sender in Brevo:
1. Go to Senders & IP → Senders
2. Check status - should show "Verified" (green checkmark)
3. If not verified, check your inbox for verification email

---

## Questions to Answer

1. **Do you own/control the `alumnibghs.org` domain?**
   - If YES → Set up domain authentication (best option)
   - If NO → Continue to next question

2. **Do you have access to `noreply@alumnibghs.org` inbox?**
   - If YES → Verify this email in Brevo
   - If NO → Use personal email with display name

3. **Which email do you want to verify in Brevo right now?**
   - This will be your `FROM_EMAIL` value

---

## Code Implementation Note

The code will work with any verified email. The display name "BGHS Alumni" will be automatically added, so recipients see a professional sender name regardless of which email you use.




