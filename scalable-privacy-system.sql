-- BGHS Alumni Website - Scalable Privacy System
-- This replaces hardcoded privacy settings with a dynamic, database-driven approach

-- Step 1: Create privacy settings definition table
CREATE TABLE IF NOT EXISTS privacy_settings_definitions (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  data_type VARCHAR(20) DEFAULT 'boolean', -- boolean, string, number, json
  default_value JSONB DEFAULT 'true',
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 2: Insert privacy settings definitions
INSERT INTO privacy_settings_definitions (setting_key, display_name, description, category, default_value, display_order) VALUES
-- Contact Information
('show_email', 'Show Email Address', 'Allow your email to be visible to other members', 'contact', 'true', 1),
('show_phone', 'Show Phone Number', 'Allow your phone number to be visible to other members', 'contact', 'false', 2),

-- Professional Information  
('show_profession', 'Show Profession', 'Display your profession in directory and profile', 'professional', 'true', 3),
('show_company', 'Show Company', 'Display your company/organization in directory and profile', 'professional', 'true', 4),
('show_location', 'Show Location', 'Display your location in directory and profile', 'professional', 'true', 5),

-- Profile Visibility
('show_in_directory', 'Include in Directory', 'Include your profile in the alumni directory', 'visibility', 'true', 6),
('show_bio', 'Show Bio', 'Display your bio/description in profile', 'visibility', 'true', 7),
('show_social_links', 'Show Social Links', 'Display LinkedIn and website links', 'visibility', 'true', 8),

-- Interaction Settings
('allow_connection_requests', 'Allow Connection Requests', 'Allow other members to send you connection requests', 'interaction', 'true', 9),
('allow_messages', 'Allow Direct Messages', 'Allow other members to send you direct messages', 'interaction', 'true', 10),
('show_online_status', 'Show Online Status', 'Display when you are online', 'interaction', 'false', 11),

-- Advanced Settings
('show_registration_date', 'Show Registration Date', 'Display when you joined the alumni network', 'advanced', 'false', 12),
('show_last_login', 'Show Last Login', 'Display your last login time', 'advanced', 'false', 13),
('allow_profile_views', 'Allow Profile Views', 'Allow others to see when you view their profile', 'advanced', 'false', 14)
ON CONFLICT (setting_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Step 3: Create function to get all privacy settings with defaults
CREATE OR REPLACE FUNCTION get_privacy_settings_with_defaults()
RETURNS JSONB AS $$
DECLARE
  settings JSONB;
BEGIN
  SELECT jsonb_object_agg(
    setting_key,
    jsonb_build_object(
      'value', default_value,
      'display_name', display_name,
      'description', description,
      'category', category,
      'data_type', data_type,
      'is_required', is_required
    )
  ) INTO settings
  FROM privacy_settings_definitions
  ORDER BY display_order;
  
  RETURN COALESCE(settings, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create function to merge user privacy settings with defaults
CREATE OR REPLACE FUNCTION get_user_privacy_settings(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  user_settings JSONB;
  default_settings JSONB;
  merged_settings JSONB;
BEGIN
  -- Get user's current privacy settings
  SELECT privacy_settings INTO user_settings
  FROM profiles
  WHERE id = user_id;
  
  -- Get default settings
  default_settings := get_privacy_settings_with_defaults();
  
  -- Merge user settings with defaults (user settings override defaults)
  SELECT jsonb_object_agg(
    key,
    CASE 
      WHEN user_settings ? key THEN 
        jsonb_set(
          value,
          '{value}',
          user_settings->key
        )
      ELSE value
    END
  ) INTO merged_settings
  FROM jsonb_each(default_settings);
  
  RETURN COALESCE(merged_settings, default_settings);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create function to check if user allows specific privacy setting
CREATE OR REPLACE FUNCTION user_allows_privacy_setting(
  user_id UUID, 
  setting_key VARCHAR(100)
)
RETURNS BOOLEAN AS $$
DECLARE
  user_settings JSONB;
  default_value JSONB;
  final_value JSONB;
BEGIN
  -- Get user's privacy settings with defaults
  user_settings := get_user_privacy_settings(user_id);
  
  -- Get the setting value
  final_value := user_settings->setting_key->'value';
  
  -- If setting doesn't exist, return false
  IF final_value IS NULL THEN
    RETURN false;
  END IF;
  
  -- Return the boolean value
  RETURN COALESCE((final_value)::boolean, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create function to update user privacy setting
CREATE OR REPLACE FUNCTION update_user_privacy_setting(
  user_id UUID,
  setting_key VARCHAR(100),
  new_value JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  current_settings JSONB;
  updated_settings JSONB;
BEGIN
  -- Get current settings
  SELECT COALESCE(privacy_settings, '{}'::jsonb) INTO current_settings
  FROM profiles
  WHERE id = user_id;
  
  -- Update the specific setting
  updated_settings := current_settings || jsonb_build_object(setting_key, new_value);
  
  -- Update the profile
  UPDATE profiles
  SET privacy_settings = updated_settings
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create function to get filtered profile data based on privacy settings
CREATE OR REPLACE FUNCTION get_profile_data_with_privacy(
  viewer_id UUID,
  target_id UUID
)
RETURNS JSONB AS $$
DECLARE
  profile_data JSONB;
  filtered_data JSONB;
  setting_key VARCHAR(100);
  setting_value JSONB;
  privacy_settings JSONB;
BEGIN
  -- Get full profile data
  SELECT to_jsonb(p.*) INTO profile_data
  FROM profiles p
  WHERE p.id = target_id;
  
  -- Get target user's privacy settings
  privacy_settings := get_user_privacy_settings(target_id);
  
  -- Start with full data
  filtered_data := profile_data;
  
  -- Remove fields based on privacy settings
  FOR setting_key, setting_value IN 
    SELECT key, value->'value' 
    FROM jsonb_each(privacy_settings)
  LOOP
    -- If setting is false, remove the corresponding field
    IF NOT COALESCE((setting_value)::boolean, true) THEN
      CASE setting_key
        WHEN 'show_email' THEN
          filtered_data := filtered_data - 'email';
        WHEN 'show_phone' THEN
          filtered_data := filtered_data - 'phone';
        WHEN 'show_profession' THEN
          filtered_data := filtered_data - 'profession';
        WHEN 'show_company' THEN
          filtered_data := filtered_data - 'company';
        WHEN 'show_location' THEN
          filtered_data := filtered_data - 'location';
        WHEN 'show_bio' THEN
          filtered_data := filtered_data - 'bio';
        WHEN 'show_social_links' THEN
          filtered_data := filtered_data - 'linkedin_url' - 'website_url';
        WHEN 'show_registration_date' THEN
          filtered_data := filtered_data - 'created_at';
        WHEN 'show_last_login' THEN
          filtered_data := filtered_data - 'last_sign_in_at';
        -- Add more cases as needed
      END CASE;
    END IF;
  END LOOP;
  
  -- Always remove sensitive system fields for non-admin users
  IF viewer_id != target_id THEN
    filtered_data := filtered_data - 'registration_id' - 'import_source' - 'imported_at';
  END IF;
  
  RETURN jsonb_build_object(
    'profile', filtered_data,
    'privacy_settings', privacy_settings
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create function to add new privacy setting dynamically
CREATE OR REPLACE FUNCTION add_privacy_setting(
  p_setting_key VARCHAR(100),
  p_display_name VARCHAR(100),
  p_description TEXT,
  p_category VARCHAR(50) DEFAULT 'general',
  p_default_value JSONB DEFAULT 'true',
  p_data_type VARCHAR(20) DEFAULT 'boolean'
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO privacy_settings_definitions (
    setting_key, display_name, description, category, 
    default_value, data_type
  ) VALUES (
    p_setting_key, p_display_name, p_description, p_category,
    p_default_value, p_data_type
  ) ON CONFLICT (setting_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    default_value = EXCLUDED.default_value,
    data_type = EXCLUDED.data_type,
    updated_at = NOW();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Grant permissions
GRANT EXECUTE ON FUNCTION get_privacy_settings_with_defaults() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_privacy_settings(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION user_allows_privacy_setting(UUID, VARCHAR) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_user_privacy_setting(UUID, VARCHAR, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile_data_with_privacy(UUID, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION add_privacy_setting(VARCHAR, VARCHAR, TEXT, VARCHAR, JSONB, VARCHAR) TO authenticated;

-- Step 10: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_privacy_settings_definitions_key ON privacy_settings_definitions(setting_key);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_definitions_category ON privacy_settings_definitions(category);

-- Step 11: Migrate existing privacy settings to new format
-- This will be handled by the application layer

-- Example usage:
-- SELECT get_privacy_settings_with_defaults();
-- SELECT get_user_privacy_settings('user-uuid');
-- SELECT user_allows_privacy_setting('user-uuid', 'show_email');
-- SELECT add_privacy_setting('show_instagram', 'Show Instagram', 'Display Instagram profile link', 'social', 'false');
