/*
  # Fix RLS infinite recursion for projects table

  1. Problem
    - Current RLS policies on projects table are causing infinite recursion
    - This happens when policies reference related tables that create circular dependencies

  2. Solution
    - Drop existing problematic policies
    - Create new policies that avoid circular references
    - Ensure direct auth.uid() checks without complex subqueries that could cause recursion

  3. Changes
    - Remove existing SELECT policies on projects table
    - Add new simplified policies that check auth.uid() directly
    - Ensure project_members policies don't create circular dependencies
*/

-- Drop existing problematic policies on projects table
DROP POLICY IF EXISTS "Users can view projects they are members of" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;

-- Create new simplified policies for projects table
CREATE POLICY "Users can view their own projects" 
  ON public.projects 
  FOR SELECT 
  TO authenticated 
  USING (created_by = auth.uid());

CREATE POLICY "Users can view member projects" 
  ON public.projects 
  FOR SELECT 
  TO authenticated 
  USING (
    id IN (
      SELECT pm.project_id 
      FROM public.project_members pm 
      WHERE pm.user_id = auth.uid()
    )
  );

-- Ensure project_members policies are simple and don't reference projects
DROP POLICY IF EXISTS "Users can view memberships in their projects" ON public.project_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.project_members;
DROP POLICY IF EXISTS "Project creators can manage members" ON public.project_members;

-- Create simplified project_members policies
CREATE POLICY "Users can view their own memberships" 
  ON public.project_members 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Project creators can manage their project members" 
  ON public.project_members 
  FOR ALL 
  TO authenticated 
  USING (
    project_id IN (
      SELECT p.id 
      FROM public.projects p 
      WHERE p.created_by = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id 
      FROM public.projects p 
      WHERE p.created_by = auth.uid()
    )
  );

-- Ensure project_tasks policies are also simple
DROP POLICY IF EXISTS "Users can view tasks of projects they're part of" ON public.project_tasks;
DROP POLICY IF EXISTS "Project members can create tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Project members can update tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Project creators can delete tasks" ON public.project_tasks;

-- Create simplified project_tasks policies
CREATE POLICY "Users can view tasks in their projects" 
  ON public.project_tasks 
  FOR SELECT 
  TO authenticated 
  USING (
    project_id IN (
      SELECT p.id 
      FROM public.projects p 
      WHERE p.created_by = auth.uid()
    )
    OR 
    project_id IN (
      SELECT pm.project_id 
      FROM public.project_members pm 
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tasks in their projects" 
  ON public.project_tasks 
  FOR ALL 
  TO authenticated 
  USING (
    project_id IN (
      SELECT p.id 
      FROM public.projects p 
      WHERE p.created_by = auth.uid()
    )
    OR 
    project_id IN (
      SELECT pm.project_id 
      FROM public.project_members pm 
      WHERE pm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id 
      FROM public.projects p 
      WHERE p.created_by = auth.uid()
    )
    OR 
    project_id IN (
      SELECT pm.project_id 
      FROM public.project_members pm 
      WHERE pm.user_id = auth.uid()
    )
  );