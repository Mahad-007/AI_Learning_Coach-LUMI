-- ============================================================================
-- ACHIEVEMENT SYSTEM - Complete Database Implementation
-- ============================================================================

-- 1. Create achievement_definitions table (master list)
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement TEXT NOT NULL,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN (
    'first_time', 'count', 'streak', 'level', 'xp', 'time_based', 'special'
  )),
  requirement_value INTEGER,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create user_achievement_progress view (aggregated metrics)
CREATE OR REPLACE VIEW public.user_achievement_progress AS
SELECT 
  u.id as user_id,
  u.xp as total_xp,
  u.level as current_level,
  u.streak as current_streak,
  
  -- Lesson metrics
  COUNT(DISTINCT CASE WHEN up.completed = TRUE THEN up.lesson_id END) as lessons_completed,
  
  -- Quiz metrics (from user_progress)
  COUNT(DISTINCT CASE WHEN up.quiz_score IS NOT NULL THEN up.quiz_id END) as quizzes_completed,
  COUNT(DISTINCT CASE WHEN up.quiz_score = 100 THEN up.quiz_id END) as perfect_scores,
  COALESCE(AVG(CASE WHEN up.quiz_score IS NOT NULL THEN up.quiz_score END), 0) as avg_quiz_score,
  
  -- Chat metrics
  COUNT(DISTINCT ch.id) as chat_messages_sent,
  
  -- Badge count
  COUNT(DISTINCT b.id) as badges_earned,
  
  -- Time-based (for Night Owl, Early Bird)
  MAX(ch.timestamp) as last_activity_time
  
FROM public.users u
LEFT JOIN public.user_progress up ON u.id = up.user_id
LEFT JOIN public.chat_history ch ON u.id = ch.user_id
LEFT JOIN public.badges b ON u.id = b.user_id
GROUP BY u.id, u.xp, u.level, u.streak;

