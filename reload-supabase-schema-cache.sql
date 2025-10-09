-- Force Supabase (PostgREST) to reload its schema cache
-- This is needed when you add new tables or columns

-- Option 1: Send NOTIFY to reload schema
NOTIFY pgrst, 'reload schema';

-- Option 2: Alternative reload command
NOTIFY pgrst, 'reload config';

-- After running this, wait 5-10 seconds for the cache to refresh
-- Then try your operation again

