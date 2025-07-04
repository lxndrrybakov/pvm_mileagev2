/*
  # Fix streams initialization

  This migration ensures that:
  1. All streams (1-6) are properly created
  2. Stream numbers are correctly set
  3. Total runs are initialized to 0
*/

-- First, ensure the streams table exists and has the correct structure
CREATE TABLE IF NOT EXISTS streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL CHECK (number BETWEEN 1 AND 6),
  total_run numeric DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (number)
);

-- Enable RLS if not already enabled
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies to ensure they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users on streams" ON streams;
DROP POLICY IF EXISTS "Enable all access for authenticated users on streams" ON streams;

CREATE POLICY "Enable read access for authenticated users on streams"
  ON streams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable all access for authenticated users on streams"
  ON streams FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Initialize or update streams
DO $$
DECLARE
  stream_numbers INTEGER[] := ARRAY[1,2,3,4,5,6];
  stream_number INTEGER;
BEGIN
  -- Create missing streams
  FOREACH stream_number IN ARRAY stream_numbers
  LOOP
    INSERT INTO streams (number, total_run)
    VALUES (stream_number, 0)
    ON CONFLICT (number) 
    DO NOTHING;
  END LOOP;
  
  -- Verify streams were created
  IF (SELECT COUNT(*) FROM streams) != 6 THEN
    RAISE EXCEPTION 'Failed to initialize all streams. Please check the database.';
  END IF;
END $$;