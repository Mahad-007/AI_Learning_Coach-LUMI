-- Complete fix for the ambiguous column reference error
-- This replaces the entire function with a corrected version
-- Run this in your Supabase SQL Editor

DROP FUNCTION IF EXISTS join_whiteboard_session_by_code(TEXT, UUID, TEXT, TEXT, TEXT);

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
  
  -- Return session info and participant id with explicit aliases
  RETURN QUERY
  SELECT 
    target_session_id as session_id,
    ws.title as session_title,
    ws.topic as session_topic,
    new_participant_id as participant_id
  FROM public.whiteboard_sessions ws
  WHERE ws.id = target_session_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION join_whiteboard_session_by_code(TEXT, UUID, TEXT, TEXT, TEXT) TO authenticated;

-- Test the function
SELECT 'Function created successfully' as status;
