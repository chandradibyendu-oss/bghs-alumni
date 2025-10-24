-- Refresh Supabase schema cache
-- Run this in your Supabase SQL Editor

-- 1. Notify Supabase to reload the schema
NOTIFY pgrst, 'reload schema';

-- 2. Alternatively, you can also run this to refresh the PostgREST cache
SELECT pg_notify('pgrst', 'reload schema');

-- 3. Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'professional_title_id';
