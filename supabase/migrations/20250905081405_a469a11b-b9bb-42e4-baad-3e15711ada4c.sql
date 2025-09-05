-- SECURITY FIX: Strengthen RLS policies for customer data protection

-- First, let's check current RLS policies and enhance them to prevent unauthorized access to customer data

-- Update appointments table RLS policies to be more restrictive
DROP POLICY IF EXISTS "Users can manage their company appointments" ON public.appointments;

-- Create stricter policies for appointments table containing customer data
CREATE POLICY "Company owners can view their appointments" 
ON public.appointments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = appointments.company_id 
    AND companies.user_id = auth.uid()
  )
);

CREATE POLICY "Company owners can insert their appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = appointments.company_id 
    AND companies.user_id = auth.uid()
  )
);

CREATE POLICY "Company owners can update their appointments" 
ON public.appointments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = appointments.company_id 
    AND companies.user_id = auth.uid()
  )
);

CREATE POLICY "Company owners can delete their appointments" 
ON public.appointments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = appointments.company_id 
    AND companies.user_id = auth.uid()
  )
);

-- Strengthen leads table RLS policies (contains customer contact info)
DROP POLICY IF EXISTS "Users can manage their company leads" ON public.leads;

CREATE POLICY "Company owners can view their leads" 
ON public.leads 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = leads.company_id 
    AND companies.user_id = auth.uid()
  )
);

CREATE POLICY "Company owners can insert their leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = leads.company_id 
    AND companies.user_id = auth.uid()
  )
);

CREATE POLICY "Company owners can update their leads" 
ON public.leads 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = leads.company_id 
    AND companies.user_id = auth.uid()
  )
);

CREATE POLICY "Company owners can delete their leads" 
ON public.leads 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = leads.company_id 
    AND companies.user_id = auth.uid()
  )
);

-- Add data masking function for sensitive customer data
CREATE OR REPLACE FUNCTION public.mask_customer_data(
  user_id uuid,
  company_id uuid,
  data_field text
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user owns the company
  IF EXISTS (
    SELECT 1 FROM public.companies 
    WHERE id = company_id AND user_id = mask_customer_data.user_id
  ) THEN
    RETURN data_field;
  ELSE
    -- Return masked data for unauthorized access attempts
    RETURN '***MASKED***';
  END IF;
END;
$$;

-- Create audit table for tracking access to sensitive customer data
CREATE TABLE public.customer_data_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_id UUID,
  table_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')),
  customer_email TEXT,
  customer_phone TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on audit table
ALTER TABLE public.customer_data_audit ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own audit logs
CREATE POLICY "Users can view their own audit logs" 
ON public.customer_data_audit 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create function to log customer data access
CREATE OR REPLACE FUNCTION public.log_customer_data_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to customer data
  INSERT INTO public.customer_data_audit (
    user_id,
    company_id,
    table_name,
    action,
    customer_email,
    customer_phone,
    accessed_at
  ) VALUES (
    auth.uid(),
    COALESCE(NEW.company_id, OLD.company_id),
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.customer_email, OLD.customer_email, NEW.email, OLD.email),
    COALESCE(NEW.customer_phone, OLD.customer_phone, NEW.phone, OLD.phone),
    now()
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Add audit triggers to tables with customer data
CREATE TRIGGER audit_appointments_customer_data
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.log_customer_data_access();

CREATE TRIGGER audit_leads_customer_data
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.log_customer_data_access();

-- Add additional security constraints
-- Prevent direct access to customer data without company context
ALTER TABLE public.appointments ADD CONSTRAINT check_company_id_not_null 
  CHECK (company_id IS NOT NULL);

ALTER TABLE public.leads ADD CONSTRAINT check_company_id_not_null 
  CHECK (company_id IS NOT NULL);

-- Add data retention policy function
CREATE OR REPLACE FUNCTION public.cleanup_old_customer_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete old leads older than 2 years that haven't been converted
  DELETE FROM public.leads 
  WHERE created_at < now() - INTERVAL '2 years' 
  AND status NOT IN ('converted', 'appointment_booked');
  
  -- Delete old appointments older than 5 years
  DELETE FROM public.appointments 
  WHERE created_at < now() - INTERVAL '5 years';
  
  -- Delete old audit logs older than 1 year
  DELETE FROM public.customer_data_audit 
  WHERE accessed_at < now() - INTERVAL '1 year';
END;
$$;

-- Create indexes for performance on security-critical queries
CREATE INDEX idx_appointments_company_user ON public.appointments(company_id, customer_email);
CREATE INDEX idx_leads_company_user ON public.leads(company_id, email);
CREATE INDEX idx_customer_audit_user_time ON public.customer_data_audit(user_id, accessed_at);

-- Grant appropriate permissions
GRANT SELECT ON public.customer_data_audit TO authenticated;
GRANT EXECUTE ON FUNCTION public.mask_customer_data(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_customer_data() TO authenticated;