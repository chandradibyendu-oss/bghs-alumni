-- Create job queue table for background PDF generation
-- This table manages PDF generation and email sending jobs

CREATE TABLE job_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('pdf_generation', 'email_send', 'reference_validation')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payload JSONB NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  result JSONB -- Store job results (e.g., PDF URL, email status)
);

-- Create indexes for efficient job processing
CREATE INDEX idx_job_queue_status_created ON job_queue(status, created_at);
CREATE INDEX idx_job_queue_type_status ON job_queue(type, status);
CREATE INDEX idx_job_queue_attempts ON job_queue(attempts, max_attempts);

-- Add helpful comments
COMMENT ON TABLE job_queue IS 'Background job queue for PDF generation and email processing';
COMMENT ON COLUMN job_queue.type IS 'Type of job: pdf_generation, email_send, reference_validation';
COMMENT ON COLUMN job_queue.status IS 'Job status: pending, processing, completed, failed';
COMMENT ON COLUMN job_queue.payload IS 'Job-specific data in JSON format';
COMMENT ON COLUMN job_queue.result IS 'Job results stored after completion';

-- Enable RLS
ALTER TABLE job_queue ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage all jobs
CREATE POLICY "Service role can manage all jobs" ON job_queue
  FOR ALL USING (true);

-- Allow authenticated users to view their own jobs (if needed)
CREATE POLICY "Users can view own jobs" ON job_queue
  FOR SELECT USING (
    auth.uid()::text = (payload->>'userId')
  );









