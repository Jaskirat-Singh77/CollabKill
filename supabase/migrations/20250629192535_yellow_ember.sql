/*
  # Create project management tables

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `created_by` (uuid, references auth.users)
      - `phases` (jsonb array)
      - `current_phase` (text)
      - `deadline` (timestamptz)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `project_members`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `email` (text)
      - `role` (text)
      - `avatar` (text)
      - `contribution_percentage` (integer)
      - `tasks_completed` (integer)
      - `hours_logged` (integer)
      - `created_at` (timestamptz)
    
    - `project_tasks`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `title` (text)
      - `description` (text)
      - `assigned_to` (uuid, references project_members)
      - `status` (text)
      - `tags` (jsonb array)
      - `deadline` (timestamptz)
      - `hours_logged` (integer)
      - `priority` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their projects
    - Add policies for project members to view and update project data
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  phases jsonb DEFAULT '["Planning", "Design", "Development", "Testing", "Deployment"]'::jsonb,
  current_phase text DEFAULT 'Planning',
  deadline timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  avatar text,
  contribution_percentage integer DEFAULT 0,
  tasks_completed integer DEFAULT 0,
  hours_logged integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES project_members(id) ON DELETE SET NULL,
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed')),
  tags jsonb DEFAULT '[]'::jsonb,
  deadline timestamptz,
  hours_logged integer DEFAULT 0,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view projects they created or are members of"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR 
    id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Project creators can update their projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Project creators can delete their projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Project members policies
CREATE POLICY "Users can view members of projects they're part of"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
      UNION
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project creators can manage project members"
  ON project_members
  FOR ALL
  TO authenticated
  USING (
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid())
  );

-- Project tasks policies
CREATE POLICY "Users can view tasks of projects they're part of"
  ON project_tasks
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
      UNION
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can create tasks"
  ON project_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
      UNION
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can update tasks"
  ON project_tasks
  FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
      UNION
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project creators can delete tasks"
  ON project_tasks
  FOR DELETE
  TO authenticated
  USING (
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid())
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to ON project_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);

-- Create updated_at triggers
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();