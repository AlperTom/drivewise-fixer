import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Database row types
interface LeadRow {
  id: string;
  company_id: string;
  session_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  lead_score: number;
  status: string;
  service_needed?: string;
  urgency_level: string;
  vehicle_info: any;
  estimated_value?: number;
  source: string;
  notes?: string;
  last_contact?: string;
  created_at: string;
  updated_at: string;
}

interface LeadActivityRow {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string;
  metadata: any;
  timestamp: string;
}

// Application types
export interface Lead {
  id: string;
  company_id: string;
  session_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  lead_score: number;
  status: 'new' | 'contacted' | 'qualified' | 'appointment_booked' | 'converted' | 'lost';
  service_needed?: string;
  urgency_level: 'low' | 'medium' | 'high' | 'urgent';
  vehicle_info: any;
  estimated_value?: number;
  source: string;
  notes?: string;
  last_contact?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: 'message' | 'email' | 'call' | 'appointment' | 'quote' | 'follow_up';
  description: string;
  metadata: any;
  timestamp: string;
}

// Type converters
const convertLeadRow = (row: LeadRow): Lead => ({
  ...row,
  status: row.status as Lead['status'],
  urgency_level: row.urgency_level as Lead['urgency_level']
});

const convertLeadActivityRow = (row: LeadActivityRow): LeadActivity => ({
  ...row,
  activity_type: row.activity_type as LeadActivity['activity_type']
});

