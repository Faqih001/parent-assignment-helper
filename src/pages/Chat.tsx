import { useState, useRef, useEffect } from "react";
import { Send, Camera, Image, Paperclip, Bot, User, AlertCircle, CheckCircle, BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { geminiService, HomeworkQuestion } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  image?: string;
}

export default function Chat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: "Hello! I'm your AI homework assistant powered by Google Gemini. Upload a photo of your homework question or type it here, and I'll provide a clear explanation to help you and your child understand the solution together. 📚✨",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [freeQuestions, setFreeQuestions] = useState(3);
  const [isAiInitialized, setIsAiInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Gemini AI when component mounts
  useEffect(() => {
    const initializeAI = async () => {
      try {
        await geminiService.initializeChat();
        setIsAiInitialized(true);
      } catch (error) {
        console.error('Failed to initialize AI:', error);
        toast({
          title: "AI Initialization Failed",
          description: "There was an issue starting the AI service. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    initializeAI();
  }, [toast]);

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
    if (!input.trim() || isLoading || !isAiInitialized) return;

    if (freeQuestions === 0) {
      toast({
        title: "No Questions Left",
        description: "Please subscribe to continue asking questions.",
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
    setInput("");
    setIsLoading(true);

    try {
      const homeworkQuestion: HomeworkQuestion = {
        subject: currentSubject,
        grade: currentGrade,
        question: currentInput
      };

      const response = await geminiService.askHomeworkQuestion(homeworkQuestion);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setFreeQuestions(prev => Math.max(0, prev - 1));

      // Show success toast
      toast({
        title: "Answer Generated!",
        description: "I've provided a detailed explanation for your question.",
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
    if (!file || !isAiInitialized) return;

    if (freeQuestions === 0) {
      toast({
        title: "No Questions Left",
        description: "Please subscribe to continue asking questions.",
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
      setInput("");

      try {
        const response = await geminiService.analyzeHomeworkImage(file, input);

        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botResponse]);
        setFreeQuestions(prev => Math.max(0, prev - 1));

        toast({
          title: "Image Analyzed!",
          description: "I've analyzed your homework image and provided an explanation.",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent">
      <div className="container mx-auto px-4 py-8 h-screen flex flex-col max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AI Homework Assistant</h1>
              <p className="text-muted-foreground">Get instant help with any homework question</p>
            </div>
            <div className="text-right">
              <Badge variant={freeQuestions > 0 ? "default" : "destructive"} className="mb-2">
                {freeQuestions > 0 ? `${freeQuestions} Free Questions Left` : "Subscribe for More"}
              </Badge>
              {freeQuestions === 0 && (
                <p className="text-xs text-muted-foreground">
                  <a href="/pricing" className="text-primary hover:underline">View Pricing Plans</a>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Subject and Grade Selection */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <SelectItem key={subj} value={subj}>
                    {subj}
                  </SelectItem>
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
                  <SelectItem key={gr} value={gr}>
                    {gr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sample Questions */}
        {messages.length === 1 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Try these sample questions:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-left justify-start h-auto py-2 px-3"
                  onClick={() => setInput(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  message.type === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-gradient-primary text-white"
                }`}>
                  {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                
                <Card className={`shadow-soft ${message.type === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                  <CardContent className="p-4">
                    {message.image && (
                      <img src={message.image} alt="Uploaded homework" className="max-w-full h-auto rounded-lg mb-3" />
                    )}
                    <div className="whitespace-pre-line text-sm">{message.content}</div>
                    <div className={`text-xs mt-2 ${message.type === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-primary text-white flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <Card className="shadow-soft">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <Card className="shadow-medium">
          <CardContent className="p-4">
            <div className="flex items-end space-x-3">
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
                  className="min-h-[40px] max-h-32 resize-none"
                  disabled={freeQuestions === 0}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={freeQuestions === 0}
                  title="Upload image"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading || freeQuestions === 0}
                  className="px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-success" />
                  All subjects supported
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-success" />
                  Step-by-step explanations
                </span>
              </div>
              {freeQuestions === 0 && (
                <span className="flex items-center text-destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  <a href="/pricing" className="hover:underline">Subscribe to continue</a>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}