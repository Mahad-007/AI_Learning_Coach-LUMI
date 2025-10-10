-- Add quiz completion tracking and XP system enhancements

-- Add quiz tracking columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS quizzes_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quizzes_passed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_quiz_score INTEGER DEFAULT 0;

-- Create quiz_results table to track individual quiz attempts
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('from_chat', 'by_topic')),
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score_percentage NUMERIC(5,2) NOT NULL,
  xp_earned INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON public.quiz_results(completed_at DESC);

-- Enable RLS
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own quiz results" ON public.quiz_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quiz results" ON public.quiz_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to award XP and update user stats
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

  -- Return results
  RETURN QUERY SELECT v_new_xp, v_new_level, v_leveled_up;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete quiz and award XP
CREATE OR REPLACE FUNCTION complete_quiz(
  p_user_id UUID,
  p_quiz_type TEXT,
  p_topic TEXT,
  p_difficulty TEXT,
  p_total_questions INTEGER,
  p_correct_answers INTEGER,
  p_xp_earned INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_quiz_id UUID;
  v_score_percentage NUMERIC(5,2);
  v_passed BOOLEAN;
BEGIN
  -- Calculate score percentage
  v_score_percentage := (p_correct_answers::NUMERIC / p_total_questions::NUMERIC) * 100;
  v_passed := v_score_percentage >= 60;

  -- Insert quiz result
  INSERT INTO public.quiz_results (
    user_id,
    quiz_type,
    topic,
    difficulty,
    total_questions,
    correct_answers,
    score_percentage,
    xp_earned,
    passed
  ) VALUES (
    p_user_id,
    p_quiz_type,
    p_topic,
    p_difficulty,
    p_total_questions,
    p_correct_answers,
    v_score_percentage,
    p_xp_earned,
    v_passed
  ) RETURNING id INTO v_quiz_id;

  -- Update user quiz stats
  UPDATE public.users
  SET 
    quizzes_completed = quizzes_completed + 1,
    quizzes_passed = quizzes_passed + CASE WHEN v_passed THEN 1 ELSE 0 END,
    total_quiz_score = total_quiz_score + p_correct_answers,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Award XP
  PERFORM award_xp_to_user(p_user_id, p_xp_earned);

  RETURN v_quiz_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON public.quiz_results TO authenticated;
GRANT EXECUTE ON FUNCTION award_xp_to_user(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_quiz(UUID, TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER) TO authenticated;

