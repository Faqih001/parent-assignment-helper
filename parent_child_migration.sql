-- 1. Create parent_students table
CREATE TABLE IF NOT EXISTS parent_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  student_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

-- 2. Update user_profiles to add 'parent' and 'student' roles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('user', 'admin', 'parent', 'student')) DEFAULT 'user';

-- 3. (Optional) Backfill roles for existing users as needed
-- UPDATE user_profiles SET role = 'parent' WHERE ...;
-- UPDATE user_profiles SET role = 'student' WHERE ...;
