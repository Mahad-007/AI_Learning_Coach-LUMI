-- Complete Leaderboard Fix - All-in-One Migration
-- This migration fixes all RLS issues and ensures leaderboard works

-- ============================================================================
-- PART 1: Fix Users Table RLS Policy
-- ============================================================================

-- Disable RLS temporarily to clean up
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing SELECT policies on users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own full profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view public user profiles" ON public.users;
DROP POLICY IF EXISTS "Public profiles viewable by all" ON public.users;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create fresh policies
-- SELECT: Everyone can view all users (needed for leaderboard)
CREATE POLICY "users_select_public" ON public.users
  FOR SELECT USING (true);

-- INSERT: Only authenticated users can insert their own profile
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE: Users can only update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- PART 2: Ensure Leaderboard Entries for All Users
-- ============================================================================

-- Insert leaderboard entries for users without one
INSERT INTO public.leaderboard (user_id, total_xp, weekly_xp, monthly_xp, rank)
SELECT 
  u.id,
  u.xp as total_xp,
  0 as weekly_xp,
  0 as monthly_xp,
  0 as rank
FROM public.users u
LEFT JOIN public.leaderboard l ON u.id = l.user_id
WHERE l.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- PART 3: Update Leaderboard for Existing Entries
-- ============================================================================

-- Sync total_xp from users table to leaderboard
UPDATE public.leaderboard l
SET total_xp = u.xp
FROM public.users u
WHERE l.user_id = u.id;

-- ============================================================================
-- PART 4: Recalculate Ranks
-- ============================================================================

WITH ranked_users AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY total_xp DESC) as new_rank
  FROM public.leaderboard
)
UPDATE public.leaderboard l
SET rank = r.new_rank
FROM ranked_users r
WHERE l.id = r.id;

-- ============================================================================
-- PART 5: Update the award_xp_to_user Function
-- ============================================================================

CREATE OR REPLACE FUNCTION award_xp_to_user(
  p_user_id UUID,
  p_xp_amount INTEGER
)
RETURNS TABLE(new_xp INTEGER, new_level INTEGER, leveled_up BOOLEAN) AS $$
DECLARE
  v_current_xp INTEGER;
  v_current_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_leveled_up BOOLEAN := FALSE;
BEGIN
  -- Get current XP and level
  SELECT xp, level INTO v_current_xp, v_current_level
  FROM public.users
  WHERE id = p_user_id;

  -- Calculate new XP and level
  v_new_xp := v_current_xp + p_xp_amount;
  v_new_level := FLOOR(SQRT(v_new_xp / 100.0)) + 1;
  
  -- Check if leveled up
  IF v_new_level > v_current_level THEN
    v_leveled_up := TRUE;
  END IF;

  -- Update user
  UPDATE public.users
  SET 
    xp = v_new_xp,
    level = v_new_level,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Update or create leaderboard entry
  INSERT INTO public.leaderboard (user_id, total_xp, weekly_xp, monthly_xp, rank)
  VALUES (p_user_id, v_new_xp, p_xp_amount, p_xp_amount, 0)
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = v_new_xp,
    weekly_xp = public.leaderboard.weekly_xp + p_xp_amount,
    monthly_xp = public.leaderboard.monthly_xp + p_xp_amount,
    updated_at = NOW();

  -- Return results
  RETURN QUERY SELECT v_new_xp, v_new_level, v_leveled_up;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION award_xp_to_user(UUID, INTEGER) TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (comment out when running migration)
-- ============================================================================

-- Uncomment these to verify after migration:
-- SELECT COUNT(*) as total_users FROM public.users;
-- SELECT COUNT(*) as total_leaderboard_entries FROM public.leaderboard;
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';

