import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Zap, Clock, MessageCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-card/30 to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 gradient-shift opacity-20" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full floating-elements" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-accent/10 rounded-full floating-delayed" />
      <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-primary-glow/10 morphing-blob floating-delayed-2" />
      <div className="absolute bottom-20 right-1/3 w-16 h-16 bg-accent/15 rounded-full parallax-slow" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-reveal">
              {/* Status Badge */}
              <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 text-sm magnetic-hover">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live & Einsatzbereit</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Der <span className="bg-gradient-carbot bg-clip-text text-transparent animate-pulse-automotive">intelligente</span><br />
                ChatBot für Ihre<br />
                Autowerkstatt
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Automatisieren Sie Ihre Kundenanfragen, Terminbuchungen und Services mit KI-Power. 
                24/7 verfügbar, deutschsprachig optimiert für die Automobilbranche.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="btn-carbot text-white px-8 py-6 text-lg magnetic-hover">
                  30 Tage kostenlos testen
                </Button>
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-primary/20 hover:bg-primary/10 magnetic-hover">
                  Live Demo ansehen
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8">
                <p className="text-sm text-muted-foreground mb-4">Vertraut von führenden Werkstätten:</p>
                <div className="flex flex-wrap items-center gap-6 opacity-60">
                  <span className="text-lg font-semibold hover:opacity-100 transition-opacity">BMW</span>
                  <span className="text-lg font-semibold hover:opacity-100 transition-opacity">Mercedes</span>
                  <span className="text-lg font-semibold hover:opacity-100 transition-opacity">Audi</span>
                  <span className="text-lg font-semibold hover:opacity-100 transition-opacity">VW</span>
                  <span className="text-lg font-semibold hover:opacity-100 transition-opacity">Porsche</span>
                </div>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 pt-4">
                <div className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-full px-4 py-2 text-sm magnetic-hover">
                  🤖 KI-Automatisierung
                </div>
                <div className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-full px-4 py-2 text-sm magnetic-hover">
                  📅 24/7 Verfügbar
                </div>
                <div className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-full px-4 py-2 text-sm magnetic-hover">
                  💬 Deutschsprachig
                </div>
                <div className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-full px-4 py-2 text-sm magnetic-hover">
                  ⚡ Sofort einsatzbereit
                </div>
              </div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="relative lg:pl-12 floating-delayed">
              <div className="relative w-full h-96 lg:h-[500px]">
                {/* Animated background shapes */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl morphing-blob" />
                
                {/* Main visual placeholder */}
                <div className="relative z-10 w-full h-full bg-card/80 backdrop-blur-sm border border-primary/20 rounded-3xl p-8 flex items-center justify-center magnetic-hover">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto bg-gradient-carbot rounded-full flex items-center justify-center animate-pulse-automotive">
                      <span className="text-3xl">🤖</span>
                    </div>
                    <h3 className="text-2xl font-bold">CarBot AI</h3>
                    <p className="text-muted-foreground">Ihr intelligenter Assistent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;