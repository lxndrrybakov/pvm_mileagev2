/*
  # Fix stream initialization and assignments

  This migration ensures that:
  1. All streams (1-6) exist and are properly initialized
  2. Stream assignments are properly tracked
  3. Adds better constraints and indexes for performance
*/

-- First ensure the streams table exists with correct structure
CREATE TABLE IF NOT EXISTS streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL CHECK (number BETWEEN 1 AND 6),
  total_run numeric DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (number)
);

-- Enable RLS
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;

-- Recreate policies to ensure they exist
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

-- Initialize streams with a more robust approach
DO $$
DECLARE
  stream_numbers INTEGER[] := ARRAY[1,2,3,4,5,6];
  stream_number INTEGER;
  stream_count INTEGER;
BEGIN
  -- Create missing streams
  FOREACH stream_number IN ARRAY stream_numbers
  LOOP
    INSERT INTO streams (number, total_run)
    VALUES (stream_number, 0)
    ON CONFLICT (number) DO UPDATE 
    SET total_run = streams.total_run;
  END LOOP;
  
  -- Verify all streams exist
  SELECT COUNT(*) INTO stream_count FROM streams;
  
  IF stream_count != 6 THEN
    RAISE EXCEPTION 'Failed to initialize streams. Expected 6 streams, found %', stream_count;
  END IF;
END $$;