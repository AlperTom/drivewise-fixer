import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import ChatBot from '@/components/ChatBot';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth page if not logged in and not loading
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

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
