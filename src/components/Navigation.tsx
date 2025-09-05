import React from 'react';
import { Car, MessageCircle, Settings, BarChart3, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-gradient-carbot">
            <Car className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-carbot bg-clip-text text-transparent">
            CarBot
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Preise
          </a>
          <a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">
            Live Demo
          </a>
          <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
            Kontakt
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="hidden md:inline-flex">
            Anmelden
          </Button>
          <Button className="btn-carbot text-white relative z-10">
            Jetzt starten
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;