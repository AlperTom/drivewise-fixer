import React from 'react';
import { 
  MessageCircle, 
  Calendar, 
  Calculator, 
  Globe, 
  Clock, 
  TrendingUp,
  Zap,
  Shield,
  Users
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <MessageCircle className="h-8 w-8 text-automotive-orange" />,
      title: "Intelligente Kundenberatung",
      description: "KI versteht Fahrzeugprobleme und gibt präzise Empfehlungen basierend auf Herstellerdaten und Werkstatterfahrung.",
      gradient: "from-automotive-orange/20 to-automotive-orange/5"
    },
    {
      icon: <Calendar className="h-8 w-8 text-automotive-purple" />,
      title: "Automatische Terminbuchung",
      description: "Nahtlose Integration in Ihren Kalender. Kunden buchen Termine direkt im Chat - ohne Wartezeiten.",
      gradient: "from-automotive-purple/20 to-automotive-purple/5"
    },
    {
      icon: <Calculator className="h-8 w-8 text-automotive-blue" />,
      title: "Sofortige Kostenvoranschläge",
      description: "Präzise Preiskalkulationen basierend auf Fahrzeugtyp, Serviceart und aktuellen Marktpreisen.",
      gradient: "from-automotive-blue/20 to-automotive-blue/5"
    },
    {
      icon: <Globe className="h-8 w-8 text-automotive-success" />,
      title: "4 Sprachen Support",
      description: "Deutsch, Englisch, Französisch und Italienisch - erreichen Sie mehr Kunden in ihrer Muttersprache.",
      gradient: "from-automotive-success/20 to-automotive-success/5"
    },
    {
      icon: <Clock className="h-8 w-8 text-automotive-warning" />,
      title: "24/7 Verfügbarkeit",
      description: "Ihr digitaler Mitarbeiter arbeitet rund um die Uhr und verpasst nie einen Kunden oder eine Anfrage.",
      gradient: "from-automotive-warning/20 to-automotive-warning/5"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-automotive-orange" />,
      title: "Lead-Generierung",
      description: "Automatische Qualifizierung von Interessenten und direkte Weiterleitung hochwertiger Leads an Ihr Team.",
      gradient: "from-automotive-orange/20 to-automotive-orange/5"
    }
  ];

  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-automotive-purple/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-automotive-orange/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-card border border-border rounded-full px-4 py-2 mb-6">
            <Zap className="h-4 w-4 text-automotive-orange" />
            <span className="text-sm text-muted-foreground">Modernste KI-Technologie</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Alles was Ihre <span className="bg-gradient-carbot bg-clip-text text-transparent">Werkstatt</span> braucht
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            CarBot automatisiert Ihre gesamte Kundenberatung und steigert gleichzeitig 
            Ihre Service-Qualität und Kundenzufriedenheit.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card-automotive group">
              {/* Feature Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>

              {/* Feature Content */}
              <h3 className="text-xl font-semibold mb-4 text-foreground group-hover:text-automotive-orange transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect Line */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-carbot group-hover:w-full transition-all duration-500"></div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-24 pt-20 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-automotive-orange">98%</div>
              <p className="text-muted-foreground text-sm">Kundenzufriedenheit</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-automotive-purple">24/7</div>
              <p className="text-muted-foreground text-sm">Verfügbarkeit</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-automotive-blue">3x</div>
              <p className="text-muted-foreground text-sm">Mehr Leads</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-automotive-success">60%</div>
              <p className="text-muted-foreground text-sm">Weniger Anrufe</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;