import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-widget-key',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const widgetKey = req.headers.get('x-widget-key');
    if (!widgetKey) {
      return new Response(JSON.stringify({ error: 'Widget key required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify widget exists and is active
    const { data: widget, error: widgetError } = await supabase
      .from('widget_configs')
      .select(`
        *,
        companies (
          id,
          company_name,
          business_type,
          services (
            id,
            service_name,
            description,
            category,
            estimated_duration
          ),
          quick_actions (
            id,
            action_text,
            action_type,
            message_template
          )
        )
      `)
      .eq('api_key', widgetKey)
      .eq('is_active', true)
      .single();

    if (widgetError || !widget) {
      console.error('Widget verification failed:', widgetError);
      return new Response(JSON.stringify({ error: 'Invalid widget key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, sessionId, visitorData } = await req.json();

    console.log('Processing chat message for widget:', widget.id);

    // Generate AI response based on company data
    const companyContext = `
      Company: ${widget.companies.company_name}
      Business Type: ${widget.companies.business_type}
      
      Available Services:
      ${widget.companies.services?.map(s => `- ${s.service_name}: ${s.description}`).join('\n') || 'No services configured'}
      
      Quick Actions:
      ${widget.companies.quick_actions?.map(a => `- ${a.action_text}`).join('\n') || 'No quick actions configured'}
    `;

    // Simple AI response (in production, you'd use OpenAI or similar)
    let response = '';
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hallo') || lowerMessage.includes('hi') || message === '') {
      response = widget.settings?.welcomeMessage || `Hallo! Willkommen bei ${widget.companies.company_name}. Wie kann ich Ihnen heute helfen?`;
    } else if (lowerMessage.includes('service') || lowerMessage.includes('angebot')) {
      const services = widget.companies.services || [];
      if (services.length > 0) {
        response = `Gerne! Wir bieten folgende Services an:\n\n${services.map(s => `• ${s.service_name} - ${s.description}`).join('\n')}\n\nWelcher Service interessiert Sie?`;
      } else {
        response = 'Gerne helfe ich Ihnen weiter! Können Sie mir mehr über Ihren Bedarf erzählen?';
      }
    } else if (lowerMessage.includes('preis') || lowerMessage.includes('kosten')) {
      response = `Für ein genaues Angebot benötige ich etwas mehr Informationen über Ihr Fahrzeug und den gewünschten Service. Können Sie mir Ihr Fahrzeugmodell und das Problem beschreiben?`;
    } else if (lowerMessage.includes('termin')) {
      response = `Sehr gerne können wir einen Termin vereinbaren! Wann würde es Ihnen am besten passen? Ich kann Ihnen auch direkt unsere Kontaktdaten geben.`;
    } else if (lowerMessage.includes('kontakt') || lowerMessage.includes('telefon')) {
      response = `Sie erreichen uns unter:\n📞 ${widget.companies.phone || 'Telefonnummer nicht hinterlegt'}\n📧 ${widget.companies.email || 'E-Mail nicht hinterlegt'}\n\nOder hinterlassen Sie mir Ihre Kontaktdaten für einen Rückruf!`;
    } else {
      response = `Vielen Dank für Ihre Nachricht! Ich leite Ihre Anfrage gerne an unser Team weiter. Können Sie mir Ihre Kontaktdaten hinterlassen, damit wir uns bei Ihnen melden können?`;
    }

    // Store conversation
    try {
      const { error: conversationError } = await supabase
        .from('widget_conversations')
        .upsert({
          widget_id: widget.id,
          session_id: sessionId,
          visitor_data: visitorData || {},
          conversation_data: {
            messages: [{
              timestamp: new Date().toISOString(),
              user_message: message,
              bot_response: response
            }]
          },
          status: 'active'
        }, {
          onConflict: 'session_id'
        });

      if (conversationError) {
        console.error('Error storing conversation:', conversationError);
      }
    } catch (error) {
      console.error('Error in conversation storage:', error);
    }

    // Detect if this could be a lead
    const isLead = lowerMessage.includes('termin') || 
                   lowerMessage.includes('reparatur') || 
                   lowerMessage.includes('problem') ||
                   lowerMessage.includes('kosten') ||
                   lowerMessage.includes('angebot');

    if (isLead && visitorData?.email) {
      try {
        // Create lead
        const { error: leadError } = await supabase
          .from('leads')
          .insert({
            company_id: widget.companies.id,
            session_id: sessionId,
            name: visitorData.name || 'Website Besucher',
            email: visitorData.email,
            phone: visitorData.phone,
            source: 'widget',
            service_needed: 'Chat Anfrage',
            notes: `Widget Conversation: ${message}`,
            urgency_level: 'medium',
            status: 'new'
          });

        if (leadError) {
          console.error('Error creating lead:', leadError);
        } else {
          console.log('Lead created successfully');
        }
      } catch (error) {
        console.error('Error in lead creation:', error);
      }
    }

    return new Response(JSON.stringify({ 
      response, 
      widget_config: widget.theme,
      quick_actions: widget.companies.quick_actions || [],
      collect_email: widget.settings?.collectEmail || false,
      collect_phone: widget.settings?.collectPhone || false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in widget-chat function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});