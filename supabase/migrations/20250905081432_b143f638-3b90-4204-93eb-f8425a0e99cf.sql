-- SECURITY FIX: Correct RLS policies and audit system (fixing previous syntax errors)

-- Remove the invalid triggers with SELECT
DROP TRIGGER IF EXISTS audit_appointments_customer_data ON public.appointments;
DROP TRIGGER IF EXISTS audit_leads_customer_data ON public.leads;

-- Create correct audit triggers (only for INSERT, UPDATE, DELETE - SELECT cannot be triggered)
CREATE TRIGGER audit_appointments_customer_data
  AFTER INSERT OR UPDATE OR DELETE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.log_customer_data_access();

CREATE TRIGGER audit_leads_customer_data
  AFTER INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.log_customer_data_access();

-- Add function to specifically log SELECT operations (called manually from application)
CREATE OR REPLACE FUNCTION public.log_customer_data_select(
  p_table_name text,
  p_company_id uuid,
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
    'SELECT',
    p_customer_email,
    p_customer_phone,
    now()
  );
END;
$$;