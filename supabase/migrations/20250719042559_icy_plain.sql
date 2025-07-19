/*
  # Add screening codes to existing tables

  1. Changes
    - Add `screening_code` column to `adult_screenings` table
    - Add `screening_code` column to `toddler_screenings` table
    - Create unique indexes on screening codes
    - Update existing records with generated codes

  2. Security
    - Screening codes are unique per table
    - Codes are 6 characters long (alphanumeric)
*/

-- Add screening_code column to adult_screenings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'adult_screenings' AND column_name = 'screening_code'
  ) THEN
    ALTER TABLE adult_screenings ADD COLUMN screening_code text;
  END IF;
END $$;

-- Add screening_code column to toddler_screenings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'toddler_screenings' AND column_name = 'screening_code'
  ) THEN
    ALTER TABLE toddler_screenings ADD COLUMN screening_code text;
  END IF;
END $$;

-- Function to generate random screening code
CREATE OR REPLACE FUNCTION generate_screening_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update existing adult_screenings with screening codes
UPDATE adult_screenings 
SET screening_code = generate_screening_code() 
WHERE screening_code IS NULL;

-- Update existing toddler_screenings with screening codes
UPDATE toddler_screenings 
SET screening_code = generate_screening_code() 
WHERE screening_code IS NULL;

-- Make screening_code NOT NULL and add unique constraints
ALTER TABLE adult_screenings 
  ALTER COLUMN screening_code SET NOT NULL,
  ADD CONSTRAINT adult_screenings_screening_code_unique UNIQUE (screening_code);

ALTER TABLE toddler_screenings 
  ALTER COLUMN screening_code SET NOT NULL,
  ADD CONSTRAINT toddler_screenings_screening_code_unique UNIQUE (screening_code);

-- Function to ensure unique screening codes on insert
CREATE OR REPLACE FUNCTION ensure_unique_screening_code()
RETURNS trigger AS $$
DECLARE
  new_code text;
  table_name text;
BEGIN
  -- Determine which table we're working with
  table_name := TG_TABLE_NAME;
  
  -- Generate a unique code
  LOOP
    new_code := generate_screening_code();
    
    -- Check if code exists in the same table
    IF table_name = 'adult_screenings' THEN
      IF NOT EXISTS (SELECT 1 FROM adult_screenings WHERE screening_code = new_code) THEN
        EXIT;
      END IF;
    ELSIF table_name = 'toddler_screenings' THEN
      IF NOT EXISTS (SELECT 1 FROM toddler_screenings WHERE screening_code = new_code) THEN
        EXIT;
      END IF;
    END IF;
  END LOOP;
  
  NEW.screening_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-generate screening codes
DROP TRIGGER IF EXISTS adult_screenings_screening_code_trigger ON adult_screenings;
CREATE TRIGGER adult_screenings_screening_code_trigger
  BEFORE INSERT ON adult_screenings
  FOR EACH ROW
  WHEN (NEW.screening_code IS NULL)
  EXECUTE FUNCTION ensure_unique_screening_code();

DROP TRIGGER IF EXISTS toddler_screenings_screening_code_trigger ON toddler_screenings;
CREATE TRIGGER toddler_screenings_screening_code_trigger
  BEFORE INSERT ON toddler_screenings
  FOR EACH ROW
  WHEN (NEW.screening_code IS NULL)
  EXECUTE FUNCTION ensure_unique_screening_code();