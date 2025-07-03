import { useState, useRef } from "react";
import { Send, Camera, Image, Paperclip, Bot, User, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  image?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: "Hello! I'm your AI homework assistant. Upload a photo of your homework question or type it here, and I'll provide a clear explanation to help you and your child understand the solution together. 📚✨",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [freeQuestions, setFreeQuestions] = useState(3);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleQuestions = [
    "Help me solve: 2x + 5 = 15",
    "Explain photosynthesis to a 10-year-old",
    "What's the capital of Tanzania and why?",
    "How do I find the area of a triangle?"
  ];

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: `Great question! Let me break this down for you step by step:

📖 **Understanding the Problem:**
${input.includes("2x") ? "This is a linear equation where we need to find the value of x." : "This appears to be a question about " + input.split(" ").slice(0, 3).join(" ") + "."}

🔍 **Step-by-Step Solution:**
${input.includes("2x") ? 
`1. Start with: 2x + 5 = 15
2. Subtract 5 from both sides: 2x = 10
3. Divide both sides by 2: x = 5
4. Check: 2(5) + 5 = 15 ✓` :
`1. Let me research this topic for you
2. I'll provide age-appropriate explanations
3. Include examples your child can relate to
4. Suggest follow-up questions to ask`}

👨‍👩‍👧‍👦 **For Parents:**
Encourage your child to explain each step back to you. This helps reinforce their understanding and builds confidence.

💡 **Next Steps:**
Would you like me to suggest similar practice problems?`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setFreeQuestions(prev => Math.max(0, prev - 1));
      setIsLoading(false);
    }, 2000);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const userMessage: Message = {
          id: Date.now().toString(),
          type: "user",
          content: "I've uploaded an image of my homework question. Please help me understand it.",
          timestamp: new Date(),
          image: imageUrl
        };
        setMessages(prev => [...prev, userMessage]);
        
        // Simulate AI response for image
        setTimeout(() => {
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: "bot",
            content: `I can see the homework question in your image! Let me analyze it and provide a detailed explanation:

📸 **What I See:**
This appears to be a [math/science/language] problem that requires [specific skills].

🔍 **Solution Approach:**
1. First, let's identify what the question is asking
2. Break down the problem into smaller parts
3. Apply the relevant concepts step by step
4. Verify our answer makes sense

👨‍👩‍👧‍👦 **Teaching Tip:**
When helping your child, start by asking "What do you think this question wants us to find?" This encourages critical thinking.

Would you like me to explain any specific part in more detail?`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botResponse]);
          setFreeQuestions(prev => Math.max(0, prev - 1));
        }, 2500);
      };
      reader.readAsDataURL(file);
    }
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