# Security Audit Report - BGHS Alumni Website

**Date:** January 2025  
**Application:** BGHS Alumni Website (Next.js + Supabase)  
**Status:** Pre-Production Security Assessment

---

## Executive Summary

This security audit identifies **critical**, **high**, **medium**, and **low** severity security issues that must be addressed before production deployment. The application has several good security practices in place (RLS policies, authentication checks, file validation) but also has significant vulnerabilities that could lead to data breaches, unauthorized access, and service disruption.

**Overall Security Rating: ⚠️ MODERATE RISK** - Requires immediate attention before production launch.

---

## 🔴 CRITICAL VULNERABILITIES

### 1. **Service Role Key Exposure Risk**
**Severity:** CRITICAL  
**Location:** Multiple API routes  
**Risk:** Complete database compromise

**Issue:**
- Service role key (`SUPABASE_SERVICE_ROLE_KEY`) is used extensively in API routes
- Service role bypasses all RLS policies, granting full database access
- If leaked, attacker gains complete control over database

**Affected Files:**
- `app/api/souvenirs/upload/route.ts` (line 109)
- `app/api/gallery/upload/route.ts` (line 41)
- `app/api/events/upload-image/route.ts` (line 40)
- And 30+ other API routes

**Recommendation:**
```typescript
// ❌ BAD: Using service role for all operations
const db = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// ✅ GOOD: Use service role only when necessary, with proper checks
// Prefer using authenticated client with RLS when possible
const cookieClient = createRouteHandlerClient({ cookies })
const { data: { user } } = await cookieClient.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// Only use service role for admin operations that require bypassing RLS
if (needsAdminAccess) {
  const adminClient = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  // Perform admin operation
}
```

**Mitigation:**
1. Audit all service role usage - only use for operations that truly need to bypass RLS
2. Implement proper permission checks before using service role
3. Rotate service role key regularly
4. Monitor service role key usage in logs
5. Consider using Supabase Edge Functions for sensitive operations

---

### 2. **Missing Rate Limiting**
**Severity:** CRITICAL  
**Location:** All API routes  
**Risk:** DDoS attacks, brute force, resource exhaustion

**Issue:**
- No rate limiting on authentication endpoints (`/api/auth/*`)
- No rate limiting on file upload endpoints
- No rate limiting on registration endpoint
- Attackers can brute force passwords, spam registrations, or exhaust server resources

**Affected Endpoints:**
- `/api/auth/send-otp` - Can spam OTP requests
- `/api/auth/verify-otp` - Can brute force OTP codes
- `/api/auth/register` - Can create unlimited accounts
- `/api/souvenirs/upload` - Can exhaust storage quota
- `/api/gallery/upload` - Can exhaust storage quota

**Recommendation:**
```typescript
// Install: npm install @upstash/ratelimit @upstash/redis
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
})

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "unknown"
  const { success, limit, remaining } = await ratelimit.limit(ip)
  
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "X-RateLimit-Limit": limit.toString(), "X-RateLimit-Remaining": remaining.toString() } }
    )
  }
  
  // Continue with request...
}
```

**Mitigation:**
1. Implement rate limiting using Upstash Redis or similar
2. Different limits for different endpoints:
   - Auth endpoints: 5 requests/minute
   - File uploads: 10 requests/hour
   - General API: 100 requests/minute
3. Use IP-based and user-based rate limiting
4. Implement exponential backoff for repeated violations
5. Consider using Vercel's built-in rate limiting for edge functions

---

### 3. **CORS Misconfiguration**
**Severity:** CRITICAL  
**Location:** `app/api/souvenirs/upload/route.ts` (line 185)  
**Risk:** Cross-origin attacks, data theft

**Issue:**
```typescript
'Access-Control-Allow-Origin': '*', // ❌ Allows any origin
```

**Recommendation:**
```typescript
// ✅ GOOD: Whitelist specific origins
const allowedOrigins = [
  'https://alumnibghs.org',
  'https://www.alumnibghs.org',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
].filter(Boolean)

const origin = request.headers.get('origin')
if (origin && allowedOrigins.includes(origin)) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}
```

