import { Users, Heart, Target, Award, BookOpen, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import familyStudy from "@/assets/family-study.jpg";

export default function About() {
  const values = [
    {
      icon: Heart,
      title: "Family First",
      description: "We believe in strengthening the parent-child learning bond, making homework a positive shared experience."
    },
    {
      icon: BookOpen,
      title: "Understanding Over Answers",
      description: "Our approach focuses on teaching concepts and thinking processes, not just providing quick solutions."
    },
    {
      icon: Globe,
      title: "Accessible Education", 
      description: "Quality educational support should be available to every Kenyan family, regardless of background or location."
    },
    {
      icon: Award,
      title: "Excellence in Learning",
      description: "We're committed to the highest standards in educational content and age-appropriate explanations."
    }
  ];

  const team = [
    {
      name: "Fakii Mohammed",
      role: "CEO",
      bio: "Visionary leader with extensive experience in educational technology and family-centered solutions.",
      expertise: "Leadership & Strategy"
    },
    {
      name: "Andrew Ogembo", 
      role: "CTO",
      bio: "Technical architect specializing in AI systems and scalable educational platforms.",
      expertise: "AI & Technology"
    },
    {
      name: "Chiboniso Nyoni",
      role: "User Experience Lead",
      bio: "UX expert focused on creating intuitive, family-friendly interfaces that make learning accessible.",
      expertise: "User Experience"
    }
  ];

  const milestones = [
    {
      year: "2023",
      title: "The Idea",
      description: "Founded by parents who struggled with homework help, recognizing a gap in accessible educational support."
    },
    {
      year: "2024 Q1",
      title: "AI Development",
      description: "Began developing our proprietary AI system, trained specifically on Kenyan curriculum and learning patterns."
    },
    {
      year: "2024 Q2",
      title: "Pilot Program",
      description: "Launched with 100 Kenyan families, achieving 95% satisfaction rate and validating our approach."
    },
    {
      year: "2024 Q3",
      title: "Public Launch",
      description: "Officially launched to serve families across Kenya with our AI-powered homework assistance platform."
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-hero overflow-hidden min-h-[60vh] flex items-center">
        <div className="absolute inset-0 bg-black/40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-30"
          style={{ backgroundImage: `url(${familyStudy})` }}
        ></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 mb-16 animate-fade-in">
            <h1 className="text-4xl lg:text-5xl font-bold animate-slide-up text-white">
              About <span className="text-secondary">HomeworkHelper</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto animate-fade-in [animation-delay:0.2s]">
              We're on a mission to make quality education support accessible to every Kenyan family, 
              empowering parents to help their children learn and grow with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold">Our Mission & Vision</h2>
            <p className="text-xl text-muted-foreground">The driving force behind everything we do</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-20 max-w-6xl mx-auto">
            {/* Mission Card */}
            <Card className="group border-0 shadow-soft hover:shadow-strong transition-all duration-500 bg-gradient-card hover:scale-105 animate-slide-up overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-8 space-y-6 relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-16 w-16 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:animate-float shadow-medium">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">Our Mission</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To bridge the educational gap between school and home by providing every Kenyan parent 
                  with the tools and confidence to support their child's homework and learning journey.
                </p>
                <div className="pt-4 border-t border-gray-200 group-hover:border-primary/30 transition-colors duration-300">
                  <div className="flex items-center space-x-3 text-sm text-primary font-medium">
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                    <span>Bridging educational gaps</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vision Card */}
            <Card className="group border-0 shadow-soft hover:shadow-strong transition-all duration-500 bg-gradient-card hover:scale-105 animate-slide-up overflow-hidden relative" style={{ animationDelay: "0.2s" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-8 space-y-6 relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-16 w-16 bg-gradient-secondary rounded-xl flex items-center justify-center group-hover:animate-float shadow-medium">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold group-hover:text-secondary transition-colors duration-300">Our Vision</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  A Kenya where every child has access to quality homework support, where parents feel 
                  empowered to help their children learn, and where homework becomes a positive bonding experience.
                </p>
                <div className="pt-4 border-t border-gray-200 group-hover:border-secondary/30 transition-colors duration-300">
                  <div className="flex items-center space-x-3 text-sm text-secondary font-medium">
                    <div className="h-2 w-2 bg-secondary rounded-full animate-pulse"></div>
                    <span>Empowering every family</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="space-y-8">
            <div className="text-center animate-fade-in">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Our Core Values</h2>
              <p className="text-xl text-muted-foreground">The principles that guide everything we do</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card 
                  key={index} 
                  className="group border-0 shadow-soft hover:shadow-strong transition-all duration-500 text-center bg-gradient-card hover:scale-105 animate-slide-up overflow-hidden relative"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  <CardContent className="p-6 space-y-4 relative z-10">
                    <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto group-hover:animate-float shadow-medium">
                      <value.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors duration-300">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Our Story</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Born from the real struggles of Kenyan parents trying to help their children succeed
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">
                HomeworkHelper was born out of a simple but powerful realization: despite wanting the best for their children, 
                many Kenyan parents struggle to provide homework support due to curriculum changes, forgotten concepts, 
                or simply not having the time to research complex topics.
              </p>
              
              <p className="text-lg leading-relaxed">
                Our founder, Dr. Sarah Kamau, experienced this firsthand while helping her own children with the new CBC curriculum. 
                As an educator, she knew the importance of parental involvement in learning, but she also understood the challenges 
                parents face when subjects become unfamiliar or complex.
              </p>
              
              <p className="text-lg leading-relaxed">
                That's when the idea struck: what if we could create an AI assistant that doesn't just give answers, 
                but actually empowers parents to teach and guide their children? An assistant that explains concepts 
                in simple terms, provides teaching tips for parents, and makes homework time a positive experience for the whole family.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Our Journey</h2>
            <p className="text-xl text-muted-foreground">Key milestones in our mission to support Kenyan families</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-6 animate-slide-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold shadow-medium hover:animate-float">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 bg-gradient-card hover:scale-[1.02]">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">{milestone.year}</span>
                          <h3 className="text-lg font-semibold">{milestone.title}</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground">
              Passionate educators, technologists, and parents working together
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card 
                key={index} 
                className="group border-0 shadow-soft hover:shadow-strong transition-all duration-500 bg-gradient-card hover:scale-105 animate-scale-in overflow-hidden relative"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                <CardContent className="p-8 text-center space-y-6 relative z-10">
                  <div className="h-24 w-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto group-hover:animate-float shadow-strong group-hover:shadow-medium transition-shadow duration-300">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-300">{member.name}</h3>
                    <p className="text-primary font-semibold text-base">{member.role}</p>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{member.bio}</p>
                  <div className="pt-2">
                    <span className="text-sm bg-primary/10 text-primary px-3 py-2 rounded-full font-medium border border-primary/20">
                      {member.expertise}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6 text-white">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Join Our Mission
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Help us make quality education support accessible to every Kenyan family
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/chat">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Try HomeworkHelper
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                  Get in Touch
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