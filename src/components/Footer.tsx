import React from 'react';
import { Car, Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-card to-background border-t border-border">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-carbot">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-carbot bg-clip-text text-transparent">
                  CarBot
                </span>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                Die führende KI-Plattform für Automotive-Kundenbetreuung. 
                Automatisieren Sie Ihre Werkstatt mit modernster Technologie.
              </p>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-automotive-orange" />
                  <span className="text-sm">München, Deutschland</span>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Mail className="h-4 w-4 text-automotive-purple" />
                  <a href="mailto:info@carbot.chat" className="text-sm hover:text-automotive-orange transition-colors">
                    info@carbot.chat
                  </a>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Phone className="h-4 w-4 text-automotive-blue" />
                  <a href="tel:+4989123456789" className="text-sm hover:text-automotive-orange transition-colors">
                    +49 (0) 89 123 456 789
                  </a>
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Produkt</h3>
              <div className="space-y-3">
                <a href="#features" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  Features
                </a>
                <a href="#pricing" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  Preise
                </a>
                <a href="#demo" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  Live Demo
                </a>
                <Link to="/dashboard" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  Dashboard
                </Link>
                <a href="#" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  API Dokumentation
                </a>
                <a href="#" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  Integrationen
                </a>
              </div>
            </div>

            {/* Support Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Support</h3>
              <div className="space-y-3">
                <a href="#" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  Hilfe Center
                </a>
                <a href="#" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  Dokumentation
                </a>
                <a href="#" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  Video Tutorials
                </a>
                <a href="#" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  Community Forum
                </a>
                <a href="#" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  System Status
                </a>
                <a href="#contact" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  Kontakt
                </a>
              </div>
            </div>

            {/* Legal Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Rechtliches</h3>
              <div className="space-y-3">
                <a href="#" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  Datenschutz
                </a>
                <a href="#" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  Impressum
                </a>
                <a href="#" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  AGB
                </a>
                <a href="#" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  Cookie-Richtlinie
                </a>
                <a href="#" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  DSGVO
                </a>
                <a href="#" className="block text-muted-foreground hover:text-automotive-orange transition-colors text-sm">
                  Sicherheit
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-12 border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              Bleiben Sie auf dem <span className="bg-gradient-carbot bg-clip-text text-transparent">Laufenden</span>
            </h3>
            <p className="text-muted-foreground mb-6">
              Erhalten Sie die neuesten Updates über CarBot und Automotive AI-Trends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Ihre E-Mail Adresse"
                className="flex-1 px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-automotive-orange"
              />
              <button className="btn-carbot text-white whitespace-nowrap px-6 py-3">
                Anmelden
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-muted-foreground text-sm">
              © 2024 CarBot GmbH. Alle Rechte vorbehalten.
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#" className="text-muted-foreground hover:text-automotive-orange transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-automotive-orange transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-automotive-orange transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
            
            <div className="text-muted-foreground text-sm">
              Made with ❤️ in Germany
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;