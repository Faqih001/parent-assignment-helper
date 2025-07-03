import { Camera, MessageCircle, BookOpen, Users, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import celebration from "@/assets/celebration.jpg";
import aiTeacher from "@/assets/ai-teacher.jpg";

export default function HowItWorks() {
  const steps = [
    {
      icon: Camera,
      title: "Capture or Type",
      description: "Take a clear photo of the homework question or type it directly into our chat interface.",
      details: [
        "Works with handwritten or printed text",
        "Supports math equations, diagrams, and charts", 
        "Can handle multiple questions at once",
        "Voice input also available"
      ]
    },
    {
      icon: MessageCircle,
      title: "AI Analysis",
      description: "Our advanced AI analyzes the question and creates a step-by-step explanation tailored for parent-child learning.",
      details: [
        "Identifies the subject and difficulty level",
        "Breaks down complex problems into simple steps",
        "Provides multiple solution approaches",
        "Explains concepts in age-appropriate language"
      ]
    },
    {
      icon: BookOpen,
      title: "Learn Together",
      description: "Get clear explanations that help both you and your child understand the solution process, not just the answer.",
      details: [
        "Parent-friendly explanations included",
        "Tips for helping your child understand",
        "Related practice questions suggested",
        "Progress tracking available"
      ]
    },
    {
      icon: Users,
      title: "Build Confidence",
      description: "Watch as both you and your child gain confidence in tackling homework challenges together.",
      details: [
        "Strengthens parent-child learning bond",
        "Builds problem-solving skills",
        "Reduces homework-related stress",
        "Creates positive learning experiences"
      ]
    }
  ];

  const subjects = [
    { name: "Mathematics", topics: ["Arithmetic", "Algebra", "Geometry", "Statistics"] },
    { name: "Science", topics: ["Biology", "Chemistry", "Physics", "Earth Science"] },
    { name: "Languages", topics: ["English", "Kiswahili", "French", "Grammar"] },
    { name: "Social Studies", topics: ["History", "Geography", "Civics", "Economics"] },
    { name: "Other Subjects", topics: ["Art", "Music", "PE Theory", "Computer Studies"] }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-32 bg-gradient-hero overflow-hidden min-h-[50vh] sm:min-h-[60vh] flex items-center">
        <div className="absolute inset-0 bg-black/40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${aiTeacher})` }}
        ></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-16 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white animate-slide-up leading-tight">
              How <span className="text-secondary">HomeworkHelper</span> Works
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto animate-fade-in [animation-delay:0.2s] px-2">
              Our AI-powered homework assistant makes it easy for parents to help their children 
              learn and understand, creating confident learners and stress-free homework time.
            </p>
          </div>
        </div>
      </section>

      {/* Step-by-step Process */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="space-y-12 sm:space-y-16">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="flex-1 space-y-4 sm:space-y-6 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto sm:mx-0">
                    <step.icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-sm font-medium text-primary mb-1">Step {index + 1}</div>
                    <h3 className="text-xl sm:text-2xl font-bold">{step.title}</h3>
                  </div>
                </div>
                
                <p className="text-base sm:text-lg text-muted-foreground text-center sm:text-left">{step.description}</p>
                
                <ul className="space-y-3">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-muted-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex-1 w-full">
                <Card className="bg-gradient-card shadow-medium border-0">
                  <CardContent className="p-6 sm:p-8">
                    <div className="h-40 sm:h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <step.icon className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto" />
                        <p className="text-sm text-muted-foreground">Interactive Demo</p>
                        <p className="text-xs text-muted-foreground">Coming Soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Subjects */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Subjects We Cover
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              From primary school to high school, we support learning across all major subjects
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {subjects.map((subject, index) => (
              <Card key={index} className="border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-primary">{subject.name}</h3>
                  <ul className="space-y-2">
                    {subject.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Why This Approach Works
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Our method focuses on understanding, not just answers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-start">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-semibold text-center md:text-left">Traditional Homework Help</h3>
                <ul className="space-y-3">
                  {[
                    "Gives direct answers",
                    "Child becomes dependent", 
                    "Parent feels inadequate",
                    "No real learning happens"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start space-x-3 text-sm sm:text-base text-muted-foreground">
                      <div className="h-2 w-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-semibold text-primary text-center md:text-left">HomeworkHelper Approach</h3>
                <ul className="space-y-3">
                  {[
                    "Explains the thinking process",
                    "Builds independent problem-solving",
                    "Empowers parents to teach", 
                    "Creates lasting understanding"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${celebration})` }}
        ></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="space-y-4 sm:space-y-6 text-white">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Ready to Try It Yourself?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl opacity-90 max-w-2xl mx-auto px-2">
              Experience the difference our AI-powered approach makes in just minutes
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2">
              <Link to="/chat" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Start Free Demo
                </Button>
              </Link>
              <Link to="/pricing" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white bg-white/10 text-white hover:bg-white hover:text-primary transition-all duration-300">
                  View Pricing Plans
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}