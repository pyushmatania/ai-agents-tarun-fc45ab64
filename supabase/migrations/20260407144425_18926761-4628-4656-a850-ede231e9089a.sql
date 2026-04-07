-- Create chat_messages table for persistent chat history
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id TEXT NOT NULL DEFAULT 'default',
  tab TEXT NOT NULL DEFAULT 'general' CHECK (tab IN ('curriculum', 'general')),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view own chat messages"
ON public.chat_messages FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own messages
CREATE POLICY "Users can insert own chat messages"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete own chat messages"
ON public.chat_messages FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Index for fast message retrieval
CREATE INDEX idx_chat_messages_user_tab ON public.chat_messages (user_id, tab, created_at);
CREATE INDEX idx_chat_messages_conversation ON public.chat_messages (user_id, conversation_id, created_at);

-- Auto-update timestamp trigger
CREATE TRIGGER update_chat_messages_updated_at
BEFORE UPDATE ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();