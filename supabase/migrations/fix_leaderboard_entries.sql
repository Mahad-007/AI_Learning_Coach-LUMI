-- Migration: Fix Leaderboard Entries for Existing Users
-- This migration creates leaderboard entries for all users who don't have one yet

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
WHERE l.id IS NULL;

-- Recalculate all ranks based on total_xp
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

