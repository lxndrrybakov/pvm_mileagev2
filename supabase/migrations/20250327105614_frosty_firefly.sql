/*
  # Add stream statistics tracking
  
  1. Changes
    - Add run_at_assignment column to stream_assignments to track runs when PVM is assigned
    - Add stream_id to pvm_runs to track which stream the run belongs to
    
  2. Purpose
    - Enable tracking of stream-specific statistics
    - Allow calculating average runs per stream
*/

-- Add run_at_assignment to stream_assignments if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stream_assignments' 
    AND column_name = 'run_at_assignment'
  ) THEN
    ALTER TABLE stream_assignments 
    ADD COLUMN run_at_assignment numeric DEFAULT 0;
  END IF;
END $$;