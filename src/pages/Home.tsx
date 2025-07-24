import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, BookOpen, MessageCircle, Clock, Shield, Star, Users, Target, Award, Zap, Heart, Globe, Smartphone, CheckCircle, TrendingUp, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import PasswordResetModal from "@/components/auth/PasswordResetModal";
import { useState, useEffect } from "react";
import heroImage from "@/assets/hero-image.jpg";
import familyStudy from "@/assets/family-study.jpg";
import aiTeacher from "@/assets/ai-teacher.jpg";
import kidsLearning from "@/assets/kids-learning.jpg";
import celebration from "@/assets/celebration.jpg";
import subjectsImage from "@/assets/subjects.jpg";
import support247 from "@/assets/support-247.jpg";
import safety from "@/assets/safety.jpg";
import progress from "@/assets/progress.jpg";

export default function Home() {
  const { user, updatePassword, isLoginLoading } = useAuth();
  const { openRegisterModal } = useAuthModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);

  // Check if user came from password reset link
  useEffect(() => {
    const isReset = searchParams.get('reset');
    if (isReset === 'true') {
      setShowPasswordResetModal(true);
      // Remove the reset parameter from the URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('reset');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handlePasswordUpdate = async (newPassword: string) => {
    await updatePassword(newPassword);
    setShowPasswordResetModal(false);
  };
  const features = [
    {
      icon: MessageCircle,
      title: "AI-Powered Chat",
      description: "Simply type or upload a photo of homework questions and get instant, easy-to-understand explanations.",
      image: aiTeacher
    },
    {
      icon: Clock,
      title: "Available 24/7",
      description: "Get help anytime, whether it's early morning prep or late-night study sessions.",
      image: support247
    },
    {
      icon: BookOpen,
      title: "All Subjects",
      description: "From math and science to languages and social studies - we cover it all.",
      image: subjectsImage
    },
    {
      icon: Shield,
      title: "Child-Safe",
      description: "Designed specifically for educational content with appropriate language and explanations.",
      image: safety
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Mother of 2",
      content: "HomeworkHelper saved our evening routine! I can now confidently help my kids with subjects I haven't studied in years.",
      rating: 5,
      avatar: "SM",
      location: "Nairobi"
    },
    {
      name: "David K.",
      role: "Father",
      content: "The explanations are so clear and simple. My daughter actually understands math better now!",
      rating: 5,
      avatar: "DK",
      location: "Mombasa"
    },
    {
      name: "Grace W.",
      role: "Parent & Teacher",
      content: "As both a parent and educator, I love how this tool bridges the gap between school and home learning.",
      rating: 5,
      avatar: "GW",
      location: "Kisumu"
    },
    {
      name: "John M.",
      role: "Single Father",
      content: "Being a single dad, this has been a lifesaver for homework time. My kids love learning with AI assistance!",
      rating: 5,
      avatar: "JM",
      location: "Nakuru"
    },
    {
      name: "Mary A.",
      role: "Working Mom",
      content: "Finally, I can help with homework even when I'm exhausted from work. This tool explains everything so well.",
      rating: 5,
      avatar: "MA",
      location: "Eldoret"
    },
    {
      name: "Peter N.",
      role: "Grandfather",
      content: "At my age, keeping up with modern education was tough. Now I can confidently help my grandchildren.",
      rating: 5,
      avatar: "PN",
      location: "Thika"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Happy Families", icon: Heart },
    { number: "50,000+", label: "Questions Answered", icon: MessageCircle },
    { number: "95%", label: "Success Rate", icon: Award },
    { number: "24/7", label: "Available", icon: Clock }
  ];

  const subjects = [
    { name: "Mathematics", description: "Algebra, Geometry, Calculus & more", color: "bg-blue-500" },
    { name: "Science", description: "Physics, Chemistry, Biology", color: "bg-green-500" },
    { name: "Languages", description: "English, Swahili, French", color: "bg-purple-500" },
    { name: "Social Studies", description: "History, Geography, Civics", color: "bg-orange-500" },
    { name: "Literature", description: "Poetry, Novels, Essays", color: "bg-pink-500" },
    { name: "Computer Science", description: "Programming, ICT", color: "bg-indigo-500" }
  ];

  const benefits = [
    {
      title: "Improved Understanding",
      description: "Children grasp concepts better with step-by-step explanations",
      icon: Target,
      stat: "89% better comprehension"
    },
    {
      title: "Reduced Stress",
      description: "No more homework battles or frustrated evenings",
      icon: Heart,
      stat: "75% less homework stress"
    },
    {
      title: "Better Grades",
      description: "Students show consistent improvement in their academic performance",
      icon: TrendingUp,
      stat: "65% grade improvement"
    },
    {
      title: "Confident Parents",
      description: "Parents feel empowered to support their children's learning",
      icon: Award,
      stat: "92% parent satisfaction"
    }
  ];

  const plans = [
    {
      name: "Free Trial",
      price: "KES 0",
      period: "5 questions",
      features: ["5 homework questions", "Basic explanations", "Photo upload", "24/7 access"],
      popular: false
    },
    {
      name: "Family Plan",
      price: "KES 499",
      period: "per month",
      features: ["Unlimited questions", "Detailed explanations", "Multiple children", "Priority support", "Progress tracking"],
      popular: true
    },
    {
      name: "School Partnership",
      price: "Custom",
      period: "pricing",
      features: ["Bulk pricing", "Teacher dashboard", "Student analytics", "Custom branding", "Dedicated support"],
      popular: false
    }
  ];

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-hero overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-white">
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white border-white/30 animate-fade-in">
                  🚀 Trusted by 10,000+ Kenyan families
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight animate-slide-up">
                  Help Your Child{" "}
                  <span className="text-secondary">
                    Excel
                  </span>{" "}
                  at Homework
                </h1>
                <p className="text-xl max-w-lg animate-slide-up [animation-delay:0.2s] opacity-90">
                  Get instant, AI-powered explanations for any homework question. 
                  Simply take a photo or ask a question, and help your child understand - not just complete.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-scale-in [animation-delay:0.4s]">
                {user ? (
                  <Link to="/chat">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-semibold shadow-lg">
                      Go to Chat
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
                    onClick={openRegisterModal}
                  >
                    Try Free Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
                <Link to="/how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white bg-white/10 text-white hover:bg-white hover:text-primary transition-all duration-300">
                    See How It Works
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative animate-float">
              <img 
                src={heroImage} 
                alt="Parent helping child with homework" 
                className="rounded-2xl shadow-strong w-full"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-medium border animate-scale-in [animation-delay:0.6s]">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">AI Assistant Ready</p>
                    <p className="text-xs text-muted-foreground">Ask any homework question</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center animate-fade-in animation-delay-${index}`}>
                <div className="mb-4 flex justify-center">
                  <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Why Parents Love HomeworkHelper
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Designed specifically for busy parents who want to support their children's learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group border-0 shadow-soft hover:shadow-medium transition-all duration-300 bg-gradient-card overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 text-center space-y-4">
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold">Real Results for Real Families</h2>
            <p className="text-xl text-muted-foreground">See the impact HomeworkHelper has on learning outcomes</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center border-0 shadow-soft hover:shadow-medium transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 space-y-4">
                  <div className="h-16 w-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto">
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                  <div className="text-2xl font-bold text-primary">{benefit.stat}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How It Works Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold">Simple as 1-2-3</h2>
            <p className="text-xl text-muted-foreground">Get homework help in seconds</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Take a Photo or Ask",
                description: "Upload a picture of the homework question or type it directly into our chat",
                icon: Smartphone
              },
              {
                step: "2", 
                title: "AI Explains Simply",
                description: "Our AI breaks down the problem into easy-to-understand steps for both you and your child",
                icon: Zap
              },
              {
                step: "3",
                title: "Learn Together",
                description: "Use the explanation to guide your child through the solution, building understanding",
                icon: Users
              }
            ].map((item, index) => (
              <div key={index} className={`text-center space-y-4 animate-slide-up animation-delay-step-${index}`}>
                <div className="h-20 w-20 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-white shadow-medium">
                  {item.step}
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 animate-fade-in">
            <Link to="/how-it-works">
              <Button variant="default" size="lg">
                See Detailed Guide
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Subjects We Cover */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold">Subjects We Cover</h2>
            <p className="text-xl text-muted-foreground">Comprehensive support across all academic areas</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <Card key={index} className="group hover:shadow-medium transition-all duration-300 border-0 overflow-hidden animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`h-12 w-12 ${subject.color} rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                      {subject.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{subject.name}</h3>
                      <p className="text-muted-foreground text-sm">{subject.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Impact Stories (expanded) */}
      <section id="impact-stories" className="py-20 relative">
        <div className="absolute inset-0 bg-cover bg-center bg-fixed bg-family-study">
          <div className="absolute inset-0 bg-primary/90"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-16 text-white animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold flex items-center justify-center gap-2">
              <Award className="h-7 w-7 text-yellow-300" /> Impact Stories
            </h2>
            <p className="text-xl opacity-90">Real transformations from Kenyan families and sponsored schools</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "From F to A in Mathematics",
                description: "12-year-old Kevin improved from failing math to getting As within 3 months, thanks to a sponsored subscription.",
                metric: "Grade improvement: F → A",
                family: "The Wanjiku Family"
              },
              {
                title: "Homework Time Reduced by 70%",
                description: "What used to take 3 hours now takes just 45 minutes with better understanding. Sponsored by a local NGO.",
                metric: "Time saved: 2+ hours daily",
                family: "The Ochieng Family"
              },
              {
                title: "Confidence Boost",
                description: "Shy student now actively participates in class and asks questions confidently. Supported by a school partnership.",
                metric: "Participation: 0% → 85%",
                family: "The Mwangi Family"
              }
            ].map((story, index) => (
              <Card key={index} className="bg-white/95 backdrop-blur-sm border-0 shadow-strong animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-primary">{story.title}</h3>
                  <p className="text-muted-foreground">{story.description}</p>
                  <div className="text-lg font-bold text-success">{story.metric}</div>
                  <p className="text-sm font-medium text-primary">{story.family}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12 animate-fade-in">
            <Button asChild size="lg" variant="hero">
              <a href="mailto:partnerships@homeworkhelper.co.ke?subject=Sponsor Impact Story">Sponsor a Family or School</a>
            </Button>
          </div>
        </div>
      </section>

      {/* 8. Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold">
              What Parents Are Saying
            </h2>
            <p className="text-xl text-muted-foreground">
              Real feedback from families across Kenya
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                      ))}
                    </div>
                    <Badge variant="outline" className="text-xs">{testimonial.location}</Badge>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 8.5 Sponsorship & Partnership CTA */}
      <section className="py-20 bg-gradient-to-br from-pink-100/60 to-blue-100/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center space-y-4 mb-10 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2"><Heart className="h-7 w-7 text-pink-500" /> Sponsor a Family or School</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              NGOs, companies, and individuals can sponsor HomeworkHelper access for families, schools, or communities. Your support helps bridge the education gap and empowers learners.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/90 rounded-xl shadow-soft p-8 space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><Users className="h-6 w-6 text-primary" /> Why Sponsor?</h3>
              <ul className="list-disc pl-6 text-muted-foreground text-base space-y-1">
                <li>Fully or partially sponsor subscriptions for families or schools</li>
                <li>Get impact reports and testimonials from beneficiaries</li>
                <li>Branding and partnership opportunities</li>
                <li>Flexible sponsorship packages (monthly, annual, or custom)</li>
              </ul>
              <div className="flex gap-4 mt-6">
                <Button asChild size="lg" variant="hero">
                  <a href="mailto:partnerships@homeworkhelper.co.ke?subject=Sponsorship Inquiry">Contact Us</a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#impact-stories">See Impact Stories</a>
                </Button>
              </div>
            </div>
            <div className="bg-white/90 rounded-xl shadow-soft p-8 space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><Building className="h-6 w-6 text-blue-500" /> For Organizations & CSR</h3>
              <ul className="list-disc pl-6 text-muted-foreground text-base space-y-1">
                <li>Bulk sponsorships for schools or regions</li>
                <li>Co-branded campaigns and reporting</li>
                <li>Employee engagement and volunteering</li>
              </ul>
              <div className="mt-6">
                <Button asChild size="lg" variant="outline">
                  <a href="mailto:partnerships@homeworkhelper.co.ke?subject=CSR Partnership">Partner With Us</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Pricing Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the plan that works for your family</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative border-0 shadow-soft hover:shadow-medium transition-all duration-300 animate-scale-in ${plan.popular ? 'ring-2 ring-primary' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-primary text-white">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6 text-center space-y-4">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-primary">{plan.price}</div>
                    <div className="text-muted-foreground text-sm">{plan.period}</div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={plan.popular ? "hero" : "outline"} 
                    className="w-full"
                    onClick={plan.name === "Free Trial" ? openRegisterModal : undefined}
                  >
                    {plan.name === "Free Trial" ? "Start Free" : "Choose Plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 animate-fade-in">
            <Link to="/pricing">
              <Button variant="default" size="lg">
                View All Pricing Options
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. AI Technology Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-slide-up">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Powered by Advanced AI Technology
              </h2>
              <p className="text-xl text-muted-foreground">
                Our cutting-edge artificial intelligence understands context, explains concepts clearly, and adapts to your child's learning style.
              </p>
              <div className="space-y-4">
                {[
                  "Natural language processing for clear explanations",
                  "Image recognition for photo-based questions",
                  "Adaptive learning algorithms",
                  "Multi-language support including Swahili"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Link to="/about">
                <Button variant="hero" size="lg">
                  Learn More About Our AI
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="relative animate-float">
              <img 
                src={aiTeacher} 
                alt="AI Technology" 
                className="rounded-2xl shadow-strong w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <div className="text-2xl font-bold">AI-Powered</div>
                <div className="text-sm opacity-90">Next-generation learning assistant</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Mobile App Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold">Learning On-the-Go</h2>
            <p className="text-xl text-muted-foreground">Access HomeworkHelper anywhere, anytime</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative animate-scale-in">
              <img 
                src={kidsLearning} 
                alt="Mobile Learning" 
                className="rounded-2xl shadow-strong w-full"
              />
            </div>
            <div className="space-y-6 animate-slide-up">
              <h3 className="text-2xl font-bold">Study Anywhere, Anytime</h3>
              <p className="text-lg text-muted-foreground">
                Whether at home, in the car, or visiting relatives, your AI homework assistant is always in your pocket.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Smartphone, title: "Mobile Optimized", desc: "Perfect for any device" },
                  { icon: Globe, title: "Offline Mode", desc: "Works without internet" },
                  { icon: Clock, title: "Quick Response", desc: "Answers in seconds" },
                  { icon: Shield, title: "Secure & Safe", desc: "Privacy protected" }
                ].map((feature, index) => (
                  <div key={index} className="text-center space-y-2">
                    <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Parent Dashboard Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-slide-up">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Track Your Child's Progress
              </h2>
              <p className="text-xl text-muted-foreground">
                Get insights into your child's learning journey with detailed analytics and progress reports.
              </p>
              <div className="space-y-4">
                {[
                  "Subject-wise performance tracking",
                  "Time spent on different topics",
                  "Improvement areas identification",
                  "Weekly progress reports",
                  "Achievement badges and rewards"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-success" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative animate-float">
              <img 
                src={progress} 
                alt="Progress Tracking" 
                className="rounded-2xl shadow-strong w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 13. Community Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold">Join Our Learning Community</h2>
            <p className="text-xl text-muted-foreground">Connect with other parents and share learning experiences</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Parent Forums",
                description: "Share tips and experiences with other parents",
                icon: Users,
                members: "5,000+ active parents"
              },
              {
                title: "Expert Webinars",
                description: "Monthly sessions with education experts",
                icon: BookOpen,
                members: "Weekly sessions"
              },
              {
                title: "Success Stories",
                description: "Celebrate achievements together",
                icon: Award,
                members: "500+ success stories"
              }
            ].map((community, index) => (
              <Card key={index} className="text-center border-0 shadow-soft hover:shadow-medium transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 space-y-4">
                  <div className="h-16 w-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto">
                    <community.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{community.title}</h3>
                  <p className="text-muted-foreground">{community.description}</p>
                  <Badge variant="outline">{community.members}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 14. FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">Everything you need to know about HomeworkHelper</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: "Is it safe for my child to use?",
                answer: "Absolutely! We prioritize child safety with content filtering, privacy protection, and age-appropriate explanations."
              },
              {
                question: "What subjects are covered?",
                answer: "We cover all major subjects including Math, Science, Languages, Social Studies, and more for all grade levels."
              },
              {
                question: "How much does it cost?",
                answer: "Start with 5 free questions, then choose from our affordable plans starting at KES 499/month."
              },
              {
                question: "Can multiple children use one account?",
                answer: "Yes! Our family plan supports multiple children with individual progress tracking for each."
              },
              {
                question: "What if I'm not satisfied?",
                answer: "We offer a 30-day money-back guarantee if you're not completely satisfied with our service."
              },
              {
                question: "Do you support Swahili?",
                answer: "Yes! Our AI can explain concepts in both English and Swahili to better serve Kenyan families."
              }
            ].map((faq, index) => (
              <Card key={index} className="border-0 shadow-soft animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold text-lg">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 15. CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 bg-celebration"
        ></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="space-y-6 text-white max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Ready to Transform Homework Time?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of Kenyan families who've made homework stress-free with AI assistance. Start your free trial today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
              {user ? (
                <Link to="/chat">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-semibold shadow-lg">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Go to Chat
                  </Button>
                </Link>
              ) : (
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
                  onClick={openRegisterModal}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
              )}
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white bg-white/10 text-white hover:bg-white hover:text-primary transition-all duration-300">
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-6 text-sm opacity-90 animate-slide-up">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>30-day guarantee</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4" />
                <span>5-star rated</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>10,000+ families</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
        onUpdatePassword={handlePasswordUpdate}
        isLoading={isLoginLoading}
      />
    </div>
  );
}