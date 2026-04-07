
CREATE TABLE public.custom_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own custom interests"
ON public.custom_interests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own custom interests"
ON public.custom_interests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom interests"
ON public.custom_interests FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom interests"
ON public.custom_interests FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_custom_interests_updated_at
BEFORE UPDATE ON public.custom_interests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_custom_interests_user_id ON public.custom_interests(user_id);
CREATE INDEX idx_custom_interests_category ON public.custom_interests(category);
