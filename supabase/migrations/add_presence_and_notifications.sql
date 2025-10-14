-- Presence and Notifications for Friends Battle

-- User presence table
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online','offline','away')),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Simple notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- e.g. 'trivia_invite', 'friend_request'
  payload JSONB NOT NULL DEFAULT '{}', -- arbitrary data like room_id, room_code, from_user
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at
  ON public.notifications(user_id, created_at DESC);

-- Optional: trivia invites table for tracking responses
CREATE TABLE IF NOT EXISTS public.trivia_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.trivia_rooms(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trivia_invites_to_user ON public.trivia_invites(to_user_id, status);

-- RLS (basic, allow users to see their own notifications and presence)
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trivia_invites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY user_presence_self ON public.user_presence
    FOR SELECT USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY notifications_self ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY notifications_insert_self ON public.notifications
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY trivia_invites_self ON public.trivia_invites
    FOR SELECT USING (auth.uid() IN (to_user_id, from_user_id))
    WITH CHECK (auth.uid() IN (to_user_id, from_user_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


