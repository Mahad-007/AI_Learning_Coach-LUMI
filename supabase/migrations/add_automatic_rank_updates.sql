-- ============================================================================
-- AUTO-UPDATE LEADERBOARD RANKS
-- ============================================================================
-- 
-- Problem: The update_leaderboard_ranks() function exists but is never called,
-- so ranks become stale when users gain XP.
--
-- Solution: Create a trigger that automatically recalculates all ranks after
-- any leaderboard update (total_xp, weekly_xp, or monthly_xp changes)

-- Create trigger function that calls update_leaderboard_ranks()
-- Using a statement-level trigger for better performance (fires once per statement, not per row)
CREATE OR REPLACE FUNCTION trigger_update_leaderboard_ranks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update all ranks based on total_xp
  -- This fires once per INSERT/UPDATE statement, not once per row
  PERFORM update_leaderboard_ranks();
  RETURN NULL; -- Result is ignored for AFTER triggers
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_update_leaderboard_ranks ON public.leaderboard;

-- Create statement-level trigger on leaderboard table
-- This fires once per SQL statement, even if multiple rows are affected
CREATE TRIGGER auto_update_leaderboard_ranks
  AFTER INSERT OR UPDATE OF total_xp, weekly_xp, monthly_xp ON public.leaderboard
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_update_leaderboard_ranks();

-- Initial rank calculation for existing data
SELECT update_leaderboard_ranks();

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify ranks are correct:
-- SELECT user_id, total_xp, rank 
-- FROM public.leaderboard 
-- ORDER BY rank ASC 
-- LIMIT 20;

