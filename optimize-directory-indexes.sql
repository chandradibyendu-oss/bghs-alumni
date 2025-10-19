-- Optimize Directory Performance Indexes
-- These indexes will significantly improve directory query performance

-- 1. Critical: is_approved index (most important - used in every directory query)
CREATE INDEX IF NOT EXISTS idx_profiles_is_approved 
ON profiles(is_approved) 
WHERE is_approved = TRUE;

-- 2. New filter fields: year_of_leaving and last_class
CREATE INDEX IF NOT EXISTS idx_profiles_year_of_leaving 
ON profiles(year_of_leaving);

CREATE INDEX IF NOT EXISTS idx_profiles_last_class 
ON profiles(last_class);

-- 3. Ordering index: created_at (for ORDER BY created_at DESC)
CREATE INDEX IF NOT EXISTS idx_profiles_created_at_desc 
ON profiles(created_at DESC);

-- 4. Composite indexes for common filter combinations
-- These will be extremely fast for filtered directory queries

-- Composite index for approved users with year filtering
CREATE INDEX IF NOT EXISTS idx_profiles_approved_year 
ON profiles(is_approved, year_of_leaving) 
WHERE is_approved = TRUE;

-- Composite index for approved users with class filtering  
CREATE INDEX IF NOT EXISTS idx_profiles_approved_class 
ON profiles(is_approved, last_class) 
WHERE is_approved = TRUE;

-- Composite index for approved users with profession filtering
CREATE INDEX IF NOT EXISTS idx_profiles_approved_profession 
ON profiles(is_approved, profession) 
WHERE is_approved = TRUE;

-- 5. Pagination optimization: composite index for approved users with ordering
CREATE INDEX IF NOT EXISTS idx_profiles_approved_created_desc 
ON profiles(is_approved, created_at DESC) 
WHERE is_approved = TRUE;

-- 6. Full text search optimization (if needed for name searching)
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_text 
ON profiles USING gin(to_tsvector('english', full_name));

-- 7. Phone number index (for OTP login optimization)
CREATE INDEX IF NOT EXISTS idx_profiles_phone 
ON profiles(phone) 
WHERE phone IS NOT NULL;

-- Performance Analysis Queries (run these to verify index usage)
-- EXPLAIN (ANALYZE, BUFFERS) 
-- SELECT id, full_name, year_of_leaving, last_class, profession 
-- FROM profiles 
-- WHERE is_approved = TRUE 
-- ORDER BY created_at DESC 
-- LIMIT 12;

-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT COUNT(*) 
-- FROM profiles 
-- WHERE is_approved = TRUE;

