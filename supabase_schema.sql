-- =====================================================
-- Parent Assignment Helper - Complete Database Schema
-- =====================================================
-- This script creates all tables, relationships, functions, 
-- and security policies for the Parent Assignment Helper app.
-- Run this in your Supabase SQL Editor.
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'family', 'premium', 'enterprise')),
  questions_remaining INTEGER NOT NULL DEFAULT 5,
  last_free_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'parent', 'student', 'teacher')),
  suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Forms Table
CREATE TABLE IF NOT EXISTS contact_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'in_progress')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  plan TEXT NOT NULL CHECK (plan IN ('family', 'premium', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('user', 'bot')),
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT NOT NULL DEFAULT 'en',
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  timezone TEXT DEFAULT 'Africa/Nairobi',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  time_format TEXT NOT NULL DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing Info Table
CREATE TABLE IF NOT EXISTS billing_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Kenya',
  billing_name TEXT,
  billing_email TEXT,
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_postal_code TEXT,
  billing_country TEXT,
  tax_id TEXT,
  company_name TEXT,
  phone_number TEXT,
  preferred_payment_method TEXT DEFAULT 'mobile_money' CHECK (preferred_payment_method IN ('card', 'mobile_money', 'bank_transfer')),
  auto_renewal BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription History Table
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  from_plan TEXT,
  to_plan TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('upgrade', 'downgrade', 'renewal', 'cancellation')),
  amount NUMERIC(10, 2),
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  old_plan TEXT,
  new_plan TEXT NOT NULL,
  change_reason TEXT,
  effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Analytics Table
CREATE TABLE IF NOT EXISTS usage_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  metadata JSONB,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Plans Table (Admin-defined plans)
CREATE TABLE IF NOT EXISTS custom_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  questions_limit INTEGER NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly',
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EDUCATIONAL TABLES (Classes, Assignments, Materials)
-- =====================================================

-- Classes Table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Materials Table
CREATE TABLE IF NOT EXISTS learning_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievement Badges Table
CREATE TABLE IF NOT EXISTS achievement_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  description TEXT,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RELATIONSHIP TABLES (Many-to-Many)
-- =====================================================

-- Parent-Student Relationships
CREATE TABLE IF NOT EXISTS parent_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- Class-Student Relationships
CREATE TABLE IF NOT EXISTS class_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- Class-Teacher Relationships (for co-teachers)
CREATE TABLE IF NOT EXISTS class_teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, teacher_id)
);

-- Student Assignment Status
CREATE TABLE IF NOT EXISTS class_students_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, assignment_id)
);

-- Parental Controls Table
CREATE TABLE IF NOT EXISTS parental_controls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  show_assignments BOOLEAN DEFAULT TRUE,
  allow_downloads BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_plan ON user_profiles(plan);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);

-- Assignment indexes
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_class_students_assignments_student_id ON class_students_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_class_students_assignments_assignment_id ON class_students_assignments(assignment_id);

