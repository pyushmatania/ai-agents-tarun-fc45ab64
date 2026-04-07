
CREATE TABLE public.user_context (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  age_range TEXT,
  gender TEXT,
  education TEXT,
  location TEXT,
  work_experience TEXT,
  job_title TEXT,
  mission_followup JSONB DEFAULT '{}'::jsonb,
  teaching_identity TEXT,
  teaching_mission TEXT,
  teaching_vibe TEXT,
  teaching_brain TEXT,
  brain_track TEXT DEFAULT 'skill',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own context"
ON public.user_context FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own context"
ON public.user_context FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own context"
ON public.user_context FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_user_context_updated_at
BEFORE UPDATE ON public.user_context
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
