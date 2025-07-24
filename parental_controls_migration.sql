-- Migration for persistent parental controls
CREATE TABLE IF NOT EXISTS parental_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  student_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  show_assignments boolean NOT NULL DEFAULT true,
  allow_downloads boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, student_id)
);
