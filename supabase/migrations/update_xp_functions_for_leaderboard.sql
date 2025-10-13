-- Migration: Update XP Functions to Track Weekly and Monthly XP
-- This migration updates the award_xp_to_user function to also update leaderboard weekly/monthly XP

-- Update the award_xp_to_user function to update leaderboard
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

  -- Update leaderboard total_xp, weekly_xp, and monthly_xp
  -- First check if leaderboard entry exists
  IF EXISTS (SELECT 1 FROM public.leaderboard WHERE user_id = p_user_id) THEN
    UPDATE public.leaderboard
    SET 
      total_xp = v_new_xp,
      weekly_xp = weekly_xp + p_xp_amount,
      monthly_xp = monthly_xp + p_xp_amount,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    -- Create leaderboard entry if it doesn't exist
    INSERT INTO public.leaderboard (user_id, total_xp, weekly_xp, monthly_xp, rank)
    VALUES (p_user_id, v_new_xp, p_xp_amount, p_xp_amount, 0);
  END IF;

  -- Return results
  RETURN QUERY SELECT v_new_xp, v_new_level, v_leveled_up;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION award_xp_to_user(UUID, INTEGER) TO authenticated;

