# Remaining Critical Security Risks

**Date:** January 2025  
**Status:** ⚠️ **REQUIRES IMMEDIATE ATTENTION**

---

## 🔴 CRITICAL RISKS (Not Yet Fixed)

### 1. **Service Role Key Overuse** 
**Severity:** 🔴 CRITICAL  
**Risk Level:** Complete database compromise if key is leaked  
**Status:** ❌ NOT FIXED

**Problem:**
- **42 API routes** use `SUPABASE_SERVICE_ROLE_KEY` which bypasses ALL Row Level Security (RLS) policies
- Service role key grants **full database access** - can read, write, delete any data
- If this key is leaked (through logs, environment variables, or code), attacker has complete control

**Affected Files (42 routes):**
- All admin routes (`/api/admin/*`)
- All auth routes (`/api/auth/*`)
- All upload routes (`/api/*/upload`)
- Directory routes
- Profile routes
- And many more...

**Impact:**
- If key is exposed → Complete database takeover
- Attacker can read all user data, modify records, delete data
- No audit trail since RLS is bypassed
- Can create admin accounts, modify permissions

**Why It's Critical:**
- Service role bypasses all security policies
- Used in too many places (should be minimal)
- No monitoring of service role usage
- Key rotation is difficult once deployed

**Recommendation:**
1. **Audit all service role usage** - Identify which routes truly need it
2. **Use authenticated clients with RLS** - Prefer RLS policies over service role
3. **Only use service role for:**
   - Admin operations that need to bypass RLS
   - System-level operations
   - Operations that can't use RLS (rare)
4. **Add permission checks** before using service role
5. **Monitor service role usage** - Log all operations
6. **Rotate key regularly** - Every 90 days

**Example Fix:**
```typescript
// ❌ BAD: Using service role unnecessarily
const db = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const { data } = await db.from('profiles').select('*')

// ✅ GOOD: Use authenticated client with RLS
const cookieClient = createRouteHandlerClient({ cookies })
const { data: { user } } = await cookieClient.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// RLS policies will automatically filter data
const { data } = await cookieClient.from('profiles').select('*')
```

---

### 2. **Missing Rate Limiting**
**Severity:** 🔴 CRITICAL  
**Risk Level:** DDoS, brute force attacks, resource exhaustion  
**Status:** ❌ NOT FIXED

**Problem:**
- **NO rate limiting** on any API endpoints
- Attackers can:
  - **Brute force passwords** - Unlimited login attempts
  - **Spam OTP requests** - Exhaust SMS/email quotas
  - **Create unlimited accounts** - Registration spam
  - **Exhaust storage** - Unlimited file uploads
  - **DDoS attacks** - Overwhelm server resources

**Vulnerable Endpoints:**
- `/api/auth/send-otp` - Can spam OTP requests (costs money)
- `/api/auth/verify-otp` - Can brute force 6-digit codes (1M attempts possible)
- `/api/auth/register` - Can create unlimited fake accounts
- `/api/auth/login-lookup` - Can enumerate user emails
- `/api/souvenirs/upload` - Can exhaust R2 storage quota
- `/api/gallery/upload` - Can exhaust R2 storage quota
- `/api/events/register` - Can spam event registrations

**Impact:**
- **Financial:** SMS/email costs from spam
- **Service disruption:** Server overload, storage exhaustion
- **Security:** Account enumeration, brute force attacks
- **Data quality:** Fake accounts, spam registrations

**Why It's Critical:**
- Easy to exploit - no protection
- Can cause immediate financial damage
- Can take down the service
- No way to detect or prevent attacks

**Recommendation:**
1. **Install rate limiting library:**
   ```bash
   npm install @upstash/ratelimit @upstash/redis
   ```

2. **Implement rate limits:**
   - Auth endpoints: **5 requests/minute per IP**
   - OTP endpoints: **3 requests/hour per IP**
   - File uploads: **10 requests/hour per user**
   - Registration: **3 requests/day per IP**
   - General API: **100 requests/minute per IP**

3. **Use both IP and user-based limiting:**
   ```typescript
   // IP-based (prevents distributed attacks)
   const ip = request.ip ?? request.headers.get("x-forwarded-for")
   await ratelimit.limit(`ip:${ip}`)
   
   // User-based (prevents authenticated user abuse)
   if (user) {
     await ratelimit.limit(`user:${user.id}`)
   }
   ```

4. **Return proper HTTP 429 status** with retry-after header

**Priority:** Implement before production launch

---

### 3. **Insufficient File Upload Validation**
**Severity:** 🟠 HIGH (but can become CRITICAL)  
**Risk Level:** Malicious file uploads, server compromise  
**Status:** ❌ NOT FIXED

**Problem:**
- File validation relies **only on MIME type** (`file.type`)
- MIME types can be **easily spoofed**
- No **magic byte/file signature** validation
- No **virus scanning**
- PDF files not validated for malicious content

**Current Validation:**
```typescript
// ❌ Only checks MIME type (can be spoofed)
if (file.type !== 'application/pdf') {
  return error
}
```

**Attack Scenarios:**
1. Upload executable as `.pdf` - Change MIME type to `application/pdf`
2. Upload malicious PDF with embedded JavaScript
3. Upload oversized files to exhaust storage
4. Upload files with malicious metadata

**Impact:**
- Malicious files stored in R2
- If files are served, could execute code
- Storage quota exhaustion
- Potential server compromise if files are processed

**Recommendation:**
1. **Install file-type library:**
   ```bash
   npm install file-type
   ```

