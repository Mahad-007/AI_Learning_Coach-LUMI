-- Friends system: tables, policies, and RPCs (presence-aware)

-- 1) Tables
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);

-- Prevent duplicate or self requests
CREATE UNIQUE INDEX IF NOT EXISTS uniq_friend_request_pair
  ON public.friend_requests(LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id))
  WHERE status IN ('pending','accepted');

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY friend_requests_self_rw ON public.friend_requests
    FOR ALL USING (auth.uid() IN (sender_id, receiver_id))
    WITH CHECK (auth.uid() IN (sender_id, receiver_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Friends table (store bidirectional rows)
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY friends_self_rw ON public.friends
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Presence select policy (allow reading others' status)
DO $$ BEGIN
  -- Add an additional permissive policy for SELECTs so clients can see friends' status
  CREATE POLICY user_presence_read_all ON public.user_presence
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) RPCs

-- Accept a friend request and create friendship rows
DROP FUNCTION IF EXISTS public.accept_friend_request(uuid);
CREATE OR REPLACE FUNCTION public.accept_friend_request(req_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _sender UUID;
  _receiver UUID;
BEGIN
  SELECT sender_id, receiver_id INTO _sender, _receiver
  FROM public.friend_requests
  WHERE id = req_id AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or not pending';
  END IF;

  UPDATE public.friend_requests
  SET status = 'accepted', responded_at = now()
  WHERE id = req_id;

  -- insert both directions (idempotent via unique constraint)
  INSERT INTO public.friends(user_id, friend_id)
  VALUES (_sender, _receiver)
  ON CONFLICT DO NOTHING;
  INSERT INTO public.friends(user_id, friend_id)
  VALUES (_receiver, _sender)
  ON CONFLICT DO NOTHING;
END; $$;

GRANT EXECUTE ON FUNCTION public.accept_friend_request(uuid) TO anon, authenticated, service_role;

-- Unfriend: remove both rows for the pair using auth.uid()
DROP FUNCTION IF EXISTS public.unfriend_friend(uuid);
CREATE OR REPLACE FUNCTION public.unfriend_friend(p_friend_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.friends
  WHERE (user_id = auth.uid() AND friend_id = p_friend_id)
     OR (user_id = p_friend_id AND friend_id = auth.uid());
END; $$;

GRANT EXECUTE ON FUNCTION public.unfriend_friend(uuid) TO anon, authenticated, service_role;

-- Get friends with presence for a user
DROP FUNCTION IF EXISTS public.get_friends_with_presence(uuid);
CREATE OR REPLACE FUNCTION public.get_friends_with_presence(p_user_id UUID)
RETURNS TABLE (
  friend_id UUID,
  name TEXT,
  username TEXT,
  avatar_url TEXT,
  status TEXT
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT u.id AS friend_id, u.name, u.username, u.avatar_url, COALESCE(up.status,'offline') AS status
  FROM public.friends f
  JOIN public.users u ON u.id = f.friend_id
  LEFT JOIN public.user_presence up ON up.user_id = u.id
  WHERE f.user_id = p_user_id
  ORDER BY u.name;
$$;

GRANT EXECUTE ON FUNCTION public.get_friends_with_presence(uuid) TO anon, authenticated, service_role;


