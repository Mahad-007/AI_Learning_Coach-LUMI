-- Fix missing tables and optimize performance
-- Run this migration to fix database issues

-- Create user_activity_metrics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_activity_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  activity_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lesson_progress table if it doesn't exist (for lesson tracking)
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  current_section TEXT,
  percent_complete INTEGER DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),
  is_completed BOOLEAN DEFAULT FALSE,
  time_spent INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Migrate data from user_progress to lesson_progress if user_progress exists and has data
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_progress') THEN
    -- Copy data from user_progress to lesson_progress where lesson_id exists
    INSERT INTO public.lesson_progress (
      id, user_id, lesson_id, current_section, percent_complete, 
      is_completed, time_spent, completed_at, last_accessed_at, created_at, updated_at
    )
    SELECT 
      id, user_id, lesson_id, 
      NULL as current_section,
      CASE WHEN completed THEN 100 ELSE 0 END as percent_complete,
      completed as is_completed,
      time_spent,
      completed_at,
      updated_at as last_accessed_at,
      created_at,
      updated_at
    FROM public.user_progress
    WHERE lesson_id IS NOT NULL
    ON CONFLICT (user_id, lesson_id) DO NOTHING;
  END IF;
END $$;

-- Create user_achievement_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_achievement_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  lessons_completed INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  perfect_scores INTEGER DEFAULT 0,
  chat_messages INTEGER DEFAULT 0,
  login_streak INTEGER DEFAULT 0,
  whiteboard_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_metrics_user_id ON public.user_activity_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_metrics_type ON public.user_activity_metrics(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_metrics_user_type ON public.user_activity_metrics(user_id, activity_type);

-- Indexes for lesson_progress
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON public.lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed ON public.lesson_progress(is_completed) WHERE is_completed = true;

-- Index for user_achievement_progress
CREATE INDEX IF NOT EXISTS idx_user_achievement_progress_user_id ON public.user_achievement_progress(user_id);

-- Enable RLS
ALTER TABLE public.user_activity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievement_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_activity_metrics
CREATE POLICY "Users can view their own activity metrics"
  ON public.user_activity_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity metrics"
  ON public.user_activity_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity metrics"
  ON public.user_activity_metrics FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for lesson_progress
CREATE POLICY "Users can view their own lesson progress"
  ON public.lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson progress"
  ON public.lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress"
  ON public.lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lesson progress"
  ON public.lesson_progress FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_achievement_progress
CREATE POLICY "Users can view their own achievement progress"
  ON public.user_achievement_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievement progress"
  ON public.user_achievement_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievement progress"
  ON public.user_achievement_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Add indexes to existing tables for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON public.badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_earned_at ON public.badges(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON public.chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_user_id ON public.lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON public.lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON public.leaderboard(rank) WHERE rank > 0;
CREATE INDEX IF NOT EXISTS idx_leaderboard_total_xp ON public.leaderboard(total_xp DESC);

-- Optimize users table queries
CREATE INDEX IF NOT EXISTS idx_users_xp_level ON public.users(xp DESC, level DESC);

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS set_updated_at ON public.user_activity_metrics;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_activity_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.lesson_progress;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.user_achievement_progress;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_achievement_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Ensure users table has proper constraints
ALTER TABLE public.users 
  ALTER COLUMN xp SET DEFAULT 0,
  ALTER COLUMN level SET DEFAULT 1,
  ALTER COLUMN streak SET DEFAULT 0;

-- Add constraint to prevent negative XP
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_xp_non_negative;
ALTER TABLE public.users ADD CONSTRAINT check_xp_non_negative CHECK (xp >= 0);

-- Add constraint to prevent level < 1
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_level_positive;
ALTER TABLE public.users ADD CONSTRAINT check_level_positive CHECK (level >= 1);

-- Optimize leaderboard updates with a function
CREATE OR REPLACE FUNCTION public.update_leaderboard_entry(p_user_id UUID, p_xp_change INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.leaderboard (user_id, total_xp, weekly_xp, monthly_xp, rank)
  VALUES (p_user_id, p_xp_change, p_xp_change, p_xp_change, 0)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_xp = leaderboard.total_xp + p_xp_change,
    weekly_xp = leaderboard.weekly_xp + p_xp_change,
    monthly_xp = leaderboard.monthly_xp + p_xp_change,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.update_leaderboard_entry TO authenticated;

-- Vacuum and analyze for performance
VACUUM ANALYZE public.users;
VACUUM ANALYZE public.badges;
VACUUM ANALYZE public.leaderboard;
VACUUM ANALYZE public.chat_history;
VACUUM ANALYZE public.lessons;

-- Add comments for documentation
COMMENT ON TABLE public.user_activity_metrics IS 'Tracks user activity for analytics and performance monitoring';
COMMENT ON TABLE public.lesson_progress IS 'Tracks user progress through lessons with completion status and time spent';
COMMENT ON TABLE public.user_achievement_progress IS 'Aggregated achievement progress metrics for each user';

-- Function to initialize achievement progress for new users
CREATE OR REPLACE FUNCTION public.initialize_user_achievement_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_achievement_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-initialize achievement progress
DROP TRIGGER IF EXISTS init_achievement_progress ON public.users;
CREATE TRIGGER init_achievement_progress
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_achievement_progress();

-- Create or update RPC functions for lesson progress
-- These functions provide backward compatibility between user_progress and lesson_progress tables

CREATE OR REPLACE FUNCTION public.update_lesson_progress_time(
  p_user_id UUID,
  p_lesson_id UUID,
  p_additional_seconds INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Try lesson_progress table first
  INSERT INTO public.lesson_progress (user_id, lesson_id, time_spent, last_accessed_at)
  VALUES (p_user_id, p_lesson_id, p_additional_seconds, NOW())
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET
    time_spent = lesson_progress.time_spent + p_additional_seconds,
    last_accessed_at = NOW(),
    updated_at = NOW();
    
  -- Also update user_progress if it exists for backward compatibility
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_progress') THEN
    INSERT INTO public.user_progress (user_id, lesson_id, time_spent, updated_at)
    VALUES (p_user_id, p_lesson_id, p_additional_seconds, NOW())
    ON CONFLICT (user_id, lesson_id)
    DO UPDATE SET
      time_spent = user_progress.time_spent + p_additional_seconds,
      updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_lesson_progress(
  p_user_id UUID,
  p_lesson_id UUID,
  p_current_section TEXT,
  p_percent_complete INTEGER,
  p_is_completed BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  -- Update lesson_progress table
  INSERT INTO public.lesson_progress (
    user_id, lesson_id, current_section, percent_complete, 
    is_completed, completed_at, last_accessed_at
  )
  VALUES (
    p_user_id, p_lesson_id, p_current_section, p_percent_complete,
    p_is_completed, 
    CASE WHEN p_is_completed THEN NOW() ELSE NULL END,
    NOW()
  )
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET
    current_section = p_current_section,
    percent_complete = GREATEST(lesson_progress.percent_complete, p_percent_complete),
    is_completed = p_is_completed OR lesson_progress.is_completed,
    completed_at = CASE 
      WHEN p_is_completed AND lesson_progress.completed_at IS NULL THEN NOW()
      ELSE lesson_progress.completed_at
    END,
    last_accessed_at = NOW(),
    updated_at = NOW();
    
  -- Also update user_progress if it exists for backward compatibility
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_progress') THEN
    INSERT INTO public.user_progress (
      user_id, lesson_id, completed, completed_at, updated_at
    )
    VALUES (
      p_user_id, p_lesson_id, p_is_completed,
      CASE WHEN p_is_completed THEN NOW() ELSE NULL END,
      NOW()
    )
    ON CONFLICT (user_id, lesson_id)
    DO UPDATE SET
      completed = p_is_completed OR user_progress.completed,
      completed_at = CASE 
        WHEN p_is_completed AND user_progress.completed_at IS NULL THEN NOW()
        ELSE user_progress.completed_at
      END,
      updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.update_lesson_progress_time(UUID, UUID, INTEGER) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_lesson_progress(UUID, UUID, TEXT, INTEGER, BOOLEAN) TO anon, authenticated, service_role;

