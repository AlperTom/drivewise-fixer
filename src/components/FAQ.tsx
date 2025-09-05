import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const FAQ = () => {
  const faqs = [
    {
      question: "Wie schnell kann CarBot in unserer Werkstatt implementiert werden?",
      answer: "Die Implementierung erfolgt in der Regel innerhalb von 24-48 Stunden. Nach der Anmeldung erhalten Sie Zugang zu unserem Setup-Assistenten, der Sie durch den gesamten Prozess führt. Unser Support-Team steht Ihnen dabei jederzeit zur Verfügung."
    },
    {
      question: "Welche Integrationen unterstützt CarBot?",
      answer: "CarBot integriert sich nahtlos in die meisten gängigen Werkstatt-Management-Systeme, Kalender-Anwendungen (Google Calendar, Outlook) und CRM-Systeme. Darüber hinaus bieten wir API-Schnittstellen für individuelle Integrationen."
    },
    {
      question: "Wie sicher sind die Kundendaten?",
      answer: "Datenschutz hat höchste Priorität. CarBot ist vollständig DSGVO-konform und wird in deutschen Rechenzentren gehostet. Alle Daten werden verschlüsselt übertragen und gespeichert. Wir sind nach ISO 27001 zertifiziert."
    },
    {
      question: "Kann CarBot spezifische Fahrzeugdaten und Preise verstehen?",
      answer: "Ja, CarBot wird mit umfangreichen Fahrzeugdatenbanken und Ihren individuellen Preislisten trainiert. Der Bot lernt kontinuierlich aus Ihren Serviceleistungen und wird immer präziser in seinen Empfehlungen."
    },
    {
      question: "Was passiert, wenn der Bot eine Frage nicht beantworten kann?",
      answer: "In solchen Fällen leitet CarBot den Kunden automatisch an Ihr Team weiter. Zusätzlich lernt das System aus jeder nicht beantworteten Frage und erweitert kontinuierlich sein Wissen."
    },
    {
      question: "Gibt es eine Mindestvertragslaufzeit?",
      answer: "Nein, alle Pläne sind monatlich kündbar. Wir bieten jedoch Rabatte für Jahresverträge an. Sie können jederzeit upgraden oder downgraden, je nach Ihren Bedürfnissen."
    },
    {
      question: "Wie funktioniert die mehrsprachige Unterstützung?",
      answer: "CarBot erkennt automatisch die Sprache des Kunden und wechselt nahtlos zwischen Deutsch, Englisch, Französisch und Italienisch. Die KI ist für jede Sprache individuell trainiert und versteht kulturelle Unterschiede."
    },
    {
      question: "Kann ich CarBot an mein Corporate Design anpassen?",
      answer: "Absolut! CarBot lässt sich vollständig an Ihr Branding anpassen - Farben, Logo, Schriftarten und sogar der Kommunikationsstil können individuell eingestellt werden. Bei Enterprise-Plänen ist auch White-Labeling möglich."
    },
    {
      question: "Welche Art von Support erhalte ich?",
      answer: "Je nach Plan erhalten Sie E-Mail-Support, Prioritäts-Support oder sogar 24/7 Telefon-Support. Zusätzlich haben alle Kunden Zugang zu unserer umfangreichen Wissensdatenbank und Video-Tutorials."
    },
    {
      question: "Wie wird die Erfolg von CarBot gemessen?",
      answer: "Sie erhalten detaillierte Analytics mit KPIs wie Konversionsrate, Kundenzufriedenheit, eingesparte Zeit, generierte Leads und Umsatzsteigerung. Unser Dashboard zeigt Ihnen den ROI in Echtzeit."
    }
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-32 right-20 w-72 h-72 bg-automotive-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-20 w-72 h-72 bg-automotive-success/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-card border border-border rounded-full px-4 py-2 mb-6">
            <HelpCircle className="h-4 w-4 text-automotive-orange" />
            <span className="text-sm text-muted-foreground">Häufige Fragen</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Haben Sie noch <span className="bg-gradient-carbot bg-clip-text text-transparent">Fragen?</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Hier finden Sie Antworten auf die am häufigsten gestellten Fragen. 
            Sollten Sie weitere Fragen haben, kontaktieren Sie uns gerne direkt.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="card-automotive border-0 px-8 py-4"
              >
                <AccordionTrigger className="text-left hover:no-underline hover:text-automotive-orange transition-colors">
                  <span className="font-semibold text-lg">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <div className="card-automotive max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Noch Fragen offen?</h3>
            <p className="text-muted-foreground mb-6">
              Unser Expertenteam hilft Ihnen gerne bei allen Fragen rund um CarBot 
              und die Integration in Ihre Werkstatt.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a 
                href="mailto:support@carbot.chat" 
                className="inline-flex items-center space-x-2 text-automotive-orange hover:text-automotive-orange/80 transition-colors"
              >
                <span>support@carbot.chat</span>
              </a>
              <span className="hidden sm:inline text-muted-foreground">|</span>
              <a 
                href="tel:+4989123456789" 
                className="inline-flex items-center space-x-2 text-automotive-blue hover:text-automotive-blue/80 transition-colors"
              >
                <span>+49 (0) 89 123 456 789</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;