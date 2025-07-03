import { Check, Star, MessageCircle, Users, Building, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { PaymentModal } from "@/components/PaymentModal";
import { useState } from "react";

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    setIsPaymentModalOpen(false);
    setSelectedPlan(null);
    // Here you can redirect to success page or update user subscription
  };

  const handlePlanSelect = (plan: any) => {
    if (plan.name === "School Partnership") {
      // Redirect to contact page for enterprise plans
      return;
    }
    
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };
  const plans = [
    {
      name: "Pay-Per-Use",
      price: "KES 10",
      originalPrice: 10,
      period: "per question",
      description: "Perfect for occasional homework help",
      badge: "Most Flexible",
      features: [
        "Instant AI explanations",
        "Photo or text input",
        "Step-by-step solutions", 
        "All subjects covered",
        "24/7 availability",
        "No monthly commitment"
      ],
      buttonText: "Try Now",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Family Plan",
      price: "KES 999",
      originalPrice: 999,
      period: "per month",
      description: "50 questions renewable every 24 hours",
      badge: "Most Popular",
      features: [
        "50 questions (renewable daily)",
        "All pay-per-use features",
        "Priority support",
        "Progress tracking",
        "Multiple children profiles",
        "Homework reminders",
        "Parent guidance tips",
        "Weekly progress reports"
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "hero" as const,
      popular: true
    },
    {
      name: "School Partnership",
      price: "Custom",
      originalPrice: 0,
      period: "contact us",
      description: "For schools and educational institutions",
      badge: "Enterprise",
      features: [
        "All Family Plan features",
        "Bulk student accounts",
        "Teacher dashboard",
        "Curriculum alignment",
        "Analytics & reporting",
        "Custom integrations",
        "Training & support",
        "Volume discounts"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "gradient" as const,
      popular: false
    }
  ];

  const faqs = [
    {
      question: "How does the renewable question system work?",
      answer: "All plans have renewable questions! Free plan gets 5 questions, Family plan gets 50 questions. When you use all your questions, they automatically renew after 24 hours. No need to wait for monthly billing cycles!"
    },
    {
      question: "What if my child's question isn't answered correctly?",
      answer: "We offer a 100% satisfaction guarantee. If you're not happy with an explanation, we'll refund your question credit or provide a better explanation for free."
    },
    {
      question: "Can I switch between plans?",
      answer: "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle."
    },
    {
      question: "Do you support Kenyan curriculum?",
      answer: "Yes! Our AI is trained on the Kenyan education system including CBC (Competency Based Curriculum) and previous systems."
    },
    {
      question: "Is my payment information secure?",
      answer: "We use industry-standard encryption and secure payment processing. We never store your full payment details on our servers."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept M-Pesa, Airtel Money, major credit cards, and bank transfers for your convenience."
    }
  ];

  return (
    <div className="flex flex-col py-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center space-y-6">
          <h1 className="text-4xl lg:text-5xl font-bold">
            Simple, <span className="bg-gradient-primary bg-clip-text text-transparent">Transparent</span> Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that works best for your family. From occasional help to daily support, 
            we have options for every need and budget.
          </p>
          <div className="flex justify-center">
            <Badge variant="secondary" className="px-4 py-2">
              💝 All Plans Renewable Every 24 Hours • Start with 5 Free Questions
            </Badge>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative border-0 shadow-soft hover:shadow-medium transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-primary shadow-strong' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge 
                    variant={plan.popular ? "default" : "secondary"}
                    className={plan.popular ? "bg-gradient-primary" : ""}
                  >
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center space-y-4 pt-8">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {plan.price}
                    <span className="text-lg font-normal text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.name === "School Partnership" ? (
                  <Link to="/contact">
                    <Button 
                      variant={plan.buttonVariant} 
                      size="lg" 
                      className="w-full"
                    >
                      {plan.buttonText}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant={plan.buttonVariant} 
                    size="lg" 
                    className="w-full"
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {plan.buttonText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Why HomeworkHelper is Worth It
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Compare the cost of tutoring vs. our AI-powered solution
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-soft text-center">
              <CardContent className="p-6 space-y-4">
                <div className="h-16 w-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Private Tutoring</h3>
                <p className="text-3xl font-bold text-muted-foreground">KES 2,000+</p>
                <p className="text-sm text-muted-foreground">Per hour • Limited availability</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-soft text-center ring-2 ring-primary">
              <CardContent className="p-6 space-y-4">
                <div className="h-16 w-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">HomeworkHelper</h3>
                <p className="text-3xl font-bold text-primary">KES 999</p>
                <p className="text-sm text-muted-foreground">Per month • 50 questions daily</p>
                <Badge variant="default" className="bg-gradient-primary">Best Value</Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-soft text-center">
              <CardContent className="p-6 space-y-4">
                <div className="h-16 w-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Learning Centers</h3>
                <p className="text-3xl font-bold text-muted-foreground">KES 5,000+</p>
                <p className="text-sm text-muted-foreground">Per month • Fixed schedule</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground mb-6">
              Save over 80% compared to traditional tutoring while getting 24/7 support
            </p>
            <Link to="/chat">
              <Button variant="hero" size="lg">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about our pricing and service
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => toggleFAQ(index)}
              >
                <CardContent className="p-0">
                  <div className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors duration-200">
                    <h3 className="text-lg font-semibold pr-4 flex-1">{faq.question}</h3>
                    <div className="flex-shrink-0 transition-transform duration-300 ease-in-out">
                      {openFAQ === index ? (
                        <ChevronUp className="h-5 w-5 text-primary" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  <div 
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${
                      openFAQ === index 
                        ? 'max-h-96 opacity-100' 
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-6 pt-0">
                      <div className="border-t border-muted pt-4 animate-in slide-in-from-top-2 duration-300">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
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
              Ready to Make Homework Easier?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of Kenyan families who've transformed their homework experience
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/chat">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Star className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                  Have Questions?
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedPlan(null);
          }}
          planName={selectedPlan.name}
          amount={selectedPlan.originalPrice}
          description={selectedPlan.description}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}