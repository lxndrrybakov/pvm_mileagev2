/*
  # Drop and recreate PVM policies

  1. Changes
    - Drop existing "Enable all access" policy
    - Create new comprehensive policy with a different name
  
  2. Security
    - All operations restricted to authenticated users
    - Single policy covers all operations (SELECT, INSERT, UPDATE, DELETE)
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.pvms;

-- Create a new policy with a different name
CREATE POLICY "Allow authenticated users full access"
ON public.pvms
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);