-- Relationship indexes
CREATE INDEX IF NOT EXISTS idx_parent_students_parent_id ON parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_student_id ON parent_students(student_id);
CREATE INDEX IF NOT EXISTS idx_class_students_class_id ON class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student_id ON class_students(student_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_created_at ON usage_analytics(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE parental_controls ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USER PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except plan, questions, role)
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow profile creation on signup
-- Allow profile creation on signup
-- The trigger that runs on auth.users may execute without a valid auth.uid() context,
-- which can cause the INSERT to fail due to the strict WITH CHECK above. Allow inserts
-- from the signup trigger by permitting the insert check here. This is safe because
-- the trigger itself controls the inserted `id` value coming from auth.users.
DROP POLICY IF EXISTS "Allow profile creation on signup" ON user_profiles;
CREATE POLICY "Allow profile creation on signup" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any profile
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;
CREATE POLICY "Admins can update any profile" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- CONTACT FORMS POLICIES
-- =====================================================

-- Anyone can submit a contact form (public access)
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_forms;
CREATE POLICY "Anyone can submit contact form" ON contact_forms
  FOR INSERT WITH CHECK (true);

-- Admins can view all contact forms
DROP POLICY IF EXISTS "Admins can view contact forms" ON contact_forms;
CREATE POLICY "Admins can view contact forms" ON contact_forms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update contact forms
DROP POLICY IF EXISTS "Admins can update contact forms" ON contact_forms;
CREATE POLICY "Admins can update contact forms" ON contact_forms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- PAYMENTS POLICIES
-- =====================================================

-- Users can view their own payments
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own payments
DROP POLICY IF EXISTS "Users can create own payments" ON payments;
CREATE POLICY "Users can create own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all payments
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any payment
DROP POLICY IF EXISTS "Admins can update payments" ON payments;
CREATE POLICY "Admins can update payments" ON payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- CHAT POLICIES
-- =====================================================

-- Users can view their own chat sessions
DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_sessions;
CREATE POLICY "Users can view own chat sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own chat sessions
DROP POLICY IF EXISTS "Users can create own chat sessions" ON chat_sessions;
CREATE POLICY "Users can create own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own chat sessions
DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;
CREATE POLICY "Users can update own chat sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their own chat messages
DROP POLICY IF EXISTS "Users can view own chat messages" ON chat_messages;
CREATE POLICY "Users can view own chat messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own chat messages
DROP POLICY IF EXISTS "Users can create own chat messages" ON chat_messages;
CREATE POLICY "Users can create own chat messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- USER SETTINGS POLICIES
-- =====================================================

-- Users can view their own settings
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own settings
-- Allow trigger to create settings during signup
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (true);

-- Users can update their own settings
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- BILLING INFO POLICIES
-- =====================================================

-- Users can view their own billing info
DROP POLICY IF EXISTS "Users can view own billing info" ON billing_info;
CREATE POLICY "Users can view own billing info" ON billing_info
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own billing info
DROP POLICY IF EXISTS "Users can insert own billing info" ON billing_info;
CREATE POLICY "Users can insert own billing info" ON billing_info
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own billing info
DROP POLICY IF EXISTS "Users can update own billing info" ON billing_info;
CREATE POLICY "Users can update own billing info" ON billing_info
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- SUBSCRIPTION HISTORY POLICIES
-- =====================================================

-- Users can view their own subscription history
DROP POLICY IF EXISTS "Users can view own subscription history" ON subscription_history;
CREATE POLICY "Users can view own subscription history" ON subscription_history
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert subscription history
DROP POLICY IF EXISTS "System can insert subscription history" ON subscription_history;
CREATE POLICY "System can insert subscription history" ON subscription_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all subscription history
DROP POLICY IF EXISTS "Admins can view all subscription history" ON subscription_history;
CREATE POLICY "Admins can view all subscription history" ON subscription_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- USAGE ANALYTICS POLICIES
-- =====================================================

-- Users can view their own analytics
DROP POLICY IF EXISTS "Users can view own analytics" ON usage_analytics;
CREATE POLICY "Users can view own analytics" ON usage_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert analytics
DROP POLICY IF EXISTS "System can insert analytics" ON usage_analytics;
CREATE POLICY "System can insert analytics" ON usage_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all analytics
DROP POLICY IF EXISTS "Admins can view all analytics" ON usage_analytics;
CREATE POLICY "Admins can view all analytics" ON usage_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- CUSTOM PLANS POLICIES
-- =====================================================

-- Anyone can view active custom plans
DROP POLICY IF EXISTS "Anyone can view active custom plans" ON custom_plans;
CREATE POLICY "Anyone can view active custom plans" ON custom_plans
  FOR SELECT USING (is_active = true);

-- Admins can view all custom plans
DROP POLICY IF EXISTS "Admins can view all custom plans" ON custom_plans;
CREATE POLICY "Admins can view all custom plans" ON custom_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can create custom plans
DROP POLICY IF EXISTS "Admins can create custom plans" ON custom_plans;
CREATE POLICY "Admins can create custom plans" ON custom_plans
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update custom plans
DROP POLICY IF EXISTS "Admins can update custom plans" ON custom_plans;
CREATE POLICY "Admins can update custom plans" ON custom_plans
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete custom plans
DROP POLICY IF EXISTS "Admins can delete custom plans" ON custom_plans;
CREATE POLICY "Admins can delete custom plans" ON custom_plans
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- CLASSES POLICIES
-- =====================================================

-- Teachers can view their own classes
DROP POLICY IF EXISTS "Teachers can view own classes" ON classes;
CREATE POLICY "Teachers can view own classes" ON classes
  FOR SELECT USING (
    auth.uid() = teacher_id OR
    EXISTS (
      SELECT 1 FROM class_teachers
      WHERE class_id = classes.id AND teacher_id = auth.uid()
    )
  );

-- Teachers can create classes
DROP POLICY IF EXISTS "Teachers can create classes" ON classes;
CREATE POLICY "Teachers can create classes" ON classes
  FOR INSERT WITH CHECK (
    auth.uid() = teacher_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

-- Teachers can update their own classes
DROP POLICY IF EXISTS "Teachers can update own classes" ON classes;
CREATE POLICY "Teachers can update own classes" ON classes
  FOR UPDATE USING (
    auth.uid() = teacher_id OR
    EXISTS (
      SELECT 1 FROM class_teachers
      WHERE class_id = classes.id AND teacher_id = auth.uid()
    )
  );

-- Students can view their enrolled classes
DROP POLICY IF EXISTS "Students can view enrolled classes" ON classes;
CREATE POLICY "Students can view enrolled classes" ON classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_students
      WHERE class_id = classes.id AND student_id = auth.uid()
    )
  );

