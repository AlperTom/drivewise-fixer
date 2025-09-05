import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  BarChart3,
  Settings,
  Bot,
  Calendar,
  Mail,
  Globe
} from 'lucide-react';
import CompanySetup from '@/components/CompanySetup';
import LeadDashboard from '@/components/LeadDashboard';
import ChatBot from '@/components/ChatBot';
import WidgetManager from '@/components/WidgetManager';
import { CalendarIntegration } from '@/components/CalendarIntegration';
import { EmailSetup } from '@/components/EmailSetup';
import { useCompany } from '@/hooks/useCompany';
import { useLeads } from '@/hooks/useLeads';

const Dashboard = () => {
  const { user } = useAuth();
  const { company, services, quickActions } = useCompany();
  const { getLeadStats } = useLeads(company?.id);
  
  const stats = getLeadStats();

  // Check if company is set up
  const isCompanySetup = company && company.company_name && services.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CarBot Dashboard</h1>
          <p className="text-muted-foreground">
            Willkommen zurück, {user?.email}! Hier ist Ihre Übersicht.
          </p>
        </div>

        {!isCompanySetup ? (
          // Setup Welcome - Improved styling
          <Card className="mb-8 border-0 bg-gradient-card shadow-card-automotive">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 rounded-2xl bg-gradient-carbot shadow-carbot">
                  <Bot className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl mb-2">
                Willkommen bei CarBot!
              </CardTitle>
              <p className="text-muted-foreground">
                Richten Sie Ihren personalisierten AI-Assistenten in wenigen Minuten ein
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 border border-border/50 rounded-xl hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">1. Firmenprofil</h4>
                  <p className="text-sm text-muted-foreground">
                    Name, Kontakt und Spezialisierungen hinterlegen
                  </p>
                </div>
                <div className="text-center p-6 border border-border/50 rounded-xl hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">2. Services & Preise</h4>
                  <p className="text-sm text-muted-foreground">
                    Aus Vorlagen wählen oder eigene Services erstellen
                  </p>
                </div>
                <div className="text-center p-6 border border-border/50 rounded-xl hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">3. ChatBot aktivieren</h4>
                  <p className="text-sm text-muted-foreground">
                    Widget generieren und in Website einbinden
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Dashboard Overview
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gesamt Leads</p>
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
                    <p className="text-sm text-muted-foreground">Hot Leads</p>
                    <p className="text-2xl font-bold text-red-600">{stats.hot}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Services</p>
                    <p className="text-2xl font-bold">{services.length}</p>
                  </div>
                  <Settings className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Konversionen</p>
                    <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue={isCompanySetup ? "overview" : "setup"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Übersicht</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Leads</span>
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span>ChatBot</span>
            </TabsTrigger>
            <TabsTrigger value="widget" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Widget</span>
            </TabsTrigger>
            <TabsTrigger value="setup" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Einstellungen</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {isCompanySetup ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="card-automotive">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5" />
                      <span>Ihr Unternehmen</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">{company?.company_name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{company?.business_type}</p>
                      </div>
                      
                      {company?.specialties && company.specialties.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Spezialisierungen</h4>
                          <div className="flex flex-wrap gap-2">
                            {company.specialties.map((specialty, index) => (
                              <span 
                                key={index} 
                                className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-primary">{services.length}</p>
                          <p className="text-sm text-muted-foreground">Services</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-primary">{quickActions.length}</p>
                          <p className="text-sm text-muted-foreground">Schnellaktionen</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-automotive">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Lead Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Neue Leads (heute)</p>
                          <p className="text-sm text-muted-foreground">ChatBot generiert</p>
                        </div>
                        <span className="text-2xl font-bold text-automotive-blue">{stats.new}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Conversion Rate</p>
                          <p className="text-sm text-muted-foreground">Leads zu Kunden</p>
                        </div>
                        <span className="text-2xl font-bold text-automotive-success">
                          {stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Durchschn. Lead Score</p>
                          <p className="text-sm text-muted-foreground">Qualität der Leads</p>
                        </div>
                        <span className="text-2xl font-bold text-automotive-warning">
                          {stats.total > 0 ? Math.round((stats.hot * 90 + stats.warm * 70 + stats.cold * 50) / stats.total) : 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  Richten Sie zuerst Ihr Unternehmen ein
                </h3>
                <p className="text-muted-foreground mb-4">
                  Wechseln Sie zum "Einstellungen" Tab, um zu beginnen.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <LeadDashboard />
          </TabsContent>

          {/* ChatBot Tab */}
          <TabsContent value="chatbot">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <Card className="card-automotive">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bot className="h-5 w-5" />
                      <span>ChatBot Vorschau</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96">
                      <ChatBot />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="card-automotive">
                  <CardHeader>
                    <CardTitle>Integration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h4 className="font-medium mb-2">✅ OpenAI ChatBot aktiv</h4>
                        <p className="text-sm text-muted-foreground">
                          Ihr intelligenter AI-Assistant ist konfiguriert und einsatzbereit.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Features</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>✅ Firmenspezifische Antworten</li>
                          <li>✅ Service-Empfehlungen</li>
                          <li>✅ Preisauskunft</li>
                          <li>✅ Lead-Generierung</li>
                          <li>✅ Terminvereinbarung</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <CalendarIntegration />
                <EmailSetup />
              </div>
            </div>
          </TabsContent>

          {/* Widget Tab */}
          <TabsContent value="widget">
            <WidgetManager />
          </TabsContent>

          {/* Setup Tab */}
          <TabsContent value="setup">
            <CompanySetup />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;