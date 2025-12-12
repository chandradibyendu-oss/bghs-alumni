# Rate Limiting Implementation Plan

**Date:** January 2025  
**Status:** Planning Phase

---

## 🎯 Overview

Rate limiting will prevent abuse by limiting the number of requests a user or IP can make within a specific time window. This protects against:
- Brute force attacks
- DDoS attacks
- Resource exhaustion
- Spam and abuse

---

## 📚 Technology Choice

### **Option 1: Upstash Redis (Recommended)**
**Why:**
- ✅ Serverless-friendly (works with Vercel)
- ✅ No infrastructure to manage
- ✅ Fast and reliable
- ✅ Free tier available (10,000 requests/day)
- ✅ Built for rate limiting

**How it works:**
- Uses Redis as a distributed cache
- Stores rate limit counters in Redis
- Works across multiple server instances
- Automatic expiration of counters

**Cost:**
- Free tier: 10,000 requests/day
- Paid: $0.20 per 100K requests

### **Option 2: In-Memory (Not Recommended)**
**Why NOT:**
- ❌ Doesn't work with serverless (each instance has separate memory)
- ❌ Doesn't scale across multiple servers
- ❌ Lost on server restart
- ❌ Can be bypassed by using different server instances

### **Option 3: Vercel Edge Rate Limiting (Alternative)**
**Why:**
- ✅ Built into Vercel
- ✅ No external service needed
- ✅ Works at edge level

**Limitations:**
- ⚠️ Less flexible than Upstash
- ⚠️ Vercel-specific (not portable)

---

## 🏗️ Architecture

### How It Works:

```
User Request → API Route → Rate Limiter Check
                              ↓
                    Check Redis for IP/User
                              ↓
                    ┌─────────┴─────────┐
                    │                   │
              Within Limit?      Exceeded?
                    │                   │
                    ↓                   ↓
            Process Request      Return 429 Error
            (with remaining)     (Rate Limit Exceeded)
```

### Components:

1. **Rate Limiter Utility** (`lib/rate-limiter.ts`)
   - Centralized rate limiting logic
   - Different limits for different endpoint types
   - IP-based and user-based limiting

2. **Middleware/Helper Function**
   - Checks rate limit before processing request
   - Returns 429 status if exceeded
   - Adds rate limit headers to response

3. **Redis Storage** (Upstash)
   - Stores counters per IP/user
   - Automatic expiration
   - Distributed across all server instances

---

## 📋 Implementation Details

### 1. **Installation**

```bash
npm install @upstash/ratelimit @upstash/redis
```

### 2. **Environment Variables**

Add to `.env.local`:
```bash
# Upstash Redis (get from https://upstash.com)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### 3. **Rate Limit Configuration**

Different limits for different endpoint types:

| Endpoint Type | Limit | Window | Reason |
|--------------|-------|--------|--------|
| **Auth (Login/OTP)** | 5 requests | 1 minute | Prevent brute force |
| **OTP Send** | 3 requests | 1 hour | Prevent SMS/email spam |
| **OTP Verify** | 10 requests | 1 minute | Allow some retries |
| **Registration** | 3 requests | 24 hours | Prevent spam accounts |
| **File Upload** | 10 requests | 1 hour | Prevent storage abuse |
| **General API** | 100 requests | 1 minute | Normal usage |
| **Admin Operations** | 50 requests | 1 minute | Admin activities |

### 4. **Rate Limiter Utility Structure**

```typescript
// lib/rate-limiter.ts

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Create Redis client
const redis = Redis.fromEnv()

// Different limiters for different endpoint types
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
})

export const otpSendLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 requests per hour
})

export const uploadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests per hour
})

// ... more limiters

// Helper function to check rate limit
export async function checkRateLimit(
  request: NextRequest,
  limiter: Ratelimit,
  identifier?: string // Optional: user ID for authenticated requests
): Promise<{ success: boolean; limit: number; remaining: number; reset: number } | null>
```

### 5. **Integration in API Routes**

**Example: Auth Endpoint**

```typescript
// app/api/auth/send-otp/route.ts

import { checkRateLimit, otpSendLimiter } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  // Get IP address
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "unknown"
  
  // Check rate limit
  const rateLimitResult = await checkRateLimit(request, otpSendLimiter, ip)
  
  if (!rateLimitResult || !rateLimitResult.success) {
    return NextResponse.json(
      { 
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: rateLimitResult?.reset || 3600
      },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimitResult?.limit.toString() || "3",
          "X-RateLimit-Remaining": rateLimitResult?.remaining.toString() || "0",
          "X-RateLimit-Reset": rateLimitResult?.reset.toString() || "3600",
          "Retry-After": rateLimitResult?.reset.toString() || "3600"
        }
      }
    )
  }
  
  // Continue with normal processing...
  // ... rest of the code
}
```

**Example: Upload Endpoint (with user-based limiting)**

```typescript
// app/api/souvenirs/upload/route.ts

