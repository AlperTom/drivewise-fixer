-- Fix critical security vulnerabilities

-- 1. Remove the overly permissive public SELECT policy on widget_configs
DROP POLICY IF EXISTS "Public widgets can be accessed by API key" ON public.widget_configs;

-- 2. Add proper RLS policies for widget_conversations table
-- Allow edge functions (service role) to insert conversations
CREATE POLICY "Service role can insert widget conversations"
ON public.widget_conversations
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow edge functions to update conversations during chat sessions
CREATE POLICY "Service role can update widget conversations"
ON public.widget_conversations
FOR UPDATE
TO service_role
USING (true);

-- Allow companies to delete their widget conversations for data management
CREATE POLICY "Companies can delete their widget conversations"
ON public.widget_conversations
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM widget_configs wc
  JOIN companies c ON c.id = wc.company_id
  WHERE wc.id = widget_conversations.widget_id 
  AND c.user_id = auth.uid()
));

-- 3. Create a security function for API key validation
CREATE OR REPLACE FUNCTION public.validate_widget_api_key(api_key_input text)
RETURNS TABLE(widget_id uuid, company_id uuid, company_name text, theme jsonb, settings jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wc.id as widget_id,
    wc.company_id,
    c.company_name,
    wc.theme,
    wc.settings
  FROM widget_configs wc
  JOIN companies c ON c.id = wc.company_id
  WHERE wc.api_key = api_key_input 
  AND wc.is_active = true;
END;
$$;

-- 4. Add audit logging for security events
CREATE TABLE IF NOT EXISTS public.security_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  widget_id uuid,
  ip_address inet,
  user_agent text,
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security audit table
ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;

-- Only service role can insert security events
CREATE POLICY "Service role can insert security events"
ON public.security_audit
FOR INSERT
TO service_role
WITH CHECK (true);

-- Companies can view their security events
CREATE POLICY "Companies can view their security events"
ON public.security_audit
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM widget_configs wc
  JOIN companies c ON c.id = wc.company_id
  WHERE wc.id = security_audit.widget_id 
  AND c.user_id = auth.uid()
));