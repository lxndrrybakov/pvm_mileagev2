/*
  # Add streams support

  1. New Tables
    - `streams`
      - `id` (uuid, primary key)
      - `number` (integer, 1-6)
      - `total_run` (numeric, default 0)
      - `created_at` (timestamp)

    - `stream_assignments`
      - `id` (uuid, primary key)
      - `pvm_id` (uuid, references pvms)
      - `stream_id` (uuid, references streams)
      - `assigned_at` (timestamp)
      - `run_at_assignment` (numeric)
      
  2. Changes
    - Add `stream_id` to `pvms` table
    - Add `stream_id` to `pvm_runs` table

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create streams table
CREATE TABLE IF NOT EXISTS streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL CHECK (number BETWEEN 1 AND 6),
  total_run numeric DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (number)
);

-- Create stream assignments history table
CREATE TABLE IF NOT EXISTS stream_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pvm_id uuid REFERENCES pvms(id) ON DELETE CASCADE,
  stream_id uuid REFERENCES streams(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  run_at_assignment numeric NOT NULL DEFAULT 0
);

-- Add stream_id to pvms table
ALTER TABLE pvms ADD COLUMN IF NOT EXISTS stream_id uuid REFERENCES streams(id) ON DELETE SET NULL;

-- Add stream_id to pvm_runs table
ALTER TABLE pvm_runs ADD COLUMN IF NOT EXISTS stream_id uuid REFERENCES streams(id) ON DELETE SET NULL;

-- Initialize streams
DO $$
BEGIN
  INSERT INTO streams (number)
  SELECT generate_series(1, 6)
  ON CONFLICT (number) DO NOTHING;
END $$;

-- Enable RLS
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_assignments ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Enable read access for authenticated users on streams"
  ON streams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable all access for authenticated users on streams"
  ON streams FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users on stream_assignments"
  ON stream_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable all access for authenticated users on stream_assignments"
  ON stream_assignments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);