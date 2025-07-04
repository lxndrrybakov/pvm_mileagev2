/*
  # Initialize streams and disable RLS
  
  1. Changes
    - Initialize streams table with required data if not exists
    - Disable RLS on all relevant tables
    
  Note: This ensures all tables are accessible and streams are properly initialized
*/

-- First, make sure we have all 6 streams initialized
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM streams WHERE number = 1
  ) THEN
    INSERT INTO streams (number, total_run) VALUES (1, 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM streams WHERE number = 2
  ) THEN
    INSERT INTO streams (number, total_run) VALUES (2, 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM streams WHERE number = 3
  ) THEN
    INSERT INTO streams (number, total_run) VALUES (3, 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM streams WHERE number = 4
  ) THEN
    INSERT INTO streams (number, total_run) VALUES (4, 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM streams WHERE number = 5
  ) THEN
    INSERT INTO streams (number, total_run) VALUES (5, 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM streams WHERE number = 6
  ) THEN
    INSERT INTO streams (number, total_run) VALUES (6, 0);
  END IF;
END $$;

-- Disable RLS on all relevant tables
ALTER TABLE streams DISABLE ROW LEVEL SECURITY;
ALTER TABLE stream_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE pvms DISABLE ROW LEVEL SECURITY;
ALTER TABLE pvm_runs DISABLE ROW LEVEL SECURITY;