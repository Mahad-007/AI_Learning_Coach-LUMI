-- Add missing tables, columns, and RPC functions for learning features
-- Safe to run multiple times (IF NOT EXISTS guards where possible)

-- 1) Create user_generated_summaries table
CREATE TABLE IF NOT EXISTS public.user_generated_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  section_anchor TEXT,
  summary_content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraints: exactly one summary per (user, lesson) when section_anchor is NULL
-- and at most one per (user, lesson, section_anchor) when section_anchor is provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'uniq_summaries_user_lesson_null_anchor'
  ) THEN
    CREATE UNIQUE INDEX uniq_summaries_user_lesson_null_anchor
      ON public.user_generated_summaries(user_id, lesson_id)
      WHERE section_anchor IS NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'uniq_summaries_user_lesson_anchor'
  ) THEN
    CREATE UNIQUE INDEX uniq_summaries_user_lesson_anchor
      ON public.user_generated_summaries(user_id, lesson_id, section_anchor)
      WHERE section_anchor IS NOT NULL;
  END IF;
END $$;

-- Basic RLS (mirror other tables): users can see/insert their own summaries
ALTER TABLE public.user_generated_summaries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_generated_summaries'
      AND policyname = 'Users can view own summaries'
  ) THEN
    CREATE POLICY "Users can view own summaries" ON public.user_generated_summaries
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_generated_summaries'
      AND policyname = 'Users can insert own summaries'
  ) THEN
    CREATE POLICY "Users can insert own summaries" ON public.user_generated_summaries
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 2) Ensure user_progress has expected columns used by the app
DO $$
BEGIN
  -- lessons.difficulty_numeric (used by XP calc)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'lessons' AND column_name = 'difficulty_numeric'
  ) THEN
    ALTER TABLE public.lessons ADD COLUMN difficulty_numeric INTEGER NOT NULL DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'percent_complete'
  ) THEN
    ALTER TABLE public.user_progress ADD COLUMN percent_complete INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'last_section'
  ) THEN
    ALTER TABLE public.user_progress ADD COLUMN last_section TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'download_count'
  ) THEN
    ALTER TABLE public.user_progress ADD COLUMN download_count INTEGER NOT NULL DEFAULT 0;
  END IF;

  -- Add is_completed column if missing (simple boolean mirror of completed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'is_completed'
  ) THEN
    ALTER TABLE public.user_progress ADD COLUMN is_completed BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

