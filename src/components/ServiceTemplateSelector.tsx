import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Clock,
  Euro,
  CheckCircle,
  Wrench,
  Car,
  Palette,
  Shield,
  Zap
} from 'lucide-react';
import { automotiveServiceTemplates, ServiceTemplate } from '@/data/serviceTemplates';
import { Service } from '@/hooks/useCompany';

interface ServiceTemplateSelectorProps {
  onSelectTemplate: (template: ServiceTemplate) => void;
  existingServices: Service[];
}

const categoryIcons = {
  maintenance: Wrench,
  repair: Car,
  detailing: Palette,
  inspection: Shield,
  cleaning: Car,
  tuning: Zap,
  other: Wrench
};

const categoryLabels = {
  maintenance: 'Wartung',
  repair: 'Reparatur',
  detailing: 'Aufbereitung',
  inspection: 'Inspektion',
  cleaning: 'Reinigung',
  tuning: 'Tuning',
  other: 'Sonstiges'
};

export const ServiceTemplateSelector: React.FC<ServiceTemplateSelectorProps> = ({ 
  onSelectTemplate, 
  existingServices 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = automotiveServiceTemplates.filter(template => {
    const matchesSearch = template.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const notExists = !existingServices.some(service => 
      service.service_name.toLowerCase() === template.service_name.toLowerCase()
    );
    
    return matchesSearch && matchesCategory && notExists;
  });

  const categories = [...new Set(automotiveServiceTemplates.map(t => t.category))];

  const formatPrice = (price: number) => `${price}€`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Service suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
          <TabsTrigger value="all" className="text-xs">Alle</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {categoryLabels[category]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <ScrollArea className="h-96">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template, index) => {
                const IconComponent = categoryIcons[template.category];
                const hasExistingService = existingServices.some(service => 
                  service.service_name.toLowerCase() === template.service_name.toLowerCase()
                );

                return (
                  <Card key={index} className="card-automotive hover:border-primary/50 transition-all">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4 text-primary" />
                          <span>{template.service_name}</span>
                        </div>
                        {hasExistingService && (
                          <CheckCircle className="h-4 w-4 text-automotive-success" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {categoryLabels[template.category]}
                        </Badge>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{template.estimated_duration} Min</span>
                        </Badge>
                      </div>

                      {template.typical_pricing && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Euro className="h-3 w-3" />
                            <span>Typische Preise:</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-xs">
                            {template.typical_pricing.kleinwagen && (
                              <span>Klein: {formatPrice(template.typical_pricing.kleinwagen)}</span>
                            )}
                            {template.typical_pricing.mittelklasse && (
                              <span>Mittel: {formatPrice(template.typical_pricing.mittelklasse)}</span>
                            )}
                            {template.typical_pricing.oberklasse && (
                              <span>Ober: {formatPrice(template.typical_pricing.oberklasse)}</span>
                            )}
                          </div>
                        </div>
                      )}

                      <Button 
                        onClick={() => onSelectTemplate(template)}
                        disabled={hasExistingService}
                        className="w-full"
                        size="sm"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {hasExistingService ? 'Bereits hinzugefügt' : 'Hinzufügen'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Keine passenden Services gefunden.' 
                    : 'Alle verfügbaren Services wurden bereits hinzugefügt.'}
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};