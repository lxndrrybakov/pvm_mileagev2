/*
  # Enhance stream run tracking

  1. Changes
    - Add stream_id to pvm_runs table if not exists
    - Add trigger to update stream total_run when pvm_runs are added
    - Reset stream total_runs and recalculate from existing runs

  2. Security
    - Maintain existing RLS settings
*/

-- Add stream_id to pvm_runs if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pvm_runs' 
    AND column_name = 'stream_id'
  ) THEN
    ALTER TABLE pvm_runs 
    ADD COLUMN stream_id uuid REFERENCES streams(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create function to update stream total_run
CREATE OR REPLACE FUNCTION update_stream_total_run()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stream_id IS NOT NULL THEN
    UPDATE streams
    SET total_run = (
      SELECT COALESCE(SUM(run_distance), 0)
      FROM pvm_runs
      WHERE stream_id = NEW.stream_id
    )
    WHERE id = NEW.stream_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for pvm_runs
DROP TRIGGER IF EXISTS update_stream_total_run_trigger ON pvm_runs;
CREATE TRIGGER update_stream_total_run_trigger
AFTER INSERT OR UPDATE OR DELETE ON pvm_runs
FOR EACH ROW
EXECUTE FUNCTION update_stream_total_run();

-- Reset and recalculate all stream total_runs
UPDATE streams SET total_run = 0;

UPDATE streams s
SET total_run = COALESCE(
  (SELECT SUM(run_distance)
   FROM pvm_runs pr
   WHERE pr.stream_id = s.id),
  0
);