-- 3) RPC: update_lesson_progress_time
DROP FUNCTION IF EXISTS public.update_lesson_progress_time(uuid, uuid, integer);
CREATE OR REPLACE FUNCTION public.update_lesson_progress_time(
  p_user_id UUID,
  p_lesson_id UUID,
  p_additional_seconds INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _exists BOOLEAN;
BEGIN
  IF p_additional_seconds IS NULL OR p_additional_seconds <= 0 THEN
    RETURN;
  END IF;

  SELECT TRUE INTO _exists FROM public.user_progress
  WHERE user_id = p_user_id AND lesson_id = p_lesson_id;

  IF _exists THEN
    UPDATE public.user_progress
    SET time_spent = COALESCE(time_spent, 0) + p_additional_seconds,
        updated_at = now()
    WHERE user_id = p_user_id AND lesson_id = p_lesson_id;
  ELSE
    INSERT INTO public.user_progress (user_id, lesson_id, time_spent, created_at, updated_at)
    VALUES (p_user_id, p_lesson_id, GREATEST(p_additional_seconds, 0), now(), now());
  END IF;
END;
$$;

-- 4) RPC: update_lesson_progress
DROP FUNCTION IF EXISTS public.update_lesson_progress(uuid, uuid, text, integer, boolean);
CREATE OR REPLACE FUNCTION public.update_lesson_progress(
  p_user_id UUID,
  p_lesson_id UUID,
  p_last_section TEXT,
  p_percent_complete INTEGER,
  p_is_completed BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _exists BOOLEAN;
  _completed BOOLEAN;
BEGIN
  _completed := COALESCE(p_is_completed, FALSE);

  SELECT TRUE INTO _exists FROM public.user_progress
  WHERE user_id = p_user_id AND lesson_id = p_lesson_id;

  IF _exists THEN
    UPDATE public.user_progress
    SET last_section = COALESCE(p_last_section, last_section),
        percent_complete = COALESCE(p_percent_complete, percent_complete),
        completed = COALESCE(_completed, completed),
        updated_at = now()
    WHERE user_id = p_user_id AND lesson_id = p_lesson_id;
  ELSE
    INSERT INTO public.user_progress (
      user_id, lesson_id, last_section, percent_complete, completed, created_at, updated_at
    ) VALUES (
      p_user_id, p_lesson_id, p_last_section, COALESCE(p_percent_complete, 0), COALESCE(_completed, FALSE), now(), now()
    );
  END IF;
END;
$$;

-- 5) RPC: increment_lesson_download
DROP FUNCTION IF EXISTS public.increment_lesson_download(uuid, uuid);
CREATE OR REPLACE FUNCTION public.increment_lesson_download(
  p_user_id UUID,
  p_lesson_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _exists BOOLEAN;
BEGIN
  SELECT TRUE INTO _exists FROM public.user_progress
  WHERE user_id = p_user_id AND lesson_id = p_lesson_id;

  IF _exists THEN
    UPDATE public.user_progress
    SET download_count = COALESCE(download_count, 0) + 1,
        updated_at = now()
    WHERE user_id = p_user_id AND lesson_id = p_lesson_id;
  ELSE
    INSERT INTO public.user_progress (user_id, lesson_id, download_count, created_at, updated_at)
    VALUES (p_user_id, p_lesson_id, 1, now(), now());
  END IF;
END;
$$;

-- 6) RPC: award_lesson_xp
-- Returns a single row with xp_awarded, new_xp, new_level
DROP FUNCTION IF EXISTS public.award_lesson_xp(uuid, uuid, integer);
CREATE OR REPLACE FUNCTION public.award_lesson_xp(
  p_user_id UUID,
  p_lesson_id UUID,
  p_time_spent_seconds INTEGER
)
RETURNS TABLE (xp_awarded INTEGER, new_xp INTEGER, new_level INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _xp_base INTEGER;
  _difficulty_num INTEGER;
  _mult NUMERIC := 1.0;
  _time_bonus INTEGER := 0;
  _current_xp INTEGER := 0;
  _current_level INTEGER := 1;
  _awarded INTEGER := 0;
  _new_xp INTEGER := 0;
  _new_level INTEGER := 1;
BEGIN
  SELECT COALESCE(xp_reward, 50), COALESCE(difficulty_numeric, 1)
  INTO _xp_base, _difficulty_num
  FROM public.lessons
  WHERE id = p_lesson_id;

  IF _difficulty_num = 2 THEN _mult := 1.5; END IF;
  IF _difficulty_num >= 3 THEN _mult := 2.0; END IF;

  _time_bonus := GREATEST(0, (COALESCE(p_time_spent_seconds, 0) / 300) * 5);
  _awarded := FLOOR(_xp_base * _mult) + _time_bonus;

  SELECT COALESCE(xp, 0), COALESCE(level, 1)
  INTO _current_xp, _current_level
  FROM public.users
  WHERE id = p_user_id;

  _new_xp := _current_xp + _awarded;
  _new_level := FLOOR(SQRT((_new_xp)::NUMERIC / 100))::INT + 1;

  UPDATE public.users
  SET xp = _new_xp,
      level = _new_level,
      updated_at = now()
  WHERE id = p_user_id;

  -- keep leaderboard in sync
  INSERT INTO public.leaderboard (user_id, total_xp, updated_at)
  VALUES (p_user_id, _new_xp, now())
  ON CONFLICT (user_id) DO UPDATE SET total_xp = EXCLUDED.total_xp, updated_at = now();

  -- Mark progress as completed
  PERFORM public.update_lesson_progress(p_user_id, p_lesson_id, '', 100, TRUE);

  RETURN QUERY SELECT _awarded, _new_xp, _new_level;
END;
$$;

-- 7) Optional: allow execution (depending on your roles setup)
GRANT EXECUTE ON FUNCTION public.update_lesson_progress_time(UUID, UUID, INTEGER) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_lesson_progress(UUID, UUID, TEXT, INTEGER, BOOLEAN) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_lesson_download(UUID, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.award_lesson_xp(UUID, UUID, INTEGER) TO anon, authenticated, service_role;


