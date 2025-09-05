-- Password Reset OTPs Table for BGHS Alumni
-- Run this in your Supabase SQL Editor

-- Create the password_reset_otps table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email ON password_reset_otps(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_phone ON password_reset_otps(phone);
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_expires ON password_reset_otps(expires_at);

-- Enable Row Level Security
ALTER TABLE password_reset_otps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow OTP insertion" ON password_reset_otps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow OTP verification" ON password_reset_otps
  FOR SELECT USING (true);

CREATE POLICY "Allow OTP update" ON password_reset_otps
  FOR UPDATE USING (true);

-- Create cleanup function for expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_otps 
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps
CREATE TRIGGER update_password_reset_otps_updated_at 
  BEFORE UPDATE ON password_reset_otps 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created
SELECT 'password_reset_otps table created successfully' as status;
