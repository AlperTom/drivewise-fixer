import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Code, 
  ExternalLink, 
  Globe, 
  CheckCircle2,
  ArrowRight,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

// Extend window interface for CarBot
declare global {
  interface Window {
    CarBot?: {
      open: () => void;
      close: () => void;
      toggle: () => void;
      sendMessage: (text: string) => void;
    };
  }
}

const WidgetDemo = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load the widget script with demo configuration
    const script = document.createElement('script');
    script.innerHTML = `
      window.carbotConfig = {
        apiKey: 'demo_key_12345_replace_with_real_key',
        theme: {
          primaryColor: '#f97316',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          borderRadius: '12px',
          position: 'bottom-right'
        },
        settings: {
          showBranding: true,
          welcomeMessage: 'Hallo! Willkommen bei unserer Demo. Wie kann ich Ihnen helfen?',
          autoOpen: false,
          collectEmail: true,
          collectPhone: true
        }
      };
    `;
    document.head.appendChild(script);

    // Load the widget
    const widgetScript = document.createElement('script');
    widgetScript.src = '/widget.js';
    widgetScript.async = true;
    document.head.appendChild(widgetScript);

    return () => {
      // Cleanup
      if (window.CarBot) {
        window.CarBot.close();
      }
      const widgetContainer = document.getElementById('carbot-widget-container');
      if (widgetContainer) {
        widgetContainer.remove();
      }
    };
  }, []);

  const integrationCode = `<!-- CarBot Widget Integration -->
<div id="carbot-widget"></div>
<script>
  window.carbotConfig = {
    apiKey: 'IHR_API_SCHLÜSSEL',
    theme: {
      primaryColor: '#f97316',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      borderRadius: '12px',
      position: 'bottom-right'
    },
    settings: {
      showBranding: true,
      welcomeMessage: 'Hallo! Wie kann ich Ihnen heute helfen?',
      autoOpen: false,
      collectEmail: true,
      collectPhone: true
    }
  };
</script>
<script src="https://carbot.chat/widget.js"></script>`;

  const features = [
    {
      icon: <Globe className="h-6 w-6 text-automotive-orange" />,
      title: "Universell einsetzbar",
      description: "Funktioniert auf jeder Website - WordPress, Shopify, HTML oder React"
    },
    {
      icon: <Smartphone className="h-6 w-6 text-automotive-purple" />,
      title: "Mobile optimiert",
      description: "Perfekte Darstellung auf Smartphones, Tablets und Desktop"
    },
    {
      icon: <CheckCircle2 className="h-6 w-6 text-automotive-success" />,
      title: "Einfache Integration",
      description: "Nur 2 Code-Zeilen und Ihr ChatBot ist live auf Ihrer Website"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-automotive-orange/20 rounded-full blur-3xl animate-pulse-automotive"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-automotive-purple/20 rounded-full blur-3xl animate-pulse-automotive" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="automotive-title mb-6">
            Live <span className="bg-gradient-carbot bg-clip-text text-transparent">Widget</span> Demo
          </h1>
          
          <p className="automotive-subtitle mb-8 max-w-2xl mx-auto">
            Erleben Sie CarBot in Aktion! Klicken Sie auf den Chat-Button unten rechts, 
            um mit unserem AI-Assistenten zu interagieren.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              onClick={() => window.CarBot && window.CarBot.open()} 
              className="btn-carbot text-white"
            >
              <Globe className="mr-2 h-4 w-4" />
              Widget öffnen
            </Button>
            
            <Button variant="outline" className="bg-card/50 border-border hover:bg-card" onClick={() => navigate('/auth')}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Zur Anmeldung
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-automotive">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-16 bg-gradient-to-br from-card/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Integration in <span className="bg-gradient-carbot bg-clip-text text-transparent">2 Minuten</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                So einfach bringen Sie CarBot auf Ihre Website
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Steps */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-automotive-orange text-white flex items-center justify-center font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Account erstellen</h3>
                    <p className="text-muted-foreground">
                      Registrieren Sie sich kostenlos und erstellen Sie Ihr Widget
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-automotive-purple text-white flex items-center justify-center font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Code kopieren</h3>
                    <p className="text-muted-foreground">
                      Ihren personalisierten Widget-Code aus dem Dashboard kopieren
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-automotive-success text-white flex items-center justify-center font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Einfügen & fertig!</h3>
                    <p className="text-muted-foreground">
                      Code vor &lt;/body&gt; einfügen und CarBot ist live
                    </p>
                  </div>
                </div>
              </div>

              {/* Code Example */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5" />
                    <span>Integration Code</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                      <code>{integrationCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        navigator.clipboard.writeText(integrationCode);
                      }}
                    >
                      Kopieren
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Device Preview */}
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-bold mb-8">Funktioniert auf allen Geräten</h3>
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <Monitor className="h-12 w-12 mx-auto mb-2 text-automotive-blue" />
                  <span className="text-sm text-muted-foreground">Desktop</span>
                </div>
                <div className="text-center">
                  <Tablet className="h-12 w-12 mx-auto mb-2 text-automotive-purple" />
                  <span className="text-sm text-muted-foreground">Tablet</span>
                </div>
                <div className="text-center">
                  <Smartphone className="h-12 w-12 mx-auto mb-2 text-automotive-orange" />
                  <span className="text-sm text-muted-foreground">Mobile</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-16">
              <Card className="card-automotive max-w-2xl mx-auto">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">
                    Bereit für Ihr eigenes Widget?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Erstellen Sie in wenigen Minuten Ihren personalisierten CarBot 
                    und steigern Sie Ihre Konversionsrate um bis zu 300%.
                  </p>
                  <Button className="btn-carbot text-white" onClick={() => navigate('/auth')}>
                    Jetzt kostenlos starten
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WidgetDemo;