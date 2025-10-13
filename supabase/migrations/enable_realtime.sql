-- Enable Realtime for tables that need live updates
-- This ensures UI updates instantly when data changes

-- Enable realtime on users table (for XP/level updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Enable realtime on badges table (for achievement unlocks)
ALTER PUBLICATION supabase_realtime ADD TABLE public.badges;

-- Enable realtime on leaderboard table (for rank updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;

