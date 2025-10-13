-- ============================================================================
-- FIX: Achievement trigger function to handle both 'id' and 'user_id' fields
-- ============================================================================
-- 
-- Problem: The trigger_achievement_evaluation() function was using NEW.user_id
-- for all tables, but the 'users' table uses 'id' as its primary key, not 'user_id'.
-- This caused "record 'new' has no field 'user_id'" errors when updating users.xp
--
-- Solution: Check TG_TABLE_NAME and use NEW.id for 'users' table, NEW.user_id otherwise

CREATE OR REPLACE FUNCTION public.trigger_achievement_evaluation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Determine the user_id based on the table
  -- The users table has 'id', other tables have 'user_id'
  IF TG_TABLE_NAME = 'users' THEN
    v_user_id := NEW.id;
  ELSE
    v_user_id := NEW.user_id;
  END IF;
  
  -- Call achievement evaluation for the user
  PERFORM public.evaluate_achievements(v_user_id);
  RETURN NEW;
END;
$$;

