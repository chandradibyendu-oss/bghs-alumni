-- Add created_by column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update existing events to set created_by to the first super_admin user
-- (You may need to adjust this based on your actual user IDs)
UPDATE events 
SET created_by = (
  SELECT id FROM auth.users 
  WHERE id IN (
    SELECT user_id FROM profiles 
    WHERE role = 'super_admin' 
    LIMIT 1
  )
)
WHERE created_by IS NULL;

-- Add RLS policy for created_by
CREATE POLICY "Users can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Event creators and admins can update events" ON events FOR UPDATE USING (
  auth.uid() = created_by OR 
  auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE role IN ('super_admin', 'event_manager')
  )
);
CREATE POLICY "Admins can delete events" ON events FOR DELETE USING (
  auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE role IN ('super_admin', 'event_manager')
  )
);

