import { useState, useRef, useEffect } from "react";
import { Send, Camera, Image, Paperclip, Bot, User, AlertCircle, CheckCircle, BookOpen, GraduationCap, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { geminiService, HomeworkQuestion } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { dbHelpers } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import FormattedMessage from "@/components/FormattedMessage";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  image?: string;
}

function Chat() {
  // Accessibility: high-contrast mode
  const [highContrast, setHighContrast] = useState(false);
  // Accessibility: text-to-speech
  const ttsRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAiInitialized, setIsAiInitialized] = useState(false);
  const [language, setLanguage] = useState("English");
  const [curriculum, setCurriculum] = useState("CBC");
  const [liteMode, setLiteMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const languages = [
    "English",
    "Swahili",
    "Hausa",
    "Kikuyu",
    "Kalenjin",
    "Somali",
    "Mijikenda"
  ];

  const curricula = ["CBC", "WAEC", "NECTA"];

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/');
      toast({
        title: "Authentication Required",
        description: "Please log in to access the homework assistant.",
        variant: "error",
      });
    }
  }, [user, navigate, toast]);

  // Load chat history and initialize AI
  useEffect(() => {
    if (!user) return;

    const initializeChat = async () => {
      try {
        // Initialize AI
        await geminiService.initializeChat();
        setIsAiInitialized(true);

        // Check and potentially reset questions for all plan users
        let currentQuestions = user.questionsRemaining || 0;
        const updatedQuestions = await dbHelpers.checkAndResetFreeQuestions(user.id);
        if (updatedQuestions > currentQuestions) {
          currentQuestions = updatedQuestions;
          user.questionsRemaining = updatedQuestions;
        }

        // Load previous chat messages
        const chatHistory = await dbHelpers.getChatMessages(user.id);
        if (chatHistory.length > 0) {
          const formattedMessages: Message[] = chatHistory.map((msg) => ({
            id: msg.id,
            type: msg.type as 'user' | 'bot',
            content: msg.content,
            timestamp: new Date(msg.created_at),
            image: msg.image_url
          }));
          setMessages(formattedMessages);
        } else {
          // Set welcome message with plan-specific info
          const planInfo = user.plan === 'free' 
            ? `${currentQuestions} questions remaining on your ${user.plan} plan (renewable every 24 hours)`
            : `${currentQuestions} questions remaining on your ${user.plan} plan (renewable every 24 hours)`;
            
          setMessages([{
            id: "welcome",
            type: "bot",
            content: `Hello **${user.name}**! I'm your AI homework assistant powered by Google Gemini. 

**How I can help you:**
- Upload a photo of your homework question or type it here
- Get clear, step-by-step explanations
- Understand concepts with real-world examples
- Practice with additional questions

**Your Plan:** You have **${planInfo}**

Let's start learning together! 📚✨`,
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        toast({
          title: "Initialization Failed",
          description: "There was an issue starting the chat service. Please refresh the page.",
          variant: "error",
        });
      }
    };

    initializeChat();
  }, [user, toast]);

  const sampleQuestions = [
    "Help me solve: 2x + 5 = 15",
    "Explain photosynthesis to a 10-year-old",
    "What's the capital of Tanzania and why?",
    "How do I find the area of a triangle?"
  ];

  const subjects = [
    "Mathematics", "Science", "English", "Kiswahili", "Social Studies", 
    "Physics", "Chemistry", "Biology", "Geography", "History", "Other"
  ];

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
    "Grade 7", "Grade 8", "Grade 9", "Form 1", "Form 2", "Form 3", "Form 4"
  ];

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !isAiInitialized || !user) return;

    // Check and potentially reset questions for all plan users after 24 hours
    const updatedQuestions = await dbHelpers.checkAndResetFreeQuestions(user.id);
    if (updatedQuestions > (user.questionsRemaining || 0)) {
      user.questionsRemaining = updatedQuestions;
      const planQuestions = user.plan === 'free' ? '5' : '50';
      toast({
        title: "Questions Renewed!",
        description: `Your ${planQuestions} questions have been renewed after 24 hours. Happy learning!`,
      });
    }

    if ((user.questionsRemaining || 0) <= 0) {
      const planMessage = user.plan === 'free' 
        ? "You've used all your free questions. They'll renew in 24 hours, or upgrade for more questions."
        : `You've used all questions on your ${user.plan} plan. They'll renew in 24 hours.`;
      
      toast({
        title: "No Questions Left",
        description: planMessage,
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentSubject = subject || "General";
    const currentGrade = grade || "General";
    const currentLanguage = language || "English";
    setInput("");
    setIsLoading(true);

    try {
      // Save user message to database
      await dbHelpers.saveChatMessage({
        user_id: user.id,
        type: 'user',
        content: currentInput
      });


      // Pass language to AI backend
    const homeworkQuestion: HomeworkQuestion & { language?: string; curriculum?: string; liteMode?: boolean } = {
      subject: currentSubject,
      grade: currentGrade,
      question: currentInput,
      language: currentLanguage,
      curriculum,
      liteMode
    };

      // Only pass the homeworkQuestion object (language is included as a property)
      const response = await geminiService.askHomeworkQuestion(homeworkQuestion);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);

      // Save bot response to database
      await dbHelpers.saveChatMessage({
        user_id: user.id,
        type: 'bot',
        content: response
      });

      // Decrement user questions
      await dbHelpers.decrementUserQuestions(user.id);

      // Update local user state
      if (user.questionsRemaining) {
        user.questionsRemaining = Math.max(0, user.questionsRemaining - 1);
      }

      toast({
        title: "Answer Generated!",
        description: `Question answered! You have ${user.questionsRemaining || 0} questions remaining.`,
      });

    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "I'm sorry, I'm having trouble processing your question right now. Please try again in a moment. If the problem persists, please check your internet connection or contact support.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isAiInitialized || !user) return;

    // Check and potentially reset questions for all plan users after 24 hours
    const updatedQuestions = await dbHelpers.checkAndResetFreeQuestions(user.id);
    if (updatedQuestions > (user.questionsRemaining || 0)) {
      user.questionsRemaining = updatedQuestions;
      const planQuestions = user.plan === 'free' ? '5' : '50';
      toast({
        title: "Questions Renewed!",
        description: `Your ${planQuestions} questions have been renewed after 24 hours. Happy learning!`,
      });
    }

    if ((user.questionsRemaining || 0) <= 0) {
      const planMessage = user.plan === 'free' 
        ? "You've used all your free questions. They'll renew in 24 hours, or upgrade for more questions."
        : `You've used all questions on your ${user.plan} plan. They'll renew in 24 hours.`;
        
      toast({
        title: "No Questions Left",
        description: planMessage,
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: input || "I've uploaded an image of my homework question. Please help me understand it.",
        timestamp: new Date(),
        image: imageUrl
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      const currentInput = input;
      setInput("");

      try {
        // Save user message with image to database
        await dbHelpers.saveChatMessage({
          user_id: user.id,
          type: 'user',
          content: currentInput || "I've uploaded an image of my homework question. Please help me understand it.",
          image_url: imageUrl
        });

        // Only pass file and currentInput (language is included in currentInput or not supported)
        const response = await geminiService.analyzeHomeworkImage(file, currentInput);

        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botResponse]);

        // Save bot response to database
        await dbHelpers.saveChatMessage({
          user_id: user.id,
          type: 'bot',
          content: response
        });

        // Decrement user questions
        await dbHelpers.decrementUserQuestions(user.id);

        // Update local user state
        if (user.questionsRemaining) {
          user.questionsRemaining = Math.max(0, user.questionsRemaining - 1);
        }

        toast({
          title: "Image Analyzed!",
          description: `Image processed successfully! You have ${user.questionsRemaining || 0} questions remaining.`,
        });

      } catch (error) {
        console.error('Failed to analyze image:', error);
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: "I'm sorry, I'm having trouble analyzing your image right now. Please try uploading the image again or type out your question instead.",
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
        
        toast({
          title: "Image Analysis Failed",
          description: "Failed to analyze the image. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen-safe bg-gradient-to-br from-background to-accent flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <LogIn className="h-6 w-6" />
              <span>Login Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please log in to access the AI homework assistant.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Accessibility: text-to-speech for AI answers
  const speak = (text: string) => {
    if (window.speechSynthesis) {
      if (ttsRef.current) window.speechSynthesis.cancel();
      const utter = new window.SpeechSynthesisUtterance(text);
      ttsRef.current = utter;
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div className={
      `min-h-screen-mobile bg-gradient-to-br from-background to-accent ${highContrast ? 'contrast-150 bg-black text-yellow-200' : ''}`
    }>
      <div className="container mx-auto px-4 py-4 md:py-8 min-h-screen-safe flex flex-col max-w-4xl min-h-[calc(100vh-4rem)]">
        {/* Accessibility: High Contrast Toggle */}
        <div className="flex justify-end mb-2">
          <button
            className={`px-3 py-1 rounded text-xs font-semibold border ${highContrast ? 'bg-yellow-300 text-black' : 'bg-muted text-foreground'}`}
            onClick={() => setHighContrast(v => !v)}
            aria-label="Toggle high contrast mode"
          >
            {highContrast ? 'Normal Mode' : 'High Contrast'}
          </button>
        </div>
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">AI Homework Assistant</h1>
              <p className="text-sm md:text-base text-muted-foreground">Get instant help with any homework question</p>
            </div>
            <div className="text-right">
              <Badge variant={(user.questionsRemaining || 0) > 0 ? "default" : "destructive"} className="mb-2 text-xs">
                {(user.questionsRemaining || 0) > 0 
                  ? `${user.questionsRemaining} Questions Left (${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan)` 
                  : "No Questions Remaining"
                }
              </Badge>
              {(user.questionsRemaining || 0) === 0 && (
                <p className="text-xs text-muted-foreground">
                  <a href="/pricing" className="text-primary hover:underline">Upgrade Your Plan</a>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Language, Curriculum, Subject and Grade Selection */}
        <div className="mb-4 md:mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3 md:gap-4">
          <div className="space-y-2">
            <Label htmlFor="language" className="flex items-center text-sm font-medium">
              <BookOpen className="h-4 w-4 mr-1" />
              Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language..." />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="curriculum" className="flex items-center text-sm font-medium">
              <BookOpen className="h-4 w-4 mr-1" />
              Curriculum
            </Label>
            <Select value={curriculum} onValueChange={setCurriculum}>
              <SelectTrigger>
                <SelectValue placeholder="Select curriculum..." />
              </SelectTrigger>
              <SelectContent>
                {curricula.map((cur) => (
                  <SelectItem key={cur} value={cur}>{cur}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject" className="flex items-center text-sm font-medium">
              <BookOpen className="h-4 w-4 mr-1" />
              Subject (Optional)
            </Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject..." />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade" className="flex items-center text-sm font-medium">
              <GraduationCap className="h-4 w-4 mr-1" />
              Grade/Form (Optional)
            </Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade..." />
              </SelectTrigger>
              <SelectContent>
                {grades.map((gr) => (
                  <SelectItem key={gr} value={gr}>{gr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lite Mode Toggle */}
        <div className="mb-4 flex items-center gap-2">
          <input type="checkbox" id="lite-mode" checked={liteMode} onChange={() => setLiteMode(v => !v)} className="mr-2" title="Enable Lite Mode" />
          <Label htmlFor="lite-mode" className="text-xs">Lite Mode (Faster, less data, minimal UI)</Label>
        </div>

        {/* Sample Questions */}
        {messages.length <= 1 && (
          <div className="mb-4 md:mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Try these sample questions:</h3>
            <div className="grid grid-cols-1 gap-2">
              {sampleQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-left justify-start h-auto py-2 px-3 text-xs md:text-sm"
                  onClick={() => setInput(question)}
                  disabled={(user.questionsRemaining || 0) === 0}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4 mb-4 md:mb-6 min-h-[500px] md:min-h-[600px]">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-start space-x-2 md:space-x-3 max-w-[85%] md:max-w-[80%] ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                <div className={`h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-gradient-primary text-white"
                }`}>
                  {message.type === "user" ? <User className="h-5 w-5 md:h-6 md:w-6" /> : <Bot className="h-5 w-5 md:h-6 md:w-6" />}
                </div>
                
                <Card className={`shadow-soft ${message.type === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                  <CardContent className="p-5 md:p-6">
                    {message.image && (
                      <img src={message.image} alt="Uploaded homework" className="max-w-full h-auto rounded-lg mb-3 md:mb-4" />
                    )}
                    {message.type === "user" ? (
                      <div className="whitespace-pre-line text-sm md:text-base leading-relaxed">{message.content}</div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold">
                            {curriculum}
                          </span>
                          {/* Accessibility: Text-to-speech button for AI answer */}
                          <button
                            className="ml-2 px-2 py-1 rounded bg-muted text-xs border hover:bg-accent"
                            onClick={() => speak(message.content)}
                            aria-label="Read answer aloud"
                          >
                            🔊
                          </button>
                        </div>
                        <FormattedMessage 
                          content={message.content} 
                          className="text-card-foreground"
                        />
                      </>
                    )}
                    <div className={`text-xs mt-2 md:mt-3 ${message.type === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 md:space-x-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-primary text-white flex items-center justify-center">
                  <Bot className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <Card className="shadow-soft">
                  <CardContent className="p-4 md:p-5">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce animate-delay-100"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce animate-delay-200"></div>
                      </div>
                      <span className="text-sm md:text-base text-muted-foreground">AI is thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <Card className="shadow-medium flex-shrink-0">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-end space-x-3 md:space-x-4">
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Type your homework question here... (e.g., 'How do I solve 2x + 5 = 15?')"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[80px] md:min-h-[100px] max-h-40 resize-none text-sm md:text-base leading-relaxed"
                  disabled={(user.questionsRemaining || 0) === 0 || !isAiInitialized}
                />
              </div>
              
              <div className="flex space-x-2 md:space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={(user.questionsRemaining || 0) === 0 || !isAiInitialized}
                  title="Upload image"
                  className="h-12 w-12 md:h-14 md:w-14"
                >
                  <Camera className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading || (user.questionsRemaining || 0) === 0 || !isAiInitialized}
                  className="px-6 md:px-8 h-12 md:h-14"
                  size="default"
                >
                  <Send className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              title="Upload homework image"
              placeholder="Upload homework image"
              aria-label="Upload homework image"
            />
            
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground flex-wrap gap-2">
              <div className="flex items-center space-x-2 md:space-x-4 flex-wrap">
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-success" />
                  Powered by Google Gemini
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-success" />
                  All subjects supported
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-success" />
                  Step-by-step explanations
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {(user.questionsRemaining || 0) === 0 && (
                  <span className="flex items-center text-destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    <a href="/pricing" className="hover:underline">Upgrade to continue</a>
                  </span>
                )}
                {!isAiInitialized && (
                  <span className="flex items-center text-yellow-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    AI initializing...
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

  );
}

export default Chat;