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
          address,
          phone,
          email,
          description,
          specialties,
          services (
            id,
            service_name,
            description,
            category,
            estimated_duration,
            pricing_rules (*)
          ),
          quick_actions (
            id,
            action_text,
            action_type,
            message_template,
            icon_name,
            display_order
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

    const { message, sessionId, visitorData, conversationHistory } = await req.json();

    console.log('Processing chat message for widget:', widget.id);

    const company = widget.companies;

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create comprehensive system prompt
    const systemPrompt = `Sie sind ein freundlicher und professioneller ChatBot für ${company?.company_name}, ein${company?.business_type === 'werkstatt' ? 'e Autowerkstatt' : 
      company?.business_type === 'detailing' ? ' Autoaufbereitungsbetrieb' :
      company?.business_type === 'cleaning' ? 'e Autoreinigungsfirma' :
      company?.business_type === 'dealership' ? ' Autohaus' : 'er Automobilbetrieb'}.

FIRMENINFORMATIONEN:
- Name: ${company?.company_name}
- Adresse: ${company?.address || 'Nicht angegeben'}
- Telefon: ${company?.phone || 'Nicht angegeben'}
- Email: ${company?.email || 'Nicht angegeben'}
- Beschreibung: ${company?.description || 'Professionelle Automobildienstleistungen'}
- Spezialisierungen: ${company?.specialties?.join(', ') || 'Allgemeine Fahrzeugwartung'}

VERFÜGBARE SERVICES:
${company?.services?.map(service => {
  const pricingInfo = service.pricing_rules?.length > 0 
    ? service.pricing_rules.map(rule => 
        `${rule.car_type}: ${rule.pricing_type === 'fixed' ? rule.base_price + '€' : 
          rule.pricing_type === 'range' ? rule.base_price + '€ - ' + rule.max_price + '€' : 
          'auf Anfrage'}`
      ).join(', ')
    : 'Preise auf Anfrage';
  
  return `• ${service.service_name}: ${service.description} (${service.estimated_duration} Min) - ${pricingInfo}`;
}).join('\n') || 'Verschiedene Automobildienstleistungen verfügbar'}

VERHALTEN:
- Antworten Sie immer auf Deutsch
- Seien Sie freundlich und hilfsbereit
- Bieten Sie konkrete Services und Preise an
- Fragen Sie nach Fahrzeugdetails wenn nötig (Marke, Modell, Baujahr)
- Helfen Sie bei Terminvereinbarungen
- Geben Sie Kontaktinformationen bei Bedarf weiter
- Bei technischen Fragen: Empfehlen Sie eine Vor-Ort-Diagnose
- Antworten Sie präzise und strukturiert (max. 3-4 Sätze)
- Verwenden Sie Emojis sparsam aber passend

Aktuelle Unterhaltung mit dem Kunden:`;

    // Prepare conversation messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).slice(-8), // Keep last 8 messages for context
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI with', messages.length, 'messages');

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: messages,
        max_completion_tokens: 800,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      
      // Fallback response
      const fallbackResponse = `Entschuldigung, ich habe gerade technische Probleme. Bitte rufen Sie uns direkt an: ${company?.phone || 'Telefonnummer auf der Website'} oder schreiben Sie an: ${company?.email || 'E-Mail auf der Website'}`;
      
      return new Response(JSON.stringify({ 
        response: fallbackResponse,
        widget_config: widget.theme,
        quick_actions: company?.quick_actions || [],
        collect_email: widget.settings?.collectEmail || false,
        collect_phone: widget.settings?.collectPhone || false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await openaiResponse.json();
    const aiResponse = aiData.choices[0]?.message?.content || 'Entschuldigung, ich konnte Ihre Anfrage nicht verarbeiten.';

    console.log('AI response generated:', aiResponse.substring(0, 100) + '...');

    // Store conversation
    try {
      const conversationData = {
        messages: [
          ...(conversationHistory || []),
          { role: 'user', content: message, timestamp: new Date().toISOString() },
          { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
        ].slice(-20) // Keep last 20 messages
      };

      const { error: conversationError } = await supabase
        .from('widget_conversations')
        .upsert({
          widget_id: widget.id,
          session_id: sessionId,
          visitor_data: visitorData || {},
          conversation_data: conversationData,
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
    const isLead = message.toLowerCase().includes('termin') || 
                   message.toLowerCase().includes('reparatur') || 
                   message.toLowerCase().includes('problem') ||
                   message.toLowerCase().includes('kosten') ||
                   message.toLowerCase().includes('angebot') ||
                   message.toLowerCase().includes('service');

    if (isLead && visitorData?.email) {
      try {
        // Create lead
        const { error: leadError } = await supabase
          .from('leads')
          .insert({
            company_id: company.id,
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
      response: aiResponse, 
      widget_config: widget.theme,
      quick_actions: company?.quick_actions?.sort((a, b) => a.display_order - b.display_order) || [],
      collect_email: widget.settings?.collectEmail || false,
      collect_phone: widget.settings?.collectPhone || false,
      company: {
        name: company?.company_name,
        phone: company?.phone,
        email: company?.email,
        address: company?.address
      }
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