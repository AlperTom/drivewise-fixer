import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Star, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "99",
      period: "pro Monat",
      description: "Perfekt für kleine Werkstätten",
      popular: false,
      features: [
        "Bis zu 500 Konversationen/Monat",
        "Basis KI-Funktionen",
        "2 Sprachen (DE, EN)",
        "E-Mail Support",
        "Grundlegende Terminbuchung",
        "Kostenvoranschläge"
      ],
      gradient: "from-card to-secondary/20",
      buttonVariant: "outline" as const
    },
    {
      name: "Professional",
      price: "199",
      period: "pro Monat",
      description: "Ideal für etablierte Betriebe",
      popular: true,
      features: [
        "Bis zu 2.000 Konversationen/Monat",
        "Erweiterte KI-Funktionen",
        "4 Sprachen (DE, EN, FR, IT)",
        "Prioritäts-Support",
        "Vollständige Kalender-Integration",
        "Detaillierte Kostenvoranschläge",
        "Lead-Qualifizierung",
        "Analytics Dashboard"
      ],
      gradient: "from-automotive-orange/20 to-automotive-purple/20",
      buttonVariant: "default" as const
    },
    {
      name: "Enterprise",
      price: "399",
      period: "pro Monat",
      description: "Für große Werkstattketten",
      popular: false,
      features: [
        "Unbegrenzte Konversationen",
        "Premium KI mit Lernfunktion",
        "Alle Sprachen + Custom",
        "24/7 Telefon-Support",
        "Multi-Standort Management",
        "Custom Integrationen",
        "Erweiterte Analytics",
        "Dedicated Account Manager",
        "White-Label Option"
      ],
      gradient: "from-automotive-blue/20 to-automotive-success/20",
      buttonVariant: "outline" as const
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-br from-background via-card/30 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-32 left-20 w-96 h-96 bg-automotive-orange/10 rounded-full blur-3xl animate-pulse-automotive"></div>
        <div className="absolute bottom-32 right-20 w-96 h-96 bg-automotive-purple/10 rounded-full blur-3xl animate-pulse-automotive" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-card border border-border rounded-full px-4 py-2 mb-6">
            <Star className="h-4 w-4 text-automotive-orange" />
            <span className="text-sm text-muted-foreground">Transparent & Fair</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Investieren Sie in die <span className="bg-gradient-carbot bg-clip-text text-transparent">Zukunft</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Wählen Sie den Plan, der zu Ihrer Werkstatt passt. Alle Pläne beinhalten eine 30-tägige Geld-zurück-Garantie.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-card border border-border rounded-full p-1">
            <button className="px-4 py-2 text-sm font-medium rounded-full bg-automotive-orange text-white">
              Monatlich
            </button>
            <button className="px-4 py-2 text-sm font-medium rounded-full text-muted-foreground hover:text-foreground transition-colors">
              Jährlich <span className="text-automotive-success ml-1">(-20%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative rounded-3xl border p-8 ${
                plan.popular 
                  ? 'border-automotive-orange/50 bg-gradient-to-br from-automotive-orange/5 to-automotive-purple/5' 
                  : 'border-border bg-card/50'
              } hover:shadow-glow transition-all duration-300 group`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-carbot text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Beliebtester Plan
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">€{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>

                <Link to="/auth">
                  <Button 
                    variant={plan.buttonVariant}
                    className={`w-full ${
                      plan.popular 
                        ? 'btn-carbot text-white' 
                        : 'hover:bg-automotive-orange hover:text-white transition-colors'
                    }`}
                  >
                    {plan.popular ? (
                      <>
                        Jetzt starten
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      'Plan wählen'
                    )}
                  </Button>
                </Link>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.popular ? 'bg-automotive-orange/20' : 'bg-muted'
                    }`}>
                      <Check className={`h-3 w-3 ${
                        plan.popular ? 'text-automotive-orange' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-automotive-orange/5 to-automotive-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16 space-y-6">
          <p className="text-muted-foreground">
            Alle Preise verstehen sich zzgl. MwSt. Monatlich kündbar. Keine Einrichtungsgebühr.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-automotive-success" />
              <span className="text-sm">30 Tage Geld-zurück-Garantie</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-automotive-orange" />
              <span className="text-sm">Sofortige Aktivierung</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-automotive-blue" />
              <span className="text-sm">Premium Support inklusive</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;