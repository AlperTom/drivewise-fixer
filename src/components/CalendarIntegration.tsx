import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CalendarDays, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CalendarIntegrationProps {
  onIntegrationComplete?: () => void;
}

export const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({ 
  onIntegrationComplete 
}) => {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const providers = [
    {
      id: 'google',
      name: 'Google Calendar',
      description: 'Synchronisiert mit Google Workspace',
      icon: '📅',
      popular: true
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      description: 'Outlook 365 und Exchange',
      icon: '📧',
      popular: true
    },
    {
      id: 'caldav',
      name: 'CalDAV',
      description: 'Apple Calendar, Thunderbird etc.',
      icon: '🔗',
      popular: false
    }
  ];

  const handleConnect = async (providerId: string) => {
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      
      if (providerId === 'google' || providerId === 'outlook') {
        setIsConnected(true);
        toast({
          title: 'Kalender verbunden!',
          description: `${providers.find(p => p.id === providerId)?.name} wurde erfolgreich verbunden.`,
        });
        onIntegrationComplete?.();
      } else {
        toast({
          title: 'Kommt bald!',
          description: 'CalDAV Integration wird in Kürze verfügbar sein.',
        });
      }
    }, 2000);
  };

  if (isConnected) {
    return (
      <Card className="card-automotive border-automotive-success/20 bg-automotive-success/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-automotive-success">
            <CheckCircle className="h-5 w-5" />
            <span>Kalender verbunden</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-background rounded-lg">
            <span className="text-2xl">📅</span>
            <div>
              <p className="font-medium">Google Calendar</p>
              <p className="text-sm text-muted-foreground">Termine werden automatisch synchronisiert</p>
            </div>
            <Badge variant="secondary" className="ml-auto">Aktiv</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="font-medium">Auto-Buchung</p>
              <p className="text-xs text-muted-foreground">ChatBot bucht direkt Termine</p>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="font-medium">Echtzeit-Sync</p>
              <p className="text-xs text-muted-foreground">Verfügbarkeiten live prüfen</p>
            </div>
          </div>

          <div className="pt-4">
            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Kalender-Einstellungen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-automotive">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Kalender verbinden</span>
        </CardTitle>
        <p className="text-muted-foreground">
          Verbinden Sie Ihren Kalender für automatische Terminbuchungen
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`
                relative p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50
                ${selectedProvider === provider.id ? 'border-primary bg-primary/5' : 'border-border'}
              `}
              onClick={() => setSelectedProvider(provider.id)}
            >
              {provider.popular && (
                <Badge className="absolute -top-2 -right-2 bg-primary">Beliebt</Badge>
              )}
              
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{provider.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold">{provider.name}</h3>
                  <p className="text-sm text-muted-foreground">{provider.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedProvider === provider.id && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedProvider && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-automotive-warning mt-0.5" />
              <div>
                <h4 className="font-medium">Berechtigungen benötigt:</h4>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Kalender-Ereignisse lesen</li>
                  <li>• Termine erstellen und bearbeiten</li>
                  <li>• Verfügbarkeiten prüfen</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={() => handleConnect(selectedProvider)}
              disabled={isConnecting}
              className="w-full btn-carbot"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verbinde...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Mit {providers.find(p => p.id === selectedProvider)?.name} verbinden
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p>🔒 Ihre Kalenderdaten bleiben sicher und privat</p>
        </div>
      </CardContent>
    </Card>
  );
};