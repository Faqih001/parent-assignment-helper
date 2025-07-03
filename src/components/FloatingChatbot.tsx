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

  // Function to format bot messages with proper HTML
  const formatBotMessage = (content: string): string => {
    let formatted = content
      // Convert **bold** to <strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      // Convert *italic* to <em>
      .replace(/\*(?!\*)(.*?)\*/g, '<em class="italic">$1</em>')
      // Convert numbered lists (1. 2. 3.)
      .replace(/^(\d+\.)\s+(.*$)/gm, '<div class="flex items-start space-x-2 mb-1"><span class="font-medium text-primary min-w-0 flex-shrink-0">$1</span><span>$2</span></div>')
      // Convert bullet points (- or • or *)
      .replace(/^[-•*]\s+(.*$)/gm, '<div class="flex items-start space-x-2 mb-1"><span class="text-primary min-w-0 flex-shrink-0">•</span><span>$1</span></div>')
      // Convert headers (### or ##)
      .replace(/^###\s+(.*$)/gm, '<h4 class="font-semibold text-gray-900 mt-3 mb-2 text-sm">$1</h4>')
      .replace(/^##\s+(.*$)/gm, '<h3 class="font-bold text-gray-900 mt-4 mb-2">$1</h3>')
      // Convert sections separated by double line breaks
      .split('\n\n')
      .map(section => {
        // If section already has formatting, wrap in div
        if (section.includes('<div class="flex') || section.includes('<h')) {
          return `<div class="mb-3">${section}</div>`;
        }
        // Otherwise wrap in paragraph
        return `<p class="mb-2">${section}</p>`;
      })
      .join('');

    // Group consecutive list items
    formatted = formatted.replace(
      /(<div class="flex items-start space-x-2 mb-1">.*?<\/div>\s*)+/gs, 
      (match) => `<div class="space-y-1 mb-3">${match}</div>`
    );

    // Clean up
    formatted = formatted
      .replace(/<p class="mb-2"><\/p>/g, '')
      .replace(/<div class="mb-3"><\/div>/g, '');

    return formatted;
  };

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
- Free Trial: 5 homework questions to get started (renewable every 24 hours, no credit card required)
- Pay-Per-Use: KES 10 per question - perfect for occasional homework help
- Family Plan: KES 999/month - 50 questions (renewable every 24 hours) with priority support and progress tracking

ADDITIONAL CREDITS:
- Single questions: KES 10 each (pay-per-use)
- For schools and institutions: Custom pricing available - contact us for volume discounts

HOW IT WORKS:
1. Create a free account to get 5 trial questions (renewable every 24 hours)
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
2. Get 5 free trial questions immediately (renewable every 24 hours)
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
      variant: "error",
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
      <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 p-0 flex items-center justify-center"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
        </Button>
        <div className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center animate-bounce">
          <span className="text-[10px] sm:text-xs font-bold">AI</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-72 sm:w-80' : 'w-[calc(100vw-2rem)] max-w-sm sm:w-96'
    }`}>
      <Card className="shadow-2xl border-0 overflow-hidden max-h-[calc(100vh-10rem)] sm:max-h-[calc(100vh-12rem)] flex flex-col">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white p-3 sm:p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">AI Homework Helper</CardTitle>
                <p className="text-xs opacity-90">
                  {isAiInitialized ? 'Online • Ready to help' : 'Initializing...'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 hidden sm:block">
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
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-50 min-h-0" style={{ height: 'min(50vh, 280px)' }}>
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2 max-w-[90%] sm:max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    }`}>
                      {message.type === 'user' ? <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <Bot className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                    </div>
                    
                    <div className={`rounded-lg p-2 sm:p-2.5 ${
                      message.type === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-white border shadow-sm'
                    }`}>
                      {message.image && (
                        <img 
                          src={message.image} 
                          alt="Uploaded homework" 
                          className="max-w-full h-auto rounded mb-2 max-h-20 sm:max-h-24 object-cover" 
                        />
                      )}
                      <div className="text-xs sm:text-sm leading-relaxed">
                        {message.type === 'bot' ? (
                          <div 
                            className="space-y-1 sm:space-y-2"
                            dangerouslySetInnerHTML={{
                              __html: formatBotMessage(message.content)
                            }}
                          />
                        ) : (
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        )}
                      </div>
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
                    <div className="bg-white border shadow-sm rounded-lg p-2 sm:p-2.5">
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
                <div className="mb-2 sm:mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  💡 For actual homework help, please <a href="/chat" className="underline font-medium">sign up and log in</a> to access our AI tutor!
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
                    className="resize-none border-gray-300 focus:border-primary text-sm h-9"
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isAiInitialized}
                  className="p-1.5 h-9 w-9 hidden sm:flex"
                  title="Image upload available in main chat after login"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading || !isAiInitialized}
                  size="sm"
                  className="px-2 sm:px-3 h-9"
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
                <span className="hidden sm:block">Ask about our platform</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
