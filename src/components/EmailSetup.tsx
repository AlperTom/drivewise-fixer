import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  MailOpen, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Send,
  Bell,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sanitizeEmail, sanitizeTextInput } from '@/lib/sanitization';

interface EmailSetupProps {
  onSetupComplete?: () => void;
}

export const EmailSetup: React.FC<EmailSetupProps> = ({ onSetupComplete }) => {
  const { toast } = useToast();
  const [isSetup, setIsSetup] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [emailSettings, setEmailSettings] = useState({
    notifyOnNewLead: true,
    notifyOnHotLead: true,
    sendCustomerConfirmation: true,
    dailyReports: false,
    fromEmail: 'service@ihre-werkstatt.de',
    replyToEmail: 'info@ihre-werkstatt.de',
    signatureName: 'Ihr CarBot Team'
  });

  const [emailTemplate, setEmailTemplate] = useState({
    subject: 'Vielen Dank für Ihre Anfrage!',
    message: `Hallo {{customer_name}},

vielen Dank für Ihre Anfrage über unseren ChatBot!

Wir haben Ihre Nachricht erhalten und melden uns schnellstmöglich bei Ihnen zurück.

Service: {{service_name}}
Fahrzeug: {{vehicle_info}}

Bei dringenden Fragen erreichen Sie uns auch telefonisch unter: {{phone}}

Mit freundlichen Grüßen
{{signature}}`
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // Sanitize email settings before saving
    const sanitizedSettings = {
      ...emailSettings,
      fromEmail: sanitizeEmail(emailSettings.fromEmail),
      replyToEmail: sanitizeEmail(emailSettings.replyToEmail),
      signatureName: sanitizeTextInput(emailSettings.signatureName)
    };

    const sanitizedTemplate = {
      ...emailTemplate,
      subject: sanitizeTextInput(emailTemplate.subject),
      message: sanitizeTextInput(emailTemplate.message)
    };

    // Validate email addresses
    if (!sanitizedSettings.fromEmail || !sanitizedSettings.replyToEmail) {
      toast({
        title: 'Fehler',
        description: 'Bitte geben Sie gültige E-Mail-Adressen ein.',
        variant: 'destructive'
      });
      setIsSaving(false);
      return;
    }
    
    // Simulate save process with sanitized data
    setTimeout(() => {
      setEmailSettings(sanitizedSettings);
      setEmailTemplate(sanitizedTemplate);
      setIsSaving(false);
      setIsSetup(true);
      toast({
        title: 'E-Mail Setup abgeschlossen!',
        description: 'Benachrichtigungen und automatische E-Mails sind jetzt aktiv.',
      });
      onSetupComplete?.();
    }, 1500);
  };

  const handleTestEmail = () => {
    toast({
      title: 'Test-E-Mail gesendet!',
      description: 'Prüfen Sie Ihren Posteingang.',
    });
  };

  if (isSetup) {
    return (
      <Card className="card-automotive border-automotive-success/20 bg-automotive-success/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-automotive-success">
            <CheckCircle className="h-5 w-5" />
            <span>E-Mail System aktiviert</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-background rounded-lg">
              <Bell className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="font-medium">Lead-Benachrichtigungen</p>
              <Badge variant="secondary" className="mt-1">Aktiv</Badge>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <MailOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="font-medium">Auto-Antworten</p>
              <Badge variant="secondary" className="mt-1">Aktiv</Badge>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <Send className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="font-medium">Kundenbestätigungen</p>
              <Badge variant="secondary" className="mt-1">Aktiv</Badge>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <Button variant="outline" className="w-full" onClick={handleTestEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Test-E-Mail senden
            </Button>
            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              E-Mail-Einstellungen bearbeiten
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Settings */}
      <Card className="card-automotive">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>E-Mail Benachrichtigungen</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Konfigurieren Sie automatische E-Mails und Benachrichtigungen
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Benachrichtigungen an Sie</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notify-lead">Bei neuen Leads</Label>
                  <p className="text-sm text-muted-foreground">Sofortige Benachrichtigung per E-Mail</p>
                </div>
                <Switch
                  id="notify-lead"
                  checked={emailSettings.notifyOnNewLead}
                  onCheckedChange={(checked) => 
                    setEmailSettings(prev => ({ ...prev, notifyOnNewLead: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notify-hot">Bei heißen Leads</Label>
                  <p className="text-sm text-muted-foreground">Prioritäts-Benachrichtigung</p>
                </div>
                <Switch
                  id="notify-hot"
                  checked={emailSettings.notifyOnHotLead}
                  onCheckedChange={(checked) => 
                    setEmailSettings(prev => ({ ...prev, notifyOnHotLead: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="daily-reports">Tägliche Berichte</Label>
                  <p className="text-sm text-muted-foreground">Lead-Zusammenfassung am Ende des Tages</p>
                </div>
                <Switch
                  id="daily-reports"
                  checked={emailSettings.dailyReports}
                  onCheckedChange={(checked) => 
                    setEmailSettings(prev => ({ ...prev, dailyReports: checked }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">E-Mails an Kunden</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="customer-confirmation">Bestätigungsmail</Label>
                  <p className="text-sm text-muted-foreground">Automatische Antwort nach ChatBot-Gespräch</p>
                </div>
                <Switch
                  id="customer-confirmation"
                  checked={emailSettings.sendCustomerConfirmation}
                  onCheckedChange={(checked) => 
                    setEmailSettings(prev => ({ ...prev, sendCustomerConfirmation: checked }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="from-email">Absender E-Mail</Label>
                <Input
                  id="from-email"
                  type="email"
                  value={emailSettings.fromEmail}
                  onChange={(e) => 
                    setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))
                  }
                  placeholder="service@ihre-werkstatt.de"
                />
              </div>

              <div>
                <Label htmlFor="reply-email">Antwort E-Mail</Label>
                <Input
                  id="reply-email"
                  type="email"
                  value={emailSettings.replyToEmail}
                  onChange={(e) => 
                    setEmailSettings(prev => ({ ...prev, replyToEmail: e.target.value }))
                  }
                  placeholder="info@ihre-werkstatt.de"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Template */}
      <Card className="card-automotive">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MailOpen className="h-5 w-5" />
            <span>E-Mail Vorlage bearbeiten</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email-subject">Betreff</Label>
            <Input
              id="email-subject"
              value={emailTemplate.subject}
              onChange={(e) => 
                setEmailTemplate(prev => ({ ...prev, subject: e.target.value }))
              }
              placeholder="Betreff der automatischen E-Mail"
            />
          </div>

          <div>
            <Label htmlFor="email-message">Nachricht</Label>
            <Textarea
              id="email-message"
              value={emailTemplate.message}
              onChange={(e) => 
                setEmailTemplate(prev => ({ ...prev, message: e.target.value }))
              }
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <h5 className="font-medium mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Verfügbare Variablen:
            </h5>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div><code>{'{{customer_name}}'}</code> - Kundenname</div>
              <div><code>{'{{service_name}}'}</code> - Gewünschter Service</div>
              <div><code>{'{{vehicle_info}}'}</code> - Fahrzeuginfos</div>
              <div><code>{'{{phone}}'}</code> - Ihre Telefonnummer</div>
              <div><code>{'{{signature}}'}</code> - Ihre Signatur</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="card-automotive border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Vorschau</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-background border rounded-lg">
            <div className="border-b pb-2 mb-4">
              <p><strong>Von:</strong> {emailSettings.fromEmail}</p>
              <p><strong>Betreff:</strong> {emailTemplate.subject}</p>
            </div>
            <div className="whitespace-pre-wrap text-sm">
              {emailTemplate.message
                .replace('{{customer_name}}', 'Max Mustermann')
                .replace('{{service_name}}', 'Ölwechsel')
                .replace('{{vehicle_info}}', 'BMW 320d, Bj. 2018')
                .replace('{{phone}}', '+49 123 456789')
                .replace('{{signature}}', emailSettings.signatureName)
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-4">
        <Button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex-1 btn-carbot"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Speichere...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              E-Mail Setup abschließen
            </>
          )}
        </Button>
        
        <Button variant="outline" onClick={handleTestEmail}>
          <Send className="h-4 w-4 mr-2" />
          Test senden
        </Button>
      </div>
    </div>
  );
};