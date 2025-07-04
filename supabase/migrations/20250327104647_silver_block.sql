/*
  # Disable RLS on streams table
  
  1. Changes
    - Disable Row Level Security (RLS) on the streams table to allow unrestricted access
    
  Note: Policy already exists, so we only need to disable RLS
*/

ALTER TABLE streams DISABLE ROW LEVEL SECURITY;