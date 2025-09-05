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
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
}

// Rate limiting function
function checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = identifier;
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
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
    const clientIP = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Rate limiting
    if (!checkRateLimit(clientIP, 20, 60000)) { // 20 requests per minute per IP
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const widgetKey = sanitizeInput(req.headers.get('x-widget-key') || new URL(req.url).searchParams.get('key') || '');
    
    if (!widgetKey || widgetKey.length < 10) {
      console.warn(`Invalid widget key attempt from IP: ${clientIP}`);
      
      // Log security event
      await supabase.from('security_audit').insert({
        event_type: 'invalid_api_key',
        ip_address: clientIP,
        user_agent: userAgent,
        details: { attempted_key: widgetKey.slice(0, 5) + '***' }
      });

      return new Response(JSON.stringify({ error: 'Valid widget key required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use enhanced secure API key validation function with rate limiting
    const { data: widgetConfig, error: widgetError } = await supabase
      .rpc('validate_widget_api_key_secure', { 
        api_key_input: widgetKey,
        client_ip: clientIP 
      });

    if (widgetError || !widgetConfig || widgetConfig.length === 0) {
      console.warn('Widget validation failed:', widgetError);
      
      return new Response(JSON.stringify({ error: 'Widget not found or inactive' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const widget = widgetConfig[0];

    // Check if rate limited by the database function
    if (widget.rate_limited) {
      console.warn(`Database rate limit exceeded for IP: ${clientIP}`);
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Security audit logging is now handled by the database function
    console.log(`Widget config accessed for company: ${widget.company_name}`);

    return new Response(JSON.stringify({
      widget_id: widget.widget_id,
      company_name: widget.company_name,
      theme: widget.theme,
      settings: widget.settings
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in widget-config function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});