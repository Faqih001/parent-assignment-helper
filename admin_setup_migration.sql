-- Admin System Setup Migration
-- Run this script in your Supabase SQL editor

-- 1. Add role column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. Update existing plan column to include enterprise
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_plan_check;

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_plan_check 
CHECK (plan IN ('free', 'family', 'premium', 'enterprise'));

-- 3. Create custom_plans table
CREATE TABLE IF NOT EXISTS custom_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    price integer NOT NULL DEFAULT 0,
    questions_limit integer NOT NULL DEFAULT 0,
    period text NOT NULL DEFAULT 'per month',
    description text NOT NULL,
    features text[] NOT NULL DEFAULT '{}',
    is_active boolean NOT NULL DEFAULT true,
    created_by uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create RLS policies for custom_plans table
ALTER TABLE custom_plans ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage all custom plans
CREATE POLICY "Admins can manage custom plans" ON custom_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Allow users to view active custom plans
CREATE POLICY "Users can view active custom plans" ON custom_plans
    FOR SELECT USING (is_active = true);

-- 5. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger for custom_plans updated_at
CREATE TRIGGER update_custom_plans_updated_at 
    BEFORE UPDATE ON custom_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Create admin user (replace with your email)
-- First, you need to register normally through the app, then run this query with your user ID
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';

-- 8. Create some sample custom plans (optional)
INSERT INTO custom_plans (name, price, questions_limit, period, description, features, created_by)
SELECT 
    'School Enterprise',
    5000,
    500,
    'per month',
    'For educational institutions with bulk student accounts',
    ARRAY['500 questions per month', 'Teacher dashboard', 'Analytics & reporting', 'Priority support', 'Custom integrations'],
    (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM user_profiles WHERE role = 'admin');

INSERT INTO custom_plans (name, price, questions_limit, period, description, features, created_by)
SELECT 
    'Corporate Training',
    10000,
    1000,
    'per month',
    'For corporate training and employee development',
    ARRAY['1000 questions per month', 'Multi-department access', 'Progress tracking', 'Custom branding', 'API access'],
    (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM user_profiles WHERE role = 'admin');

-- 9. Grant necessary permissions
GRANT ALL ON custom_plans TO authenticated;
GRANT ALL ON custom_plans TO service_role;

-- 10. Update user_profiles trigger to set default role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, plan, questions_remaining, last_free_reset, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'free',
    5,
    now(),
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE custom_plans IS 'Custom pricing plans that can be managed by admins';
COMMENT ON COLUMN user_profiles.role IS 'User role: user or admin';
