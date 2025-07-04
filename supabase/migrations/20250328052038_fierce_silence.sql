/*
  # Continue importing PVM run data
  
  1. Changes
    - Import next batch of PVM run records
    - Maintain exact timestamps and values
    - Preserve data integrity
*/

-- PVM 2 Series (continued)
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  445.936,
  '2024-09-19 10:10:55'::timestamptz,
  false
FROM pvms p
WHERE p.number = '2';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  550.866,
  '2024-09-21 04:52:54'::timestamptz,
  false
FROM pvms p
WHERE p.number = '2';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  465.666,
  '2024-09-24 00:37:37'::timestamptz,
  false
FROM pvms p
WHERE p.number = '2';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  545.666,
  '2024-10-01 23:47:12'::timestamptz,
  false
FROM pvms p
WHERE p.number = '2';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  367.366,
  '2024-10-14 02:41:26'::timestamptz,
  false
FROM pvms p
WHERE p.number = '2';

-- PVM 8 Series (continued)
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  980.866,
  '2024-09-04 18:15:01'::timestamptz,
  false
FROM pvms p
WHERE p.number = '8';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  900.866,
  '2024-09-04 18:22:36'::timestamptz,
  false
FROM pvms p
WHERE p.number = '8';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  480.866,
  '2024-09-10 20:43:29'::timestamptz,
  false
FROM pvms p
WHERE p.number = '8';

-- PVM 9 Series (continued)
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  577.266,
  '2024-09-03 14:51:30'::timestamptz,
  false
FROM pvms p
WHERE p.number = '9';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  480.866,
  '2024-09-10 20:43:48'::timestamptz,
  false
FROM pvms p
WHERE p.number = '9';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  487.666,
  '2024-09-12 23:57:11'::timestamptz,
  false
FROM pvms p
WHERE p.number = '9';

-- PVM 10 Series (continued)
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  588.466,
  '2024-09-03 14:53:03'::timestamptz,
  false
FROM pvms p
WHERE p.number = '10';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  119.926,
  '2024-09-10 20:44:27'::timestamptz,
  false
FROM pvms p
WHERE p.number = '10';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  494.066,
  '2024-09-12 23:57:25'::timestamptz,
  false
FROM pvms p
WHERE p.number = '10';

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