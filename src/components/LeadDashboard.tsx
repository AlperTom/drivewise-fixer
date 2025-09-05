import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Mail, 
  Phone, 
  Star,
  Clock,
  Filter,
  Search,
  MessageSquare,
  UserCheck,
  Trophy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLeads, Lead } from '@/hooks/useLeads';
import { useCompany } from '@/hooks/useCompany';

const LeadDashboard = () => {
  const { toast } = useToast();
  const { company } = useCompany();
  const { 
    leads, 
    activities, 
    loading, 
    updateLeadStatus, 
    getLeadStats, 
    fetchLeads,
    addActivity
  } = useLeads(company?.id);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterScore, setFilterScore] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newNote, setNewNote] = useState('');

  const stats = getLeadStats();

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    // Status filter
    if (filterStatus !== 'all' && lead.status !== filterStatus) return false;
    
    // Score filter
    if (filterScore === 'hot' && lead.lead_score < 80) return false;
    if (filterScore === 'warm' && (lead.lead_score < 60 || lead.lead_score >= 80)) return false;
    if (filterScore === 'cold' && lead.lead_score >= 60) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        lead.name?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.toLowerCase().includes(query) ||
        lead.service_needed?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Get lead score color using semantic tokens
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-destructive bg-destructive/5 border-destructive/20';
    if (score >= 60) return 'text-automotive-warning bg-automotive-warning/10 border-automotive-warning/20';
    return 'text-automotive-blue bg-automotive-blue/10 border-automotive-blue/20';
  };

  // Get lead score label
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Hot Lead';
    if (score >= 60) return 'Warm Lead';
    return 'Cold Lead';
  };

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      default: return 'outline';
    }
  };

  // Handle status change
  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    const success = await updateLeadStatus(leadId, newStatus);
    if (success && selectedLead?.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Add note to lead
  const handleAddNote = async () => {
    if (!selectedLead || !newNote.trim()) return;

    const success = await addActivity(
      selectedLead.id,
      'follow_up',
      newNote,
      { type: 'manual_note' }
    );

    if (success) {
      setNewNote('');
      toast({
        title: 'Notiz hinzugefügt',
        description: 'Die Notiz wurde erfolgreich gespeichert.',
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE');
  };

  // Get activities for selected lead
  const leadActivities = selectedLead 
    ? activities.filter(activity => activity.lead_id === selectedLead.id)
    : [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lead Management</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihre Leads und verfolgen Sie den Erfolg Ihres ChatBots.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Neue Leads</p>
                <p className="text-2xl font-bold text-automotive-blue">{stats.new}</p>
              </div>
              <UserCheck className="h-8 w-8 text-automotive-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hot Leads</p>
                <p className="text-2xl font-bold text-destructive">{stats.hot}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warm Leads</p>
                <p className="text-2xl font-bold text-automotive-warning">{stats.warm}</p>
              </div>
              <Clock className="h-8 w-8 text-automotive-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Konvertiert</p>
                <p className="text-2xl font-bold text-automotive-success">{stats.converted}</p>
              </div>
              <Trophy className="h-8 w-8 text-automotive-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Leads</span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Suchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Status</SelectItem>
                      <SelectItem value="new">Neu</SelectItem>
                      <SelectItem value="contacted">Kontaktiert</SelectItem>
                      <SelectItem value="qualified">Qualifiziert</SelectItem>
                      <SelectItem value="appointment_booked">Termin gebucht</SelectItem>
                      <SelectItem value="converted">Konvertiert</SelectItem>
                      <SelectItem value="lost">Verloren</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterScore} onValueChange={setFilterScore}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Scores</SelectItem>
                      <SelectItem value="hot">Hot (80+)</SelectItem>
                      <SelectItem value="warm">Warm (60-79)</SelectItem>
                      <SelectItem value="cold">Cold (&lt;60)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className={`p-4 border rounded cursor-pointer transition-colors ${
                        selectedLead?.id === lead.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedLead(lead)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">
                            {lead.name || 'Unbekannter Lead'}
                          </h4>
                          {lead.email && (
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {lead.email}
                            </p>
                          )}
                          {lead.phone && (
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {lead.phone}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`text-xs px-2 py-1 rounded border ${getScoreColor(lead.lead_score)}`}>
                            {lead.lead_score} - {getScoreLabel(lead.lead_score)}
                          </div>
                          <Badge 
                            variant={getUrgencyColor(lead.urgency_level)} 
                            className="mt-1"
                          >
                            {lead.urgency_level}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          {lead.service_needed && (
                            <Badge variant="outline" className="text-xs">
                              {lead.service_needed}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={lead.status === 'converted' ? 'default' : 'secondary'}
                          >
                            {lead.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(lead.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Lead Details */}
        <div>
          {selectedLead ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Lead Details</span>
                  <div className={`text-xs px-2 py-1 rounded border ${getScoreColor(selectedLead.lead_score)}`}>
                    Score: {selectedLead.lead_score}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="activities">Aktivitäten</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4 mt-4">
                    <div>
                      <h4 className="font-medium mb-2">Kontaktinformationen</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Name:</strong> {selectedLead.name || 'Nicht angegeben'}</p>
                        <p><strong>E-Mail:</strong> {selectedLead.email || 'Nicht angegeben'}</p>
                        <p><strong>Telefon:</strong> {selectedLead.phone || 'Nicht angegeben'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Service-Informationen</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Service:</strong> {selectedLead.service_needed || 'Nicht angegeben'}</p>
                        <p><strong>Dringlichkeit:</strong> {selectedLead.urgency_level}</p>
                        <p><strong>Quelle:</strong> {selectedLead.source}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Status ändern</h4>
                      <Select 
                        value={selectedLead.status} 
                        onValueChange={(value) => handleStatusChange(selectedLead.id, value as Lead['status'])}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Neu</SelectItem>
                          <SelectItem value="contacted">Kontaktiert</SelectItem>
                          <SelectItem value="qualified">Qualifiziert</SelectItem>
                          <SelectItem value="appointment_booked">Termin gebucht</SelectItem>
                          <SelectItem value="converted">Konvertiert</SelectItem>
                          <SelectItem value="lost">Verloren</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Notiz hinzufügen</h4>
                      <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Notiz zum Lead..."
                        rows={3}
                      />
                      <Button 
                        onClick={handleAddNote}
                        className="w-full mt-2"
                        disabled={!newNote.trim()}
                      >
                        Notiz speichern
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="activities" className="mt-4">
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {leadActivities.map((activity) => (
                          <div key={activity.id} className="p-3 border rounded">
                            <div className="flex items-start justify-between mb-1">
                              <Badge variant="outline" className="text-xs">
                                {activity.activity_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(activity.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm">{activity.description}</p>
                          </div>
                        ))}
                        {leadActivities.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            Keine Aktivitäten für diesen Lead
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-80">
                <div className="text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <p>Wählen Sie einen Lead aus, um Details anzuzeigen</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadDashboard;