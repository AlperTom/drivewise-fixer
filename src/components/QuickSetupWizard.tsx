import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Wrench, 
  Euro, 
  MessageSquare, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Zap,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompany, Company, Service, QuickAction } from '@/hooks/useCompany';
import { ServiceTemplateSelector } from './ServiceTemplateSelector';
import { automotiveServiceTemplates, defaultQuickActions, ServiceTemplate } from '@/data/serviceTemplates';
import { sanitizeTextInput, sanitizeEmail, sanitizePhone } from '@/lib/sanitization';

interface QuickSetupWizardProps {
  onComplete?: () => void;
}

type SetupStep = 'company' | 'services' | 'pricing' | 'quickactions' | 'complete';

export const QuickSetupWizard: React.FC<QuickSetupWizardProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const { company, services, saveCompany, saveService, savePricingRule, saveQuickAction } = useCompany();
  
  const [currentStep, setCurrentStep] = useState<SetupStep>('company');
  const [progress, setProgress] = useState(0);
  
  // Company data
  const [companyForm, setCompanyForm] = useState<Partial<Company>>({
    company_name: '',
    business_type: 'werkstatt',
    phone: '',
    email: '',
    address: '',
    description: '',
  });
  
  // Selected services from templates
  const [selectedServices, setSelectedServices] = useState<ServiceTemplate[]>([]);
  
  // Pricing settings
  const [showPricesInChat, setShowPricesInChat] = useState(true);
  const [quickPricingEnabled, setQuickPricingEnabled] = useState(true);
  
  // Quick actions
  const [selectedQuickActions, setSelectedQuickActions] = useState(
    defaultQuickActions.slice(0, 4) // Select first 4 by default
  );

  const steps: { key: SetupStep; title: string; icon: any }[] = [
    { key: 'company', title: 'Firmenprofil', icon: Building2 },
    { key: 'services', title: 'Services wählen', icon: Wrench },
    { key: 'pricing', title: 'Preiseinstellungen', icon: Euro },
    { key: 'quickactions', title: 'Schnellaktionen', icon: MessageSquare },
    { key: 'complete', title: 'Fertig!', icon: CheckCircle }
  ];

  useEffect(() => {
    if (company) {
      setCompanyForm(company);
    }
  }, [company]);

  useEffect(() => {
    const stepIndex = steps.findIndex(step => step.key === currentStep);
    setProgress(((stepIndex + 1) / steps.length) * 100);
  }, [currentStep]);

  const handleNextStep = async () => {
    if (currentStep === 'company') {
      // Sanitize company form data before saving
      const sanitizedCompanyForm = {
        ...companyForm,
        company_name: sanitizeTextInput(companyForm.company_name || ''),
        phone: sanitizePhone(companyForm.phone || ''),
        email: sanitizeEmail(companyForm.email || ''),
        address: sanitizeTextInput(companyForm.address || ''),
        description: sanitizeTextInput(companyForm.description || '')
      };

      // Validate critical fields after sanitization
      if (!sanitizedCompanyForm.company_name || !sanitizedCompanyForm.phone || !sanitizedCompanyForm.email) {
        toast({
          title: 'Fehler',
          description: 'Bitte füllen Sie alle Pflichtfelder aus.',
          variant: 'destructive'
        });
        return;
      }

      const success = await saveCompany(sanitizedCompanyForm);
      if (success) {
        setCurrentStep('services');
      }
    } else if (currentStep === 'services') {
      // Save selected services
      let allSuccessful = true;
      for (const template of selectedServices) {
        const success = await saveService({
          service_name: template.service_name,
          description: template.description,
          category: template.category,
          estimated_duration: template.estimated_duration,
          requires_appointment: template.requires_appointment,
          service_details: template.service_details,
          is_active: true,
          display_order: 0
        });
        if (!success) allSuccessful = false;
      }
      
      if (allSuccessful) {
        setCurrentStep('pricing');
      }
    } else if (currentStep === 'pricing') {
      // Save pricing rules if enabled
      if (quickPricingEnabled && selectedServices.length > 0) {
        for (const template of selectedServices) {
          if (template.typical_pricing) {
            const serviceId = services.find(s => s.service_name === template.service_name)?.id;
            if (serviceId) {
              // Add pricing for common car types
              for (const [carType, price] of Object.entries(template.typical_pricing)) {
                await savePricingRule({
                  service_id: serviceId,
                  car_type: carType as any,
                  pricing_type: 'fixed',
                  base_price: price
                });
              }
            }
          }
        }
      }
      setCurrentStep('quickactions');
    } else if (currentStep === 'quickactions') {
      // Save quick actions
      let allSuccessful = true;
      for (const action of selectedQuickActions) {
        const success = await saveQuickAction({
          action_text: action.action_text,
          action_type: action.action_type,
          message_template: action.message_template,
          icon_name: action.icon_name,
          display_order: action.display_order,
          is_active: true
        });
        if (!success) allSuccessful = false;
      }
      
      if (allSuccessful) {
        setCurrentStep('complete');
      }
    } else if (currentStep === 'complete') {
      onComplete?.();
    }
  };

  const handlePreviousStep = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'company':
        return companyForm.company_name && companyForm.phone && companyForm.email;
      case 'services':
        return selectedServices.length > 0;
      case 'pricing':
      case 'quickactions':
        return true;
      default:
        return false;
    }
  };

  const selectService = (template: ServiceTemplate) => {
    setSelectedServices(prev => [...prev, template]);
  };

  const removeService = (templateIndex: number) => {
    setSelectedServices(prev => prev.filter((_, index) => index !== templateIndex));
  };

  const toggleQuickAction = (action: typeof defaultQuickActions[0]) => {
    setSelectedQuickActions(prev => {
      const exists = prev.find(a => a.action_text === action.action_text);
      if (exists) {
        return prev.filter(a => a.action_text !== action.action_text);
      } else {
        return [...prev, action];
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Zap className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">CarBot Quick-Setup</h1>
        </div>
        <p className="text-muted-foreground mb-6">
          Richten Sie Ihren ChatBot in wenigen Minuten ein
        </p>
        
        <Progress value={progress} className="mb-8" />
        
        <div className="flex items-center justify-center space-x-4 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.key === currentStep;
            const isCompleted = steps.findIndex(s => s.key === currentStep) > index;
            
            return (
              <div key={step.key} className="flex items-center space-x-2">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 
                  ${isActive ? 'border-primary bg-primary text-primary-foreground' : 
                    isCompleted ? 'border-automotive-success bg-automotive-success text-white' : 
                    'border-muted bg-background text-muted-foreground'}
                `}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-sm ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Card className="card-automotive">
        <CardContent className="p-8">
          {/* Company Step */}
          {currentStep === 'company' && (
            <div className="space-y-6">
              <CardHeader className="text-center p-0">
                <CardTitle className="flex items-center justify-center space-x-2 text-xl">
                  <Building2 className="h-5 w-5" />
                  <span>Firmenprofil einrichten</span>
                </CardTitle>
              </CardHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Firmenname *</Label>
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
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+49 123 456789"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-Mail *</Label>
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
                <Label htmlFor="description">Kurzbeschreibung</Label>
                <Textarea
                  id="description"
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beschreiben Sie Ihre Werkstatt in wenigen Sätzen..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Services Step */}
          {currentStep === 'services' && (
            <div className="space-y-6">
              <CardHeader className="text-center p-0">
                <CardTitle className="flex items-center justify-center space-x-2 text-xl">
                  <Wrench className="h-5 w-5" />
                  <span>Services auswählen</span>
                </CardTitle>
                <p className="text-muted-foreground">
                  Wählen Sie aus unseren vorgefertigten Services oder fügen Sie eigene hinzu
                </p>
              </CardHeader>

              {selectedServices.length > 0 && (
                <div className="space-y-3">
                  <Label>Ausgewählte Services ({selectedServices.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map((service, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="flex items-center space-x-2 px-3 py-1"
                      >
                        <span>{service.service_name}</span>
                        <button
                          onClick={() => removeService(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <ServiceTemplateSelector 
                onSelectTemplate={selectService}
                existingServices={[...services, ...selectedServices.map(template => ({
                  id: 'temp',
                  company_id: 'temp',
                  service_name: template.service_name,
                  description: template.description,
                  category: template.category,
                  estimated_duration: template.estimated_duration,
                  requires_appointment: template.requires_appointment,
                  service_details: template.service_details,
                  prerequisites: template.prerequisites,
                  is_active: true,
                  display_order: 0,
                  created_at: '',
                  updated_at: ''
                }))]}
              />
            </div>
          )}

          {/* Pricing Step */}
          {currentStep === 'pricing' && (
            <div className="space-y-6">
              <CardHeader className="text-center p-0">
                <CardTitle className="flex items-center justify-center space-x-2 text-xl">
                  <Euro className="h-5 w-5" />
                  <span>Preiseinstellungen</span>
                </CardTitle>
              </CardHeader>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="show-prices"
                    checked={showPricesInChat}
                    onCheckedChange={(checked) => setShowPricesInChat(checked === true)}
                  />
                  <Label htmlFor="show-prices">
                    Preise im ChatBot anzeigen
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="quick-pricing"
                    checked={quickPricingEnabled}
                    onCheckedChange={(checked) => setQuickPricingEnabled(checked === true)}
                  />
                  <Label htmlFor="quick-pricing">
                    Standard-Preise aus Vorlagen übernehmen
                  </Label>
                </div>
              </div>

              {quickPricingEnabled && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Für Ihre ausgewählten Services werden automatisch branchenübliche Preise eingepflegt. 
                    Sie können diese später jederzeit anpassen.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions Step */}
          {currentStep === 'quickactions' && (
            <div className="space-y-6">
              <CardHeader className="text-center p-0">
                <CardTitle className="flex items-center justify-center space-x-2 text-xl">
                  <MessageSquare className="h-5 w-5" />
                  <span>Schnellaktionen auswählen</span>
                </CardTitle>
                <p className="text-muted-foreground">
                  Diese Buttons erscheinen im ChatBot für häufige Kundenanfragen
                </p>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {defaultQuickActions.map((action, index) => {
                  const isSelected = selectedQuickActions.some(a => a.action_text === action.action_text);
                  
                  return (
                    <Card 
                      key={index}
                      className={`cursor-pointer transition-all ${
                        isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => toggleQuickAction(action)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            checked={isSelected}
                            onChange={() => {}}
                          />
                          <div>
                            <p className="font-medium">{action.action_text}</p>
                            <p className="text-xs text-muted-foreground">
                              {action.message_template?.slice(0, 60)}...
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Complete Step */}
          {currentStep === 'complete' && (
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center w-16 h-16 bg-automotive-success/10 rounded-full mx-auto">
                <CheckCircle className="h-8 w-8 text-automotive-success" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2">Setup abgeschlossen!</h2>
                <p className="text-muted-foreground">
                  Ihr CarBot ist jetzt einsatzbereit. Sie können das Widget jetzt in Ihre Website einbinden.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-lg space-y-3">
                <h3 className="font-semibold">Was Sie eingerichtet haben:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>✅ Firmenprofil</div>
                  <div>✅ {selectedServices.length} Services</div>
                  <div>✅ Preiseinstellungen</div>
                  <div>✅ {selectedQuickActions.length} Schnellaktionen</div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Setup-Zeit: ca. 3 Minuten</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-8">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStep === 'company'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>

            <Button
              onClick={handleNextStep}
              disabled={!canProceed()}
              className="btn-carbot"
            >
              {currentStep === 'complete' ? 'Dashboard öffnen' : 'Weiter'}
              {currentStep !== 'complete' && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};