-- Update Blog Posts Schema for BGHS Alumni Website
-- Adds Bengali support, rich content, moderation status, and image support
-- Run this in your Supabase SQL Editor

-- Add Bengali text fields
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS title_bengali TEXT,
ADD COLUMN IF NOT EXISTS content_bengali TEXT,
ADD COLUMN IF NOT EXISTS excerpt_bengali TEXT;

-- Add status field for moderation workflow (draft, pending_review, published, rejected)
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';

-- Add CHECK constraint for status if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'blog_posts_status_check'
  ) THEN
    ALTER TABLE blog_posts 
    ADD CONSTRAINT blog_posts_status_check 
    CHECK (status IN ('draft', 'pending_review', 'published', 'rejected'));
  END IF;
END $$;

-- Add moderation fields
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- Update published column to work with status
-- If published=true, ensure status is 'published'
UPDATE blog_posts SET status = 'published' WHERE published = true AND (status IS NULL OR status = 'draft');
UPDATE blog_posts SET status = 'draft' WHERE published = false AND (status IS NULL OR status = '');

-- Add read_time field (calculated in minutes)
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS read_time INTEGER DEFAULT 5;

-- Add content_type to support HTML/Markdown
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'html';

-- Add CHECK constraint for content_type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'blog_posts_content_type_check'
  ) THEN
    ALTER TABLE blog_posts 
    ADD CONSTRAINT blog_posts_content_type_check 
    CHECK (content_type IN ('html', 'markdown', 'plain'));
  END IF;
END $$;

-- Create blog_images table for inline images
CREATE TABLE IF NOT EXISTS blog_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_images_post ON blog_images(blog_post_id);

-- Add comments for documentation
COMMENT ON COLUMN blog_posts.status IS 'Blog post status: draft, pending_review, published, rejected';
COMMENT ON COLUMN blog_posts.title_bengali IS 'Bengali translation of the title';
COMMENT ON COLUMN blog_posts.content_bengali IS 'Bengali translation of the content';
COMMENT ON COLUMN blog_posts.content_type IS 'Content format: html, markdown, or plain text';
COMMENT ON COLUMN blog_posts.reviewed_by IS 'ID of moderator who reviewed/approved the blog post';
