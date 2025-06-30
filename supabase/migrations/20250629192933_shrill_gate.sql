/*
  # Sample Data Migration

  1. New Tables
    - `users` (if not exists from auth.users)
    - Sample project data with proper foreign key relationships
  
  2. Sample Data
    - Creates sample users first
    - Creates sample project with valid user references
    - Creates project members with valid user and project references
    - Creates project tasks with valid assignments
  
  3. Security
    - Maintains existing RLS policies
    - Ensures data integrity with proper foreign key relationships
*/

-- First, create sample users in auth.users if they don't exist
-- Note: In production, users would be created through Supabase Auth
DO $$
BEGIN
  -- Insert sample users into auth.users (this simulates real user accounts)
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'alice@university.edu',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Alice Johnson", "role": "student"}',
    false,
    'authenticated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'bob@university.edu',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Bob Smith", "role": "student"}',
    false,
    'authenticated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'charlie@university.edu',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Charlie Brown", "role": "student"}',
    false,
    'authenticated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'diana@university.edu',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Diana Prince", "role": "student"}',
    false,
    'authenticated'
  )
  ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN others THEN
    -- If we can't insert into auth.users (permissions), create a local users table
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE NOT NULL,
      name text NOT NULL,
      role text DEFAULT 'student',
      avatar text,
      created_at timestamptz DEFAULT now()
    );

    ALTER TABLE users ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can read own data"
      ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);

    -- Insert sample users into our local users table
    INSERT INTO users (
      id,
      email,
      name,
      role,
      avatar
    ) VALUES 
    (
      '550e8400-e29b-41d4-a716-446655440000',
      'alice@university.edu',
      'Alice Johnson',
      'student',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
    ),
    (
      '550e8400-e29b-41d4-a716-446655440001',
      'bob@university.edu',
      'Bob Smith',
      'student',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
    ),
    (
      '550e8400-e29b-41d4-a716-446655440002',
      'charlie@university.edu',
      'Charlie Brown',
      'student',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie'
    ),
    (
      '550e8400-e29b-41d4-a716-446655440003',
      'diana@university.edu',
      'Diana Prince',
      'student',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=diana'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Update the foreign key constraint to reference our users table instead of auth.users
    ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_created_by_fkey;
    ALTER TABLE projects ADD CONSTRAINT projects_created_by_fkey 
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
    
    ALTER TABLE project_members DROP CONSTRAINT IF EXISTS project_members_user_id_fkey;
    ALTER TABLE project_members ADD CONSTRAINT project_members_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
END $$;

-- Insert sample project
INSERT INTO projects (
  id,
  title,
  description,
  created_by,
  phases,
  current_phase,
  deadline,
  status,
  created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'E-commerce Mobile Application',
  'Developing a full-stack mobile application for online shopping with React Native and Node.js',
  '550e8400-e29b-41d4-a716-446655440000',
  '["Planning", "Design", "Development", "Testing", "Deployment"]'::jsonb,
  'Development',
  '2025-01-15 00:00:00+00',
  'active',
  '2024-11-01 00:00:00+00'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample project members
INSERT INTO project_members (
  id,
  project_id,
  user_id,
  name,
  email,
  role,
  avatar,
  contribution_percentage,
  tasks_completed,
  hours_logged
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'Alice Johnson',
  'alice@university.edu',
  'Frontend Developer',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
  35,
  8,
  42
),
(
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001',
  'Bob Smith',
  'bob@university.edu',
  'Backend Developer',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
  28,
  6,
  38
),
(
  '550e8400-e29b-41d4-a716-446655440012',
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  'Charlie Brown',
  'charlie@university.edu',
  'UI/UX Designer',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
  25,
  5,
  35
),
(
  '550e8400-e29b-41d4-a716-446655440013',
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440003',
  'Diana Prince',
  'diana@university.edu',
  'QA Tester',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
  12,
  2,
  15
) ON CONFLICT (project_id, user_id) DO NOTHING;

-- Insert sample tasks
INSERT INTO project_tasks (
  id,
  project_id,
  title,
  description,
  assigned_to,
  status,
  tags,
  deadline,
  hours_logged,
  priority
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440001',
  'Design user authentication flow',
  'Create wireframes and mockups for login/signup pages',
  '550e8400-e29b-41d4-a716-446655440012',
  'completed',
  '["UI", "Design"]'::jsonb,
  '2024-12-15 00:00:00+00',
  8,
  'high'
),
(
  '550e8400-e29b-41d4-a716-446655440021',
  '550e8400-e29b-41d4-a716-446655440001',
  'Implement user authentication API',
  'Create backend endpoints for user registration and login',
  '550e8400-e29b-41d4-a716-446655440011',
  'in-progress',
  '["Backend", "API"]'::jsonb,
  '2024-12-20 00:00:00+00',
  12,
  'high'
),
(
  '550e8400-e29b-41d4-a716-446655440022',
  '550e8400-e29b-41d4-a716-446655440001',
  'Build product catalog interface',
  'Develop the main product browsing and search functionality',
  '550e8400-e29b-41d4-a716-446655440010',
  'in-progress',
  '["Frontend", "UI"]'::jsonb,
  '2024-12-25 00:00:00+00',
  15,
  'medium'
),
(
  '550e8400-e29b-41d4-a716-446655440023',
  '550e8400-e29b-41d4-a716-446655440001',
  'Write test cases for authentication',
  'Create comprehensive test suite for user authentication',
  '550e8400-e29b-41d4-a716-446655440013',
  'todo',
  '["Testing", "QA"]'::jsonb,
  '2024-12-30 00:00:00+00',
  0,
  'medium'
) ON CONFLICT (id) DO NOTHING;