**Mitigation:**
1. Remove wildcard CORS (`*`)
2. Whitelist only trusted domains
3. Use environment variables for allowed origins
4. Add `Access-Control-Allow-Credentials: true` only when needed
5. Review all API routes for CORS configuration

---

### 4. **XSS Vulnerability in Blog Content**
**Severity:** CRITICAL  
**Location:** `app/blog/[id]/page.tsx` (line 284)  
**Risk:** Stored XSS attacks, session hijacking

**Issue:**
```typescript
dangerouslySetInnerHTML={{ __html: blog.content }}
```

**Recommendation:**
```typescript
// ✅ GOOD: Sanitize HTML before rendering
import DOMPurify from 'isomorphic-dompurify'

// In component:
<div 
  className="prose max-w-none"
  dangerouslySetInnerHTML={{ 
    __html: DOMPurify.sanitize(blog.content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
      ALLOW_DATA_ATTR: false
    })
  }} 
/>
```

**Mitigation:**
1. Install and use DOMPurify: `npm install isomorphic-dompurify`
2. Sanitize all user-generated HTML content
3. Whitelist only safe HTML tags and attributes
4. Consider using a markdown parser instead of raw HTML
5. Implement Content Security Policy (CSP) headers

---

## 🟠 HIGH SEVERITY VULNERABILITIES

### 5. **Insufficient File Upload Validation**
**Severity:** HIGH  
**Location:** Multiple upload endpoints  
**Risk:** Malicious file uploads, server compromise

**Current Issues:**
- File type validation relies only on `file.type` (can be spoofed)
- No magic byte/file signature validation
- No virus scanning
- PDF files not validated for malicious content
- File size limits exist but may be too generous (100MB for PDFs)

**Recommendation:**
```typescript
import { fileTypeFromBuffer } from 'file-type'

// Validate file type by magic bytes, not just MIME type
const buffer = await file.arrayBuffer()
const fileType = await fileTypeFromBuffer(buffer)

if (!fileType || fileType.mime !== 'application/pdf') {
  return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
}

// Additional PDF validation
if (fileType.ext !== 'pdf') {
  return NextResponse.json({ error: 'File is not a valid PDF' }, { status: 400 })
}

// Check for PDF structure
const pdfHeader = new Uint8Array(buffer.slice(0, 4))
const pdfSignature = new TextDecoder().decode(pdfHeader)
if (!pdfSignature.startsWith('%PDF')) {
  return NextResponse.json({ error: 'Invalid PDF structure' }, { status: 400 })
}
```

**Mitigation:**
1. Use `file-type` library for magic byte validation
2. Validate PDF structure (must start with `%PDF`)
3. Implement file size limits appropriate for each file type:
   - Images: 10MB
   - PDFs: 50MB (reduce from 100MB)
   - Evidence files: 5MB
4. Consider virus scanning for uploaded files (ClamAV, VirusTotal API)
5. Store files outside web root when possible
6. Use unique, unpredictable filenames

---

### 6. **Missing Input Sanitization**
**Severity:** HIGH  
**Location:** Multiple API routes  
**Risk:** SQL injection (mitigated by Supabase), XSS, injection attacks

**Issues:**
- User inputs not sanitized before database insertion
- Text fields accept any characters without validation
- No length limits on text inputs
- Email validation is basic (only trim + lowercase)

**Recommendation:**
```typescript
import validator from 'validator'
import { z } from 'zod'

// Use Zod for schema validation
const registerSchema = z.object({
  email: z.string().email().max(255).transform(v => v.trim().toLowerCase()),
  first_name: z.string().min(1).max(100).regex(/^[a-zA-Z\s'-]+$/),
  last_name: z.string().min(1).max(100).regex(/^[a-zA-Z\s'-]+$/),
  year_of_leaving: z.number().int().min(1900).max(new Date().getFullYear()),
  // ... other fields
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validated = registerSchema.parse(body) // Throws if invalid
  // Use validated data...
}
```