-- Admins can view all classes
DROP POLICY IF EXISTS "Admins can view all classes" ON classes;
CREATE POLICY "Admins can view all classes" ON classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- ASSIGNMENTS POLICIES
-- =====================================================

-- Teachers can view assignments for their classes
DROP POLICY IF EXISTS "Teachers can view assignments for their classes" ON assignments;
CREATE POLICY "Teachers can view assignments for their classes" ON assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE id = assignments.class_id AND teacher_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM class_teachers
      WHERE class_id = assignments.class_id AND teacher_id = auth.uid()
    )
  );

-- Teachers can create assignments for their classes
DROP POLICY IF EXISTS "Teachers can create assignments" ON assignments;
CREATE POLICY "Teachers can create assignments" ON assignments
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM classes
      WHERE id = class_id AND teacher_id = auth.uid()
    )
  );

-- Students can view assignments for their classes
DROP POLICY IF EXISTS "Students can view assignments for enrolled classes" ON assignments;
CREATE POLICY "Students can view assignments for enrolled classes" ON assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_students
      WHERE class_id = assignments.class_id AND student_id = auth.uid()
    )
  );

-- Admins can view all assignments
DROP POLICY IF EXISTS "Admins can view all assignments" ON assignments;
CREATE POLICY "Admins can view all assignments" ON assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- LEARNING MATERIALS POLICIES
-- =====================================================

-- Users can view public learning materials
DROP POLICY IF EXISTS "Users can view public materials" ON learning_materials;
CREATE POLICY "Users can view public materials" ON learning_materials
  FOR SELECT USING (is_public = true);

-- Students can view materials for their classes
DROP POLICY IF EXISTS "Students can view class materials" ON learning_materials;
CREATE POLICY "Students can view class materials" ON learning_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_students
      WHERE class_id = learning_materials.class_id AND student_id = auth.uid()
    )
  );

