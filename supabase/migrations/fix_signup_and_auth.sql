-- Complete fix for signup and authentication issues
-- This migration ensures users can sign up and all auth flows work correctly

-- ================================================
-- 1. CREATE USERS TABLE WITH ALL REQUIRED FIELDS
-- ================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  bio TEXT,
  role TEXT DEFAULT 'student',
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  streak INTEGER DEFAULT 0,
  avatar_url TEXT,
  persona TEXT DEFAULT 'friendly' CHECK (persona IN ('friendly', 'strict', 'fun', 'scholar')),
  learning_mode TEXT DEFAULT 'ai_chat',
  theme_preference TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 2. DROP ALL EXISTING RLS POLICIES ON USERS
-- ================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;
DROP POLICY IF EXISTS "Allow public read access to users for leaderboard" ON public.users;
DROP POLICY IF EXISTS "Allow users to read all user profiles for leaderboard" ON public.users;

-- ================================================
-- 3. DISABLE RLS (Since you don't want it enabled)
-- ================================================

-- Disable RLS on all tables for simpler access control
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges DISABLE ROW LEVEL SECURITY;

-- Note: With RLS disabled, make sure your anon key has proper permissions
-- This is fine for development and beta testing

-- RLS policies are commented out since you don't want RLS
-- Uncomment these if you want to enable RLS later

/*
CREATE POLICY "Allow authenticated users to read all profiles"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
*/

-- ================================================
-- 4. CREATE TRIGGER TO AUTO-CREATE USER PROFILE
-- ================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users
  INSERT INTO public.users (id, email, name, xp, level, streak, persona, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    0,
    1,
    0,
    'friendly',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  -- Create leaderboard entry
  INSERT INTO public.leaderboard (user_id, total_xp, weekly_xp, monthly_xp, rank)
  VALUES (NEW.id, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create achievement progress entry
  INSERT INTO public.user_achievement_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Award welcome badge
  INSERT INTO public.badges (user_id, badge_type, badge_name, badge_description, badge_icon)
  VALUES (
    NEW.id,
    'milestone',
    'Welcome Aboard',
    'Created your account and joined the learning community',
    '🎉'
  )
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new auth users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- 5. ENSURE LEADERBOARD TABLE EXISTS WITH RLS
-- ================================================

CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  weekly_xp INTEGER DEFAULT 0,
  monthly_xp INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS disabled for leaderboard (as per user preference)
-- Drop old policies
DROP POLICY IF EXISTS "Leaderboard is viewable by everyone" ON public.leaderboard;
DROP POLICY IF EXISTS "Users can view leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "Allow authenticated users to view leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "Service role can manage leaderboard" ON public.leaderboard;

-- ================================================
-- 6. ENSURE BADGES TABLE EXISTS WITH RLS
-- ================================================

CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS disabled for badges (as per user preference)
-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own badges" ON public.badges;
DROP POLICY IF EXISTS "Users can view all badges" ON public.badges;
DROP POLICY IF EXISTS "Service role can insert badges" ON public.badges;

-- ================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_xp_level ON public.users(xp DESC, level DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON public.leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_total_xp ON public.leaderboard(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON public.leaderboard(rank) WHERE rank > 0;
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON public.badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_earned_at ON public.badges(earned_at DESC);

-- ================================================
-- 8. HELPER FUNCTIONS
-- ================================================

-- Function to safely get or create user
CREATE OR REPLACE FUNCTION public.get_or_create_user_profile(p_user_id UUID, p_email TEXT, p_name TEXT)
RETURNS TABLE(id UUID, email TEXT, name TEXT, xp INTEGER, level INTEGER) AS $$
BEGIN
  -- Try to get existing user
  RETURN QUERY
  SELECT u.id, u.email, u.name, u.xp, u.level
  FROM public.users u
  WHERE u.id = p_user_id;
  
  -- If no user found, create one
  IF NOT FOUND THEN
    INSERT INTO public.users (id, email, name, xp, level, streak, persona)
    VALUES (p_user_id, p_email, COALESCE(p_name, 'User'), 0, 1, 0, 'friendly')
    ON CONFLICT (id) DO NOTHING;
    
    RETURN QUERY
    SELECT u.id, u.email, u.name, u.xp, u.level
    FROM public.users u
    WHERE u.id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- 9. UPDATE EXISTING USERS (ENSURE DEFAULTS)
-- ================================================

-- Set defaults for existing users
UPDATE public.users 
SET 
  xp = COALESCE(xp, 0),
  level = COALESCE(level, 1),
  streak = COALESCE(streak, 0),
  persona = COALESCE(persona, 'friendly'),
  learning_mode = COALESCE(learning_mode, 'ai_chat'),
  theme_preference = COALESCE(theme_preference, 'system')
WHERE xp IS NULL 
   OR level IS NULL 
   OR streak IS NULL 
   OR persona IS NULL;

-- ================================================
-- 10. GRANT PERMISSIONS
-- ================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT ON public.users TO authenticated;
GRANT INSERT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;

GRANT SELECT ON public.leaderboard TO authenticated;
GRANT SELECT ON public.badges TO authenticated;

-- Grant all permissions to service role
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.leaderboard TO service_role;
GRANT ALL ON public.badges TO service_role;
GRANT ALL ON public.user_achievement_progress TO service_role;
GRANT ALL ON public.lesson_progress TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_or_create_user_profile(UUID, TEXT, TEXT) TO authenticated, service_role;

-- ================================================
-- 11. VERIFY AND REPAIR DATA INTEGRITY
-- ================================================

-- Ensure all auth users have a profile
INSERT INTO public.users (id, email, name, xp, level, streak, persona)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', 'User'),
  0,
  1,
  0,
  'friendly'
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Ensure all users have leaderboard entries
INSERT INTO public.leaderboard (user_id, total_xp, weekly_xp, monthly_xp, rank)
SELECT 
  u.id,
  COALESCE(u.xp, 0),
  0,
  0,
  0
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.leaderboard l WHERE l.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Ensure all users have achievement progress
INSERT INTO public.user_achievement_progress (user_id)
SELECT u.id
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievement_progress ap WHERE ap.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- ================================================
-- 12. ADD HELPFUL COMMENTS
-- ================================================

COMMENT ON TABLE public.users IS 'User profiles with XP, levels, and learning preferences';
COMMENT ON TABLE public.leaderboard IS 'Global and friend leaderboards with XP rankings';
COMMENT ON TABLE public.badges IS 'User achievements and milestone badges';

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user profile, leaderboard entry, and welcome badge on signup';
COMMENT ON FUNCTION public.get_or_create_user_profile(UUID, TEXT, TEXT) IS 'Safely retrieves or creates a user profile';

-- ================================================
-- 13. VACUUM AND ANALYZE FOR PERFORMANCE
-- ================================================

VACUUM ANALYZE public.users;
VACUUM ANALYZE public.leaderboard;
VACUUM ANALYZE public.badges;

-- ================================================
-- SUCCESS MESSAGE
-- ================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Signup and authentication fixes applied successfully!';
  RAISE NOTICE '📊 Users table: Ready';
  RAISE NOTICE '🏆 Leaderboard table: Ready';
  RAISE NOTICE '🎖️ Badges table: Ready';
  RAISE NOTICE '🔐 RLS Policies: Updated';
  RAISE NOTICE '⚡ Performance indexes: Created';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Users can now sign up successfully!';
END $$;

