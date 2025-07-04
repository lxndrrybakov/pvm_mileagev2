/*
  # Import complete historical PVM run data
  
  1. Changes
    - Reset existing run data
    - Import all historical runs with exact timestamps
    - Import all repair records
    - Update PVM totals
    - Reset stream totals
    
  2. Notes
    - Complete data import in a single migration
    - Maintains data integrity
    - Preserves exact timestamps
*/

-- First reset all data
DELETE FROM pvm_runs;
UPDATE pvms SET current_run = 0, total_run = 0;
UPDATE streams SET total_run = 0, monthly_run = 0;

-- PVM 1 Series
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  14.466,
  '2024-08-13 14:44:45'::timestamptz,
  false
FROM pvms p
WHERE p.number = '1';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  404.336,
  '2024-09-02 06:35:06'::timestamptz,
  false
FROM pvms p
WHERE p.number = '1';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  589.936,
  '2024-09-03 14:48:07'::timestamptz,
  false
FROM pvms p
WHERE p.number = '1';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  482.466,
  '2024-09-10 20:41:30'::timestamptz,
  false
FROM pvms p
WHERE p.number = '1';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  397.936,
  '2024-09-12 23:55:59'::timestamptz,
  false
FROM pvms p
WHERE p.number = '1';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  721.666,
  '2024-09-15 21:45:50'::timestamptz,
  false
FROM pvms p
WHERE p.number = '1';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  177.126,
  '2024-09-17 15:23:26'::timestamptz,
  false
FROM pvms p
WHERE p.number = '1';

-- PVM 1 Repair Records
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  14.466,
  '2024-08-13 14:44:53'::timestamptz,
  true
FROM pvms p
WHERE p.number = '1';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  14.466,
  '2024-08-27 09:31:45'::timestamptz,
  true
FROM pvms p
WHERE p.number = '1';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  14.466,
  '2024-08-27 13:58:43'::timestamptz,
  true
FROM pvms p
WHERE p.number = '1';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  2787.93,
  '2024-09-19 10:12:53'::timestamptz,
  true
FROM pvms p
WHERE p.number = '1';

-- PVM 6 Repair Records
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  0.0,
  '2024-08-13 14:48:19'::timestamptz,
  true
FROM pvms p
WHERE p.number = '6';

-- PVM 5 Repair Records
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  0.0,
  '2024-08-13 14:48:25'::timestamptz,
  true
FROM pvms p
WHERE p.number = '5';

-- PVM 4 Series
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  708.336,
  '2024-08-30 17:38:16'::timestamptz,
  false
FROM pvms p
WHERE p.number = '4';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  404.336,
  '2024-09-02 06:35:46'::timestamptz,
  false
FROM pvms p
WHERE p.number = '4';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  604.466,
  '2024-09-03 14:49:03'::timestamptz,
  false
FROM pvms p
WHERE p.number = '4';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  530.866,
  '2024-09-03 14:50:13'::timestamptz,
  false
FROM pvms p
WHERE p.number = '4';

-- PVM 4 Repair Records
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  0.0,
  '2024-08-26 12:33:45'::timestamptz,
  true
FROM pvms p
WHERE p.number = '4';

-- PVM 3 Repair Records
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  0.0,
  '2024-08-28 14:35:12'::timestamptz,
  true
FROM pvms p
WHERE p.number = '3';

-- PVM 2 Series
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  674.736,
  '2024-08-30 17:35:13'::timestamptz,
  false
FROM pvms p
WHERE p.number = '2';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  404.336,
  '2024-09-02 06:35:29'::timestamptz,
  false
FROM pvms p
WHERE p.number = '2';

-- Update PVM current runs based on non-repair records
UPDATE pvms p
SET current_run = COALESCE(subquery.total_run, 0),
    total_run = COALESCE(subquery.total_run, 0)
FROM (
  SELECT pvm_id, SUM(run_distance) as total_run
  FROM pvm_runs
  WHERE NOT is_repair_record
  GROUP BY pvm_id
) as subquery
WHERE p.id = subquery.pvm_id;

-- Reset stream totals to 0 as they weren't tracked historically
UPDATE streams SET total_run = 0, monthly_run = 0;