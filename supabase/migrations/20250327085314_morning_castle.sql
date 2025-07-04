/*
  # Disable Row Level Security

  1. Changes
    - Disable RLS on pvms table
    - Disable RLS on pvm_runs table
  
  2. Security
    - WARNING: This removes all access restrictions
    - All users will have full access to both tables
    - This should only be temporary for development
*/

-- Disable RLS on both tables
ALTER TABLE public.pvms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvm_runs DISABLE ROW LEVEL SECURITY;