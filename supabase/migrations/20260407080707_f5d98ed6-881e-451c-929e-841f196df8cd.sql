
-- Create leaderboard table
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'Learner',
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  league TEXT NOT NULL DEFAULT 'Bronze',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view the leaderboard
CREATE POLICY "Leaderboard is viewable by authenticated users"
  ON public.leaderboard FOR SELECT TO authenticated
  USING (true);

-- Users can insert their own entry
CREATE POLICY "Users can insert own leaderboard entry"
  ON public.leaderboard FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own entry
CREATE POLICY "Users can update own leaderboard entry"
  ON public.leaderboard FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Auto-update timestamp
CREATE TRIGGER update_leaderboard_updated_at
  BEFORE UPDATE ON public.leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
