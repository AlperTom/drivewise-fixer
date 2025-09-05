import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  validatePassword: (password: string, email?: string) => Promise<{
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
    isLeaked?: boolean;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          toast({
            title: "Willkommen zurück!",
            description: "Sie wurden erfolgreich angemeldet.",
          });
          
          // Redirect to dashboard after successful login
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Abgemeldet",
            description: "Sie wurden erfolgreich abgemeldet.",
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const validatePassword = async (password: string, email?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-password', {
        body: { password, email }
      });
      
      if (error) {
        console.error('Password validation error:', error);
        return {
          isValid: false,
          errors: ['Password validation service unavailable'],
          strength: 'weak' as const
        };
      }
      
      return data;
    } catch (error) {
      console.error('Password validation error:', error);
      return {
        isValid: false,
        errors: ['Password validation service unavailable'],
        strength: 'weak' as const
      };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    // Validate password before attempting signup
    const validation = await validatePassword(password, email);
    if (!validation.isValid) {
      return { error: { message: validation.errors.join('. ') } };
    }
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || ''
        }
      }
    });

    if (!error) {
      toast({
        title: "Check your email",
        description: "We've sent you a verification link to complete your registration.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resendConfirmation = async (email: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resendConfirmation,
    validatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};