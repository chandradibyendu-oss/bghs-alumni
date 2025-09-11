-- Add education fields to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_class smallint,
  ADD COLUMN IF NOT EXISTS year_of_leaving smallint,
  ADD COLUMN IF NOT EXISTS start_class smallint,
  ADD COLUMN IF NOT EXISTS start_year smallint;

-- Optional: basic constraints
-- Add constraints (Postgres doesn't support IF NOT EXISTS for constraints)
DO $$ BEGIN
  ALTER TABLE profiles
    ADD CONSTRAINT chk_last_class_range CHECK (last_class IS NULL OR last_class BETWEEN 1 AND 12);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE profiles
    ADD CONSTRAINT chk_start_class_range CHECK (start_class IS NULL OR start_class BETWEEN 1 AND 12);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE profiles
    ADD CONSTRAINT chk_year_of_leaving CHECK (
      year_of_leaving IS NULL OR year_of_leaving BETWEEN 1950 AND date_part('year', now())::int
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE profiles
    ADD CONSTRAINT chk_start_year CHECK (
      start_year IS NULL OR start_year BETWEEN 1950 AND date_part('year', now())::int
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


