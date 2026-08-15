import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { getAllDiseases } from '@/data/diseases';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your health assistant. I can help you find information about chronic diseases, medications, meal plans, and emergency symptoms. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const diseases = getAllDiseases();

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simple bot response logic
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage.toLowerCase());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setInputMessage('');
  };

  const generateBotResponse = (input: string): string => {
    // Check for disease names
    const foundDisease = diseases.find(disease => 
      disease.name.toLowerCase().includes(input) || 
      input.includes(disease.id) ||
      disease.medications.some(med => input.includes(med.name.toLowerCase()))
    );

    if (foundDisease) {
      const medNames = foundDisease.medications.map(m => m.name).join(', ');
      return `I found information about ${foundDisease.name}. Commonly prescribed medicines include: ${medNames}. Key tips: ${foundDisease.tips.join(', ')}. Reminder: always follow your doctor's exact prescription — never self-medicate. Want to know more about meal plans or emergency symptoms?`;
    }

    if (input.includes('emergency') || input.includes('urgent') || input.includes('symptom')) {
      return "For medical emergencies, please call 911 immediately. I can provide general information about warning symptoms for chronic conditions. Which condition would you like to know about?";
    }

    if (input.includes('medication') || input.includes('medicine') || input.includes('pill')) {
      return "I can help you with medication information for chronic conditions. Please tell me which condition you're asking about, and I can provide details about common medications and timing.";
    }

    if (input.includes('food') || input.includes('meal') || input.includes('diet')) {
      return "I have meal plans for various chronic conditions from morning to night. Which condition would you like meal recommendations for?";
    }

    if (input.includes('doctor') || input.includes('physician') || input.includes('appointment')) {
      return "You can find nearby doctors in the 'Doctors' section of our app. I recommend consulting with healthcare professionals for personalized medical advice.";
    }

    // Default responses
    const defaultResponses = [
      "I can help you with information about chronic diseases, medications, meal plans, and emergency symptoms. What would you like to know?",
      "I have information about 15+ chronic conditions including diabetes, hypertension, asthma, and more. Which condition interests you?",
      "You can ask me about medications, symptoms, meal plans, or emergency warning signs for various chronic conditions."
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full shadow-medical bg-primary hover:bg-primary-glow"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px]">
      <Card className="h-full flex flex-col shadow-medical">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            Health Assistant
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-primary-foreground hover:bg-primary-glow"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {message.sender === 'user' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about diseases, medications, symptoms..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="sm">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent" 
                     onClick={() => setInputMessage('Tell me about diabetes')}>
                Diabetes
              </Badge>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent"
                     onClick={() => setInputMessage('Emergency symptoms')}>
                Emergency symptoms
              </Badge>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent"
                     onClick={() => setInputMessage('Meal plans')}>
                Meal plans
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatBot;