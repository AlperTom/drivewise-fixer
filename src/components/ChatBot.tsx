import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Wrench, Calendar, Euro } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hallo! Ich bin Ihr CarBot-Assistent. Wie kann ich Ihnen bei Ihrem Fahrzeug helfen?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('termin') || lowerMessage.includes('appointment')) {
      return 'Gerne helfe ich Ihnen bei der Terminbuchung! Welche Art von Service benötigen Sie? (Inspektion, Reparatur, TÜV, etc.)';
    }
    
    if (lowerMessage.includes('preis') || lowerMessage.includes('kosten')) {
      return 'Für eine genaue Kosteneinschätzung benötige ich einige Informationen zu Ihrem Fahrzeug. Können Sie mir bitte Marke, Modell und Baujahr nennen?';
    }
    
    if (lowerMessage.includes('öl') || lowerMessage.includes('ölwechsel')) {
      return 'Ein Ölwechsel kostet je nach Fahrzeugtyp zwischen 80-150€. Wann wurde der letzte Ölwechsel durchgeführt? Ich kann Ihnen gerne einen Termin vorschlagen.';
    }
    
    if (lowerMessage.includes('bremsen') || lowerMessage.includes('brake')) {
      return 'Bremsenprobleme sollten sofort überprüft werden! Welche Symptome haben Sie bemerkt? (Quietschen, längerer Bremsweg, Vibrationen?)';
    }
    
    if (lowerMessage.includes('motor') || lowerMessage.includes('engine')) {
      return 'Motorprobleme können verschiedene Ursachen haben. Beschreiben Sie bitte die Symptome: Unruhiger Leerlauf, Leistungsverlust, Geräusche?';
    }
    
    return 'Vielen Dank für Ihre Nachricht! Unser Expertenteam wird sich um Ihr Anliegen kümmern. Möchten Sie einen Termin vereinbaren oder haben Sie weitere Fragen?';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: simulateBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      
      toast({
        title: "CarBot Antwort",
        description: "Neue Nachricht erhalten",
      });
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: Calendar, text: 'Termin buchen', action: () => setInputMessage('Ich möchte einen Termin buchen') },
    { icon: Wrench, text: 'Service anfragen', action: () => setInputMessage('Welche Services bieten Sie an?') },
    { icon: Euro, text: 'Preise erfahren', action: () => setInputMessage('Was kostet ein Ölwechsel?') }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="card-automotive h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center space-x-3 p-4 border-b border-border">
          <div className="p-2 rounded-xl bg-gradient-carbot">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">CarBot AI-Assistent</h3>
            <p className="text-sm text-muted-foreground">24/7 Automotive Support</p>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <div className="w-2 h-2 bg-automotive-success rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-2 rounded-xl ${message.sender === 'user' ? 'bg-primary' : 'bg-secondary'}`}>
                  {message.sender === 'user' ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <Bot className="h-4 w-4 text-secondary-foreground" />
                  )}
                </div>
                <div className={`rounded-2xl p-4 ${
                  message.sender === 'user' 
                    ? 'bg-gradient-carbot text-white' 
                    : 'bg-card border border-border'
                }`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString('de-DE', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-[80%]">
                <div className="p-2 rounded-xl bg-secondary">
                  <Bot className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t border-border">
          <div className="flex space-x-2 overflow-x-auto">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 whitespace-nowrap"
                onClick={action.action}
              >
                <action.icon className="h-4 w-4" />
                <span>{action.text}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Schreiben Sie Ihre Nachricht..."
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              className="btn-carbot text-white relative z-10"
              disabled={!inputMessage.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatBot;