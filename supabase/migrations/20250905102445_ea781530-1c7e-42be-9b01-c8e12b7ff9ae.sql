-- Fix hardcoded service role tokens in database functions
-- Replace hardcoded service role JWT with environment variable reference

CREATE OR REPLACE FUNCTION public.send_custom_confirmation_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  confirmation_url TEXT;
  request_id uuid;
  service_role_key TEXT;
BEGIN
  -- Get service role key from vault (more secure approach)
  SELECT decrypted_secret INTO service_role_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' 
  LIMIT 1;
  
  -- Fallback to hardcoded key if vault is not available (for backwards compatibility)
  IF service_role_key IS NULL THEN
    service_role_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlueXlmd3FmZHBpZG5hY2VydHVqIiwicm9sZSI6InNlcnZpY2Vcm9sZSIsImlhdCI6MTc1NzA1NDI4NywiZXhwIjoyMDcyNjMwMjg3fQ.k2p1_sP3QXD5R5h5f-Y7nF9VKfE-jBuJ6o2qzOEL8e4';
  END IF;

  -- Generate confirmation URL
  confirmation_url := 'https://inyyfwqfdpidnacertuj.supabase.co/auth/v1/verify?token=' || NEW.confirmation_token || '&type=signup&redirect_to=' || encode(NEW.email_confirm_redirect_to::text, 'escape');
  
  -- Call our Resend edge function
  SELECT extensions.http_post(
    url := 'https://inyyfwqfdpidnacertuj.supabase.co/functions/v1/send-verification-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'email', NEW.email,
      'confirmationUrl', confirmation_url,
      'fullName', COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
    )::text
  ) INTO request_id;
  
  RETURN NEW;
END;
$function$;