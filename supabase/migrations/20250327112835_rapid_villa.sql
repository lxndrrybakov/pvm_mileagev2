/*
  # Add monthly run tracking for streams

  1. Changes
    - Add monthly_run column to streams table
    - Update trigger function to track both total and monthly runs
    - Add function to reset monthly runs at the start of each month

  2. Security
    - No changes to security policies
*/

-- Add monthly_run column to streams table
ALTER TABLE streams ADD COLUMN monthly_run numeric DEFAULT 0;

-- Update the trigger function to handle both total and monthly runs
CREATE OR REPLACE FUNCTION update_stream_total_run()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- When a run is deleted
    IF OLD.stream_id IS NOT NULL THEN
      UPDATE streams
      SET total_run = COALESCE((
        SELECT SUM(run_distance)
        FROM pvm_runs
        WHERE stream_id = OLD.stream_id
        AND is_repair_record = false
      ), 0),
      monthly_run = COALESCE((
        SELECT SUM(run_distance)
        FROM pvm_runs
        WHERE stream_id = OLD.stream_id
        AND is_repair_record = false
        AND created_at >= date_trunc('month', CURRENT_DATE)
      ), 0)
      WHERE id = OLD.stream_id;
    END IF;
    RETURN OLD;
  ELSE
    -- When a run is inserted or updated
    IF NEW.stream_id IS NOT NULL THEN
      UPDATE streams
      SET total_run = COALESCE((
        SELECT SUM(run_distance)
        FROM pvm_runs
        WHERE stream_id = NEW.stream_id
        AND is_repair_record = false
      ), 0),
      monthly_run = COALESCE((
        SELECT SUM(run_distance)
        FROM pvm_runs
        WHERE stream_id = NEW.stream_id
        AND is_repair_record = false
        AND created_at >= date_trunc('month', CURRENT_DATE)
      ), 0)
      WHERE id = NEW.stream_id;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Reset all monthly runs to start fresh
UPDATE streams SET monthly_run = COALESCE((
  SELECT SUM(run_distance)
  FROM pvm_runs
  WHERE stream_id = streams.id
  AND is_repair_record = false
  AND created_at >= date_trunc('month', CURRENT_DATE)
), 0);