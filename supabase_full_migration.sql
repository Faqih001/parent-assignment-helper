-- SUPABASE DATABASE MIGRATION SCRIPT
-- This script updates your Supabase database schema to support all features used in your app pages.
-- Review before running in the Supabase SQL Editor.

-- 1. USER PROFILES TABLE
create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  avatar_url text,
  plan text not null default 'free',
  questions_remaining integer not null default 0,
  last_free_reset timestamptz not null default now(),
  role text not null default 'user',
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. PARENT-STUDENT RELATIONSHIPS
create table if not exists parent_students (
  parent_id uuid references user_profiles(id) on delete cascade,
  student_id uuid references user_profiles(id) on delete cascade,
  primary key (parent_id, student_id)
);

-- 3. TEACHER-CLASS RELATIONSHIPS
create table if not exists class_teachers (
  teacher_id uuid references user_profiles(id) on delete cascade,
  class_id uuid references classes(id) on delete cascade,
  primary key (teacher_id, class_id)
);

-- 4. CLASSES
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  teacher_id uuid references user_profiles(id),
  created_at timestamptz not null default now()
);

-- 5. CLASS-STUDENT RELATIONSHIPS
create table if not exists class_students (
  class_id uuid references classes(id) on delete cascade,
  student_id uuid references user_profiles(id) on delete cascade,
  primary key (class_id, student_id)
);

-- 6. ASSIGNMENTS
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  due_date timestamptz,
  class_id uuid references classes(id) on delete cascade,
  created_by uuid references user_profiles(id),
  created_at timestamptz not null default now()
);

-- 7. CLASS-STUDENT-ASSIGNMENTS (status tracking)
create table if not exists class_students_assignments (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references assignments(id) on delete cascade,
  student_id uuid references user_profiles(id) on delete cascade,
  status text not null default 'pending',
  completed_at timestamptz
);

-- 8. LEARNING MATERIALS
create table if not exists learning_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_url text not null,
  uploaded_by uuid references user_profiles(id),
  class_id uuid references classes(id),
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

-- 9. PARENTAL CONTROLS
create table if not exists parental_controls (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references user_profiles(id) on delete cascade,
  student_id uuid references user_profiles(id) on delete cascade,
  show_assignments boolean not null default true,
  allow_downloads boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (parent_id, student_id)
);

-- 10. CONTACT FORMS
create table if not exists contact_forms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- 11. PAYMENTS
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id),
  amount numeric not null,
  currency text not null,
  plan text not null,
  status text not null default 'pending',
  payment_method text not null,
  transaction_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 12. CHAT MESSAGES
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id),
  type text not null,
  content text not null,
  image_url text,
  created_at timestamptz not null default now()
);

-- 13. USER SETTINGS
create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  theme text not null default 'system',
  language text not null default 'en',
  email_notifications boolean not null default true,
  push_notifications boolean not null default false,
  marketing_emails boolean not null default false,
  timezone text not null default 'UTC',
  date_format text not null default 'YYYY-MM-DD',
  time_format text not null default '24h',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 14. BILLING INFO
create table if not exists billing_info (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  address text,
  city text,
  postal_code text,
  country text,
  billing_name text,
  billing_email text,
  billing_address_line1 text,
  billing_address_line2 text,
  billing_city text,
  billing_state text,
  billing_postal_code text,
  billing_country text,
  tax_id text,
  company_name text,
  phone_number text,
  preferred_payment_method text not null default 'card',
  auto_renewal boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 15. SUBSCRIPTION HISTORY
create table if not exists subscription_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  from_plan text,
  to_plan text not null,
  action_type text not null,
  amount numeric,
  payment_id uuid references payments(id),
  old_plan text,
  new_plan text,
  change_reason text,
  effective_date timestamptz,
  created_at timestamptz not null default now()
);

-- 16. USAGE ANALYTICS
create table if not exists usage_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  action_type text not null,
  metadata jsonb,
  session_id text,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- 17. CUSTOM PLANS
create table if not exists custom_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  questions_limit integer not null,
  period text not null,
  description text,
  features jsonb not null default '[]',
  is_active boolean not null default true,
  created_by uuid references user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 18. ACHIEVEMENT BADGES
create table if not exists achievement_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  badge_type text not null,
  awarded_at timestamptz not null default now(),
  description text
);

-- 19. CHAT SESSIONS (optional, for future use)
create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 20. STORAGE BUCKETS (for profile-pictures, learning materials, etc.)
-- Create these in the Supabase Storage UI if not already present:
--   - profile-pictures
--   - learning-materials

-- 21. RPC FUNCTIONS (for decrement_questions, add_user_credits, check_and_reset_free_questions)
-- Example for decrement_questions:
create or replace function decrement_questions(user_id uuid)
returns void as $$
begin
  update user_profiles set questions_remaining = greatest(questions_remaining - 1, 0)
  where id = user_id;
end;
$$ language plpgsql;

-- Example for add_user_credits:
create or replace function add_user_credits(user_id uuid, credits_to_add integer)
returns void as $$
begin
  update user_profiles set questions_remaining = questions_remaining + credits_to_add
  where id = user_id;
end;
$$ language plpgsql;

-- Example for check_and_reset_free_questions:
create or replace function check_and_reset_free_questions(user_id uuid)
returns integer as $$
declare
  reset_limit integer := 10; -- adjust as needed
  last_reset timestamptz;
begin
  select last_free_reset into last_reset from user_profiles where id = user_id;
  if last_reset is null or last_reset < now() - interval '1 day' then
    update user_profiles set questions_remaining = reset_limit, last_free_reset = now() where id = user_id;
    return reset_limit;
  else
    select questions_remaining into reset_limit from user_profiles where id = user_id;
    return reset_limit;
  end if;
end;
$$ language plpgsql;

-- END OF MIGRATION SCRIPT