-- 3. Create achievement evaluation function
CREATE OR REPLACE FUNCTION public.evaluate_achievements(p_user_id UUID)
RETURNS TABLE(
  achievement_id TEXT,
  achievement_name TEXT,
  newly_unlocked BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_progress RECORD;
  v_achievement RECORD;
  v_existing_badge UUID;
  v_new_badge UUID;
BEGIN
  -- Get user's current progress
  SELECT * INTO v_progress
  FROM public.user_achievement_progress
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
  
  -- Evaluate each achievement
  FOR v_achievement IN 
    SELECT * FROM public.achievement_definitions WHERE is_hidden = FALSE
  LOOP
    -- Check if user already has this badge
    SELECT id INTO v_existing_badge
    FROM public.badges
    WHERE user_id = p_user_id 
    AND badge_name = v_achievement.name
    LIMIT 1;
    
    -- Skip if already earned
    IF v_existing_badge IS NOT NULL THEN
      RETURN QUERY SELECT v_achievement.id, v_achievement.name, FALSE;
      CONTINUE;
    END IF;
    
    -- Evaluate based on requirement type
    CASE v_achievement.requirement_type
      WHEN 'first_time' THEN
        -- These are handled by specific triggers (chat, quiz, lesson completion)
        NULL;
        
      WHEN 'count' THEN
        -- Lesson count achievements
        IF v_achievement.id LIKE 'lesson_%' AND v_progress.lessons_completed >= v_achievement.requirement_value THEN
          INSERT INTO public.badges (user_id, badge_type, badge_name, badge_description, badge_icon)
          VALUES (p_user_id, v_achievement.category, v_achievement.name, v_achievement.description, v_achievement.icon)
          RETURNING id INTO v_new_badge;
          
          RETURN QUERY SELECT v_achievement.id, v_achievement.name, TRUE;
          
        -- Quiz count achievements
        ELSIF v_achievement.id LIKE 'quiz_%' AND v_progress.quizzes_completed >= v_achievement.requirement_value THEN
          INSERT INTO public.badges (user_id, badge_type, badge_name, badge_description, badge_icon)
          VALUES (p_user_id, v_achievement.category, v_achievement.name, v_achievement.description, v_achievement.icon)
          RETURNING id INTO v_new_badge;
          
          RETURN QUERY SELECT v_achievement.id, v_achievement.name, TRUE;
          
        -- Chat count achievements
        ELSIF v_achievement.id LIKE 'chat_%' AND v_progress.chat_messages_sent >= v_achievement.requirement_value THEN
          INSERT INTO public.badges (user_id, badge_type, badge_name, badge_description, badge_icon)
          VALUES (p_user_id, v_achievement.category, v_achievement.name, v_achievement.description, v_achievement.icon)
          RETURNING id INTO v_new_badge;
          
          RETURN QUERY SELECT v_achievement.id, v_achievement.name, TRUE;
          
        -- Perfect score achievements
        ELSIF v_achievement.id LIKE 'perfect_%' AND v_progress.perfect_scores >= v_achievement.requirement_value THEN
          INSERT INTO public.badges (user_id, badge_type, badge_name, badge_description, badge_icon)
          VALUES (p_user_id, v_achievement.category, v_achievement.name, v_achievement.description, v_achievement.icon)
          RETURNING id INTO v_new_badge;
          
          RETURN QUERY SELECT v_achievement.id, v_achievement.name, TRUE;
        END IF;
        
      WHEN 'level' THEN
        IF v_progress.current_level >= v_achievement.requirement_value THEN
          INSERT INTO public.badges (user_id, badge_type, badge_name, badge_description, badge_icon)
          VALUES (p_user_id, v_achievement.category, v_achievement.name, v_achievement.description, v_achievement.icon)
          RETURNING id INTO v_new_badge;
          
          RETURN QUERY SELECT v_achievement.id, v_achievement.name, TRUE;
        END IF;
        
      WHEN 'xp' THEN
        IF v_progress.total_xp >= v_achievement.requirement_value THEN
          INSERT INTO public.badges (user_id, badge_type, badge_name, badge_description, badge_icon)
          VALUES (p_user_id, v_achievement.category, v_achievement.name, v_achievement.description, v_achievement.icon)
          RETURNING id INTO v_new_badge;
          
          RETURN QUERY SELECT v_achievement.id, v_achievement.name, TRUE;
        END IF;
        
      WHEN 'streak' THEN
        IF v_progress.current_streak >= v_achievement.requirement_value THEN
          INSERT INTO public.badges (user_id, badge_type, badge_name, badge_description, badge_icon)
          VALUES (p_user_id, v_achievement.category, v_achievement.name, v_achievement.description, v_achievement.icon)
          RETURNING id INTO v_new_badge;
          
          RETURN QUERY SELECT v_achievement.id, v_achievement.name, TRUE;
        END IF;
        
      ELSE
        NULL;
    END CASE;
  END LOOP;
  
  RETURN;
END;
$$;

-- 4. Create trigger function to auto-evaluate after relevant changes
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

-- 5. Attach triggers to relevant tables
DROP TRIGGER IF EXISTS evaluate_achievements_on_progress ON public.user_progress;
CREATE TRIGGER evaluate_achievements_on_progress
  AFTER INSERT OR UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_achievement_evaluation();

DROP TRIGGER IF EXISTS evaluate_achievements_on_user_update ON public.users;
CREATE TRIGGER evaluate_achievements_on_user_update
  AFTER UPDATE OF xp, level, streak ON public.users
  FOR EACH ROW
  WHEN (OLD.xp IS DISTINCT FROM NEW.xp OR 
        OLD.level IS DISTINCT FROM NEW.level OR 
        OLD.streak IS DISTINCT FROM NEW.streak)
  EXECUTE FUNCTION public.trigger_achievement_evaluation();

DROP TRIGGER IF EXISTS evaluate_achievements_on_chat ON public.chat_history;
CREATE TRIGGER evaluate_achievements_on_chat
  AFTER INSERT ON public.chat_history
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_achievement_evaluation();

-- 6. Create manual evaluation RPC (for frontend to call)
CREATE OR REPLACE FUNCTION public.check_my_achievements()
RETURNS TABLE(
  achievement_id TEXT,
  achievement_name TEXT,
  newly_unlocked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.evaluate_achievements(auth.uid());
END;
$$;

-- 7. Grant permissions
GRANT SELECT ON public.achievement_definitions TO authenticated;
GRANT SELECT ON public.user_achievement_progress TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_my_achievements() TO authenticated;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_badges_user_badge_name ON public.badges(user_id, badge_name);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON public.user_progress(user_id, completed) WHERE completed = TRUE;
CREATE INDEX IF NOT EXISTS idx_chat_history_user_timestamp ON public.chat_history(user_id, timestamp DESC);

