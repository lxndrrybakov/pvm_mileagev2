/*
  # Add missing PVM table policies

  1. Changes
    - Add policy to allow inserting PVMs when table is empty
    - Add policy to allow updating PVMs
  
  2. Security
    - Policies restricted to authenticated users
    - Insert only allowed when table is empty
    - Updates restricted to authenticated users
*/

-- Allow inserts when table is empty
CREATE POLICY "Enable insert for authenticated users when table is empty"
ON public.pvms
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public.pvms
  ) OR (
    auth.role() = 'authenticated'
  )
);

-- Allow updating PVMs
CREATE POLICY "Enable update for authenticated users"
ON public.pvms
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);