# Environment Variables Setup for Admin User Management

## 🔑 **Required Environment Variables**

You need to add the following to your `.env.local` file:

```env
# Supabase Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 📍 **How to Get the Service Role Key:**

1. **Go to your Supabase Dashboard**
2. **Navigate to Settings → API**
3. **Copy the "service_role" key** (NOT the anon key)
4. **Add it to your `.env.local` file**

## ⚠️ **Important Security Notes:**

- **NEVER expose the service role key** in client-side code
- **Only use it in server-side API routes** (which we've implemented)
- **The service role key has full admin privileges**
- **Keep it secure and don't commit it to Git**

## 🔄 **After Adding the Key:**

1. **Restart your development server** (`npm run dev`)
2. **The admin user management will now work properly**
3. **You can create, edit, and delete users**

## 🧪 **Test the System:**

1. **Login to your admin account**
2. **Go to Dashboard → User Management**
3. **Try adding a new user**
4. **The error should be resolved!**

## 📚 **What We Fixed:**

- **Client-side admin operations** were causing "User not allowed" errors
- **Created server-side API routes** that can safely use admin privileges
- **Proper authentication** with JWT tokens
- **Secure user creation** through the backend
- **Full CRUD operations** for user management

