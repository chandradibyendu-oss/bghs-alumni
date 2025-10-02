// Create test users using Supabase Admin API
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
}

loadEnvFile();

// Use environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if environment variables are set
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const testUsers = [
  {
    email: 'superadmin@bghs-alumni.com',
    password: 'TestPass123!',
    user_metadata: {
      first_name: 'Super',
      last_name: 'Administrator',
      role: 'super_admin'
    }
  },
  {
    email: 'eventmanager@bghs-alumni.com',
    password: 'TestPass123!',
    user_metadata: {
      first_name: 'Priya',
      last_name: 'Sharma',
      role: 'event_manager'
    }
  },
  {
    email: 'contentcreator@bghs-alumni.com',
    password: 'TestPass123!',
    user_metadata: {
      first_name: 'Rahul',
      last_name: 'Patel',
      role: 'content_creator'
    }
  },
  {
    email: 'moderator@bghs-alumni.com',
    password: 'TestPass123!',
    user_metadata: {
      first_name: 'Anjali',
      last_name: 'Singh',
      role: 'content_moderator'
    }
  },
  {
    email: 'donationmanager@bghs-alumni.com',
    password: 'TestPass123!',
    user_metadata: {
      first_name: 'Vikram',
      last_name: 'Gupta',
      role: 'donation_manager'
    }
  },
  {
    email: 'premiummember@bghs-alumni.com',
    password: 'TestPass123!',
    user_metadata: {
      first_name: 'Sneha',
      last_name: 'Joshi',
      role: 'alumni_premium'
    }
  },
  {
    email: 'alumnimember@bghs-alumni.com',
    password: 'TestPass123!',
    user_metadata: {
      first_name: 'Arjun',
      last_name: 'Kumar',
      role: 'alumni_member'
    }
  },
  {
    email: 'pendinguser@bghs-alumni.com',
    password: 'TestPass123!',
    user_metadata: {
      first_name: 'Rohit',
      last_name: 'Verma',
      role: 'alumni_member'
    }
  },
  {
    email: 'privateuser@bghs-alumni.com',
    password: 'TestPass123!',
    user_metadata: {
      first_name: 'Kavya',
      last_name: 'Reddy',
      role: 'alumni_member'
    }
  }
];

async function createTestUsers() {
  console.log('Creating test users via Supabase Admin API...');
  
  for (const user of testUsers) {
    try {
      console.log(`Creating user: ${user.email}`);
      
      // Create user via Admin API
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: user.user_metadata
      });
      
      if (error) {
        console.error(`Error creating ${user.email}:`, error.message);
        continue;
      }
      
      console.log(`✅ Created user: ${user.email} (ID: ${data.user.id})`);
      
      // Now create the profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: data.user.id,
          email: user.email,
          first_name: user.user_metadata.first_name,
          last_name: user.user_metadata.last_name,
          phone: `+91-987654321${testUsers.indexOf(user)}`,
          last_class: 12,
          year_of_leaving: 2000 + testUsers.indexOf(user) * 2,
          profession: 'Test Profession',
          company: 'Test Company',
          location: 'Test Location',
          is_approved: user.email !== 'pendinguser@bghs-alumni.com',
          role: user.user_metadata.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError.message);
      } else {
        console.log(`✅ Created profile for: ${user.email}`);
      }
      
    } catch (err) {
      console.error(`Unexpected error for ${user.email}:`, err.message);
    }
  }
  
  console.log('\n🎉 Test user creation completed!');
  console.log('\nTest Credentials:');
  testUsers.forEach(user => {
    console.log(`Email: ${user.email} | Password: ${user.password}`);
  });
}

// Run the script
createTestUsers().catch(console.error);
