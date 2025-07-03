-- Database Schema for Parent Assignment Helper
-- Run these SQL commands in your Supabase SQL editor

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'family', 'premium')),
    questions_remaining INTEGER DEFAULT 5,
    last_free_reset TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create contact_forms table
CREATE TABLE contact_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'in_progress')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create payments table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('family', 'premium')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    payment_method TEXT NOT NULL,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create chat_sessions table
CREATE TABLE chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create chat_messages table
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES chat_sessions ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('user', 'bot')),
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, name, plan, questions_remaining, last_free_reset)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'free',
        5,
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to decrement user questions
CREATE OR REPLACE FUNCTION public.decrement_questions(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE user_profiles 
    SET questions_remaining = GREATEST(questions_remaining - 1, 0),
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check and reset free questions if 24 hours have passed
CREATE OR REPLACE FUNCTION public.check_and_reset_free_questions(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    user_plan TEXT;
    current_questions INTEGER;
    last_reset TIMESTAMP WITH TIME ZONE;
    hours_since_reset INTERVAL;
    reset_amount INTEGER;
BEGIN
    -- Get user plan, current questions, and last reset time
    SELECT plan, questions_remaining, last_free_reset
    INTO user_plan, current_questions, last_reset
    FROM user_profiles 
    WHERE id = user_id;
    
    -- Set reset amount based on plan
    CASE user_plan
        WHEN 'free' THEN reset_amount := 5;
        WHEN 'family' THEN reset_amount := 50;
        WHEN 'premium' THEN reset_amount := 50;
        ELSE reset_amount := 5;
    END CASE;
    
    -- Check if user has any plan
    IF user_plan IS NOT NULL THEN
        hours_since_reset := NOW() - last_reset;
        
        -- If 24 hours have passed and user has 0 questions, reset based on plan
        IF hours_since_reset >= INTERVAL '24 hours' AND current_questions = 0 THEN
            UPDATE user_profiles 
            SET questions_remaining = reset_amount,
                last_free_reset = NOW(),
                updated_at = NOW()
            WHERE id = user_id;
            
            RETURN reset_amount; -- Return new question count
        END IF;
    END IF;
    
    RETURN current_questions; -- Return current question count
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user plan after successful payment
CREATE OR REPLACE FUNCTION public.update_user_plan(user_id UUID, new_plan TEXT)
RETURNS VOID AS $$
DECLARE
    new_questions INTEGER;
BEGIN
    -- Set questions based on plan (all plans now renewable)
    CASE new_plan
        WHEN 'family' THEN new_questions := 50;
        WHEN 'premium' THEN new_questions := 50;
        ELSE new_questions := 5;
    END CASE;
    
    UPDATE user_profiles 
    SET plan = new_plan,
        questions_remaining = new_questions,
        last_free_reset = NOW(),
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add credits to user account
CREATE OR REPLACE FUNCTION public.add_user_credits(user_id UUID, credits_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE user_profiles 
    SET questions_remaining = questions_remaining + credits_to_add,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- User profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Contact forms: Allow inserts from anyone (for contact form submissions)
CREATE POLICY "Anyone can submit contact forms" ON contact_forms
    FOR INSERT WITH CHECK (true);

-- Payments: Users can only see their own payments
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat sessions: Users can only see and create their own sessions
CREATE POLICY "Users can view own chat sessions" ON chat_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat sessions" ON chat_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions" ON chat_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages: Users can only see and create their own messages
CREATE POLICY "Users can view own chat messages" ON chat_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_contact_forms_status ON contact_forms(status);
CREATE INDEX idx_contact_forms_created_at ON contact_forms(created_at);
