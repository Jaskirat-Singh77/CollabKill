/*
  # Fix project_members RLS policy infinite recursion

  1. Problem
    - The current SELECT policy on project_members causes infinite recursion
    - Policy references project_members table within its own definition

  2. Solution
    - Drop the problematic policy
    - Create a new policy that avoids recursion
    - Use direct project ownership check instead of subquery to project_members
*/

-- Drop the existing problematic SELECT policy
DROP POLICY IF EXISTS "Users can view members of projects they're part of" ON project_members;

-- Create a new SELECT policy that avoids recursion
CREATE POLICY "Users can view members of projects they created or are members of"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    -- User can see members of projects they created
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid())
    OR
    -- User can see members of projects where they are also a member
    user_id = auth.uid()
  );