/*
  # Assign all working PVMs to stream 1
  
  1. Changes
    - Assigns all PVMs with status 'inWork' to stream 1
    - Creates stream assignments for these PVMs
  
  2. Notes
    - Only affects PVMs currently in work status
    - Preserves existing PVM data
*/

-- Get stream 1 ID
DO $$
DECLARE
  stream_one_id uuid;
BEGIN
  SELECT id INTO stream_one_id FROM streams WHERE number = 1;
  
  -- Update all working PVMs to use stream 1
  UPDATE pvms
  SET stream_id = stream_one_id
  WHERE status = 'inWork';
  
  -- Create stream assignments for these PVMs
  INSERT INTO stream_assignments (pvm_id, stream_id, run_at_assignment)
  SELECT id, stream_one_id, current_run
  FROM pvms
  WHERE status = 'inWork'
  AND NOT EXISTS (
    SELECT 1 FROM stream_assignments sa
    WHERE sa.pvm_id = pvms.id AND sa.stream_id = stream_one_id
  );
END $$;