**Mitigation:**
1. Install Zod: `npm install zod`
2. Create validation schemas for all API endpoints
3. Sanitize all text inputs (trim, escape special characters)
4. Implement length limits on all text fields
5. Use parameterized queries (Supabase does this, but validate inputs)
6. Validate email format properly
7. Sanitize file names before storage

---

### 7. **Weak Password Policy**
**Severity:** HIGH  
**Location:** `app/api/auth/register/route.ts` (line 52)  
**Risk:** Account compromise via brute force

**Current Policy:**
```typescript
const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
```

**Issues:**
- Minimum 8 characters is too short (should be 12+)
- No check against common passwords
- No password history enforcement
- No account lockout after failed attempts

**Recommendation:**
```typescript
// Enhanced password validation
const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/\d/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character')
  .refine((pw) => !isCommonPassword(pw), 'Password is too common')

// Check against common passwords (use haveibeenpwned API or local list)
async function isCommonPassword(password: string): Promise<boolean> {
  // Implement check against common password list
  return false
}
```

**Mitigation:**
1. Increase minimum password length to 12 characters
2. Implement password strength meter
3. Check passwords against common password lists
4. Implement account lockout after 5 failed login attempts
5. Require password change after 90 days
6. Enforce password history (prevent reusing last 5 passwords)

---

### 8. **Information Disclosure in Error Messages**
**Severity:** HIGH  
**Location:** Multiple API routes  
**Risk:** Information leakage, system reconnaissance

**Issues:**
- Error messages expose internal details
- Stack traces may be exposed in production
- Database errors reveal table/column names
- File paths exposed in error messages

**Examples:**
```typescript
// ❌ BAD: Exposes internal details
catch (error) {
  return NextResponse.json({ 
    error: error.message, // May contain sensitive info
    stack: error.stack    // Exposes code structure
  }, { status: 500 })
}
```

**Recommendation:**
```typescript
// ✅ GOOD: Generic error messages
catch (error) {
  console.error('Souvenir upload error:', error) // Log full error server-side
  
  // Return generic message to client
  return NextResponse.json(
    { 
      error: 'Failed to upload souvenir book. Please try again.',
      success: false 
    },
    { status: 500 }
  )
}
```

**Mitigation:**
1. Never expose stack traces to clients in production
2. Use generic error messages for users
3. Log detailed errors server-side only
4. Sanitize error messages before sending to client
5. Use error codes instead of descriptive messages
6. Implement error monitoring (Sentry, LogRocket)

---

### 9. **Missing Security Headers**
**Severity:** HIGH  
**Location:** `next.config.js`, middleware  
**Risk:** XSS, clickjacking, MIME sniffing attacks

**Missing Headers:**
- Content-Security-Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (HSTS)
- Referrer-Policy
- Permissions-Policy

**Recommendation:**
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.alumnibghs.org;"
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

**Mitigation:**
1. Add security headers to `next.config.js`
2. Implement strict CSP policy
3. Test headers using securityheaders.com
4. Enable HSTS for HTTPS
5. Configure Referrer-Policy appropriately

---

## 🟡 MEDIUM SEVERITY VULNERABILITIES

### 10. **Insecure Session Management**
**Severity:** MEDIUM  
**Location:** Authentication system  
**Risk:** Session hijacking, unauthorized access

**Issues:**
- No session timeout configuration visible
- No session invalidation on password change
- No concurrent session limits
- Cookies may not have secure flags

**Recommendation:**
```typescript
// Configure secure session cookies
// In Supabase client configuration
const supabaseOptions = {
  cookies: {
    get(name: string) {
      return cookies().get(name)?.value
    },
    set(name: string, value: string, options: any) {
      cookies().set({
        name,
        value,
        ...options,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    },
    remove(name: string, options: any) {
      cookies().set({
        name,
        value: '',
        ...options,
        maxAge: 0
      })
    }
  }
}
```

**Mitigation:**
1. Set secure cookie flags (httpOnly, secure, sameSite)
2. Implement session timeout (30 minutes inactivity)
3. Invalidate all sessions on password change
4. Limit concurrent sessions per user
5. Implement session rotation on privilege escalation

