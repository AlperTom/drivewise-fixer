import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Company {
  id: string;
  user_id: string;
  company_name: string;
  business_type: 'werkstatt' | 'detailing' | 'cleaning' | 'dealership' | 'other';
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  brand_colors: {
    primary: string;
    secondary: string;
  };
  description?: string;
  specialties: string[];
  business_hours: any;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  company_id: string;
  service_name: string;
  description?: string;
  category: 'maintenance' | 'repair' | 'detailing' | 'inspection' | 'cleaning' | 'tuning' | 'other';
  estimated_duration: number;
  requires_appointment: boolean;
  service_details?: string;
  prerequisites?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PricingRule {
  id: string;
  service_id: string;
  car_type: 'kleinwagen' | 'mittelklasse' | 'oberklasse' | 'suv' | 'transporter' | 'motorrad' | 'other';
  base_price?: number;
  max_price?: number;
  pricing_type: 'fixed' | 'range' | 'quote_only';
  additional_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface QuickAction {
  id: string;
  company_id: string;
  action_text: string;
  action_type: 'message' | 'calendar' | 'service_inquiry' | 'pricing';
  message_template?: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export const useCompany = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch company data
  const fetchCompany = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCompany(data);
    } catch (error) {
      console.error('Error fetching company:', error);
      toast({
        title: 'Fehler',
        description: 'Firma konnte nicht geladen werden.',
        variant: 'destructive',
      });
    }
  };

  // Fetch services
  const fetchServices = async () => {
    if (!company) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Fetch pricing rules
  const fetchPricingRules = async () => {
    if (!company || services.length === 0) return;

    try {
      const serviceIds = services.map(s => s.id);
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .in('service_id', serviceIds);

      if (error) throw error;
      setPricingRules(data || []);
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
    }
  };

  // Fetch quick actions
  const fetchQuickActions = async () => {
    if (!company) return;

    try {
      const { data, error } = await supabase
        .from('quick_actions')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setQuickActions(data || []);
    } catch (error) {
      console.error('Error fetching quick actions:', error);
    }
  };

  // Create or update company
  const saveCompany = async (companyData: Partial<Company>) => {
    if (!user) return false;

    try {
      if (company) {
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', company.id);

        if (error) throw error;
        
        setCompany({ ...company, ...companyData } as Company);
      } else {
        const { data, error } = await supabase
          .from('companies')
          .insert({ ...companyData, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        setCompany(data);
      }

      toast({
        title: 'Erfolg',
        description: 'Firmendaten wurden gespeichert.',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: 'Fehler',
        description: 'Firmendaten konnten nicht gespeichert werden.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Save service
  const saveService = async (serviceData: Partial<Service>) => {
    if (!company) return false;

    try {
      if (serviceData.id) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', serviceData.id);

        if (error) throw error;
        
        setServices(prev => prev.map(s => s.id === serviceData.id ? { ...s, ...serviceData } as Service : s));
      } else {
        const { data, error } = await supabase
          .from('services')
          .insert({ ...serviceData, company_id: company.id })
          .select()
          .single();

        if (error) throw error;
        setServices(prev => [...prev, data]);
      }

      toast({
        title: 'Erfolg',
        description: 'Service wurde gespeichert.',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: 'Fehler',
        description: 'Service konnte nicht gespeichert werden.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Save pricing rule
  const savePricingRule = async (pricingData: Partial<PricingRule>) => {
    try {
      if (pricingData.id) {
        const { error } = await supabase
          .from('pricing_rules')
          .update(pricingData)
          .eq('id', pricingData.id);

        if (error) throw error;
        
        setPricingRules(prev => prev.map(p => p.id === pricingData.id ? { ...p, ...pricingData } as PricingRule : p));
      } else {
        const { data, error } = await supabase
          .from('pricing_rules')
          .insert(pricingData)
          .select()
          .single();

        if (error) throw error;
        setPricingRules(prev => [...prev, data]);
      }

      return true;
    } catch (error) {
      console.error('Error saving pricing rule:', error);
      toast({
        title: 'Fehler',
        description: 'Preis konnte nicht gespeichert werden.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Save quick action
  const saveQuickAction = async (actionData: Partial<QuickAction>) => {
    if (!company) return false;

    try {
      if (actionData.id) {
        const { error } = await supabase
          .from('quick_actions')
          .update(actionData)
          .eq('id', actionData.id);

        if (error) throw error;
        
        setQuickActions(prev => prev.map(a => a.id === actionData.id ? { ...a, ...actionData } as QuickAction : a));
      } else {
        const { data, error } = await supabase
          .from('quick_actions')
          .insert({ ...actionData, company_id: company.id })
          .select()
          .single();

        if (error) throw error;
        setQuickActions(prev => [...prev, data]);
      }

      toast({
        title: 'Erfolg',
        description: 'Schnellaktion wurde gespeichert.',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving quick action:', error);
      toast({
        title: 'Fehler',
        description: 'Schnellaktion konnte nicht gespeichert werden.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Get pricing for service and car type
  const getPricing = (serviceId: string, carType: string) => {
    return pricingRules.find(rule => 
      rule.service_id === serviceId && rule.car_type === carType
    );
  };

  // Get service by name (fuzzy matching)
  const findServiceByName = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return services.find(service => 
      service.service_name.toLowerCase().includes(lowerQuery) ||
      service.description?.toLowerCase().includes(lowerQuery) ||
      service.service_details?.toLowerCase().includes(lowerQuery)
    );
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchCompany().finally(() => setLoading(false));
    }
  }, [user]);

  useEffect(() => {
    if (company) {
      fetchServices();
      fetchQuickActions();
    }
  }, [company]);

  useEffect(() => {
    if (services.length > 0) {
      fetchPricingRules();
    }
  }, [services]);

  return {
    company,
    services,
    pricingRules,
    quickActions,
    loading,
    saveCompany,
    saveService,
    savePricingRule,
    saveQuickAction,
    getPricing,
    findServiceByName,
    refreshData: () => {
      fetchCompany();
      if (company) {
        fetchServices();
        fetchQuickActions();
      }
    }
  };
};