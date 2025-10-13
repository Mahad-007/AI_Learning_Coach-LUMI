-- Migration: Fix Badges RLS Policy
-- The "System can insert badges" policy needs to allow authenticated users to insert their own badges

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "System can insert badges" ON public.badges;

-- Create new policy that allows users to insert their own badges
CREATE POLICY "Users can insert own badges" ON public.badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Also ensure UPDATE policy exists for badge operations
DROP POLICY IF EXISTS "Users can update own badges" ON public.badges;

CREATE POLICY "Users can update own badges" ON public.badges
  FOR UPDATE USING (auth.uid() = user_id);