export const useLeads = (companyId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Lead scoring algorithm
  const calculateLeadScore = (leadData: Partial<Lead>, messageContent?: string): number => {
    let score = 0;

    // Contact information provided
    if (leadData.email) score += 20;
    if (leadData.phone) score += 20;
    if (leadData.name) score += 10;

    // Service specificity
    if (leadData.service_needed) {
      if (leadData.service_needed.length > 20) score += 15; // Detailed description
      else if (leadData.service_needed.length > 10) score += 10;
      else score += 5;
    }

    // Urgency indicators
    if (leadData.urgency_level === 'urgent') score += 25;
    else if (leadData.urgency_level === 'high') score += 20;
    else if (leadData.urgency_level === 'medium') score += 10;

    // Vehicle information
    if (leadData.vehicle_info) {
      const vehicleKeys = Object.keys(leadData.vehicle_info).length;
      score += Math.min(vehicleKeys * 3, 15);
    }

    // Analyze message content for urgency keywords (German)
    if (messageContent) {
      const urgencyKeywords = ['sofort', 'dringend', 'heute', 'morgen', 'schnell', 'asap', 'notfall', 'kaputt', 'defekt'];
      const priceKeywords = ['preis', 'kosten', 'kostenvoranschlag', 'angebot', 'budget'];
      const appointmentKeywords = ['termin', 'appointment', 'buchen', 'reservieren', 'zeit'];

      const lowerContent = messageContent.toLowerCase();
      
      urgencyKeywords.forEach(keyword => {
        if (lowerContent.includes(keyword)) score += 5;
      });

      priceKeywords.forEach(keyword => {
        if (lowerContent.includes(keyword)) score += 8;
      });

      appointmentKeywords.forEach(keyword => {
        if (lowerContent.includes(keyword)) score += 15;
      });
    }

    return Math.min(score, 100); // Cap at 100
  };

  // Extract information from message
  const extractLeadInfo = (message: string) => {
    const info: any = {};
    
    // Email extraction
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = message.match(emailRegex);
    if (emails && emails.length > 0) {
      info.email = emails[0];
    }

    // Phone extraction (German formats)
    const phoneRegex = /(?:\+49\s?|0)(?:1[5-7][0-9]\s?\d{7,8}|\d{2,5}\s?\d{6,8})/g;
    const phones = message.match(phoneRegex);
    if (phones && phones.length > 0) {
      info.phone = phones[0];
    }

    // Name extraction (simple heuristic)
    const nameRegex = /ich bin ([a-zA-Z\s]{2,30})|mein name ist ([a-zA-Z\s]{2,30})|ich heiße ([a-zA-Z\s]{2,30})/i;
    const nameMatch = message.match(nameRegex);
    if (nameMatch) {
      info.name = nameMatch[1] || nameMatch[2] || nameMatch[3];
    }

    // Service extraction
    const serviceKeywords = {
      'ölwechsel': 'Ölwechsel',
      'bremsen': 'Bremsservice',
      'reifen': 'Reifenservice',
      'inspektion': 'Inspektion',
      'tüv': 'TÜV/HU',
      'reparatur': 'Reparatur',
      'wartung': 'Wartung',
      'klimaanlage': 'Klimaservice',
      'batterie': 'Batterieservice',
      'auspuff': 'Auspuffservice'
    };

    const lowerMessage = message.toLowerCase();
    for (const [keyword, service] of Object.entries(serviceKeywords)) {
      if (lowerMessage.includes(keyword)) {
        info.service_needed = service;
        break;
      }
    }

    // Urgency extraction
    const urgencyKeywords = ['sofort', 'dringend', 'heute', 'morgen', 'schnell', 'notfall'];
    const hasUrgency = urgencyKeywords.some(keyword => lowerMessage.includes(keyword));
    info.urgency_level = hasUrgency ? 'high' : 'medium';

    return info;
  };

  // Create or update lead from chat message
  const createOrUpdateLead = async (sessionId: string, message: string, companyId: string): Promise<Lead | null> => {
    if (!user || !companyId) return null;

    try {
      // Check if lead already exists for this session
      let { data: existingLead, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('session_id', sessionId)
        .eq('company_id', companyId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const extractedInfo = extractLeadInfo(message);
      const leadScore = calculateLeadScore(extractedInfo, message);

      const leadData = {
        company_id: companyId,
        session_id: sessionId,
        lead_score: leadScore,
        source: 'chatbot',
        ...extractedInfo
      };

      let lead: Lead;

      if (existingLead) {
        // Update existing lead
        const updatedData = {
          ...leadData,
          lead_score: Math.max(existingLead.lead_score, leadScore), // Keep highest score
          name: extractedInfo.name || existingLead.name,
          email: extractedInfo.email || existingLead.email,
          phone: extractedInfo.phone || existingLead.phone,
          service_needed: extractedInfo.service_needed || existingLead.service_needed,
          urgency_level: extractedInfo.urgency_level === 'high' ? 'high' : existingLead.urgency_level
        };

        const { data, error } = await supabase
          .from('leads')
          .update(updatedData)
          .eq('id', existingLead.id)
          .select()
          .single();

        if (error) throw error;
        lead = convertLeadRow(data);
      } else {
        // Create new lead
        const { data, error } = await supabase
          .from('leads')
          .insert(leadData)
          .select()
          .single();

        if (error) throw error;
        lead = convertLeadRow(data);
      }

      // Add activity
      await addActivity(lead.id, 'message', `ChatBot Nachricht: ${message.substring(0, 100)}...`, { message });

      // Update leads list if this company is being viewed
      if (companyId === companyId) {
        setLeads(prev => {
          const filtered = prev.filter(l => l.id !== lead.id);
          return [lead, ...filtered];
        });
      }

      return lead;
    } catch (error) {
      console.error('Error creating/updating lead:', error);
      return null;
    }
  };

  // Add activity to lead
  const addActivity = async (
    leadId: string, 
    activityType: LeadActivity['activity_type'], 
    description: string, 
    metadata: any = {}
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('lead_activities')
        .insert({
          lead_id: leadId,
          activity_type: activityType,
          description,
          metadata
        })
        .select()
        .single();

      if (error) throw error;

      setActivities(prev => [convertLeadActivityRow(data), ...prev]);
      return true;
    } catch (error) {
      console.error('Error adding activity:', error);
      return false;
    }
  };

  // Fetch leads for company
  const fetchLeads = async () => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data ? data.map(convertLeadRow) : []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Fehler',
        description: 'Leads konnten nicht geladen werden.',
        variant: 'destructive',
      });
    }
  };

  // Fetch activities for leads
  const fetchActivities = async (leadId?: string) => {
    if (!companyId) return;

    try {
      let query = supabase
        .from('lead_activities')
        .select(`
          *,
          leads!inner(company_id)
        `)
        .eq('leads.company_id', companyId)
        .order('timestamp', { ascending: false });

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setActivities(data ? data.map(convertLeadActivityRow) : []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  // Update lead status
  const updateLeadStatus = async (leadId: string, status: Lead['status']): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status, last_contact: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status, last_contact: new Date().toISOString() } : lead
      ));

      await addActivity(leadId, 'follow_up', `Status geändert zu: ${status}`);

      toast({
        title: 'Erfolg',
        description: 'Lead-Status wurde aktualisiert.',
      });

      return true;
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({
        title: 'Fehler',
        description: 'Lead-Status konnte nicht aktualisiert werden.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Get lead statistics - memoized for performance
  const getLeadStats = useMemo(() => {
    return () => {
      const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === 'new').length,
        hot: leads.filter(l => l.lead_score >= 80).length,
        warm: leads.filter(l => l.lead_score >= 60 && l.lead_score < 80).length,
        cold: leads.filter(l => l.lead_score < 60).length,
        converted: leads.filter(l => l.status === 'converted').length
      };

      return stats;
    };
  }, [leads]);

  useEffect(() => {
    if (companyId) {
      setLoading(true);
      Promise.all([
        fetchLeads(),
        fetchActivities()
      ]).finally(() => setLoading(false));
    }
  }, [companyId]);

  return {
    leads,
    activities,
    loading,
    createOrUpdateLead,
    addActivity,
    updateLeadStatus,
    fetchLeads,
    fetchActivities,
    getLeadStats,
    calculateLeadScore,
    extractLeadInfo
  };
};