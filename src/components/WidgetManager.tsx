import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Code,
  Copy,
  Eye,
  Settings,
  Key,
  Globe,
  Palette,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';

interface WidgetConfig {
  id: string;
  company_id: string;
  widget_name: string;
  api_key: string;
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: string;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    logoUrl?: string;
  };
  settings: {
    showBranding: boolean;
    welcomeMessage: string;
    autoOpen: boolean;
    collectEmail: boolean;
    collectPhone: boolean;
  };
  is_active: boolean;
  created_at: string;
}

const WidgetManager = () => {
  const { toast } = useToast();
  const { company } = useCompany();
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<WidgetConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Widget form state
  const [widgetForm, setWidgetForm] = useState({
    widget_name: '',
    theme: {
      primaryColor: '#f97316',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      borderRadius: '12px',
      position: 'bottom-right' as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left',
      logoUrl: ''
    },
    settings: {
      showBranding: true,
      welcomeMessage: 'Hallo! Wie kann ich Ihnen heute helfen?',
      autoOpen: false,
      collectEmail: true,
      collectPhone: true
    }
  });

  // Load widgets
  const fetchWidgets = async () => {
    if (!company) return;

    try {
      const { data, error } = await supabase
        .from('widget_configs' as any)
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWidgets((data as unknown as WidgetConfig[]) || []);
      
      if (data && data.length > 0) {
        setSelectedWidget(data[0] as unknown as WidgetConfig);
      }
    } catch (error) {
      console.error('Error fetching widgets:', error);
      toast({
        title: 'Fehler',
        description: 'Widgets konnten nicht geladen werden.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate API key
  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'cb_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Create new widget
  const createWidget = async () => {
    if (!company) return;
    
    setGenerating(true);
    try {
      const newWidget = {
        company_id: company.id,
        widget_name: widgetForm.widget_name || 'CarBot Widget',
        api_key: generateApiKey(),
        theme: widgetForm.theme,
        settings: widgetForm.settings,
        is_active: true
      };

      const { data, error } = await supabase
        .from('widget_configs' as any)
        .insert(newWidget)
        .select()
        .single();

      if (error) throw error;

      setWidgets(prev => [data as unknown as WidgetConfig, ...prev]);
      setSelectedWidget(data as unknown as WidgetConfig);
      
      toast({
        title: 'Erfolg',
        description: 'Widget wurde erstellt!',
      });
      
      // Reset form
      setWidgetForm({
        widget_name: '',
        theme: {
          primaryColor: '#f97316',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          borderRadius: '12px',
          position: 'bottom-right' as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left',
          logoUrl: ''
        },
        settings: {
          showBranding: true,
          welcomeMessage: 'Hallo! Wie kann ich Ihnen heute helfen?',
          autoOpen: false,
          collectEmail: true,
          collectPhone: true
        }
      });
    } catch (error) {
      console.error('Error creating widget:', error);
      toast({
        title: 'Fehler',
        description: 'Widget konnte nicht erstellt werden.',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  // Update widget
  const updateWidget = async () => {
    if (!selectedWidget) return;

    try {
      const { error } = await supabase
        .from('widget_configs' as any)
        .update({
          theme: widgetForm.theme,
          settings: widgetForm.settings
        })
        .eq('id', selectedWidget.id);

      if (error) throw error;

      toast({
        title: 'Erfolg',
        description: 'Widget wurde aktualisiert!',
      });

      fetchWidgets();
    } catch (error) {
      console.error('Error updating widget:', error);
      toast({
        title: 'Fehler',
        description: 'Widget konnte nicht aktualisiert werden.',
        variant: 'destructive'
      });
    }
  };

  // Regenerate API key
  const regenerateApiKey = async () => {
    if (!selectedWidget) return;

    try {
      const newApiKey = generateApiKey();
      
      const { error } = await supabase
        .from('widget_configs' as any)
        .update({ api_key: newApiKey })
        .eq('id', selectedWidget.id);

      if (error) throw error;

      toast({
        title: 'Erfolg',
        description: 'API-Schlüssel wurde erneuert!',
      });

      fetchWidgets();
    } catch (error) {
      console.error('Error regenerating API key:', error);
      toast({
        title: 'Fehler',
        description: 'API-Schlüssel konnte nicht erneuert werden.',
        variant: 'destructive'
      });
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Kopiert!',
        description: 'Text wurde in die Zwischenablage kopiert.',
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Text konnte nicht kopiert werden.',
        variant: 'destructive'
      });
    }
  };

  // Generate embed code
  const generateEmbedCode = (widget: WidgetConfig) => {
    return `<!-- CarBot Widget -->
<div id="carbot-widget"></div>
<script>
  window.carbotConfig = {
    apiKey: '${widget.api_key}',
    theme: ${JSON.stringify(widget.theme, null, 2)},
    settings: ${JSON.stringify(widget.settings, null, 2)}
  };
</script>
<script src="https://carbot.chat/widget.js"></script>`;
  };

  // Generate JavaScript integration
  const generateJSCode = (widget: WidgetConfig) => {
    return `// JavaScript Integration
import CarBot from 'https://carbot.chat/widget.js';

const chatbot = new CarBot({
  apiKey: '${widget.api_key}',
  container: '#carbot-widget',
  theme: ${JSON.stringify(widget.theme, null, 2)},
  settings: ${JSON.stringify(widget.settings, null, 2)}
});

chatbot.init();`;
  };

  useEffect(() => {
    fetchWidgets();
  }, [company]);

  useEffect(() => {
    if (selectedWidget) {
      setWidgetForm({
        widget_name: selectedWidget.widget_name,
        theme: {
          primaryColor: selectedWidget.theme.primaryColor,
          backgroundColor: selectedWidget.theme.backgroundColor,
          textColor: selectedWidget.theme.textColor,
          borderRadius: selectedWidget.theme.borderRadius,
          position: selectedWidget.theme.position,
          logoUrl: selectedWidget.theme.logoUrl || ''
        },
        settings: selectedWidget.settings
      });
    }
  }, [selectedWidget]);

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Widget Management</h2>
          <p className="text-muted-foreground">
            Erstellen und verwalten Sie einbettbare ChatBot-Widgets für Ihre Website
          </p>
        </div>
        
        {!selectedWidget && (
          <Button onClick={createWidget} disabled={generating} className="btn-carbot text-white">
            {generating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Globe className="h-4 w-4 mr-2" />
            )}
            Widget erstellen
          </Button>
        )}
      </div>

      {widgets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Noch keine Widgets</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Erstellen Sie Ihr erstes Widget, um CarBot auf Ihrer Website zu integrieren.
            </p>
            <Button onClick={createWidget} disabled={generating} className="btn-carbot text-white">
              {generating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Globe className="h-4 w-4 mr-2" />
              )}
              Erstes Widget erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Widget List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Ihre Widgets</span>
                <Button size="sm" onClick={createWidget} disabled={generating}>
                  <Globe className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedWidget?.id === widget.id ? 'bg-primary/5 border-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedWidget(widget)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{widget.widget_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(widget.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={widget.is_active ? "default" : "secondary"}>
                        {widget.is_active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Widget Configuration */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>{selectedWidget?.widget_name || 'Widget'} - Konfiguration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedWidget && (
                <Tabs defaultValue="settings" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="settings">Einstellungen</TabsTrigger>
                    <TabsTrigger value="theme">Design</TabsTrigger>
                    <TabsTrigger value="api">API</TabsTrigger>
                    <TabsTrigger value="embed">Integration</TabsTrigger>
                  </TabsList>

                  {/* Settings Tab */}
                  <TabsContent value="settings" className="space-y-4">
                    <div>
                      <Label>Begrüßungsnachricht</Label>
                      <Textarea
                        value={widgetForm.settings.welcomeMessage}
                        onChange={(e) => setWidgetForm(prev => ({
                          ...prev,
                          settings: { ...prev.settings, welcomeMessage: e.target.value }
                        }))}
                        placeholder="Hallo! Wie kann ich Ihnen heute helfen?"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={widgetForm.settings.autoOpen}
                          onChange={(e) => setWidgetForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, autoOpen: e.target.checked }
                          }))}
                        />
                        <span>Automatisch öffnen</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={widgetForm.settings.showBranding}
                          onChange={(e) => setWidgetForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, showBranding: e.target.checked }
                          }))}
                        />
                        <span>CarBot Branding anzeigen</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={widgetForm.settings.collectEmail}
                          onChange={(e) => setWidgetForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, collectEmail: e.target.checked }
                          }))}
                        />
                        <span>E-Mail sammeln</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={widgetForm.settings.collectPhone}
                          onChange={(e) => setWidgetForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, collectPhone: e.target.checked }
                          }))}
                        />
                        <span>Telefon sammeln</span>
                      </label>
                    </div>

                    <Button onClick={updateWidget} className="w-full">
                      Einstellungen speichern
                    </Button>
                  </TabsContent>

                  {/* Theme Tab */}
                  <TabsContent value="theme" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Primärfarbe</Label>
                        <Input
                          type="color"
                          value={widgetForm.theme.primaryColor}
                          onChange={(e) => setWidgetForm(prev => ({
                            ...prev,
                            theme: { ...prev.theme, primaryColor: e.target.value }
                          }))}
                        />
                      </div>

                      <div>
                        <Label>Hintergrundfarbe</Label>
                        <Input
                          type="color"
                          value={widgetForm.theme.backgroundColor}
                          onChange={(e) => setWidgetForm(prev => ({
                            ...prev,
                            theme: { ...prev.theme, backgroundColor: e.target.value }
                          }))}
                        />
                      </div>

                      <div>
                        <Label>Textfarbe</Label>
                        <Input
                          type="color"
                          value={widgetForm.theme.textColor}
                          onChange={(e) => setWidgetForm(prev => ({
                            ...prev,
                            theme: { ...prev.theme, textColor: e.target.value }
                          }))}
                        />
                      </div>

                       <div>
                        <Label>Position</Label>
                        <select
                          value={widgetForm.theme.position}
                          onChange={(e) => setWidgetForm(prev => ({
                            ...prev,
                            theme: { ...prev.theme, position: e.target.value as any }
                          }))}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="bottom-right">Unten rechts</option>
                          <option value="bottom-left">Unten links</option>
                          <option value="top-right">Oben rechts</option>
                          <option value="top-left">Oben links</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <Label>Custom Logo URL (optional)</Label>
                      <Input
                        type="url"
                        value={widgetForm.theme.logoUrl || ''}
                        onChange={(e) => setWidgetForm(prev => ({
                          ...prev,
                          theme: { ...prev.theme, logoUrl: e.target.value }
                        }))}
                        placeholder="https://ihr-logo.com/logo.png"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Lassen Sie das Feld leer um das CarBot Standard-Logo zu verwenden
                      </p>
                    </div>

                    <Button onClick={updateWidget} className="w-full">
                      <Palette className="h-4 w-4 mr-2" />
                      Design speichern
                    </Button>
                  </TabsContent>

                  {/* API Tab */}
                  <TabsContent value="api" className="space-y-4">
                    <Alert>
                      <Key className="h-4 w-4" />
                      <AlertDescription>
                        Ihr API-Schlüssel wird für die Authentifizierung des Widgets verwendet. 
                        Teilen Sie ihn nicht öffentlich und erneuern Sie ihn regelmäßig.
                      </AlertDescription>
                    </Alert>

                    <div>
                      <Label>API-Schlüssel</Label>
                      <div className="flex space-x-2">
                        <Input 
                          value={selectedWidget.api_key} 
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => copyToClipboard(selectedWidget.api_key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={regenerateApiKey}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Widget-ID</Label>
                      <div className="flex space-x-2">
                        <Input 
                          value={selectedWidget.id} 
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => copyToClipboard(selectedWidget.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Embed Tab */}
                  <TabsContent value="embed" className="space-y-4">
                    <div>
                      <Label className="flex items-center space-x-2">
                        <Code className="h-4 w-4" />
                        <span>HTML Embed Code</span>
                      </Label>
                      <div className="relative">
                        <Textarea
                          value={generateEmbedCode(selectedWidget)}
                          readOnly
                          className="font-mono text-sm"
                          rows={8}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(generateEmbedCode(selectedWidget))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center space-x-2">
                        <ExternalLink className="h-4 w-4" />
                        <span>JavaScript Integration</span>
                      </Label>
                      <div className="relative">
                        <Textarea
                          value={generateJSCode(selectedWidget)}
                          readOnly
                          className="font-mono text-sm"
                          rows={8}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(generateJSCode(selectedWidget))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Integration erfolgreich!</strong><br />
                        Kopieren Sie den Code und fügen Sie ihn vor dem schließenden &lt;/body&gt; Tag Ihrer Website ein.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WidgetManager;