---

### 11. **Missing Audit Logging**
**Severity:** MEDIUM  
**Location:** Admin operations  
**Risk:** Inability to detect breaches, compliance issues

**Issues:**
- No audit logs for sensitive operations
- Cannot track who performed admin actions
- No compliance trail for data access

**Recommendation:**
```typescript
// Create audit_log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

// Log admin actions
async function logAuditEvent(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details: any
) {
  await supabase.from('audit_log').insert({
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
    ip_address: request.ip,
    user_agent: request.headers.get('user-agent')
  })
}
```

**Mitigation:**
1. Create audit_log table
2. Log all admin operations (create, update, delete)
3. Log authentication events (login, logout, failed attempts)
4. Log data access (profile views, exports)
5. Retain logs for 1 year minimum
6. Implement log analysis and alerting

---

### 12. **Basic Auth in Middleware (Testing Only)**
**Severity:** MEDIUM  
**Location:** `middleware.ts`  
**Risk:** Weak authentication if enabled in production

**Issue:**
- Basic auth implementation for testing
- Password stored in environment variable (may be weak)
- No rate limiting on basic auth attempts

**Current Code:**
```typescript
if (password === ACCESS_PASSWORD && ACCESS_PASSWORD) {
  // Basic auth check
}
```

**Recommendation:**
- **DO NOT enable in production** - This is for testing only
- If needed, use proper authentication (Supabase Auth)
- Remove or disable before production launch
- Document that this is testing-only functionality

**Mitigation:**
1. Ensure `ENABLE_ACCESS_CONTROL=false` in production
2. Remove basic auth middleware before production
3. Use Supabase Auth for all authentication
4. If basic auth needed, implement proper rate limiting

---

### 13. **Insufficient RLS Policy Coverage**
**Severity:** MEDIUM  
**Location:** Database RLS policies  
**Risk:** Unauthorized data access

