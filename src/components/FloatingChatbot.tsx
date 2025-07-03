import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Camera, User, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { geminiService, HomeworkQuestion } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { dbHelpers } from '@/lib/supabase';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  image?: string;
}

export function FloatingChatbot() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: '👋 Hi! I\'m your website assistant. I can help you learn about HomeworkHelper - our features, pricing, how it works, and answer any questions about our platform. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiInitialized, setIsAiInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Website-specific context for the AI
  const websiteContext = `
You are a helpful assistant for HomeworkHelper, an AI-powered homework assistance platform. Here's what you should know about our platform:

ABOUT HOMEWORKHELPER:
HomeworkHelper is founded by a team of educators and AI specialists who wanted to make quality homework assistance accessible to all families. We use cutting-edge Google Gemini AI technology to provide step-by-step explanations that help students learn, not just get answers.

FEATURES:
- AI-powered homework help using Google Gemini
- Support for all subjects (Math, Science, English, History, Languages, etc.)
- Image analysis for handwritten or printed homework
- Step-by-step explanations that promote learning
- 24/7 availability
- Safe, educational responses only
- Chat history saving
- Mobile-responsive design

PRICING PLANS:
- Free Trial: 3 homework questions to get started (no credit card required)
- Pay-Per-Use: KES 10 per question - perfect for occasional homework help
- Family Plan: KES 999/month - unlimited questions with priority support and progress tracking

ADDITIONAL CREDITS:
- Single questions: KES 10 each (pay-per-use)
- For schools and institutions: Custom pricing available - contact us for volume discounts

HOW IT WORKS:
1. Create a free account to get 3 trial questions
2. Students can type or upload photos of homework questions
3. Our AI analyzes and provides detailed, educational explanations
4. Students learn step-by-step problem-solving methods
5. Parents can monitor progress and usage

SAFETY & EDUCATION:
- Focuses on teaching, not just giving answers
- Promotes understanding over memorization
- Family-friendly and safe environment
- Encourages critical thinking and learning

FOUNDER & TEAM:
HomeworkHelper was founded by a passionate team of educators and technology experts who believe every child deserves access to quality educational support, regardless of their family's economic situation.

GETTING STARTED:
1. Click "Sign Up" to create your free account
2. Get 3 free trial questions immediately
3. Access the full homework assistant in the Chat section
4. Upgrade to a paid plan for more questions when needed

You should ONLY answer questions about:
- HomeworkHelper features and benefits
- Pricing plans and credit options
- How the platform works
- Account setup and getting started
- Educational philosophy and safety
- Founder/company information
- Technical requirements
- Upgrade options and billing

DO NOT provide actual homework help or solve academic problems in this chat. Instead, direct users to sign up and use the main Chat page for homework assistance.

Keep responses friendly, informative, and focused on helping users understand what HomeworkHelper offers.
`;

  // Initialize AI when component mounts
  useEffect(() => {
    const initializeAI = async () => {
      try {
        await geminiService.initializeChat();
        setIsAiInitialized(true);
      } catch (error) {
        console.error('Failed to initialize AI:', error);
      }
    };

    if (isOpen && !isAiInitialized) {
      initializeAI();
    }
  }, [isOpen, isAiInitialized]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !isAiInitialized) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Create a website-focused prompt
      const websitePrompt = `${websiteContext}\n\nUser question: ${currentInput}\n\nPlease provide a helpful response about HomeworkHelper platform.`;
      
      const homeworkQuestion: HomeworkQuestion = {
        subject: 'Website Information',
        grade: 'General',
        question: websitePrompt
      };

      const response = await geminiService.askHomeworkQuestion(homeworkQuestion);

      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm sorry, I'm having trouble right now. Please try again in a moment or contact our support team.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isAiInitialized) return;

    toast({
      title: "Image upload not available",
      description: "For homework image analysis, please sign up and use our main chat feature after logging in.",
      variant: "default",
    });

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 sm:bottom-24 right-4 sm:right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
        <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center animate-bounce">
          AI
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 sm:bottom-24 right-4 sm:right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 sm:w-80' : 'w-[95vw] max-w-sm sm:w-96'
    }`}>
      <Card className="shadow-2xl border-0 overflow-hidden max-h-[85vh] sm:max-h-none flex flex-col">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white p-3 sm:p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-sm font-semibold">AI Homework Helper</CardTitle>
                <p className="text-xs opacity-90">
                  {isAiInitialized ? 'Online • Ready to help' : 'Initializing...'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                Website Info
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-1 h-7 w-7 sm:h-8 sm:w-8 hidden sm:flex"
              >
                <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1 h-7 w-7 sm:h-8 sm:w-8"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Chat Area */}
        {!isMinimized && (
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-50 min-h-0" style={{ height: 'min(60vh, 320px)' }}>
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2 max-w-[85%] sm:max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    }`}>
                      {message.type === 'user' ? <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <Bot className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                    </div>
                    
                    <div className={`rounded-lg p-2.5 sm:p-3 ${
                      message.type === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-white border shadow-sm'
                    }`}>
                      {message.image && (
                        <img 
                          src={message.image} 
                          alt="Uploaded homework" 
                          className="max-w-full h-auto rounded mb-2 max-h-24 sm:max-h-32 object-cover" 
                        />
                      )}
                      <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center">
                      <Bot className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </div>
                    <div className="bg-white border shadow-sm rounded-lg p-2.5 sm:p-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        <span className="text-xs sm:text-sm text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-4 border-t bg-white flex-shrink-0">
              {!user && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs sm:text-sm text-blue-800">
                  � For actual homework help, please <a href="/chat" className="underline font-medium">sign up and log in</a> to access our AI tutor!
                </div>
              )}
              
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Ask about HomeworkHelper features..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!isAiInitialized}
                    className="resize-none border-gray-300 focus:border-primary text-sm"
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isAiInitialized}
                  className="p-1.5 sm:p-2 h-9 w-9"
                  title="Image upload available in main chat after login"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading || !isAiInitialized}
                  size="sm"
                  className="px-2.5 sm:px-3 h-9"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span className="hidden sm:block">Website Assistant • Powered by AI</span>
                <span className="sm:hidden">Website Assistant</span>
                <span>Ask about our platform</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
