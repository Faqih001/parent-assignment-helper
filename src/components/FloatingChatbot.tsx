import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Camera, User, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { geminiService, HomeworkQuestion } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  image?: string;
}

export function FloatingChatbot() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: '👋 Hi! I\'m your AI homework assistant. Ask me any homework question or upload a photo, and I\'ll help you understand it step by step!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [isAiInitialized, setIsAiInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const maxFreeQuestions = 3;

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

    if (questionsAsked >= maxFreeQuestions) {
      toast({
        title: "Free limit reached",
        description: "You've used all your free questions. Upgrade to continue!",
        variant: "destructive",
      });
      return;
    }

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
      const homeworkQuestion: HomeworkQuestion = {
        subject: 'General',
        grade: 'General',
        question: currentInput
      };

      const response = await geminiService.askHomeworkQuestion(homeworkQuestion);

      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setQuestionsAsked(prev => prev + 1);

    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm sorry, I'm having trouble right now. Please try again in a moment or contact support.",
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

    if (questionsAsked >= maxFreeQuestions) {
      toast({
        title: "Free limit reached",
        description: "You've used all your free questions. Upgrade to continue!",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: input || "Please help me with this homework question.",
        timestamp: new Date(),
        image: imageUrl
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      setInput('');

      try {
        const response = await geminiService.analyzeHomeworkImage(file, input);

        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botResponse]);
        setQuestionsAsked(prev => prev + 1);

      } catch (error) {
        console.error('Failed to analyze image:', error);
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: "I'm sorry, I couldn't analyze your image. Please try again or type your question instead.",
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const remainingQuestions = maxFreeQuestions - questionsAsked;

  if (!isOpen) {
    return (
      <div className="fixed bottom-24 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-16 h-16 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
          AI
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-24 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80' : 'w-96'
    }`}>
      <Card className="shadow-2xl border-0 overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">AI Homework Helper</CardTitle>
                <p className="text-xs opacity-90">
                  {isAiInitialized ? 'Online • Ready to help' : 'Initializing...'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="text-xs">
                {remainingQuestions} free left
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-1 h-8 w-8"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Chat Area */}
        {!isMinimized && (
          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    }`}>
                      {message.type === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                    </div>
                    
                    <div className={`rounded-lg p-3 ${
                      message.type === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-white border shadow-sm'
                    }`}>
                      {message.image && (
                        <img 
                          src={message.image} 
                          alt="Uploaded homework" 
                          className="max-w-full h-auto rounded mb-2 max-h-32 object-cover" 
                        />
                      )}
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center">
                      <Bot className="h-3 w-3" />
                    </div>
                    <div className="bg-white border shadow-sm rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
              {remainingQuestions === 0 && (
                <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                  🚨 You've used all free questions. <a href="/pricing" className="underline font-medium">Upgrade now</a> to continue!
                </div>
              )}
              
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Ask me anything about homework..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!isAiInitialized || remainingQuestions === 0}
                    className="resize-none border-gray-300 focus:border-primary"
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isAiInitialized || remainingQuestions === 0}
                  className="p-2"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading || !isAiInitialized || remainingQuestions === 0}
                  size="sm"
                  className="px-3"
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
                <span>Powered by Google Gemini AI</span>
                <span>{remainingQuestions} questions remaining</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
