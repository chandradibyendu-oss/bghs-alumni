-- Extend alumni_verification table with PDF-related columns
-- This adds PDF storage and generation tracking to the verification table

-- Add PDF-related columns to alumni_verification table
ALTER TABLE alumni_verification 
ADD COLUMN pdf_url TEXT,
ADD COLUMN pdf_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN pdf_generation_status TEXT DEFAULT 'pending' CHECK (pdf_generation_status IN ('pending', 'processing', 'completed', 'failed'));

-- Create index for PDF generation status
CREATE INDEX idx_alumni_verification_pdf_status ON alumni_verification(pdf_generation_status);

-- Add helpful comments
COMMENT ON COLUMN alumni_verification.pdf_url IS 'R2 URL of the generated registration PDF';
COMMENT ON COLUMN alumni_verification.pdf_generated_at IS 'Timestamp when PDF was successfully generated';
COMMENT ON COLUMN alumni_verification.pdf_generation_status IS 'Status of PDF generation process';

-- Update existing records to have pending PDF generation status
UPDATE alumni_verification 
SET pdf_generation_status = 'pending' 
WHERE pdf_generation_status IS NULL;









