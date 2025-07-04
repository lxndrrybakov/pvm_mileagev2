/*
  # Import remaining PVM run data
  
  1. Changes
    - Import remaining PVM run records
    - Maintain exact timestamps and values
    - Preserve data integrity
    
  2. Notes
    - Continues from previous migration
    - Includes all remaining records
*/

-- PVM 2 Series (continued)
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  596.326,
  '2024-09-03 14:48:37'::timestamptz,
  false
FROM pvms p
WHERE p.number = '2';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  423.796,
  '2024-09-10 20:42:28'::timestamptz,
  false
FROM pvms p
WHERE p.number = '2';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  461.936,
  '2024-09-12 23:56:16'::timestamptz,
  false
FROM pvms p
WHERE p.number = '2';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  699.266,
  '2024-09-15 21:46:23'::timestamptz,
  false
FROM pvms p
WHERE p.number = '2';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  177.126,
  '2024-09-17 15:23:47'::timestamptz,
  false
FROM pvms p
WHERE p.number = '2';

-- PVM 8 Series
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  709.936,
  '2024-08-30 17:35:39'::timestamptz,
  false
FROM pvms p
WHERE p.number = '8';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  709.936,
  '2024-08-30 17:35:42'::timestamptz,
  false
FROM pvms p
WHERE p.number = '8';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  404.336,
  '2024-09-02 06:35:59'::timestamptz,
  false
FROM pvms p
WHERE p.number = '8';

-- PVM 9 Series
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  713.266,
  '2024-08-30 17:36:36'::timestamptz,
  false
FROM pvms p
WHERE p.number = '9';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  404.336,
  '2024-09-02 06:36:17'::timestamptz,
  false
FROM pvms p
WHERE p.number = '9';

-- PVM 10 Series
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  711.666,
  '2024-08-30 17:37:03'::timestamptz,
  false
FROM pvms p
WHERE p.number = '10';

INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  404.336,
  '2024-09-02 06:37:04'::timestamptz,
  false
FROM pvms p
WHERE p.number = '10';

-- PVM 7 Repair Records
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  0.0,
  '2024-08-30 17:37:34'::timestamptz,
  true
FROM pvms p
WHERE p.number = '7';

-- PVM 11 Series
INSERT INTO pvm_runs (pvm_id, blank_size, num_blanks, tech_scrap, run_distance, created_at, is_repair_record)
SELECT 
  p.id,
  '130',
  0,
  0,
  426.866,
  '2024-09-19 10:13:20'::timestamptz,
  false
FROM pvms p
WHERE p.number = '11';

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