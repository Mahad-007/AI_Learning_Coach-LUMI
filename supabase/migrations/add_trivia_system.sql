-- Trivia Battle Room System Database Schema
-- This creates all tables and functions for multiplayer trivia battles

-- Trivia Rooms Table
CREATE TABLE IF NOT EXISTS public.trivia_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  room_code TEXT UNIQUE,
  room_name TEXT DEFAULT 'Trivia Battle',
  is_active BOOLEAN DEFAULT TRUE,
  game_started BOOLEAN DEFAULT FALSE,
  max_players INTEGER DEFAULT 50,
  mode TEXT NOT NULL CHECK (mode IN ('global', 'private', 'friends')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

-- Trivia Participants Table
CREATE TABLE IF NOT EXISTS public.trivia_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.trivia_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Trivia Questions Pool Table
CREATE TABLE IF NOT EXISTS public.trivia_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trivia Game Questions (Active game questions)
CREATE TABLE IF NOT EXISTS public.trivia_game_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.trivia_rooms(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.trivia_questions(id),
  question_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trivia Answers (Player responses)
CREATE TABLE IF NOT EXISTS public.trivia_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.trivia_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.trivia_questions(id),
  answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER, -- in seconds
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trivia_rooms_code ON public.trivia_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_trivia_rooms_active ON public.trivia_rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_trivia_participants_room ON public.trivia_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_trivia_participants_user ON public.trivia_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_trivia_game_questions_room ON public.trivia_game_questions(room_id);
CREATE INDEX IF NOT EXISTS idx_trivia_answers_room ON public.trivia_answers(room_id);

-- Enable RLS
ALTER TABLE public.trivia_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trivia_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trivia_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trivia_game_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trivia_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active rooms" ON public.trivia_rooms
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can create rooms" ON public.trivia_rooms
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update own rooms" ON public.trivia_rooms
  FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Users can view participants in their rooms" ON public.trivia_participants
  FOR SELECT USING (
    room_id IN (SELECT room_id FROM public.trivia_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can join rooms" ON public.trivia_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms" ON public.trivia_participants
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view questions" ON public.trivia_questions
  FOR SELECT USING (true);

CREATE POLICY "Users can view game questions in their rooms" ON public.trivia_game_questions
  FOR SELECT USING (
    room_id IN (SELECT room_id FROM public.trivia_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view answers" ON public.trivia_answers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can submit answers" ON public.trivia_answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function: Generate unique room code
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN := TRUE;
BEGIN
  WHILE exists LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    SELECT COUNT(*) > 0 INTO exists FROM public.trivia_rooms WHERE room_code = code AND is_active = TRUE;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-cleanup if host leaves
CREATE OR REPLACE FUNCTION cleanup_trivia_room_on_host_leave()
RETURNS TRIGGER AS $$
BEGIN
  -- If host leaves and game hasn't started, delete room
  IF OLD.user_id IN (SELECT host_id FROM public.trivia_rooms WHERE id = OLD.room_id AND game_started = FALSE) THEN
    DELETE FROM public.trivia_rooms WHERE id = OLD.room_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_room_on_host_leave
  AFTER DELETE ON public.trivia_participants
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_trivia_room_on_host_leave();

-- Grant permissions
GRANT ALL ON public.trivia_rooms TO authenticated;
GRANT ALL ON public.trivia_participants TO authenticated;
GRANT ALL ON public.trivia_questions TO authenticated;
GRANT ALL ON public.trivia_game_questions TO authenticated;
GRANT ALL ON public.trivia_answers TO authenticated;
GRANT EXECUTE ON FUNCTION generate_room_code() TO authenticated;