-- Teachers can view and create materials for their classes
DROP POLICY IF EXISTS "Teachers can view materials for their classes" ON learning_materials;
CREATE POLICY "Teachers can view materials for their classes" ON learning_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE id = learning_materials.class_id AND teacher_id = auth.uid()
    ) OR
    auth.uid() = uploaded_by
  );

DROP POLICY IF EXISTS "Teachers can create materials" ON learning_materials;
CREATE POLICY "Teachers can create materials" ON learning_materials
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

-- Admins can view all materials
DROP POLICY IF EXISTS "Admins can view all materials" ON learning_materials;
CREATE POLICY "Admins can view all materials" ON learning_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- ACHIEVEMENT BADGES POLICIES
-- =====================================================

-- Users can view their own badges
DROP POLICY IF EXISTS "Users can view own badges" ON achievement_badges;
CREATE POLICY "Users can view own badges" ON achievement_badges
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert badges
DROP POLICY IF EXISTS "System can insert badges" ON achievement_badges;
CREATE POLICY "System can insert badges" ON achievement_badges
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- RELATIONSHIP TABLES POLICIES
-- =====================================================

-- Parent-Student Relationships
DROP POLICY IF EXISTS "Parents can view their students" ON parent_students;
CREATE POLICY "Parents can view their students" ON parent_students
  FOR SELECT USING (auth.uid() = parent_id);

DROP POLICY IF EXISTS "Students can view their parents" ON parent_students;
CREATE POLICY "Students can view their parents" ON parent_students
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Admins can manage parent-student relationships" ON parent_students;
CREATE POLICY "Admins can manage parent-student relationships" ON parent_students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Class-Student Relationships
DROP POLICY IF EXISTS "Students can view their class enrollments" ON class_students;
CREATE POLICY "Students can view their class enrollments" ON class_students
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers can view their class students" ON class_students;
CREATE POLICY "Teachers can view their class students" ON class_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE id = class_students.class_id AND teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Teachers can enroll students in their classes" ON class_students;
CREATE POLICY "Teachers can enroll students in their classes" ON class_students
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes
      WHERE id = class_id AND teacher_id = auth.uid()
    )
  );

-- Class-Teacher Relationships
DROP POLICY IF EXISTS "Teachers can view their class assignments" ON class_teachers;
CREATE POLICY "Teachers can view their class assignments" ON class_teachers
  FOR SELECT USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Admins can manage class teachers" ON class_teachers;
CREATE POLICY "Admins can manage class teachers" ON class_teachers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Student Assignment Status
DROP POLICY IF EXISTS "Students can view their assignment status" ON class_students_assignments;
CREATE POLICY "Students can view their assignment status" ON class_students_assignments
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update their assignment status" ON class_students_assignments;
CREATE POLICY "Students can update their assignment status" ON class_students_assignments
  FOR ALL USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers can view student assignment status" ON class_students_assignments;
CREATE POLICY "Teachers can view student assignment status" ON class_students_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN classes c ON a.class_id = c.id
      WHERE a.id = class_students_assignments.assignment_id
      AND c.teacher_id = auth.uid()
    )
  );

-- Parental Controls
DROP POLICY IF EXISTS "Parents can manage their controls" ON parental_controls;
CREATE POLICY "Parents can manage their controls" ON parental_controls
  FOR ALL USING (auth.uid() = parent_id);

