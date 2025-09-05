-- Create companies table for client business profiles
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  business_type TEXT NOT NULL DEFAULT 'werkstatt' CHECK (business_type IN ('werkstatt', 'detailing', 'cleaning', 'dealership', 'other')),
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  brand_colors JSONB DEFAULT '{"primary": "#f97316", "secondary": "#1f2937"}',
  description TEXT,
  specialties TEXT[] DEFAULT '{}',
  business_hours JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table for client offerings
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'maintenance' CHECK (category IN ('maintenance', 'repair', 'detailing', 'inspection', 'cleaning', 'tuning', 'other')),
  estimated_duration INTEGER DEFAULT 60, -- minutes
  requires_appointment BOOLEAN DEFAULT true,
  service_details TEXT,
  prerequisites TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pricing rules table
CREATE TABLE public.pricing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  car_type TEXT NOT NULL CHECK (car_type IN ('kleinwagen', 'mittelklasse', 'oberklasse', 'suv', 'transporter', 'motorrad', 'other')),
  base_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  pricing_type TEXT NOT NULL DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'range', 'quote_only')),
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_id, car_type)
);

-- Create quick actions table for customizable chat buttons
CREATE TABLE public.quick_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  action_text TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('message', 'calendar', 'service_inquiry', 'pricing')),
  message_template TEXT,
  icon_name TEXT DEFAULT 'calendar',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calendar integrations table
CREATE TABLE public.calendar_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook', 'calendly')),
  access_token TEXT,
  refresh_token TEXT,
  calendar_id TEXT,
  timezone TEXT DEFAULT 'Europe/Berlin',
  booking_settings JSONB DEFAULT '{"min_advance_hours": 2, "max_days_ahead": 30, "buffer_minutes": 15}',
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chatbot knowledge base table
CREATE TABLE public.chatbot_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('services', 'pricing', 'policies', 'faq', 'general')),
  keywords TEXT[] DEFAULT '{}',
  priority_level INTEGER DEFAULT 5 CHECK (priority_level BETWEEN 1 AND 10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table for lead management
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  session_id TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'appointment_booked', 'converted', 'lost')),
  service_needed TEXT,
  urgency_level TEXT DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'urgent')),
  vehicle_info JSONB DEFAULT '{}',
  estimated_value DECIMAL(10,2),
  source TEXT DEFAULT 'chatbot',
  notes TEXT,
  last_contact TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead activities table for tracking interactions
CREATE TABLE public.lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('message', 'email', 'call', 'appointment', 'quote', 'follow_up')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  service_type TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  calendar_provider TEXT CHECK (calendar_provider IN ('google', 'outlook', 'calendly')),
  external_event_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CRM integrations table
CREATE TABLE public.crm_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  crm_type TEXT NOT NULL CHECK (crm_type IN ('hubspot', 'salesforce', 'pipedrive', 'activecampaign', 'zoho', 'monday')),
  api_credentials JSONB NOT NULL,
  sync_settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "Users can view their own company" ON public.companies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own company" ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company" ON public.companies
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for services
CREATE POLICY "Users can manage their company services" ON public.services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE companies.id = services.company_id 
      AND companies.user_id = auth.uid()
    )
  );

-- Create RLS policies for pricing rules
CREATE POLICY "Users can manage their service pricing" ON public.pricing_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.services s
      JOIN public.companies c ON s.company_id = c.id
      WHERE s.id = pricing_rules.service_id 
      AND c.user_id = auth.uid()
    )
  );

-- Create RLS policies for quick actions
CREATE POLICY "Users can manage their quick actions" ON public.quick_actions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE companies.id = quick_actions.company_id 
      AND companies.user_id = auth.uid()
    )
  );

-- Create RLS policies for calendar integrations
CREATE POLICY "Users can manage their calendar integrations" ON public.calendar_integrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE companies.id = calendar_integrations.company_id 
      AND companies.user_id = auth.uid()
    )
  );

-- Create RLS policies for chatbot knowledge
CREATE POLICY "Users can manage their chatbot knowledge" ON public.chatbot_knowledge
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE companies.id = chatbot_knowledge.company_id 
      AND companies.user_id = auth.uid()
    )
  );

-- Create RLS policies for leads
CREATE POLICY "Users can manage their company leads" ON public.leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE companies.id = leads.company_id 
      AND companies.user_id = auth.uid()
    )
  );

-- Create RLS policies for lead activities
CREATE POLICY "Users can view their lead activities" ON public.lead_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      JOIN public.companies c ON l.company_id = c.id
      WHERE l.id = lead_activities.lead_id 
      AND c.user_id = auth.uid()
    )
  );

-- Create RLS policies for appointments
CREATE POLICY "Users can manage their company appointments" ON public.appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE companies.id = appointments.company_id 
      AND companies.user_id = auth.uid()
    )
  );

-- Create RLS policies for CRM integrations
CREATE POLICY "Users can manage their CRM integrations" ON public.crm_integrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE companies.id = crm_integrations.company_id 
      AND companies.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_companies_user_id ON public.companies(user_id);
CREATE INDEX idx_services_company_id ON public.services(company_id);
CREATE INDEX idx_pricing_rules_service_id ON public.pricing_rules(service_id);
CREATE INDEX idx_quick_actions_company_id ON public.quick_actions(company_id);
CREATE INDEX idx_calendar_integrations_company_id ON public.calendar_integrations(company_id);
CREATE INDEX idx_chatbot_knowledge_company_id ON public.chatbot_knowledge(company_id);
CREATE INDEX idx_leads_company_id ON public.leads(company_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_score ON public.leads(lead_score);
CREATE INDEX idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX idx_appointments_company_id ON public.appointments(company_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_crm_integrations_company_id ON public.crm_integrations(company_id);

-- Create updated_at triggers
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON public.pricing_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_integrations_updated_at
  BEFORE UPDATE ON public.calendar_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chatbot_knowledge_updated_at
  BEFORE UPDATE ON public.chatbot_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_integrations_updated_at
  BEFORE UPDATE ON public.crm_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();