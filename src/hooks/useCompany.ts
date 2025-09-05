import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Database types (as returned from Supabase)
export interface CompanyRow {
  id: string;
  user_id: string;
  company_name: string;
  business_type: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  brand_colors: any;
  description?: string;
  specialties: string[];
  business_hours: any;
  created_at: string;
  updated_at: string;
}

// Application types (with proper unions)
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

export interface ServiceRow {
  id: string;
  company_id: string;
  service_name: string;
  description?: string;
  category: string;
  estimated_duration: number;
  requires_appointment: boolean;
  service_details?: string;
  prerequisites?: string;
  is_active: boolean;
  display_order: number;
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

export interface PricingRuleRow {
  id: string;
  service_id: string;
  car_type: string;
  base_price?: number;
  max_price?: number;
  pricing_type: string;
  additional_notes?: string;
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

export interface QuickActionRow {
  id: string;
  company_id: string;
  action_text: string;
  action_type: string;
  message_template?: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
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

// Type conversion functions
const convertCompanyRow = (row: CompanyRow): Company => ({
  ...row,
  business_type: row.business_type as Company['business_type'],
  brand_colors: typeof row.brand_colors === 'object' ? row.brand_colors : { primary: '#f97316', secondary: '#1f2937' }
});

const convertServiceRow = (row: ServiceRow): Service => ({
  ...row,
  category: row.category as Service['category']
});

const convertPricingRuleRow = (row: PricingRuleRow): PricingRule => ({
  ...row,
  car_type: row.car_type as PricingRule['car_type'],
  pricing_type: row.pricing_type as PricingRule['pricing_type']
});

const convertQuickActionRow = (row: QuickActionRow): QuickAction => ({
  ...row,
  action_type: row.action_type as QuickAction['action_type']
});

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

      setCompany(data ? convertCompanyRow(data) : null);
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
      setServices(data ? data.map(convertServiceRow) : []);
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
      setPricingRules(data ? data.map(convertPricingRuleRow) : []);
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
      setQuickActions(data ? data.map(convertQuickActionRow) : []);
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
          .update({
            company_name: companyData.company_name,
            business_type: companyData.business_type,
            address: companyData.address,
            phone: companyData.phone,
            email: companyData.email,
            website: companyData.website,
            logo_url: companyData.logo_url,
            brand_colors: companyData.brand_colors,
            description: companyData.description,
            specialties: companyData.specialties,
            business_hours: companyData.business_hours
          })
          .eq('id', company.id);

        if (error) throw error;
        
