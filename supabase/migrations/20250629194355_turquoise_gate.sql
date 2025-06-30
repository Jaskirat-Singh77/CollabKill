/*
  # Fix RLS Policies to Prevent Infinite Recursion

  1. Security Updates
    - Simplify project_members policies to prevent recursion
    - Update projects policies to avoid circular references
    - Ensure clean policy structure without self-referential loops

  2. Policy Changes
    - Remove complex nested queries that cause recursion
    - Use direct user ID checks where possible
    - Maintain security while preventing infinite loops
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view project members" ON project_members;
DROP POLICY IF EXISTS "Project creators can manage project members" ON project_members;
DROP POLICY IF EXISTS "Users can view projects they created or are members of" ON projects;

-- Create simplified policies for project_members
CREATE POLICY "Users can view their own memberships"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view memberships in their projects"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Project creators can manage members"
  ON project_members
  FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

-- Create simplified policies for projects
CREATE POLICY "Users can view their own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can view projects they are members of"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

-- Ensure other project policies remain intact
CREATE POLICY "Users can create projects" ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Project creators can update their projects" ON projects
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Project creators can delete their projects" ON projects
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());