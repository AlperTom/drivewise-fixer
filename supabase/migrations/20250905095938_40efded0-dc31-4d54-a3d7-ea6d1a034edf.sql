-- Fix Critical Security Issues: Enhanced RLS Policies for Appointments Table

-- First, drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can manage their company appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can view their company appointments" ON public.appointments;

-- Create granular RLS policies for appointments table with proper access control
CREATE POLICY "Users can view their company appointments" 
ON public.appointments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE id = appointments.company_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert appointments for their company" 
ON public.appointments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE id = appointments.company_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their company appointments" 
ON public.appointments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE id = appointments.company_id 
    AND user_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE id = appointments.company_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their company appointments" 
ON public.appointments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE id = appointments.company_id 
    AND user_id = auth.uid()
  )
);

-- Create security definer function for appointment access validation
CREATE OR REPLACE FUNCTION public.validate_appointment_access(
  appointment_id uuid, 
  user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.appointments a
    JOIN public.companies c ON c.id = a.company_id
    WHERE a.id = appointment_id 
    AND c.user_id = user_id
  );
END;
$$;

-- Create function to mask sensitive appointment data for unauthorized access
CREATE OR REPLACE FUNCTION public.mask_appointment_data(
  check_user_id uuid, 
  appointment_id uuid, 
  data_field text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has access to this appointment
  IF public.validate_appointment_access(appointment_id, check_user_id) THEN
    RETURN data_field;
  ELSE
    -- Return masked data for unauthorized access attempts
    RETURN '***MASKED***';
  END IF;
END;
$$;

-- Enhanced security audit logging for appointment access
CREATE OR REPLACE FUNCTION public.log_appointment_access(
  p_appointment_id uuid,
  p_action text DEFAULT 'SELECT',
  p_customer_email text DEFAULT NULL,
  p_customer_phone text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  -- Get company_id from appointment
  SELECT company_id INTO v_company_id 
  FROM public.appointments 
  WHERE id = p_appointment_id;
  
  -- Log the access
  INSERT INTO public.customer_data_audit (
    user_id,
    company_id,
    table_name,
    action,
    customer_email,
    customer_phone,
    accessed_at,
    additional_data
  ) VALUES (
    auth.uid(),
    v_company_id,
    'appointments',
    p_action,
    p_customer_email,
    p_customer_phone,
    now(),
    jsonb_build_object('appointment_id', p_appointment_id)
  );
END;
$$;

-- Create trigger to automatically log appointment access
CREATE OR REPLACE FUNCTION public.trigger_log_appointment_access()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Log the access attempt
  PERFORM public.log_appointment_access(
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    COALESCE(NEW.customer_email, OLD.customer_email),
    COALESCE(NEW.customer_phone, OLD.customer_phone)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for appointment access logging
DROP TRIGGER IF EXISTS appointment_access_audit ON public.appointments;
CREATE TRIGGER appointment_access_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_log_appointment_access();

-- Enhanced security for widget API key validation with rate limiting
CREATE OR REPLACE FUNCTION public.validate_widget_api_key_secure(api_key_input text, client_ip text DEFAULT NULL)
RETURNS TABLE(widget_id uuid, company_id uuid, company_name text, theme jsonb, settings jsonb, rate_limited boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_request timestamp;
  v_request_count integer;
BEGIN
  -- Basic rate limiting check (simple implementation)
  IF client_ip IS NOT NULL THEN
    SELECT COUNT(*), MAX(created_at) 
    INTO v_request_count, v_last_request
    FROM public.security_audit 
    WHERE ip_address = client_ip 
    AND created_at > now() - interval '1 minute';
    
    -- If more than 60 requests per minute, return rate limited
    IF v_request_count > 60 THEN
      RETURN QUERY SELECT NULL::uuid, NULL::uuid, NULL::text, NULL::jsonb, NULL::jsonb, true;
      RETURN;
    END IF;
  END IF;
  
  -- Validate API key
  RETURN QUERY
  SELECT 
    wc.id as widget_id,
    wc.company_id,
    c.company_name,
    wc.theme,
    wc.settings,
    false as rate_limited
  FROM widget_configs wc
  JOIN companies c ON c.id = wc.company_id
  WHERE wc.api_key = api_key_input 
  AND wc.is_active = true;
  
  -- Log the API key validation attempt
  INSERT INTO public.security_audit (
    event_type,
    ip_address,
    user_agent,
    details,
    created_at
  ) VALUES (
    'widget_api_key_validation',
    client_ip,
    'widget_request',
    jsonb_build_object('api_key_provided', api_key_input IS NOT NULL),
    now()
  );
END;
$$;