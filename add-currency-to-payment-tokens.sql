-- Add missing currency column to payment_tokens table
-- This column is required for the payment workflow

-- Add the currency column
ALTER TABLE payment_tokens 
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'INR';

-- Update the default to allow NULL for now (in case there are existing rows)
ALTER TABLE payment_tokens 
ALTER COLUMN currency DROP DEFAULT;

-- Add a check constraint for valid currencies (optional but recommended)
ALTER TABLE payment_tokens
DROP CONSTRAINT IF EXISTS payment_tokens_currency_check;

ALTER TABLE payment_tokens
ADD CONSTRAINT payment_tokens_currency_check 
CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP'));

-- Verify the change
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'payment_tokens'
ORDER BY ordinal_position;

-- Reload the schema cache
NOTIFY pgrst, 'reload schema';

