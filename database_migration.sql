-- Migration script to add renewable free questions feature
-- Run this in your Supabase SQL editor to update existing database

-- Add last_free_reset column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS last_free_reset TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;

-- Update existing users to have the current timestamp as their last reset
UPDATE user_profiles 
SET last_free_reset = TIMEZONE('utc'::text, NOW())
WHERE last_free_reset IS NULL;

-- Create or replace the function to check and reset free questions
CREATE OR REPLACE FUNCTION public.check_and_reset_free_questions(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    user_plan TEXT;
    current_questions INTEGER;
    last_reset TIMESTAMP WITH TIME ZONE;
    hours_since_reset INTERVAL;
BEGIN
    -- Get user plan, current questions, and last reset time
    SELECT plan, questions_remaining, last_free_reset
    INTO user_plan, current_questions, last_reset
    FROM user_profiles 
    WHERE id = user_id;
    
    -- Only process free plan users
    IF user_plan = 'free' THEN
        hours_since_reset := NOW() - last_reset;
        
        -- If 24 hours have passed and user has 0 questions, reset to 5
        IF hours_since_reset >= INTERVAL '24 hours' AND current_questions = 0 THEN
            UPDATE user_profiles 
            SET questions_remaining = 5,
                last_free_reset = NOW(),
                updated_at = NOW()
            WHERE id = user_id;
            
            RETURN 5; -- Return new question count
        END IF;
    END IF;
    
    RETURN current_questions; -- Return current question count
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to include last_free_reset
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
