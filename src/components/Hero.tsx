import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Zap, Clock, MessageCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-automotive-orange/20 rounded-full blur-3xl animate-pulse-automotive"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-automotive-purple/20 rounded-full blur-3xl animate-pulse-automotive" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="container mx-auto px-4 py-32 relative z-10">
        {/* Status Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-card border border-border rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-automotive-success rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Jetzt verfügbar in Deutschland</span>
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="automotive-title mb-6">
            KI-gestützte<br />
            <span className="bg-gradient-carbot bg-clip-text text-transparent">
              Kundenberatung
            </span><br />
            für Autowerkstätten
          </h1>
          
          <p className="automotive-subtitle mb-12 max-w-3xl mx-auto">
            Automatisieren Sie Ihre Kundenberatung mit KI. Buchen Sie Termine, 
            generieren Sie Leads und bedienen Sie Kunden <span className="text-automotive-orange font-semibold">24/7 in 4 Sprachen</span>.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <Button className="btn-carbot text-white relative z-10 group">
              <span className="relative z-10 flex items-center">
                30 Tage kostenlos testen
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            
            <Button variant="outline" className="bg-card/50 border-border hover:bg-card group">
              <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Live Demo ansehen
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-6">Vertraut von führenden Werkstätten</p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="text-lg font-semibold">BMW</div>
              <div className="text-lg font-semibold">Mercedes</div>
              <div className="text-lg font-semibold">Audi</div>
              <div className="text-lg font-semibold">VW</div>
            </div>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-16">
          <div className="flex items-center space-x-2 bg-card/30 border border-border rounded-full px-4 py-2">
            <Zap className="h-4 w-4 text-automotive-orange" />
            <span className="text-sm">KI-Automatisierung</span>
          </div>
          <div className="flex items-center space-x-2 bg-card/30 border border-border rounded-full px-4 py-2">
            <Clock className="h-4 w-4 text-automotive-purple" />
            <span className="text-sm">24/7 Verfügbar</span>
          </div>
          <div className="flex items-center space-x-2 bg-card/30 border border-border rounded-full px-4 py-2">
            <MessageCircle className="h-4 w-4 text-automotive-blue" />
            <span className="text-sm">4 Sprachen</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;