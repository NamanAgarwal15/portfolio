
CREATE TABLE public.chatbot_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  prompt text NOT NULL,
  response text,
  message_count int NOT NULL DEFAULT 1,
  user_agent text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.chatbot_logs TO service_role;
GRANT SELECT ON public.chatbot_logs TO authenticated;
ALTER TABLE public.chatbot_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read chatbot logs" ON public.chatbot_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
