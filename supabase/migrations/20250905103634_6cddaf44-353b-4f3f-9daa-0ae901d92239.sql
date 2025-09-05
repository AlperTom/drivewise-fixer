-- CRITICAL SECURITY FIX: Add comprehensive RLS policies and audit logging

-- Fix companies table - add missing DELETE policy
CREATE POLICY "Users can delete their own company" 
ON public.companies 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix profiles table - add missing DELETE policy  
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Add comprehensive security audit logging for customer data access
CREATE OR REPLACE FUNCTION public.log_customer_data_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive customer data (INSERT, UPDATE, DELETE only)
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
    COALESCE(NEW.company_id, OLD.company_id),
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.customer_email, OLD.customer_email, NEW.email, OLD.email),
    COALESCE(NEW.customer_phone, OLD.customer_phone, NEW.phone, OLD.phone),
    now(),
    jsonb_build_object(
      'record_id', COALESCE(NEW.id, OLD.id),
      'session_info', current_setting('application_name', true)
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers to monitor sensitive data modifications (not SELECT)
CREATE TRIGGER trigger_log_leads_modifications
  AFTER INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.log_customer_data_access();

CREATE TRIGGER trigger_log_appointments_modifications
  AFTER INSERT OR UPDATE OR DELETE ON public.appointments  
  FOR EACH ROW EXECUTE FUNCTION public.log_customer_data_access();

-- Add security event logging for policy updates
INSERT INTO public.security_audit (event_type, details) 
VALUES ('security_policy_update', jsonb_build_object(
  'timestamp', now(),
  'action', 'comprehensive_rls_policy_implementation',
  'tables_secured', ARRAY['companies', 'profiles', 'leads', 'appointments']
));