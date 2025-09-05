-- Create a function to call our Resend edge function when a user signs up
CREATE OR REPLACE FUNCTION public.send_custom_confirmation_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  confirmation_url TEXT;
  request_id uuid;
BEGIN
  -- Generate confirmation URL
  confirmation_url := 'https://inyyfwqfdpidnacertuj.supabase.co/auth/v1/verify?token=' || NEW.confirmation_token || '&type=signup&redirect_to=' || encode(NEW.email_confirm_redirect_to::text, 'escape');
  
  -- Call our Resend edge function
  SELECT net.http_post(
    url := 'https://inyyfwqfdpidnacertuj.supabase.co/functions/v1/send-verification-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlueXlmd3FmZHBpZG5hY2VydHVqIiwicm9sZSI6InNlcnZpY2Vcm9sZSIsImlhdCI6MTc1NzA1NDI4NywiZXhwIjoyMDcyNjMwMjg3fQ.k2p1_sP3QXD5R5h5f-Y7nF9VKfE-jBuJ6o2qzOEL8e4'
    ),
    body := jsonb_build_object(
      'email', NEW.email,
      'confirmationUrl', confirmation_url,
      'fullName', COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
    )::text
  ) INTO request_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to send custom confirmation emails
CREATE OR REPLACE TRIGGER on_auth_user_created_send_email
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.confirmation_token IS NOT NULL)
  EXECUTE FUNCTION public.send_custom_confirmation_email();