import { checkRateLimit, uploadLimiter } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  // Authenticate user first
  const { data: { user } } = await cookieClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check rate limit - use user ID for authenticated requests
  const identifier = `user:${user.id}` // More accurate than IP
  const rateLimitResult = await checkRateLimit(request, uploadLimiter, identifier)
  
  if (!rateLimitResult || !rateLimitResult.success) {
    return NextResponse.json(
      { error: "Upload rate limit exceeded. Please try again later." },
      { status: 429 }
    )
  }
  
  // Continue with upload...
}
```

---

## 🔄 Rate Limiting Strategies

### **1. Sliding Window (Recommended)**
- Smooth distribution of requests
- Better user experience
- Example: 5 requests per minute = can make 1 request every 12 seconds

### **2. Fixed Window**
- Simpler but can allow bursts
- Example: 5 requests per minute = can make 5 requests at once, then wait

### **3. Token Bucket**
- Most flexible
- Allows bursts up to bucket size
- More complex to implement

**We'll use Sliding Window** for better user experience.

---

## 📊 Rate Limit Headers

All rate-limited responses will include:

```
X-RateLimit-Limit: 5          # Maximum requests allowed
X-RateLimit-Remaining: 3      # Requests remaining in window
X-RateLimit-Reset: 1640995200  # Unix timestamp when limit resets
Retry-After: 60                # Seconds until retry allowed
```

---

## 🎯 Endpoints to Protect

### **Critical (Must Have):**
1. `/api/auth/send-otp` - 3/hour
2. `/api/auth/verify-otp` - 10/minute
3. `/api/auth/register` - 3/day
4. `/api/auth/login-lookup` - 10/minute
5. `/api/souvenirs/upload` - 10/hour
6. `/api/gallery/upload` - 10/hour
7. `/api/events/upload-image` - 10/hour
8. `/api/blog/upload-image` - 10/hour

### **Important (Should Have):**
9. `/api/auth/forgot-password` - 5/hour
10. `/api/auth/reset-password` - 5/hour
11. `/api/events/register` - 20/hour
12. `/api/verification/submit` - 5/day

### **General (Nice to Have):**
13. All other API routes - 100/minute

---

## ⚠️ Considerations

### **1. User Experience**
- **Don't be too strict** - Legitimate users should not be blocked
- **Clear error messages** - Tell users when they can retry
- **Progressive limits** - Stricter for sensitive operations

### **2. Bypass Scenarios**
- **VPN/Proxy** - IP-based limiting can be bypassed
- **Solution:** Use user-based limiting for authenticated requests
- **Distributed attacks** - Multiple IPs attacking
- **Solution:** Monitor patterns, implement additional protections

### **3. False Positives**
- **Shared IPs** - Office, school networks
- **Solution:** Use user-based limiting when possible
- **Legitimate bursts** - User refreshing page
- **Solution:** Use sliding window, not fixed window

### **4. Development/Testing**
- **Bypass in development** - Don't rate limit localhost
- **Test mode** - Allow disabling for testing
- **Monitoring** - Log rate limit hits for analysis

---

## 🧪 Testing Strategy

### **1. Unit Tests**
- Test rate limiter utility
- Test different limit configurations
- Test edge cases (exact limit, over limit)

### **2. Integration Tests**
- Test with actual API endpoints
- Verify 429 responses
- Verify headers are correct

### **3. Load Testing**
- Test under normal load
- Test under attack scenarios
- Verify limits are enforced

---

## 📈 Monitoring

### **What to Monitor:**
1. **Rate limit hits** - How often limits are exceeded
2. **Which endpoints** - Most frequently rate-limited
3. **Which IPs/users** - Potential attackers
4. **False positives** - Legitimate users being blocked

### **Alerts:**
- High rate limit hit rate (potential attack)
- Specific IP hitting limits repeatedly
- Unusual patterns

---

## 🚀 Implementation Steps

1. **Setup Upstash Redis**
   - Create account at https://upstash.com
   - Create Redis database
   - Get REST URL and token

2. **Install Dependencies**
   ```bash
   npm install @upstash/ratelimit @upstash/redis
   ```

3. **Create Rate Limiter Utility**
   - Create `lib/rate-limiter.ts`
   - Define different limiters
   - Create helper functions

4. **Add to Critical Endpoints**
   - Start with auth endpoints
   - Then upload endpoints
   - Then general API

5. **Test Thoroughly**
   - Test in development
   - Test rate limit enforcement
   - Test error responses

6. **Monitor in Production**
   - Watch for false positives
   - Adjust limits if needed
   - Monitor for attacks

---

## 💰 Cost Estimate

**Upstash Redis:**
- Free tier: 10,000 requests/day
- For 1,000 users making 10 requests/day = 10,000 requests/day
- **Likely within free tier** for initial launch
- Paid: $0.20 per 100K requests (very affordable)

**Estimated cost:** $0-5/month for typical usage

---

## ✅ Benefits

1. **Protection against attacks** - DDoS, brute force, spam
2. **Cost control** - Prevent SMS/email spam
3. **Resource protection** - Prevent storage exhaustion
4. **Better security** - Multiple layers of defense
5. **Compliance** - Industry best practice

---

## ❓ Questions to Consider

1. **Should we rate limit by IP or User ID?**
   - **Answer:** Both - IP for unauthenticated, User ID for authenticated

2. **What if a legitimate user hits the limit?**
   - **Answer:** Clear error message, reasonable limits, sliding window

3. **Should we have different limits for different user roles?**
   - **Answer:** Yes - Admins can have higher limits

4. **What about development/testing?**
   - **Answer:** Bypass for localhost, configurable for test environments

---

## 📝 Next Steps

1. **Review this plan** - Understand the approach
2. **Setup Upstash account** - Get Redis credentials
3. **Implement rate limiter utility** - Create the base code
4. **Add to endpoints incrementally** - Start with critical ones
5. **Test and monitor** - Ensure it works correctly

---

**Ready to implement?** Let me know if you have any questions or want to proceed with the implementation!

