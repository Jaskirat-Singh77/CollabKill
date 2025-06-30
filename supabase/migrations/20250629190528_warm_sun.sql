/*
  # Create generated videos table

  1. New Tables
    - `generated_videos`
      - `id` (uuid, primary key)
      - `project_id` (text, references projects)
      - `user_id` (text, references users)
      - `video_url` (text, URL to the generated video)
      - `script` (text, the AI-generated script)
      - `generation_status` (text, status of video generation)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `generated_videos` table
    - Add policies for authenticated users to manage their videos
*/

CREATE TABLE IF NOT EXISTS generated_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL,
  user_id text,
  video_url text NOT NULL,
  script text,
  generation_status text DEFAULT 'pending' CHECK (generation_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE generated_videos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own generated videos"
  ON generated_videos
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create generated videos"
  ON generated_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own generated videos"
  ON generated_videos
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_videos_project_id ON generated_videos(project_id);
CREATE INDEX IF NOT EXISTS idx_generated_videos_user_id ON generated_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_videos_status ON generated_videos(generation_status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_generated_videos_updated_at
  BEFORE UPDATE ON generated_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();