        setCompany({ ...company, ...companyData } as Company);
      } else {
        const { data, error } = await supabase
          .from('companies')
          .insert({ 
            user_id: user.id,
            company_name: companyData.company_name || '',
            business_type: companyData.business_type || 'werkstatt',
            address: companyData.address,
            phone: companyData.phone,
            email: companyData.email,
            website: companyData.website,
            logo_url: companyData.logo_url,
            brand_colors: companyData.brand_colors || { primary: '#f97316', secondary: '#1f2937' },
            description: companyData.description,
            specialties: companyData.specialties || [],
            business_hours: companyData.business_hours || {}
          })
          .select()
          .single();

        if (error) throw error;
        setCompany(convertCompanyRow(data));
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
          .update({
            service_name: serviceData.service_name,
            description: serviceData.description,
            category: serviceData.category,
            estimated_duration: serviceData.estimated_duration,
            requires_appointment: serviceData.requires_appointment,
            service_details: serviceData.service_details,
            prerequisites: serviceData.prerequisites,
            is_active: serviceData.is_active,
            display_order: serviceData.display_order
          })
          .eq('id', serviceData.id);

        if (error) throw error;
        
        setServices(prev => prev.map(s => s.id === serviceData.id ? { ...s, ...serviceData } as Service : s));
      } else {
        const { data, error } = await supabase
          .from('services')
          .insert({ 
            company_id: company.id,
            service_name: serviceData.service_name || '',
            description: serviceData.description,
            category: serviceData.category || 'maintenance',
            estimated_duration: serviceData.estimated_duration || 60,
            requires_appointment: serviceData.requires_appointment ?? true,
            service_details: serviceData.service_details,
            prerequisites: serviceData.prerequisites,
            is_active: serviceData.is_active ?? true,
            display_order: serviceData.display_order || 0
          })
          .select()
          .single();

        if (error) throw error;
        setServices(prev => [...prev, convertServiceRow(data)]);
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
          .update({
            car_type: pricingData.car_type,
            base_price: pricingData.base_price,
            max_price: pricingData.max_price,
            pricing_type: pricingData.pricing_type,
            additional_notes: pricingData.additional_notes
          })
          .eq('id', pricingData.id);

        if (error) throw error;
        
        setPricingRules(prev => prev.map(p => p.id === pricingData.id ? { ...p, ...pricingData } as PricingRule : p));
      } else {
        const { data, error } = await supabase
          .from('pricing_rules')
          .insert({
            service_id: pricingData.service_id!,
            car_type: pricingData.car_type || 'mittelklasse',
            base_price: pricingData.base_price,
            max_price: pricingData.max_price,
            pricing_type: pricingData.pricing_type || 'fixed',
            additional_notes: pricingData.additional_notes
          })
          .select()
          .single();

        if (error) throw error;
        setPricingRules(prev => [...prev, convertPricingRuleRow(data)]);
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
          .update({
            action_text: actionData.action_text,
            action_type: actionData.action_type,
            message_template: actionData.message_template,
            icon_name: actionData.icon_name,
            display_order: actionData.display_order,
            is_active: actionData.is_active
          })
          .eq('id', actionData.id);

        if (error) throw error;
        
        setQuickActions(prev => prev.map(a => a.id === actionData.id ? { ...a, ...actionData } as QuickAction : a));
      } else {
        const { data, error } = await supabase
          .from('quick_actions')
          .insert({
            company_id: company.id,
            action_text: actionData.action_text || '',
            action_type: actionData.action_type || 'message',
            message_template: actionData.message_template,
            icon_name: actionData.icon_name || 'wrench',
            display_order: actionData.display_order || 0,
            is_active: actionData.is_active ?? true
          })
          .select()
          .single();

        if (error) throw error;
        setQuickActions(prev => [...prev, convertQuickActionRow(data)]);
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

  // Optimized data fetching - single effect to prevent cascading requests
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      
      try {
        // Fetch company first
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (companyError && companyError.code !== 'PGRST116') {
          throw companyError;
        }

        const fetchedCompany = companyData ? convertCompanyRow(companyData) : null;
        setCompany(fetchedCompany);

        if (fetchedCompany) {
          // Fetch all related data in parallel to avoid cascading requests
          const [servicesResult, quickActionsResult] = await Promise.all([
            supabase
              .from('services')
              .select('*')
              .eq('company_id', fetchedCompany.id)
              .eq('is_active', true)
              .order('display_order'),
            supabase
              .from('quick_actions')
              .select('*')
              .eq('company_id', fetchedCompany.id)
              .eq('is_active', true)
              .order('display_order')
          ]);

          if (servicesResult.error) throw servicesResult.error;
          if (quickActionsResult.error) throw quickActionsResult.error;

          const fetchedServices = servicesResult.data ? servicesResult.data.map(convertServiceRow) : [];
          setServices(fetchedServices);
          setQuickActions(quickActionsResult.data ? quickActionsResult.data.map(convertQuickActionRow) : []);

          // Fetch pricing rules if there are services
          if (fetchedServices.length > 0) {
            const serviceIds = fetchedServices.map(s => s.id);
            const { data: pricingData, error: pricingError } = await supabase
              .from('pricing_rules')
              .select('*')
              .in('service_id', serviceIds);

            if (pricingError) throw pricingError;
            setPricingRules(pricingData ? pricingData.map(convertPricingRuleRow) : []);
          } else {
            setPricingRules([]);
          }
        } else {
          // Clear all data if no company
          setServices([]);
          setPricingRules([]);
          setQuickActions([]);
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
        toast({
          title: 'Fehler',
          description: 'Daten konnten nicht geladen werden.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user?.id]); // Only depend on user.id to prevent unnecessary refetches

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
    findServiceByName
  };
};