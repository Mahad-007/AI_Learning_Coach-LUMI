-- Add session codes to whiteboard sessions
-- This migration adds room code functionality similar to trivia system

-- Add room_code column to whiteboard_sessions table
ALTER TABLE public.whiteboard_sessions 
ADD COLUMN IF NOT EXISTS room_code TEXT UNIQUE;

-- Add is_joinable column to control whether session accepts new participants
ALTER TABLE public.whiteboard_sessions 
ADD COLUMN IF NOT EXISTS is_joinable BOOLEAN DEFAULT TRUE;

-- Create index for room_code lookups
CREATE INDEX IF NOT EXISTS idx_whiteboard_sessions_room_code ON public.whiteboard_sessions(room_code);

-- Function: Generate unique whiteboard session code
CREATE OR REPLACE FUNCTION generate_whiteboard_session_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN := TRUE;
BEGIN
  WHILE exists LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    SELECT COUNT(*) > 0 INTO exists FROM public.whiteboard_sessions WHERE room_code = code AND is_active = TRUE;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function: Join whiteboard session by code
CREATE OR REPLACE FUNCTION join_whiteboard_session_by_code(
  session_code TEXT,
  user_id_param UUID,
  user_name_param TEXT,
  user_avatar_param TEXT DEFAULT NULL,
  role_param TEXT DEFAULT 'student'
)
RETURNS TABLE (
  session_id UUID,
  session_title TEXT,
  session_topic TEXT,
  participant_id UUID
) AS $$
DECLARE
  target_session_id UUID;
  new_participant_id UUID;
BEGIN
  -- Find the session by code
  SELECT id INTO target_session_id 
  FROM public.whiteboard_sessions 
  WHERE room_code = session_code 
    AND is_active = TRUE 
    AND is_joinable = TRUE;
  
  IF target_session_id IS NULL THEN
    RAISE EXCEPTION 'Session not found or not joinable';
  END IF;
  
  -- Check if user is already a participant
  IF EXISTS (
    SELECT 1 FROM public.whiteboard_participants 
    WHERE session_id = target_session_id AND user_id = user_id_param
  ) THEN
    RAISE EXCEPTION 'User already a participant in this session';
  END IF;
  
  -- Check session capacity
  IF (
    SELECT current_participants >= max_participants 
    FROM public.whiteboard_sessions 
    WHERE id = target_session_id
  ) THEN
    RAISE EXCEPTION 'Session is full';
  END IF;
  
  -- Add participant
  INSERT INTO public.whiteboard_participants (
    session_id, user_id, user_name, user_avatar, role, color
  ) VALUES (
    target_session_id, 
    user_id_param, 
    user_name_param, 
    user_avatar_param,
    role_param,
    CASE 
      WHEN role_param = 'host' THEN '#FF6B6B'
      WHEN role_param = 'teacher' THEN '#4ECDC4'
      ELSE '#45B7D1'
    END
  ) RETURNING id INTO new_participant_id;
  
  -- Update participant count
  UPDATE public.whiteboard_sessions 
  SET current_participants = current_participants + 1
  WHERE id = target_session_id;
  
  -- Return session info and participant id
  RETURN QUERY
  SELECT 
    ws.id,
    ws.title,
    ws.topic,
    new_participant_id
  FROM public.whiteboard_sessions ws
  WHERE ws.id = target_session_id;
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies to allow joining by code
CREATE POLICY "Users can join sessions by code" ON public.whiteboard_participants
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    session_id IN (
      SELECT id FROM public.whiteboard_sessions 
      WHERE room_code IS NOT NULL 
        AND is_active = TRUE 
        AND is_joinable = TRUE
    )
  );

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_whiteboard_session_code() TO authenticated;
GRANT EXECUTE ON FUNCTION join_whiteboard_session_by_code(TEXT, UUID, TEXT, TEXT, TEXT) TO authenticated;
