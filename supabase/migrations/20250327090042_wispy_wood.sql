/*
  # Add repair record tracking

  1. Changes
    - Add is_repair_record column to pvm_runs table to distinguish between regular runs and repair records
    
  2. Notes
    - Default value is false for backward compatibility
    - Column is not nullable to ensure data consistency
*/

ALTER TABLE public.pvm_runs
ADD COLUMN is_repair_record boolean NOT NULL DEFAULT false;