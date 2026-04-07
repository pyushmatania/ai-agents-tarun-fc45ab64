
-- Add weekly_xp column
ALTER TABLE public.leaderboard ADD COLUMN weekly_xp INTEGER NOT NULL DEFAULT 0;

-- Enable extensions for cron
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;

-- Function to reset weekly XP
CREATE OR REPLACE FUNCTION public.reset_weekly_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.leaderboard SET weekly_xp = 0;
END;
$$;