2. **Validate by magic bytes:**
   ```typescript
   import { fileTypeFromBuffer } from 'file-type'
   
   const buffer = await file.arrayBuffer()
   const fileType = await fileTypeFromBuffer(buffer)
   
   if (!fileType || fileType.mime !== 'application/pdf') {
     return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
   }
   
   // Validate PDF structure
   const pdfHeader = new Uint8Array(buffer.slice(0, 4))
   if (!pdfHeader.toString().startsWith('%PDF')) {
     return NextResponse.json({ error: 'Invalid PDF' }, { status: 400 })
   }
   ```

3. **Add file size limits:**
   - Images: 10MB max
   - PDFs: 50MB max (reduce from 100MB)
   - Evidence: 5MB max

4. **Consider virus scanning** for production (ClamAV, VirusTotal API)

**Priority:** High - Should fix before production

---

### 4. **Weak Password Policy**
**Severity:** 🟠 HIGH  
**Risk Level:** Account compromise via brute force  
**Status:** ❌ NOT FIXED

**Current Policy:**
```typescript
// Only 8 characters minimum - too weak
const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
```

**Problems:**
- **8 characters is too short** - Can be brute forced
- **No check against common passwords** - "Password123!" would pass
- **No password history** - Users can reuse passwords
- **No account lockout** - Unlimited login attempts (see rate limiting)

**Recommendation:**
1. **Increase minimum to 12 characters**
2. **Check against common passwords:**
   ```typescript
   const commonPasswords = ['password', 'password123', '12345678', ...]
   if (commonPasswords.includes(password.toLowerCase())) {
     return error
   }
   ```
3. **Implement account lockout:**
   - Lock after 5 failed attempts
   - Unlock after 30 minutes or admin reset
4. **Password history:** Prevent reusing last 5 passwords

**Priority:** High - Should fix before production

---

### 5. **Missing Input Validation/Sanitization**
**Severity:** 🟠 HIGH  
**Risk Level:** Injection attacks, data corruption  
**Status:** ❌ NOT FIXED

**Problem:**
- No **schema-based validation** (Zod, Yup)
- Text inputs accept **any characters** without validation
- No **length limits** on text fields
- Email validation is **basic** (only trim + lowercase)
- No **SQL injection protection** (Supabase helps, but input should still be validated)

**Examples:**
```typescript
// ❌ No validation
const { email, first_name, last_name } = await request.json()
// Could be anything - null, undefined, extremely long strings, special characters

// ✅ Should validate
const schema = z.object({
  email: z.string().email().max(255),
  first_name: z.string().min(1).max(100).regex(/^[a-zA-Z\s'-]+$/),
  last_name: z.string().min(1).max(100).regex(/^[a-zA-Z\s'-]+$/)
})
const validated = schema.parse(body)
```

**Recommendation:**
1. **Install Zod:**
   ```bash
   npm install zod
   ```

2. **Create validation schemas** for all API endpoints
3. **Validate all inputs** before processing
4. **Sanitize text inputs** (trim, escape special characters)
5. **Set length limits** on all text fields

**Priority:** High - Should fix before production

---

## 🟡 MEDIUM RISKS (Should Fix Soon)

### 6. **Insecure Session Management**
- Missing secure cookie flags
- No session timeout
- No session invalidation on password change

### 7. **Missing Audit Logging**
- No trail of admin operations
- Cannot detect breaches
- Compliance issues

### 8. **Basic Auth in Middleware**
- Testing-only feature
- Should be disabled in production
- Weak authentication if enabled

---

## 📊 Risk Summary

| Risk | Severity | Status | Priority |
|------|----------|--------|----------|
| Service Role Overuse | 🔴 CRITICAL | ❌ Not Fixed | **IMMEDIATE** |
| Missing Rate Limiting | 🔴 CRITICAL | ❌ Not Fixed | **IMMEDIATE** |
| File Upload Validation | 🟠 HIGH | ❌ Not Fixed | **HIGH** |
| Weak Password Policy | 🟠 HIGH | ❌ Not Fixed | **HIGH** |
| Input Validation | 🟠 HIGH | ❌ Not Fixed | **HIGH** |
| Session Management | 🟡 MEDIUM | ❌ Not Fixed | Medium |
| Audit Logging | 🟡 MEDIUM | ❌ Not Fixed | Medium |

---

## 🎯 Recommended Action Plan

### Before Production Launch (CRITICAL):
1. ✅ **Security Headers** - DONE
2. ✅ **CORS Fix** - DONE
3. ✅ **XSS Protection** - DONE
4. ✅ **Error Handling** - DONE
5. ❌ **Rate Limiting** - **MUST FIX**
6. ❌ **Service Role Audit** - **MUST FIX** (at least document and minimize)

### Within First Week (HIGH):
7. ❌ **File Upload Validation** - Add magic byte checking
8. ❌ **Password Policy** - Increase to 12 characters
9. ❌ **Input Validation** - Add Zod schemas

### Within First Month (MEDIUM):
10. ❌ **Session Management** - Secure cookies, timeouts
11. ❌ **Audit Logging** - Track admin operations

---

## ⚠️ Production Readiness

**Current Status:** ⚠️ **NOT READY FOR PRODUCTION**

**Blockers:**
- ❌ No rate limiting (DDoS/brute force risk)
- ❌ Service role overuse (complete database compromise risk)

**Recommendation:**
- **DO NOT launch to production** until rate limiting is implemented
- **Minimize service role usage** before launch
- **Implement file validation** before accepting user uploads

---

## 📝 Notes

- Rate limiting is the **highest priority** - can cause immediate damage
- Service role audit is **critical** but can be done incrementally
- File validation should be done before accepting production uploads
- Password policy can be updated without breaking existing users

---

**Last Updated:** January 2025