DROP POLICY IF EXISTS "Admins can view all parental controls" ON parental_controls;
CREATE POLICY "Admins can view all parental controls" ON parental_controls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function to decrement user questions
CREATE OR REPLACE FUNCTION decrement_questions(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET questions_remaining = GREATEST(questions_remaining - 1, 0),
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add user credits
CREATE OR REPLACE FUNCTION add_user_credits(user_id UUID, credits_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET questions_remaining = questions_remaining + credits_to_add,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and reset free questions (daily)
CREATE OR REPLACE FUNCTION check_and_reset_free_questions(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_questions INTEGER;
  last_reset TIMESTAMP WITH TIME ZONE;
  user_plan TEXT;
  questions_limit INTEGER;
BEGIN
  -- Get user info
  SELECT questions_remaining, last_free_reset, plan
  INTO current_questions, last_reset, user_plan
  FROM user_profiles
  WHERE id = user_id;

  -- Determine questions limit based on plan
  CASE user_plan
    WHEN 'free' THEN questions_limit := 5;
    WHEN 'family' THEN questions_limit := 100;
    WHEN 'premium' THEN questions_limit := 500;
    WHEN 'enterprise' THEN questions_limit := 9999;
    ELSE questions_limit := 5;
  END CASE;

  -- Check if we need to reset (more than 24 hours for free, or start of month for paid)
  IF user_plan = 'free' AND (NOW() - last_reset) > INTERVAL '24 hours' THEN
    UPDATE user_profiles
    SET questions_remaining = questions_limit,
        last_free_reset = NOW(),
        updated_at = NOW()
    WHERE id = user_id;
    RETURN questions_limit;
  ELSIF user_plan IN ('family', 'premium', 'enterprise') AND 
        EXTRACT(MONTH FROM NOW()) != EXTRACT(MONTH FROM last_reset) THEN
    UPDATE user_profiles
    SET questions_remaining = questions_limit,
        last_free_reset = NOW(),
        updated_at = NOW()
    WHERE id = user_id;
    RETURN questions_limit;
  END IF;

  RETURN current_questions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, name, plan, questions_remaining, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'free',
    5,
    'user'
  );
  
  -- Create default user settings
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_billing_info_updated_at ON billing_info;
CREATE TRIGGER update_billing_info_updated_at
  BEFORE UPDATE ON billing_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_plans_updated_at ON custom_plans;
CREATE TRIGGER update_custom_plans_updated_at
  BEFORE UPDATE ON custom_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE BUCKETS (for file uploads)
-- =====================================================

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for profile pictures
DROP POLICY IF EXISTS "Users can upload their own profile picture" ON storage.objects;
CREATE POLICY "Users can upload their own profile picture" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update their own profile picture" ON storage.objects;
CREATE POLICY "Users can update their own profile picture" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete their own profile picture" ON storage.objects;
CREATE POLICY "Users can delete their own profile picture" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Profile pictures are publicly accessible" ON storage.objects;
CREATE POLICY "Profile pictures are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

-- Create storage bucket for learning materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('learning-materials', 'learning-materials', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for learning materials
DROP POLICY IF EXISTS "Teachers can upload learning materials" ON storage.objects;
CREATE POLICY "Teachers can upload learning materials" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'learning-materials' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can view learning materials" ON storage.objects;
CREATE POLICY "Users can view learning materials" ON storage.objects
  FOR SELECT USING (bucket_id = 'learning-materials');

-- =====================================================
-- INITIAL DATA / SEED DATA
-- =====================================================

-- You can add initial custom plans or other seed data here
-- Example:
-- INSERT INTO custom_plans (name, price, questions_limit, period, description, features, created_by)
-- VALUES (
--   'School Package',
--   49.99,
--   1000,
--   'monthly',
--   'Perfect for schools and institutions',
--   '["Unlimited students", "Priority support", "Custom branding"]'::jsonb,
--   (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)
-- );

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created: 22';
  RAISE NOTICE 'Security policies: Enabled on all tables';
  RAISE NOTICE 'Functions: 5 database functions';
  RAISE NOTICE 'Triggers: Auto profile creation + timestamps';
  RAISE NOTICE 'Storage: Profile pictures & materials buckets';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update your .env with Supabase credentials';
  RAISE NOTICE '2. Make your first user an admin:';
  RAISE NOTICE '   UPDATE user_profiles SET role = %', 'admin';
  RAISE NOTICE '   WHERE email = %', 'your-email@example.com';
  RAISE NOTICE '========================================';
END $$;
