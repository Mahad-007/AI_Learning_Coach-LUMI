-- Additional tables for Interactive Whiteboard Feature
-- Add these to your existing schema.sql file

-- Whiteboard Sessions table
CREATE TABLE IF NOT EXISTS public.whiteboard_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  host_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  host_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  max_participants INTEGER DEFAULT 10,
  current_participants INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{
    "allow_drawing": true,
    "allow_text": true,
    "allow_shapes": true,
    "allow_images": true,
    "ai_assistant_enabled": true,
    "recording_enabled": false
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Whiteboard Participants table
CREATE TABLE IF NOT EXISTS public.whiteboard_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.whiteboard_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('host', 'teacher', 'student')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  cursor_position JSONB,
  color TEXT DEFAULT '#FF6B6B',
  UNIQUE(session_id, user_id)
);

-- Whiteboard Elements table
CREATE TABLE IF NOT EXISTS public.whiteboard_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.whiteboard_sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('drawing', 'text', 'shape', 'image')),
  data JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  layer INTEGER DEFAULT 1,
  visible BOOLEAN DEFAULT TRUE
);

-- Whiteboard Messages table (for chat)
CREATE TABLE IF NOT EXISTS public.whiteboard_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.whiteboard_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  type TEXT NOT NULL DEFAULT 'chat' CHECK (type IN ('chat', 'system', 'ai'))
);

-- Friend Invitations table
CREATE TABLE IF NOT EXISTS public.friend_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.whiteboard_sessions(id) ON DELETE CASCADE,
  invitation_type TEXT NOT NULL CHECK (invitation_type IN ('global', 'facebook')),
  facebook_friend_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Session Recordings table (for future use)
CREATE TABLE IF NOT EXISTS public.session_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.whiteboard_sessions(id) ON DELETE CASCADE,
  recording_url TEXT NOT NULL,
  duration INTEGER, -- in seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whiteboard_sessions_host_id ON public.whiteboard_sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_whiteboard_sessions_created_at ON public.whiteboard_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whiteboard_sessions_is_active ON public.whiteboard_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_whiteboard_participants_session_id ON public.whiteboard_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_whiteboard_participants_user_id ON public.whiteboard_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_whiteboard_participants_is_active ON public.whiteboard_participants(is_active);

CREATE INDEX IF NOT EXISTS idx_whiteboard_elements_session_id ON public.whiteboard_elements(session_id);
CREATE INDEX IF NOT EXISTS idx_whiteboard_elements_created_by ON public.whiteboard_elements(created_by);
CREATE INDEX IF NOT EXISTS idx_whiteboard_elements_type ON public.whiteboard_elements(type);
CREATE INDEX IF NOT EXISTS idx_whiteboard_elements_layer ON public.whiteboard_elements(layer);

