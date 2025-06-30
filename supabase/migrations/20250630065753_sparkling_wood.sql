/*
  # Add AI nudges table

  1. New Tables
    - `ai_nudges`
      - `id` (uuid, primary key)
      - `project_id` (text, references projects)
      - `user_id` (text, references users)
      - `nudge_type` (text, type of nudge)
      - `message` (text, nudge message)
      - `voice_url` (text, URL to voice message)
      - `is_read` (boolean, whether user has seen the nudge)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `ai_nudges` table
    - Add policies for users to view their own nudges
*/

CREATE TABLE IF NOT EXISTS ai_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL,
  user_id text NOT NULL,
  nudge_type text NOT NULL CHECK (nudge_type IN ('reminder', 'motivation', 'workload_balance', 'deadline', 'collaboration')),
  message text NOT NULL,
  voice_url text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_nudges ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own nudges"
  ON ai_nudges
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own nudges"
  ON ai_nudges
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_nudges_user_id ON ai_nudges(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_nudges_project_id ON ai_nudges(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_nudges_created_at ON ai_nudges(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_nudges_is_read ON ai_nudges(is_read);