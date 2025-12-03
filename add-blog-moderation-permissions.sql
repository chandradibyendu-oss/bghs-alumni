-- Add Blog Moderation Permissions and Blog Moderator Role
-- Run this in your Supabase SQL Editor

-- 1. Add blog_moderator role with moderation permissions
INSERT INTO user_roles (name, description, permissions) VALUES
(
  'blog_moderator', 
  'Blog Moderator - Can approve/reject and publish blog posts', 
  '{"can_view_landing": true, "can_view_directory": true, "can_edit_profile": true, "can_view_events": true, "can_register_events": true, "can_view_blog": true, "can_comment_blog": true, "can_create_blog": true, "can_edit_blog": true, "can_moderate_blog": true, "can_publish_blog": true, "can_moderate_comments": true, "can_upload_media": true, "can_access_admin": true}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- 2. Update content_moderator role to include blog moderation
UPDATE user_roles 
SET permissions = jsonb_set(
  jsonb_set(
    permissions,
    '{can_moderate_blog}',
    'true'::jsonb
  ),
  '{can_publish_blog}',
  'true'::jsonb
)
WHERE name = 'content_moderator';

-- 3. Update content_creator role - ensure publish permission is false
UPDATE user_roles 
SET permissions = jsonb_set(
  permissions,
  '{can_publish_blog}',
  'false'::jsonb
)
WHERE name = 'content_creator';

-- 4. Update super_admin to have all blog permissions
UPDATE user_roles 
SET permissions = jsonb_set(
  jsonb_set(
    jsonb_set(
      permissions,
      '{can_moderate_blog}',
      'true'::jsonb
    ),
    '{can_publish_blog}',
    'true'::jsonb
  ),
  '{can_delete_blog}',
  'true'::jsonb
)
WHERE name = 'super_admin';