**Issues:**
- Some tables may not have RLS enabled
- RLS policies may be too permissive
- Service role bypasses all RLS (see Critical #1)

**Recommendation:**
```sql
-- Ensure RLS is enabled on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
-- ... all user data tables

-- Review and tighten policies
-- Example: Only allow users to see approved profiles
CREATE POLICY "Users can view approved profiles" ON profiles
  FOR SELECT USING (is_approved = true OR id = auth.uid());
```

**Mitigation:**
1. Audit all tables for RLS enablement
2. Review all RLS policies for correctness
3. Test policies with different user roles
4. Use principle of least privilege
5. Document all RLS policies

---

### 14. **Environment Variable Exposure**
**Severity:** MEDIUM  
**Location:** Client-side code  
**Risk:** API key exposure

**Issues:**
- `NEXT_PUBLIC_*` variables are exposed to client
- Service role key should never be in client code (currently safe)
- Public Supabase URL and anon key are exposed (acceptable)

**Current State:**
- ✅ Service role key is server-side only
- ⚠️ Public keys are exposed (acceptable for Supabase)
- ⚠️ No validation that sensitive keys aren't accidentally exposed

**Recommendation:**
```typescript
// Create a validation script
// scripts/validate-env.ts
const SENSITIVE_KEYS = ['SERVICE_ROLE_KEY', 'SECRET', 'PASSWORD', 'TOKEN']
const clientCode = fs.readFileSync('app/**/*.tsx', 'utf-8')

SENSITIVE_KEYS.forEach(key => {
  if (clientCode.includes(key)) {
    throw new Error(`Sensitive key ${key} found in client code!`)
  }
})
```

**Mitigation:**
1. Audit all environment variable usage
2. Ensure no sensitive keys in `NEXT_PUBLIC_*` variables
3. Use build-time validation
4. Document which variables are safe to expose
5. Rotate keys regularly

---

## 🟢 LOW SEVERITY / BEST PRACTICES

### 15. **Missing Input Length Limits**
**Severity:** LOW  
**Location:** Form inputs  
**Risk:** DoS via large inputs, database bloat

**Recommendation:**
- Implement max length on all text inputs
- Validate length server-side
- Use database constraints

---

### 16. **Console.log in Production**
**Severity:** LOW  
**Location:** Multiple files  
**Risk:** Information leakage, performance impact

**Recommendation:**
- Remove or replace with proper logging
- Use structured logging (Winston, Pino)
- Implement log levels

---

### 17. **Missing HTTPS Enforcement**
**Severity:** LOW  
**Location:** Deployment configuration  
**Risk:** Man-in-the-middle attacks

**Recommendation:**
- Ensure HTTPS is enforced in production
- Use HSTS header (see #9)
- Redirect HTTP to HTTPS

---

### 18. **No CSRF Protection**
**Severity:** LOW (Mitigated by SameSite cookies)  
**Location:** API routes  
**Risk:** Cross-site request forgery

**Current State:**
- ✅ SameSite cookie attribute provides some protection
- ⚠️ No explicit CSRF tokens

**Recommendation:**
- Consider adding CSRF tokens for state-changing operations
- Ensure SameSite is set to 'strict' or 'lax'
- Use double-submit cookie pattern if needed

---

## ✅ SECURITY STRENGTHS

1. **✅ Row Level Security (RLS)** - Properly implemented on most tables
2. **✅ Authentication Checks** - Most API routes check authentication
3. **✅ Permission System** - Granular permission-based access control
4. **✅ File Type Validation** - Basic validation in place
5. **✅ Password Requirements** - Minimum complexity requirements
6. **✅ Supabase Integration** - Uses secure Supabase client
7. **✅ Parameterized Queries** - Supabase prevents SQL injection

---

## 📋 PRIORITY ACTION ITEMS

### Before Production Launch (CRITICAL):

1. **🔴 Fix CORS configuration** - Remove wildcard, whitelist domains
2. **🔴 Implement rate limiting** - All API endpoints
3. **🔴 Sanitize blog content** - Fix XSS vulnerability
4. **🔴 Reduce service role usage** - Only when absolutely necessary
5. **🔴 Add security headers** - CSP, HSTS, etc.
6. **🔴 Enhance file validation** - Magic byte checking
7. **🔴 Improve error handling** - No stack traces to clients
8. **🔴 Strengthen password policy** - 12+ characters, common password check

### Within First Month (HIGH):

9. **🟠 Input validation** - Use Zod schemas
10. **🟠 Audit logging** - Track all admin operations
11. **🟠 Session management** - Secure cookies, timeouts
12. **🟠 RLS policy review** - Ensure all tables protected

### Ongoing (MEDIUM/LOW):

13. **🟡 Security monitoring** - Set up alerts
14. **🟡 Regular security audits** - Quarterly reviews
15. **🟡 Dependency updates** - Keep packages updated
16. **🟡 Penetration testing** - Annual professional audit

---

## 🔧 IMPLEMENTATION CHECKLIST

- [ ] Install security dependencies: `zod`, `isomorphic-dompurify`, `file-type`, `@upstash/ratelimit`
- [ ] Fix CORS in all API routes
- [ ] Add rate limiting middleware
- [ ] Sanitize all user-generated HTML
- [ ] Add security headers to next.config.js
- [ ] Implement input validation with Zod
- [ ] Enhance file upload validation
- [ ] Set up audit logging
- [ ] Review and reduce service role usage
- [ ] Test all security fixes
- [ ] Security headers test (securityheaders.com)
- [ ] OWASP ZAP scan
- [ ] Load testing with rate limits

---

## 📚 REFERENCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Supabase Security Guide](https://supabase.com/docs/guides/platform/security)
- [Vercel Security](https://vercel.com/docs/security)

---

## 📝 NOTES

- This audit is based on code review and may not catch all runtime issues
- Recommend professional penetration testing before production
- Security is an ongoing process - regular reviews needed
- Consider bug bounty program for community reporting

---

**Report Generated:** January 2025  
**Next Review:** After implementing critical fixes

