-- BGHS Alumni Website - Improved Role Relationships
-- This creates a proper many-to-many relationship with audit trail

-- Step 1: Create user_role_assignments table (if not exists)
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES user_roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NULL, -- Optional: for temporary roles
  is_active BOOLEAN DEFAULT true,
  notes TEXT, -- Optional: reason for assignment
  UNIQUE(user_id, role_id)
);

-- Step 2: Create role assignment history table
CREATE TABLE IF NOT EXISTS role_assignment_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES user_roles(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL, -- 'assigned', 'revoked', 'expired'
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP DEFAULT NOW(),
  reason TEXT,
  ip_address INET,
  user_agent TEXT
);

-- Step 3: Create function to get user's active roles
CREATE OR REPLACE FUNCTION get_user_active_roles(user_uuid UUID)
RETURNS TABLE(
  role_id INTEGER,
  role_name VARCHAR(50),
  role_description TEXT,
  permissions JSONB,
  assigned_at TIMESTAMP,
  assigned_by UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.id as role_id,
    ur.name as role_name,
    ur.description as role_description,
    ur.permissions,
    ura.assigned_at,
    ura.assigned_by
  FROM user_role_assignments ura
  JOIN user_roles ur ON ur.id = ura.role_id
  WHERE ura.user_id = user_uuid 
    AND ura.is_active = true
    AND (ura.expires_at IS NULL OR ura.expires_at > NOW())
  ORDER BY ura.assigned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create function to get user's effective permissions (from all active roles)
CREATE OR REPLACE FUNCTION get_user_effective_permissions(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  effective_permissions JSONB := '{}'::jsonb;
  role_permissions JSONB;
BEGIN
  -- Aggregate permissions from all active roles
  FOR role_permissions IN
    SELECT ur.permissions
    FROM user_role_assignments ura
    JOIN user_roles ur ON ur.id = ura.role_id
    WHERE ura.user_id = user_uuid 
      AND ura.is_active = true
      AND (ura.expires_at IS NULL OR ura.expires_at > NOW())
  LOOP
    -- Merge permissions (later roles override earlier ones)
    effective_permissions := effective_permissions || role_permissions;
  END LOOP;
  
  -- If no roles found, check profiles table for legacy role
  IF effective_permissions = '{}'::jsonb THEN
    SELECT ur.permissions INTO role_permissions
    FROM profiles p
    JOIN user_roles ur ON ur.name = p.role
    WHERE p.id = user_uuid;
    
    effective_permissions := COALESCE(role_permissions, '{}'::jsonb);
  END IF;
  
  RETURN effective_permissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create function to assign role to user
CREATE OR REPLACE FUNCTION assign_role_to_user(
  target_user_id UUID,
  role_name VARCHAR(50),
  assigned_by_user_id UUID,
  expires_at TIMESTAMP DEFAULT NULL,
  notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  role_id_val INTEGER;
BEGIN
  -- Get role ID
  SELECT id INTO role_id_val FROM user_roles WHERE name = role_name;
  
  IF role_id_val IS NULL THEN
    RAISE EXCEPTION 'Role % not found', role_name;
  END IF;
  
  -- Insert or update role assignment
  INSERT INTO user_role_assignments (user_id, role_id, assigned_by, expires_at, notes)
  VALUES (target_user_id, role_id_val, assigned_by_user_id, expires_at, notes)
  ON CONFLICT (user_id, role_id) 
  DO UPDATE SET
    assigned_by = EXCLUDED.assigned_by,
    assigned_at = NOW(),
    expires_at = EXCLUDED.expires_at,
    is_active = true,
    notes = EXCLUDED.notes;
  
  -- Log the assignment
  INSERT INTO role_assignment_history (user_id, role_id, action, performed_by, reason)
  VALUES (target_user_id, role_id_val, 'assigned', assigned_by_user_id, notes);
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create function to revoke role from user
CREATE OR REPLACE FUNCTION revoke_role_from_user(
  target_user_id UUID,
  role_name VARCHAR(50),
  revoked_by_user_id UUID,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  role_id_val INTEGER;
BEGIN
  -- Get role ID
  SELECT id INTO role_id_val FROM user_roles WHERE name = role_name;
  
  IF role_id_val IS NULL THEN
    RAISE EXCEPTION 'Role % not found', role_name;
  END IF;
  
  -- Deactivate the role assignment
  UPDATE user_role_assignments 
  SET is_active = false
  WHERE user_id = target_user_id AND role_id = role_id_val;
  
  -- Log the revocation
  INSERT INTO role_assignment_history (user_id, role_id, action, performed_by, reason)
  VALUES (target_user_id, role_id_val, 'revoked', revoked_by_user_id, reason);
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create function to check if user has specific role
CREATE OR REPLACE FUNCTION user_has_role(user_uuid UUID, role_name VARCHAR(50))
RETURNS BOOLEAN AS $$
DECLARE
  has_role BOOLEAN := false;
BEGIN
  -- Check in user_role_assignments first
  SELECT EXISTS(
    SELECT 1 
    FROM user_role_assignments ura
    JOIN user_roles ur ON ur.id = ura.role_id
    WHERE ura.user_id = user_uuid 
      AND ur.name = role_name
      AND ura.is_active = true
      AND (ura.expires_at IS NULL OR ura.expires_at > NOW())
  ) INTO has_role;
  
  -- If not found, check legacy profiles table
  IF NOT has_role THEN
    SELECT (role = role_name) INTO has_role
    FROM profiles
    WHERE id = user_uuid;
  END IF;
  
  RETURN has_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create function to get user's primary role (for backward compatibility)
CREATE OR REPLACE FUNCTION get_user_primary_role(user_uuid UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
  primary_role VARCHAR(50);
BEGIN
  -- Get the most recently assigned active role
  SELECT ur.name INTO primary_role
  FROM user_role_assignments ura
  JOIN user_roles ur ON ur.id = ura.role_id
  WHERE ura.user_id = user_uuid 
    AND ura.is_active = true
    AND (ura.expires_at IS NULL OR ura.expires_at > NOW())
  ORDER BY ura.assigned_at DESC
  LIMIT 1;
  
  -- If no active roles, check legacy profiles table
  IF primary_role IS NULL THEN
    SELECT role INTO primary_role FROM profiles WHERE id = user_uuid;
  END IF;
  
  -- Default to public if no role found
  RETURN COALESCE(primary_role, 'public');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Grant permissions
GRANT EXECUTE ON FUNCTION get_user_active_roles(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_effective_permissions(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION assign_role_to_user(UUID, VARCHAR, UUID, TIMESTAMP, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_role_from_user(UUID, VARCHAR, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_role(UUID, VARCHAR) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_primary_role(UUID) TO authenticated, anon;

-- Step 10: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_user_id ON user_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_role_id ON user_role_assignments(role_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_active ON user_role_assignments(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_role_assignment_history_user_id ON role_assignment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_role_assignment_history_performed_at ON role_assignment_history(performed_at);

-- Step 11: Migrate existing roles to new system (optional)
-- This will create role assignments for users who have roles in the profiles table
INSERT INTO user_role_assignments (user_id, role_id, assigned_by, notes)
SELECT 
  p.id as user_id,
  ur.id as role_id,
  p.id as assigned_by, -- Self-assigned during migration
  'Migrated from profiles table' as notes
FROM profiles p
JOIN user_roles ur ON ur.name = p.role
WHERE p.role IS NOT NULL
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Example usage:
-- SELECT get_user_active_roles('user-uuid');
-- SELECT get_user_effective_permissions('user-uuid');
-- SELECT assign_role_to_user('user-uuid', 'content_moderator', 'admin-uuid', NULL, 'Promoted to moderator');
-- SELECT revoke_role_from_user('user-uuid', 'content_moderator', 'admin-uuid', 'No longer needed');
-- SELECT user_has_role('user-uuid', 'super_admin');
