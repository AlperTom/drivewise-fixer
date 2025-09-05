import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building2, 
  Settings, 
  Wrench, 
  Euro, 
  Calendar, 
  MessageSquare, 
  Save,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompany, Company, Service, PricingRule, QuickAction } from '@/hooks/useCompany';

const CompanySetup = () => {
  const { toast } = useToast();
  const {
    company,
    services,
    pricingRules,
    quickActions,
    loading,
    saveCompany,
    saveService,
    savePricingRule,
    saveQuickAction
  } = useCompany();

  // Company form state
  const [companyForm, setCompanyForm] = useState<Partial<Company>>({
    company_name: '',
    business_type: 'werkstatt',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    specialties: [],
    brand_colors: { primary: '#f97316', secondary: '#1f2937' },
    business_hours: {}
  });

  // Service form state
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({
    service_name: '',
    description: '',
    category: 'maintenance',
    estimated_duration: 60,
    requires_appointment: true,
    service_details: '',
    is_active: true,
    display_order: 0
  });

  // Quick action form state
  const [quickActionForm, setQuickActionForm] = useState<Partial<QuickAction>>({
    action_text: '',
    action_type: 'message',
    message_template: '',
    icon_name: 'wrench',
    display_order: 0,
    is_active: true
  });

  // Pricing form state
  const [pricingForm, setPricingForm] = useState<Partial<PricingRule>>({
    car_type: 'mittelklasse',
    pricing_type: 'fixed',
    base_price: 0,
    max_price: 0
  });

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingQuickAction, setEditingQuickAction] = useState<QuickAction | null>(null);

  // Load company data into form
  useEffect(() => {
    if (company) {
      setCompanyForm(company);
    }
  }, [company]);

  // Handle company save
  const handleCompanySave = async () => {
    const success = await saveCompany(companyForm);
    if (success) {
      toast({
        title: 'Erfolg',
        description: 'Firmendaten wurden gespeichert.',
      });
    }
  };

  // Handle service save
  const handleServiceSave = async () => {
    const success = await saveService(editingService ? { ...serviceForm, id: editingService.id } : serviceForm);
    if (success) {
      setServiceForm({
        service_name: '',
        description: '',
        category: 'maintenance',
        estimated_duration: 60,
        requires_appointment: true,
        service_details: '',
        is_active: true,
        display_order: services.length
      });
      setEditingService(null);
    }
  };

  // Handle quick action save
  const handleQuickActionSave = async () => {
    const success = await saveQuickAction(editingQuickAction ? { ...quickActionForm, id: editingQuickAction.id } : quickActionForm);
    if (success) {
      setQuickActionForm({
        action_text: '',
        action_type: 'message',
        message_template: '',
        icon_name: 'wrench',
        display_order: quickActions.length,
        is_active: true
      });
      setEditingQuickAction(null);
    }
  };

  // Handle pricing save
  const handlePricingSave = async () => {
    if (!selectedService) {
      toast({
        title: 'Fehler',
        description: 'Bitte wählen Sie zuerst einen Service aus.',
        variant: 'destructive'
      });
      return;
    }

    const success = await savePricingRule({
      ...pricingForm,
      service_id: selectedService.id
    });

    if (success) {
      setPricingForm({
        car_type: 'mittelklasse',
        pricing_type: 'fixed',
        base_price: 0,
        max_price: 0
      });
      toast({
        title: 'Erfolg',
        description: 'Preis wurde gespeichert.',
      });
    }
  };

  // Add specialty
  const addSpecialty = (specialty: string) => {
    if (specialty && !companyForm.specialties?.includes(specialty)) {
      setCompanyForm(prev => ({
        ...prev,
        specialties: [...(prev.specialties || []), specialty]
      }));
    }
  };

  // Remove specialty
  const removeSpecialty = (specialty: string) => {
    setCompanyForm(prev => ({
      ...prev,
      specialties: prev.specialties?.filter(s => s !== specialty) || []
    }));
  };

  // Get pricing for service and car type
  const getPricingForService = (serviceId: string, carType: string) => {
    return pricingRules.find(rule => 
      rule.service_id === serviceId && rule.car_type === carType
    );
  };

  const carTypes = [
    { value: 'kleinwagen', label: 'Kleinwagen' },
    { value: 'mittelklasse', label: 'Mittelklasse' },
    { value: 'oberklasse', label: 'Oberklasse' },
    { value: 'suv', label: 'SUV' },
    { value: 'transporter', label: 'Transporter' },
    { value: 'motorrad', label: 'Motorrad' }
  ];

  const iconOptions = [
    { value: 'wrench', label: 'Werkzeug' },
    { value: 'calendar', label: 'Kalender' },
    { value: 'euro', label: 'Euro' },
    { value: 'phone', label: 'Telefon' },
    { value: 'mail', label: 'E-Mail' },
    { value: 'clock', label: 'Uhr' }
  ];

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CarBot Konfiguration</h1>
        <p className="text-muted-foreground">
          Konfigurieren Sie Ihren personalisierten ChatBot mit Ihren Services, Preisen und Einstellungen.
        </p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Firma</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center space-x-2">
            <Wrench className="h-4 w-4" />
            <span>Services</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center space-x-2">
            <Euro className="h-4 w-4" />
            <span>Preise</span>
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Schnellaktionen</span>
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Firmenprofil</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Firmenname</Label>
                  <Input
                    id="company_name"
                    value={companyForm.company_name}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Ihre Werkstatt GmbH"
                  />
                </div>
                <div>
                  <Label htmlFor="business_type">Geschäftstyp</Label>
                  <Select 
                    value={companyForm.business_type} 
                    onValueChange={(value) => setCompanyForm(prev => ({ ...prev, business_type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="werkstatt">Werkstatt</SelectItem>
                      <SelectItem value="detailing">Detailing</SelectItem>
                      <SelectItem value="cleaning">Reinigung</SelectItem>
                      <SelectItem value="dealership">Autohaus</SelectItem>
                      <SelectItem value="other">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+49 123 456789"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="info@ihre-werkstatt.de"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Musterstraße 123, 12345 Musterstadt"
                />
              </div>

              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beschreiben Sie Ihre Werkstatt und Services..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Spezialisierungen</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {companyForm.specialties?.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{specialty}</span>
                      <button
                        onClick={() => removeSpecialty(specialty)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex mt-2">
                  <Input
                    placeholder="z.B. BMW, Mercedes, Elektrofahrzeuge..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSpecialty(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="ml-2"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      addSpecialty(input.value);
                      input.value = '';
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={handleCompanySave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Firmenprofil speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services */}
        <TabsContent value="services">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wrench className="h-5 w-5" />
                  <span>{editingService ? 'Service bearbeiten' : 'Neuer Service'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="service_name">Service Name</Label>
                  <Input
                    id="service_name"
                    value={serviceForm.service_name}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, service_name: e.target.value }))}
                    placeholder="z.B. Ölwechsel"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Kategorie</Label>
                  <Select 
                    value={serviceForm.category} 
                    onValueChange={(value) => setServiceForm(prev => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Wartung</SelectItem>
                      <SelectItem value="repair">Reparatur</SelectItem>
                      <SelectItem value="detailing">Aufbereitung</SelectItem>
                      <SelectItem value="inspection">Inspektion</SelectItem>
                      <SelectItem value="cleaning">Reinigung</SelectItem>
                      <SelectItem value="tuning">Tuning</SelectItem>
                      <SelectItem value="other">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estimated_duration">Geschätzte Dauer (Minuten)</Label>
                  <Input
                    id="estimated_duration"
                    type="number"
                    value={serviceForm.estimated_duration}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Kurze Beschreibung des Services"
                    rows={3}
                  />
                </div>

                <Button onClick={handleServiceSave} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {editingService ? 'Service aktualisieren' : 'Service speichern'}
                </Button>

                {editingService && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingService(null);
                      setServiceForm({
                        service_name: '',
                        description: '',
                        category: 'maintenance',
                        estimated_duration: 60,
                        requires_appointment: true,
                        service_details: '',
                        is_active: true,
                        display_order: services.length
                      });
                    }}
                    className="w-full"
                  >
                    Abbrechen
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ihre Services</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h4 className="font-medium">{service.service_name}</h4>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          <Badge variant="outline" className="mt-1">
                            {service.category}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingService(service);
                            setServiceForm(service);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pricing */}
        <TabsContent value="pricing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Euro className="h-5 w-5" />
                  <span>Preise festlegen</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Service auswählen</Label>
                  <Select 
                    value={selectedService?.id || ''} 
                    onValueChange={(value) => {
                      const service = services.find(s => s.id === value);
                      setSelectedService(service || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Service auswählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.service_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedService && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="car_type">Fahrzeugtyp</Label>
                        <Select 
                          value={pricingForm.car_type} 
                          onValueChange={(value) => setPricingForm(prev => ({ ...prev, car_type: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {carTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="pricing_type">Preistyp</Label>
                        <Select 
                          value={pricingForm.pricing_type} 
                          onValueChange={(value) => setPricingForm(prev => ({ ...prev, pricing_type: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Festpreis</SelectItem>
                            <SelectItem value="range">Preisbereich</SelectItem>
                            <SelectItem value="quote_only">Nur auf Anfrage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="base_price">
                          {pricingForm.pricing_type === 'range' ? 'Min. Preis (€)' : 'Preis (€)'}
                        </Label>
                        <Input
                          id="base_price"
                          type="number"
                          value={pricingForm.base_price}
                          onChange={(e) => setPricingForm(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                          disabled={pricingForm.pricing_type === 'quote_only'}
                        />
                      </div>

                      {pricingForm.pricing_type === 'range' && (
                        <div>
                          <Label htmlFor="max_price">Max. Preis (€)</Label>
                          <Input
                            id="max_price"
                            type="number"
                            value={pricingForm.max_price}
                            onChange={(e) => setPricingForm(prev => ({ ...prev, max_price: parseFloat(e.target.value) || 0 }))}
                          />
                        </div>
                      )}
                    </div>

                    <Button onClick={handlePricingSave} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Preis speichern
                    </Button>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-4">Aktuelle Preise für {selectedService.service_name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {carTypes.map((carType) => {
                          const pricing = getPricingForService(selectedService.id, carType.value);
                          return (
                            <div key={carType.value} className="p-3 border rounded">
                              <h5 className="font-medium">{carType.label}</h5>
                              {pricing ? (
                                <div className="mt-2">
                                  {pricing.pricing_type === 'fixed' && (
                                    <span className="text-lg font-semibold text-green-600">
                                      {pricing.base_price}€
                                    </span>
                                  )}
                                  {pricing.pricing_type === 'range' && (
                                    <span className="text-lg font-semibold text-blue-600">
                                      {pricing.base_price}€ - {pricing.max_price}€
                                    </span>
                                  )}
                                  {pricing.pricing_type === 'quote_only' && (
                                    <span className="text-sm text-muted-foreground">
                                      Auf Anfrage
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground mt-2 block">
                                  Kein Preis festgelegt
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quick Actions */}
        <TabsContent value="actions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>{editingQuickAction ? 'Schnellaktion bearbeiten' : 'Neue Schnellaktion'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="action_text">Button-Text</Label>
                  <Input
                    id="action_text"
                    value={quickActionForm.action_text}
                    onChange={(e) => setQuickActionForm(prev => ({ ...prev, action_text: e.target.value }))}
                    placeholder="z.B. Termin buchen"
                  />
                </div>

                <div>
                  <Label htmlFor="action_type">Aktionstyp</Label>
                  <Select 
                    value={quickActionForm.action_type} 
                    onValueChange={(value) => setQuickActionForm(prev => ({ ...prev, action_type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="message">Nachricht senden</SelectItem>
                      <SelectItem value="calendar">Kalender öffnen</SelectItem>
                      <SelectItem value="service_inquiry">Service anfragen</SelectItem>
                      <SelectItem value="pricing">Preise anzeigen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="icon_name">Symbol</Label>
                  <Select 
                    value={quickActionForm.icon_name} 
                    onValueChange={(value) => setQuickActionForm(prev => ({ ...prev, icon_name: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message_template">Nachrichtenvorlage</Label>
                  <Textarea
                    id="message_template"
                    value={quickActionForm.message_template}
                    onChange={(e) => setQuickActionForm(prev => ({ ...prev, message_template: e.target.value }))}
                    placeholder="Die Nachricht, die gesendet wird, wenn der Button geklickt wird"
                    rows={3}
                  />
                </div>

                <Button onClick={handleQuickActionSave} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {editingQuickAction ? 'Schnellaktion aktualisieren' : 'Schnellaktion speichern'}
                </Button>

                {editingQuickAction && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingQuickAction(null);
                      setQuickActionForm({
                        action_text: '',
                        action_type: 'message',
                        message_template: '',
                        icon_name: 'wrench',
                        display_order: quickActions.length,
                        is_active: true
                      });
                    }}
                    className="w-full"
                  >
                    Abbrechen
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ihre Schnellaktionen</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {quickActions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h4 className="font-medium">{action.action_text}</h4>
                          <p className="text-sm text-muted-foreground">{action.message_template}</p>
                          <Badge variant="outline" className="mt-1">
                            {action.action_type}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingQuickAction(action);
                            setQuickActionForm(action);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanySetup;