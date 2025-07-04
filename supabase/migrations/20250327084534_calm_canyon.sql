/*
  # PVM Database Schema

  1. New Tables
    - `pvms`
      - `id` (uuid, primary key)
      - `number` (text)
      - `status` (text)
      - `current_run` (numeric)
      - `total_run` (numeric)
      - `created_at` (timestamp)
      
    - `pvm_runs`
      - `id` (uuid, primary key)
      - `pvm_id` (uuid, foreign key)
      - `blank_size` (text)
      - `num_blanks` (integer)
      - `tech_scrap` (numeric)
      - `run_distance` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create PVMs table
CREATE TABLE IF NOT EXISTS pvms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL,
  status text NOT NULL CHECK (status IN ('inWork', 'inStock', 'inRepair')),
  current_run numeric NOT NULL DEFAULT 0,
  total_run numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create PVM runs table
CREATE TABLE IF NOT EXISTS pvm_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pvm_id uuid REFERENCES pvms(id) ON DELETE CASCADE,
  blank_size text NOT NULL CHECK (blank_size IN ('130', '150')),
  num_blanks integer NOT NULL,
  tech_scrap numeric NOT NULL,
  run_distance numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pvms ENABLE ROW LEVEL SECURITY;
ALTER TABLE pvm_runs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON pvms
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users" ON pvms
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON pvm_runs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users" ON pvm_runs
  FOR ALL TO authenticated USING (true);