CREATE INDEX IF NOT EXISTS idx_whiteboard_messages_session_id ON public.whiteboard_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_whiteboard_messages_user_id ON public.whiteboard_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_whiteboard_messages_timestamp ON public.whiteboard_messages(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_friend_invitations_from_user_id ON public.friend_invitations(from_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_invitations_to_user_id ON public.friend_invitations(to_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_invitations_session_id ON public.friend_invitations(session_id);
CREATE INDEX IF NOT EXISTS idx_friend_invitations_status ON public.friend_invitations(status);
CREATE INDEX IF NOT EXISTS idx_friend_invitations_expires_at ON public.friend_invitations(expires_at);

CREATE INDEX IF NOT EXISTS idx_session_recordings_session_id ON public.session_recordings(session_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all new tables
ALTER TABLE public.whiteboard_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboard_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboard_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboard_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;

-- Whiteboard Sessions policies
CREATE POLICY "Users can view sessions they participate in" ON public.whiteboard_sessions
  FOR SELECT USING (
    host_id = auth.uid() OR 
    id IN (SELECT session_id FROM public.whiteboard_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create sessions" ON public.whiteboard_sessions
  FOR INSERT WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts can update their sessions" ON public.whiteboard_sessions
  FOR UPDATE USING (host_id = auth.uid());

CREATE POLICY "Hosts can delete their sessions" ON public.whiteboard_sessions
  FOR DELETE USING (host_id = auth.uid());

-- Whiteboard Participants policies
CREATE POLICY "Users can view participants in their sessions" ON public.whiteboard_participants
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.whiteboard_sessions 
      WHERE host_id = auth.uid() OR 
      id IN (SELECT session_id FROM public.whiteboard_participants WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can join sessions" ON public.whiteboard_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation" ON public.whiteboard_participants
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can leave sessions" ON public.whiteboard_participants
  FOR DELETE USING (user_id = auth.uid());

-- Whiteboard Elements policies
CREATE POLICY "Users can view elements in their sessions" ON public.whiteboard_elements
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.whiteboard_sessions 
      WHERE host_id = auth.uid() OR 
      id IN (SELECT session_id FROM public.whiteboard_participants WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Session participants can create elements" ON public.whiteboard_elements
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    session_id IN (
      SELECT id FROM public.whiteboard_sessions 
      WHERE host_id = auth.uid() OR 
      id IN (SELECT session_id FROM public.whiteboard_participants WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own elements" ON public.whiteboard_elements
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own elements" ON public.whiteboard_elements
  FOR DELETE USING (created_by = auth.uid());

-- Whiteboard Messages policies
CREATE POLICY "Users can view messages in their sessions" ON public.whiteboard_messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.whiteboard_sessions 
      WHERE host_id = auth.uid() OR 
      id IN (SELECT session_id FROM public.whiteboard_participants WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Session participants can send messages" ON public.whiteboard_messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    session_id IN (
      SELECT id FROM public.whiteboard_sessions 
      WHERE host_id = auth.uid() OR 
      id IN (SELECT session_id FROM public.whiteboard_participants WHERE user_id = auth.uid())
    )
  );

-- Friend Invitations policies
CREATE POLICY "Users can view their invitations" ON public.friend_invitations
  FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can create invitations" ON public.friend_invitations
  FOR INSERT WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Users can update invitations sent to them" ON public.friend_invitations
  FOR UPDATE USING (to_user_id = auth.uid());

CREATE POLICY "Users can delete their own invitations" ON public.friend_invitations
  FOR DELETE USING (from_user_id = auth.uid());

-- Session Recordings policies
CREATE POLICY "Users can view recordings from their sessions" ON public.session_recordings
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.whiteboard_sessions 
      WHERE host_id = auth.uid() OR 
      id IN (SELECT session_id FROM public.whiteboard_participants WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Hosts can create recordings" ON public.session_recordings
  FOR INSERT WITH CHECK (
    session_id IN (SELECT id FROM public.whiteboard_sessions WHERE host_id = auth.uid())
  );

-- Functions for session management

-- Function to increment session participants count
CREATE OR REPLACE FUNCTION increment_session_participants(session_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.whiteboard_sessions
  SET current_participants = current_participants + 1,
      updated_at = NOW()
  WHERE id = session_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement session participants count
CREATE OR REPLACE FUNCTION decrement_session_participants(session_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.whiteboard_sessions
  SET current_participants = GREATEST(current_participants - 1, 0),
      updated_at = NOW()
  WHERE id = session_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS VOID AS $$
BEGIN
  UPDATE public.friend_invitations
  SET status = 'declined'
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get session statistics
CREATE OR REPLACE FUNCTION get_session_stats(session_id_param UUID)
RETURNS TABLE (
  total_elements BIGINT,
  total_messages BIGINT,
  active_participants BIGINT,
  session_duration INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.whiteboard_elements WHERE session_id = session_id_param),
    (SELECT COUNT(*) FROM public.whiteboard_messages WHERE session_id = session_id_param),
    (SELECT COUNT(*) FROM public.whiteboard_participants WHERE session_id = session_id_param AND is_active = true),
    (SELECT NOW() - created_at FROM public.whiteboard_sessions WHERE id = session_id_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for updated_at
CREATE TRIGGER update_whiteboard_sessions_updated_at BEFORE UPDATE ON public.whiteboard_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whiteboard_elements_updated_at BEFORE UPDATE ON public.whiteboard_elements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a scheduled job to clean up expired invitations (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-invitations', '0 * * * *', 'SELECT cleanup_expired_invitations();');
