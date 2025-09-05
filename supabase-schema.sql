-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    batch_year INTEGER NOT NULL,
    profession TEXT,
    company TEXT,
    location TEXT,
    bio TEXT,
    avatar_url TEXT,
    linkedin_url TEXT,
    website_url TEXT,
    phone TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create events table
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    max_attendees INTEGER NOT NULL,
    current_attendees INTEGER DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create event_registrations table
CREATE TABLE event_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist')),
    UNIQUE(event_id, user_id)
);

-- Create blog_posts table
CREATE TABLE blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create blog_comments table
CREATE TABLE blog_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create blog_likes table
CREATE TABLE blog_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Create donation_causes table
CREATE TABLE donation_causes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    raised_amount DECIMAL(10,2) DEFAULT 0,
    category TEXT NOT NULL,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create donations table
CREATE TABLE donations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    cause_id UUID REFERENCES donation_causes(id) ON DELETE CASCADE NOT NULL,
    message TEXT,
    anonymous BOOLEAN DEFAULT false,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create newsletters table
CREATE TABLE newsletters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscribed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Password Reset OTPs Table
CREATE TABLE IF NOT EXISTS password_reset_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  phone TEXT,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email ON password_reset_otps(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_phone ON password_reset_otps(phone);
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_expires ON password_reset_otps(expires_at);

-- RLS Policies for password_reset_otps
ALTER TABLE password_reset_otps ENABLE ROW LEVEL SECURITY;

-- Allow insertion of OTPs (no auth required for password reset)
CREATE POLICY "Allow OTP insertion" ON password_reset_otps
  FOR INSERT WITH CHECK (true);

-- Allow reading OTPs for verification (no auth required)
CREATE POLICY "Allow OTP verification" ON password_reset_otps
  FOR SELECT USING (true);

-- Allow updating OTPs to mark as used
CREATE POLICY "Allow OTP update" ON password_reset_otps
  FOR UPDATE USING (true);

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_otps 
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Events policies
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update events" ON events FOR UPDATE USING (auth.role() = 'authenticated');

-- Event registrations policies
CREATE POLICY "Users can view own registrations" ON event_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can register for events" ON event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own registrations" ON event_registrations FOR UPDATE USING (auth.uid() = user_id);

-- Blog posts policies
CREATE POLICY "Anyone can view published posts" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Authors can view own posts" ON blog_posts FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Authenticated users can create posts" ON blog_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts" ON blog_posts FOR UPDATE USING (auth.uid() = author_id);

-- Blog comments policies
CREATE POLICY "Anyone can view comments" ON blog_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON blog_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Comment authors can update own comments" ON blog_comments FOR UPDATE USING (auth.uid() = author_id);

-- Blog likes policies
CREATE POLICY "Anyone can view likes" ON blog_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like posts" ON blog_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike own likes" ON blog_likes FOR DELETE USING (auth.uid() = user_id);

-- Donation causes policies
CREATE POLICY "Anyone can view donation causes" ON donation_causes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage donation causes" ON donation_causes FOR ALL USING (auth.role() = 'authenticated');

-- Donations policies
CREATE POLICY "Users can view own donations" ON donations FOR SELECT USING (auth.uid() = donor_id OR anonymous = false);
CREATE POLICY "Authenticated users can create donations" ON donations FOR INSERT WITH CHECK (auth.uid() = donor_id);

-- Newsletter policies
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletters FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can manage own subscription" ON newsletters FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE email = newsletters.email));

-- Create indexes for better performance
CREATE INDEX idx_profiles_batch_year ON profiles(batch_year);
CREATE INDEX idx_profiles_profession ON profiles(profession);
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);
CREATE INDEX idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX idx_donations_cause_id ON donations(cause_id);
CREATE INDEX idx_donations_donor_id ON donations(donor_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donation_causes_updated_at BEFORE UPDATE ON donation_causes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO donation_causes (title, description, target_amount, raised_amount, category, active) VALUES
('Student Scholarship Fund', 'Support deserving students from underprivileged backgrounds to continue their education at BGHS.', 500000, 320000, 'Education', true),
('School Infrastructure Development', 'Help us build modern classrooms, laboratories, and sports facilities for better learning environment.', 1000000, 750000, 'Infrastructure', true),
('Library Enhancement', 'Expand our library with modern books, digital resources, and study materials for students.', 200000, 120000, 'Resources', true),
('Sports Equipment & Facilities', 'Provide quality sports equipment and maintain sports facilities for physical development.', 300000, 180000, 'Sports', true);

-- Create a function to increment event attendees
CREATE OR REPLACE FUNCTION increment_event_attendees()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events SET current_attendees = current_attendees + 1 WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events SET current_attendees = current_attendees - 1 WHERE id = OLD.event_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for event attendees
CREATE TRIGGER update_event_attendees AFTER INSERT OR DELETE ON event_registrations FOR EACH ROW EXECUTE FUNCTION increment_event_attendees();