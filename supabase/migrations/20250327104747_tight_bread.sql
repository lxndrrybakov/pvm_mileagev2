/*
  # Fix stream assignments RLS
  
  1. Changes
    - Disable RLS on stream_assignments table to allow proper access
    - Drop existing policy to avoid conflicts
    - Re-enable RLS with proper policies
    
  Note: This ensures stream assignments can be created and managed properly
*/

-- First drop the existing policy
DROP POLICY IF EXISTS "Enable all access for authenticated users on stream_assignments" ON stream_assignments;

-- Disable and re-enable RLS to reset the policies
ALTER TABLE stream_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE stream_assignments ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policy for all operations
CREATE POLICY "Enable all access for authenticated users on stream_assignments"
ON stream_assignments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);