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

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Input sanitization function
function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/[^\w\s\-.,!?äöüßÄÖÜ@()]/g, '') // Allow only safe characters including German umlauts
    .trim()
    .slice(0, 2000); // Limit message length
}

// Rate limiting function
function checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  
  const current = rateLimitStore.get(identifier);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const clientIP = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Rate limiting - 5 messages per minute per session/IP
    const rateLimitKey = body.sessionId || clientIP;
    if (!checkRateLimit(rateLimitKey, 5, 60000)) {
      console.warn(`Rate limit exceeded for: ${rateLimitKey}`);
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded',
        response: 'Sie senden zu viele Nachrichten. Bitte warten Sie einen Moment und versuchen Sie es erneut.'
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize inputs
    const message = sanitizeInput(body.message || '');
    const sessionId = sanitizeInput(body.sessionId || '');
    const widgetKey = sanitizeInput(req.headers.get('x-widget-key') || '');
    const visitorData = {
      ...body.visitorData,
      email: body.visitorData?.email ? sanitizeInput(body.visitorData.email) : undefined,
      phone: body.visitorData?.phone ? sanitizeInput(body.visitorData.phone) : undefined,
      name: body.visitorData?.name ? sanitizeInput(body.visitorData.name) : undefined
    };
    const conversationHistory = body.conversationHistory || [];

    // Validate inputs
    if (!widgetKey || widgetKey.length < 10) {
      console.warn(`Invalid widget key from IP: ${clientIP}`);
      return new Response(JSON.stringify({ 
        error: 'Widget key required',
        response: 'Entschuldigung, es gab ein technisches Problem. Bitte versuchen Sie es später erneut.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!message || message.length < 1) {
      return new Response(JSON.stringify({ 
        error: 'Message required',
        response: 'Bitte geben Sie eine Nachricht ein.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use secure API key validation function
    const { data: widgetConfig, error: widgetError } = await supabase
      .rpc('validate_widget_api_key', { api_key_input: widgetKey });

    if (widgetError || !widgetConfig || widgetConfig.length === 0) {
      console.warn('Widget not found for key:', widgetKey.slice(0, 8) + '***');
      
      // Log security event
      await supabase.from('security_audit').insert({
        event_type: 'unauthorized_chat_attempt',
        ip_address: clientIP,
        user_agent: userAgent,
        details: { key_prefix: widgetKey.slice(0, 5), message_preview: message.slice(0, 50) }
      });

      return new Response(JSON.stringify({ 
        error: 'Widget not found',
        response: 'Entschuldigung, dieser Chat-Service ist momentan nicht verfügbar.'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const widget = {
      id: widgetConfig[0].widget_id,
      company_id: widgetConfig[0].company_id,
      theme: widgetConfig[0].theme,
      settings: widgetConfig[0].settings
    };

    // Get company and services data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
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
      `)
      .eq('id', widget.company_id)
      .single();

    if (companyError || !company) {
      console.error('Company not found:', companyError);
      return new Response(JSON.stringify({ 
        error: 'Company not found',
        response: 'Entschuldigung, es gab ein Problem beim Laden der Firmeninformationen.'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing chat message for widget:', widget.id);

    // Log chat interaction
    await supabase.from('security_audit').insert({
      event_type: 'chat_message_processed',
      widget_id: widget.id,
      ip_address: clientIP,
      user_agent: userAgent,
      details: { message_length: message.length, has_visitor_data: !!visitorData.email }
    });

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
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
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