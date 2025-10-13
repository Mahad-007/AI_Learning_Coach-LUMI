-- Add new profile fields to users table
-- Migration: add_profile_fields

-- Add username field (unique)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add bio field
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add learning_mode field
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS learning_mode TEXT DEFAULT 'ai_chat' 
CHECK (learning_mode IN ('ai_chat', 'stories', 'whiteboard', 'quiz', 'tutoring'));

-- Add theme_preference field
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system' 
CHECK (theme_preference IN ('light', 'dark', 'system'));

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Update existing users to have default values
UPDATE public.users 
SET username = LOWER(REPLACE(name, ' ', '_')) || '_' || SUBSTRING(id::text, 1, 4)
WHERE username IS NULL;

UPDATE public.users 
SET bio = 'Learning enthusiast 📚'
WHERE bio IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.users.username IS 'Unique username for the user, used for display and mentions';
COMMENT ON COLUMN public.users.bio IS 'Short bio/description for the user profile';
COMMENT ON COLUMN public.users.learning_mode IS 'Preferred learning mode: ai_chat, stories, whiteboard, quiz, or tutoring';
COMMENT ON COLUMN public.users.theme_preference IS 'UI theme preference: light, dark, or system';

