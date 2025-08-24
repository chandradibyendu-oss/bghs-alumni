// Script to create an admin user in Supabase
// Run this in your Supabase SQL Editor or use the Supabase Dashboard

// Step 1: Create a new user through Supabase Auth (do this in the dashboard)
// Go to Authentication > Users > Add User
// Email: admin@bghs.edu.in
// Password: (set a strong password)

// Step 2: After creating the user, run this SQL to set up the profile
-- Insert admin profile
INSERT INTO profiles (
  id,
  email,
  full_name,
  batch_year,
  profession,
  company,
  location,
  bio,
  avatar_url,
  linkedin_url,
  website_url
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@bghs.edu.in'),
  'admin@bghs.edu.in',
  'BGHS Admin',
  2000,
  'Administrator',
  'Barasat Govt. High School',
  'Barasat, West Bengal',
  'System administrator for BGHS Alumni website',
  null,
  null,
  null
);

-- Step 3: Create admin role (optional - for future role-based access)
-- CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'member');

-- ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'member';

-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@bghs.edu.in';

-- Step 4: Verify the admin user was created
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.profession,
  p.created_at
FROM profiles p
WHERE p.email = 'admin@bghs.edu.in';
