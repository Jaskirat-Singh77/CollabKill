/*
  # Fix RLS Policy Recursion Issues

  1. Policy Updates
    - Drop and recreate problematic policies that cause infinite recursion
    - Simplify project_members policies to avoid circular references
    - Create separate policies for different access patterns

  2. Security
    - Maintain proper RLS protection
    - Ensure users can only access their own data or projects they're members of
    - Project creators maintain full control over their projects
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view project members" ON project_members;
DROP POLICY IF EXISTS "Project creators can manage project members" ON project_members;
DROP POLICY IF EXISTS "Users can view projects they created or are members of" ON projects;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Project creators can update their projects" ON projects;
DROP POLICY IF EXISTS "Project creators can delete their projects" ON projects;

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

-- Recreate other project policies
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