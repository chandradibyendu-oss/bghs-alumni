// Simple script to create test users - reads from .env.local
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
    console.log('✅ Loaded environment variables from .env.local');
  } else {
    console.error('❌ .env.local file not found');
    process.exit(1);
  }
}

loadEnvFile();

// Use the same values from your working application
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlhojsyqqazdztrzuqky.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  console.error('📝 Please ensure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local file');
  process.exit(1);
}

console.log('✅ Using Supabase URL:', SUPABASE_URL);
console.log('✅ Service role key loaded successfully');

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
    },
    profile: {
      phone: '+91-9876543210',
      year_of_leaving: 1990,
      profession: 'System Administrator',
      company: 'BGHS Alumni Association',
      location: 'Mumbai, Maharashtra, India'
    }
  },
  {
    email: 'eventmanager@bghs-alumni.com',
    password: 'TestPass123!',
    user_metadata: {
      first_name: 'Priya',
      last_name: 'Sharma',
      role: 'event_manager'
    },
    profile: {
      phone: '+91-9876543211',
      year_of_leaving: 2005,
      profession: 'Event Coordinator',
      company: 'Event Management Co.',
      location: 'Delhi, Delhi, India'
    }
  },
  {
    email: 'contentcreator@bghs-alumni.com',
    password: 'TestPass123!',
    user_metadata: {
      first_name: 'Rahul',
      last_name: 'Patel',
      role: 'content_creator'
    },
    profile: {
      phone: '+91-9876543212',
      year_of_leaving: 2010,
      profession: 'Content Writer',
      company: 'Digital Media Agency',
      location: 'Bangalore, Karnataka, India'
    }
  },
  {
    email: 'moderator@bghs-alumni.com',
    password: 'TestPass123!',
    user_metadata: {
      first_name: 'Anjali',
      last_name: 'Singh',
      role: 'content_moderator'
    },
    profile: {
      phone: '+91-9876543213',
      year_of_leaving: 2008,
      profession: 'Community Manager',
      company: 'Social Media Solutions',
      location: 'Pune, Maharashtra, India'
    }
  },
  {
    email: 'donationmanager@bghs-alumni.com',
    password: 'TestPass123!',
    user_metadata: {
      first_name: 'Vikram',
      last_name: 'Gupta',
      role: 'donation_manager'
    },
    profile: {
      phone: '+91-9876543214',
      year_of_leaving: 2000,
      profession: 'Fundraising Manager',
      company: 'Non-Profit Organization',
      location: 'Chennai, Tamil Nadu, India'
    }
  },
  {
    email: 'premiummember@bghs-alumni.com',
    password: 'TestPass123!',
    user_metadata: {
      first_name: 'Sneha',
      last_name: 'Joshi',
      role: 'alumni_premium'
    },
    profile: {
      phone: '+91-9876543215',
      year_of_leaving: 2015,
      profession: 'Software Engineer',
      company: 'Tech Solutions Ltd.',
      location: 'Hyderabad, Telangana, India'
    }
  },
  {
    email: 'alumnimember@bghs-alumni.com',
    password: 'TestPass123!',
    user_metadata: {
      first_name: 'Arjun',
      last_name: 'Kumar',
      role: 'alumni_member'
    },
    profile: {
      phone: '+91-9876543216',
      year_of_leaving: 2018,
      profession: 'Marketing Executive',
      company: 'Advertising Agency',
      location: 'Kolkata, West Bengal, India'
    }
  },
  {
    email: 'pendinguser@bghs-alumni.com',
    password: 'TestPass123!',
    user_metadata: {
      first_name: 'Rohit',
      last_name: 'Verma',
      role: 'alumni_member'
    },
    profile: {
      phone: '+91-9876543217',
      year_of_leaving: 2020,
      profession: 'Recent Graduate',
      company: 'Startup Company',
      location: 'Ahmedabad, Gujarat, India',
      is_approved: false
    }
  },
  {
    email: 'privateuser@bghs-alumni.com',
    password: 'TestPass123!',
    user_metadata: {
      first_name: 'Kavya',
      last_name: 'Reddy',
      role: 'alumni_member'
    },
    profile: {
      phone: '+91-9876543218',
      year_of_leaving: 2012,
      profession: 'Data Scientist',
      company: 'AI Research Lab',
      location: 'Bangalore, Karnataka, India'
    }
  }
];

async function createTestUsers() {
  console.log('🚀 Creating test users via Supabase Admin API...');
  
  for (const user of testUsers) {
    try {
      console.log(`📝 Creating user: ${user.email}`);
      
      // Create user via Admin API
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: user.user_metadata
      });
      
      if (error) {
        console.error(`❌ Error creating ${user.email}:`, error.message);
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
          phone: user.profile.phone,
          last_class: 12,
          year_of_leaving: user.profile.year_of_leaving,
          profession: user.profile.profession,
          company: user.profile.company,
          location: user.profile.location,
          is_approved: user.profile.is_approved !== false, // Default to true unless explicitly false
          role: user.user_metadata.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (profileError) {
        console.error(`❌ Error creating profile for ${user.email}:`, profileError.message);
      } else {
        console.log(`✅ Created profile for: ${user.email}`);
      }
      
    } catch (err) {
      console.error(`❌ Unexpected error for ${user.email}:`, err.message);
    }
  }
  
  console.log('\n🎉 Test user creation completed!');
  console.log('\n📋 Test Credentials:');
  testUsers.forEach(user => {
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   Role: ${user.user_metadata.role}`);
    console.log('');
  });
}

// Run the script
createTestUsers().catch(console.error);
