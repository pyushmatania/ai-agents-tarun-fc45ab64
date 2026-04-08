-- =============================================================
-- SECURITY HARDENING MIGRATION
-- Fixes: RLS WITH CHECK, FK constraints, leaderboard PII, indexes
-- =============================================================

-- A) RLS UPDATE POLICY HARDENING
-- Add WITH CHECK to prevent user_id hijacking on UPDATE

-- profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_progress
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;
CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_context
DROP POLICY IF EXISTS "Users can update own context" ON public.user_context;
CREATE POLICY "Users can update own context"
  ON public.user_context FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- custom_interests
DROP POLICY IF EXISTS "Users can update own custom interests" ON public.custom_interests;
CREATE POLICY "Users can update own custom interests"
  ON public.custom_interests FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- leaderboard
DROP POLICY IF EXISTS "Users can update own leaderboard entry" ON public.leaderboard;
CREATE POLICY "Users can update own leaderboard entry"
  ON public.leaderboard FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- B) MISSING FOREIGN KEYS (idempotent)

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_user_id_fkey'
  ) THEN
    ALTER TABLE public.chat_messages
      ADD CONSTRAINT chat_messages_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'custom_interests_user_id_fkey'
  ) THEN
    ALTER TABLE public.custom_interests
      ADD CONSTRAINT custom_interests_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_context_user_id_fkey'
  ) THEN
    ALTER TABLE public.user_context
      ADD CONSTRAINT user_context_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leaderboard_user_id_fkey'
  ) THEN
    ALTER TABLE public.leaderboard
      ADD CONSTRAINT leaderboard_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;


-- C) LEADERBOARD PII PROTECTION

-- Enable pgcrypto for hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create public view that hides user_id
CREATE OR REPLACE VIEW public.leaderboard_public
  WITH (security_invoker = true)
AS
  SELECT
    display_name,
    xp,
    weekly_xp,
    level,
    league,
    updated_at,
    encode(digest(user_id::text, 'sha256'), 'hex') AS public_id
  FROM public.leaderboard;

GRANT SELECT ON public.leaderboard_public TO authenticated;
GRANT SELECT ON public.leaderboard_public TO anon;

-- Replace the open SELECT policy with a user-scoped one
DROP POLICY IF EXISTS "Leaderboard is viewable by authenticated users" ON public.leaderboard;
CREATE POLICY "Users can view own leaderboard row"
  ON public.leaderboard FOR SELECT TO authenticated
  USING (auth.uid() = user_id);


-- D) PERFORMANCE INDEXES

CREATE INDEX IF NOT EXISTS idx_leaderboard_weekly_xp ON public.leaderboard(weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_xp ON public.leaderboard(xp DESC);
