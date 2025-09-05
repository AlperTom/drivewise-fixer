/**
 * Input sanitization utilities for frontend forms
 */

export function sanitizeTextInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 500); // Reasonable length limit for most inputs
}

export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  
  const sanitized = email
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .trim()
    .toLowerCase();
    
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : '';
}

export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  
  return phone
    .replace(/[^+\d\s\-()]/g, '') // Only allow digits, spaces, dashes, parentheses, and plus
    .trim()
    .slice(0, 20); // Reasonable phone number length
}

export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  
  const sanitized = url
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:/gi, '') // Remove data URLs
    .trim();
    
  // Basic URL validation
  try {
    const urlObj = new URL(sanitized);
    return ['http:', 'https:'].includes(urlObj.protocol) ? sanitized : '';
  } catch {
    return '';
  }
}