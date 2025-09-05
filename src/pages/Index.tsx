import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import ChatBot from '@/components/ChatBot';
import { Toaster } from '@/components/ui/toaster';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      
      <section id="demo" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Testen Sie CarBot <span className="bg-gradient-carbot bg-clip-text text-transparent">live</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Erleben Sie die Zukunft der Automotive-Kundenbetreuung. Unser AI-Chatbot versteht 
              Fahrzeugprobleme, erstellt Kostenvoranschläge und bucht Termine automatisch.
            </p>
          </div>
          
          <ChatBot />
        </div>
      </section>
      
      <Toaster />
    </div>
  );
};

export default Index;
