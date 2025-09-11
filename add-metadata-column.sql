-- Add metadata column to events table if it doesn't exist
ALTER TABLE events ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add an index for better performance on metadata queries
CREATE INDEX IF NOT EXISTS idx_events_metadata ON events USING GIN (metadata);

-- Update the RLS policy to allow metadata updates
-- (The existing policy should already cover this, but let's make sure)

