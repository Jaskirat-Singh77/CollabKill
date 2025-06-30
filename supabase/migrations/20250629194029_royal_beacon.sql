/*
  # Fix infinite recursion in project_members RLS policy

  1. Problem
    - The current SELECT policy for project_members creates infinite recursion
    - When loading projects with project_members data, the policy tries to check project_members table while already querying it

  2. Solution
    - Simplify the SELECT policy to avoid circular dependency
    - Allow users to see project members for projects they created OR their own membership records
    - Use a more direct approach that doesn't create recursion

  3. Changes
    - Drop the existing problematic SELECT policy
    - Create a new, simpler SELECT policy that avoids recursion
*/

-- Drop the existing problematic SELECT policy
DROP POLICY IF EXISTS "Users can view members of projects they created or are members " ON project_members;

-- Create a new, simpler SELECT policy that avoids recursion
CREATE POLICY "Users can view project members"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see their own membership records
    user_id = auth.uid()
    OR
    -- Users can see members of projects they created
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );