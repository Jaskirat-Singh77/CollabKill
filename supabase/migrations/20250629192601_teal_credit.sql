/*
  # Seed sample project data

  1. Sample Data
    - Create a sample project with team members and tasks
    - This matches the existing mock data structure for testing

  2. Notes
    - This is for development/testing purposes
    - In production, users will create their own projects
*/

-- Insert sample project (you'll need to replace the created_by UUID with an actual user ID)
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
  '550e8400-e29b-41d4-a716-446655440000', -- Replace with actual user UUID
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