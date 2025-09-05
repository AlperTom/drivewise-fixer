import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PasswordValidationRequest {
  password: string
  email?: string
}

interface PasswordValidationResponse {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
  isLeaked?: boolean
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { password, email } = await req.json() as PasswordValidationRequest
    
    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Password is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const validation = await validatePassword(password, email)
    
    return new Response(
      JSON.stringify(validation),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Password validation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function validatePassword(password: string, email?: string): Promise<PasswordValidationResponse> {
  const errors: string[] = []
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  let isLeaked = false

  // Basic password requirements
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  // Check against common passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common')
  }

  // Check if password contains email
  if (email && password.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
    errors.push('Password should not contain parts of your email')
  }

  // Check against HaveIBeenPwned API
  try {
    isLeaked = await checkPasswordLeak(password)
    if (isLeaked) {
      errors.push('This password has been found in data breaches and should not be used')
    }
  } catch (error) {
    console.error('Failed to check password against breach database:', error)
    // Don't fail validation if the service is unavailable
  }

  // Calculate strength
  let strengthScore = 0
  if (password.length >= 8) strengthScore++
  if (password.length >= 12) strengthScore++
  if (/[a-z]/.test(password)) strengthScore++
  if (/[A-Z]/.test(password)) strengthScore++
  if (/[0-9]/.test(password)) strengthScore++
  if (/[^a-zA-Z0-9]/.test(password)) strengthScore++
  if (password.length >= 16) strengthScore++

  if (strengthScore >= 6) strength = 'strong'
  else if (strengthScore >= 4) strength = 'medium'
  else strength = 'weak'

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    isLeaked
  }
}

async function checkPasswordLeak(password: string): Promise<boolean> {
  try {
    // Hash the password with SHA-1
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()

    // Use k-anonymity: only send first 5 characters of hash
    const prefix = hashHex.substring(0, 5)
    const suffix = hashHex.substring(5)

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'User-Agent': 'CarBot-Security-Check'
      }
    })

    if (!response.ok) {
      throw new Error(`HaveIBeenPwned API error: ${response.status}`)
    }

    const text = await response.text()
    const lines = text.split('\n')
    
    // Check if our password hash suffix is in the results
    for (const line of lines) {
      const [hashSuffix] = line.split(':')
      if (hashSuffix === suffix) {
        return true // Password found in breach database
      }
    }

    return false // Password not found in breach database
  } catch (error) {
    console.error('Error checking password against breach database:', error)
    throw error
  }
}