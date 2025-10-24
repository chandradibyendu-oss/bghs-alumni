-- Create function to get approved profiles with all fields including professional_title_id
-- This bypasses any caching issues with the Supabase JS client
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_approved_profiles(page_offset INTEGER, page_limit INTEGER)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  batch_year INTEGER,
  profession TEXT,
  company TEXT,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  phone TEXT,
  is_approved BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  role VARCHAR(50),
  first_name TEXT,
  last_name TEXT,
  middle_name TEXT,
  last_class INTEGER,
  year_of_leaving INTEGER,
  start_class INTEGER,
  start_year INTEGER,
  registration_id TEXT,
  import_source TEXT,
  imported_at TIMESTAMPTZ,
  privacy_settings JSONB,
  registration_payment_status TEXT,
  registration_payment_transaction_id TEXT,
  payment_status TEXT,
  professional_title_id INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.batch_year,
    p.profession,
    p.company,
    p.location,
    p.bio,
    p.avatar_url,
    p.linkedin_url,
    p.website_url,
    p.phone,
    p.is_approved,
    p.created_at,
    p.updated_at,
    p.role,
    p.first_name,
    p.last_name,
    p.middle_name,
    p.last_class,
    p.year_of_leaving,
    p.start_class,
    p.start_year,
    p.registration_id,
    p.import_source,
    p.imported_at,
    p.privacy_settings,
    p.registration_payment_status,
    p.registration_payment_transaction_id,
    p.payment_status,
    p.professional_title_id
  FROM profiles p
  WHERE p.is_approved = true
  ORDER BY p.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
