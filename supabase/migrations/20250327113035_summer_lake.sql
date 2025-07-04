/*
  # Fix stream total run calculation

  1. Changes
    - Update trigger function to only count non-repair records
    - Fix double-counting issue in total_run calculation
    - Reset and recalculate all stream totals

  2. Notes
    - This migration ensures accurate stream total calculations
    - Only counts actual runs (not repair records)
    - Maintains data integrity by resetting and recalculating all totals
*/

-- Update the trigger function to handle total run calculations correctly
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
      ), 0)
      WHERE id = NEW.stream_id;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Reset all stream totals to 0
UPDATE streams SET total_run = 0;

-- Recalculate all stream totals correctly
UPDATE streams s
SET total_run = COALESCE((
  SELECT SUM(run_distance)
  FROM pvm_runs pr
  WHERE pr.stream_id = s.id
  AND pr.is_repair_record = false
), 0);