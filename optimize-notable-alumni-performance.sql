-- Performance Optimization for Notable Alumni
-- This script adds indexes to improve query performance

-- Composite index for the most common query pattern:
-- WHERE is_active = true ORDER BY display_order ASC
CREATE INDEX IF NOT EXISTS idx_notable_alumni_active_order 
ON notable_alumni(is_active, display_order) 
WHERE is_active = true;

-- Index for batch_year filtering (if needed in future)
CREATE INDEX IF NOT EXISTS idx_notable_alumni_batch_year 
ON notable_alumni(batch_year) 
WHERE batch_year IS NOT NULL;

-- Index for field filtering (if needed in future)
CREATE INDEX IF NOT EXISTS idx_notable_alumni_field 
ON notable_alumni(field) 
WHERE field IS NOT NULL;

