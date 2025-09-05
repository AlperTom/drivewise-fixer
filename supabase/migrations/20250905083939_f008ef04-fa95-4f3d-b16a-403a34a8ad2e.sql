-- Create widget_configs table for managing client widget integrations
CREATE TABLE public.widget_configs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    widget_name TEXT NOT NULL DEFAULT 'CarBot Widget',
    api_key TEXT NOT NULL UNIQUE,
    theme JSONB NOT NULL DEFAULT '{
        "primaryColor": "#f97316",
        "backgroundColor": "#ffffff", 
        "textColor": "#1f2937",
        "borderRadius": "12px",
        "position": "bottom-right"
    }'::jsonb,
    settings JSONB NOT NULL DEFAULT '{
        "showBranding": true,
        "welcomeMessage": "Hallo! Wie kann ich Ihnen heute helfen?",
        "autoOpen": false,
        "collectEmail": true,
        "collectPhone": true
    }'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.widget_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for widget_configs
CREATE POLICY "Users can view their company widgets" 
ON public.widget_configs 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = widget_configs.company_id 
    AND companies.user_id = auth.uid()
));

CREATE POLICY "Users can create widgets for their company" 
ON public.widget_configs 
FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = widget_configs.company_id 
    AND companies.user_id = auth.uid()
));

CREATE POLICY "Users can update their company widgets" 
ON public.widget_configs 
FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = widget_configs.company_id 
    AND companies.user_id = auth.uid()
));

CREATE POLICY "Users can delete their company widgets" 
ON public.widget_configs 
FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = widget_configs.company_id 
    AND companies.user_id = auth.uid()
));

-- Create widget_conversations table for tracking widget interactions
CREATE TABLE public.widget_conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    widget_id UUID NOT NULL REFERENCES public.widget_configs(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    visitor_data JSONB DEFAULT '{}',
    conversation_data JSONB DEFAULT '{}',
    lead_id UUID REFERENCES public.leads(id),
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for widget_conversations
ALTER TABLE public.widget_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for widget_conversations
CREATE POLICY "Companies can view their widget conversations" 
ON public.widget_conversations 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM widget_configs wc
    JOIN companies c ON c.id = wc.company_id
    WHERE wc.id = widget_conversations.widget_id
    AND c.user_id = auth.uid()
));

-- Public access policy for widget API (will be used by edge functions)
CREATE POLICY "Public widgets can be accessed by API key"
ON public.widget_configs
FOR SELECT
USING (is_active = true);

-- Create indexes for performance
CREATE INDEX idx_widget_configs_company_id ON public.widget_configs(company_id);
CREATE INDEX idx_widget_configs_api_key ON public.widget_configs(api_key);
CREATE INDEX idx_widget_conversations_widget_id ON public.widget_conversations(widget_id);
CREATE INDEX idx_widget_conversations_session_id ON public.widget_conversations(session_id);

-- Create trigger for updated_at
CREATE TRIGGER update_widget_configs_updated_at
    BEFORE UPDATE ON public.widget_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_widget_conversations_updated_at
    BEFORE UPDATE ON public.widget_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();