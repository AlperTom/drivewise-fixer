import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Thomas Müller",
      role: "Geschäftsführer",
      company: "Autowerkstatt Müller GmbH",
      location: "München",
      content: "CarBot hat unsere Kundenbetreuung revolutioniert. 70% weniger Telefonanrufe und trotzdem zufriedenere Kunden. Unser Team kann sich endlich auf das konzentrieren, was sie am besten können.",
      rating: 5,
      avatar: "TM",
      gradient: "from-automotive-orange/20 to-automotive-orange/5"
    },
    {
      name: "Sandra Weber",
      role: "Serviceleiterin", 
      company: "KFZ-Service Weber",
      location: "Hamburg",
      content: "Die Terminbuchung läuft jetzt vollautomatisch. Kunden lieben es, dass sie rund um die Uhr buchen können. Unsere Auslastung ist um 40% gestiegen.",
      rating: 5,
      avatar: "SW",
      gradient: "from-automotive-purple/20 to-automotive-purple/5"
    },
    {
      name: "Michael Schmidt",
      role: "Inhaber",
      company: "Auto Schmidt & Söhne",
      location: "Berlin",
      content: "Als Familienbetrieb waren wir skeptisch. Aber CarBot fühlt sich an wie ein echter Mitarbeiter - nur besser. Nie krank, nie müde, immer freundlich.",
      rating: 5,
      avatar: "MS",
      gradient: "from-automotive-blue/20 to-automotive-blue/5"
    },
    {
      name: "Julia Hoffmann",
      role: "Marketing Manager",
      company: "Autohaus Hoffmann",
      location: "Köln", 
      content: "Die mehrsprachige Funktion hat uns neue Kundengruppen erschlossen. Unsere türkischen und italienischen Kunden sind begeistert von der persönlichen Betreuung.",
      rating: 5,
      avatar: "JH",
      gradient: "from-automotive-success/20 to-automotive-success/5"
    },
    {
      name: "Robert Fischer",
      role: "Geschäftsführer",
      company: "Fischer Automobile",
      location: "Stuttgart",
      content: "ROI bereits nach 3 Monaten erreicht. CarBot generiert qualifizierte Leads und unser Umsatz ist deutlich gestiegen. Beste Investition seit Jahren!",
      rating: 5,
      avatar: "RF",
      gradient: "from-automotive-warning/20 to-automotive-warning/5"
    },
    {
      name: "Andrea Klein",
      role: "Inhaberin",
      company: "Klein's Werkstatt",
      location: "Frankfurt",
      content: "Als Ein-Frau-Betrieb war ich überlastet. CarBot übernimmt die erste Kundenberatung perfekt und ich bekomme nur noch die wichtigen Anfragen.",
      rating: 5,
      avatar: "AK",
      gradient: "from-automotive-orange/20 to-automotive-purple/5"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-card/30 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-40 left-1/4 w-64 h-64 bg-automotive-purple/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-automotive-orange/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-card border border-border rounded-full px-4 py-2 mb-6">
            <Star className="h-4 w-4 text-automotive-orange fill-current" />
            <span className="text-sm text-muted-foreground">4.9/5 Bewertung</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Was unsere <span className="bg-gradient-carbot bg-clip-text text-transparent">Kunden</span> sagen
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Über 500 Werkstätten vertrauen bereits auf CarBot. 
            Lesen Sie, wie wir ihren Alltag verbessert haben.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card-automotive group">
              {/* Quote Icon */}
              <div className="flex items-center justify-between mb-6">
                <Quote className="h-8 w-8 text-automotive-orange/50" />
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-automotive-orange fill-current" />
                  ))}
                </div>
              </div>

              {/* Testimonial Content */}
              <blockquote className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center font-semibold text-automotive-orange`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-sm text-automotive-orange">{testimonial.company}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.location}</div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-carbot group-hover:w-full transition-all duration-500"></div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-20 pt-16 border-t border-border">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">Vertraut von führenden Unternehmen</h3>
            <p className="text-muted-foreground">Zertifiziert nach deutschen Datenschutz- und Sicherheitsstandards</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
            <div className="text-2xl font-bold text-muted-foreground">TÜV Süd</div>
            <div className="text-2xl font-bold text-muted-foreground">DSGVO</div>
            <div className="text-2xl font-bold text-muted-foreground">ISO 27001</div>
            <div className="text-2xl font-bold text-muted-foreground">Made in DE</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;