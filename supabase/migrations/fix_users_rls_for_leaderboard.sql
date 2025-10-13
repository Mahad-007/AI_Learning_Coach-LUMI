-- Migration: Fix Users RLS Policy to Allow Public Profile Viewing
-- This allows the leaderboard to show all users' names and avatars

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Create two new policies:
-- 1. Users can view their own full profile
CREATE POLICY "Users can view own full profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- 2. Everyone can view basic public profile info of all users (for leaderboards)
CREATE POLICY "Anyone can view public user profiles" ON public.users
  FOR SELECT USING (true);

-- Note: Both policies will be evaluated, and if either one passes, the user can view the row.
-- This allows:
-- - Users to see their own profile (full access)
-- - Everyone to see all users' profiles (for leaderboard display)

