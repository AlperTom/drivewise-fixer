-- SECURITY FIX: Essential RLS policy updates for customer data protection

-- Create audit table for tracking customer data access
CREATE TABLE IF NOT EXISTS public.customer_data_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_id UUID,
  table_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')),
  customer_email TEXT,
  customer_phone TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.customer_data_audit ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own audit logs
CREATE POLICY "Users can view their own audit logs" 
ON public.customer_data_audit 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create data masking function for unauthorized access
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

-- Create function to manually log customer data access from application
CREATE OR REPLACE FUNCTION public.log_customer_data_access(
  p_table_name text,
  p_company_id uuid,
  p_action text DEFAULT 'SELECT',
  p_customer_email text DEFAULT NULL,
  p_customer_phone text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    p_company_id,
    p_table_name,
    p_action,
    p_customer_email,
    p_customer_phone,
    now()
  );
END;
$$;

-- Add data retention constraints
ALTER TABLE public.appointments ADD CONSTRAINT IF NOT EXISTS check_company_id_not_null 
  CHECK (company_id IS NOT NULL);

ALTER TABLE public.leads ADD CONSTRAINT IF NOT EXISTS check_leads_company_id_not_null 
  CHECK (company_id IS NOT NULL);

-- Create indexes for security-critical queries
CREATE INDEX IF NOT EXISTS idx_appointments_company_security ON public.appointments(company_id, customer_email);
CREATE INDEX IF NOT EXISTS idx_leads_company_security ON public.leads(company_id, email);

-- Grant appropriate permissions
GRANT SELECT ON public.customer_data_audit TO authenticated;
GRANT EXECUTE ON FUNCTION public.mask_customer_data(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_customer_data_access(text, uuid, text, text, text) TO authenticated;