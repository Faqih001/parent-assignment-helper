import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Users, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm, validateContactForm } from "@/lib/contact";
import { dbHelpers } from "@/lib/supabase";
import { env } from "@/lib/env";
import support247 from "@/assets/support-247.jpg";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    type: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email",
      contact: env.supportEmail,
      availability: "24/7 response within 4 hours"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak with our team",
      contact: env.supportPhone,
      availability: "Mon-Fri: 8 AM - 6 PM EAT"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Support",
      description: "Chat on WhatsApp",
      contact: `+${env.whatsappNumber}`,
      availability: "Mon-Fri: 8 AM - 8 PM EAT"
    },
    {
      icon: MapPin,
      title: "Office Location",
      description: "Visit our office",
      contact: "Nairobi, Kenya",
      availability: "By appointment only"
    }
  ];

  const inquiryTypes = [
    { value: "general", label: "General Inquiry", icon: MessageCircle },
    { value: "support", label: "Technical Support", icon: Phone },
    { value: "partnership", label: "School Partnership", icon: Building },
    { value: "billing", label: "Billing Question", icon: Mail }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form data
    const validation = validateContactForm({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      phone: formData.phone
    });

    if (!validation.isValid) {
      toast({
        title: "Please fix the following errors:",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Save to database first
      const contactData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        message: `Subject: ${formData.subject}\n\nType: ${formData.type}\n\nMessage: ${formData.message}`,
        status: 'pending' as const
      };

      const savedContact = await dbHelpers.saveContactForm(contactData);
      
      if (!savedContact) {
        throw new Error('Failed to save contact form to database');
      }

      // Also send email notification (optional, for admin notification)
      try {
        await submitContactForm({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          phone: formData.phone || undefined,
        });
      } catch (emailError) {
        console.warn('Email notification failed, but form was saved:', emailError);
      }

      toast({
        title: "Message Sent Successfully! ✅",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        type: "general"
      });
      
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: "Failed to Send Message",
        description: "There was an error submitting your message. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-hero overflow-hidden min-h-[60vh] flex items-center">
        <div className="absolute inset-0 bg-black/40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-30"
          style={{ backgroundImage: `url(${support247})` }}
        ></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 animate-fade-in">
            <h1 className="text-4xl lg:text-5xl font-bold text-white animate-slide-up">
              Get in <span className="text-secondary">Touch</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto animate-fade-in [animation-delay:0.2s]">
              Have questions about HomeworkHelper? Need technical support? Want to explore school partnerships? 
              We're here to help and would love to hear from you.
            </p>
            <Badge variant="secondary" className="px-4 py-2 bg-white/10 text-white border-white/30 animate-scale-in [animation-delay:0.4s]">
              💬 Average response time: 2 hours
            </Badge>
          </div>
        </div>
      </section>

            {/* Contact Methods */}
      <section className="py-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactMethods.map((method, index) => (
            <Card key={index} className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 text-center">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                  <method.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                  <p className="text-sm font-medium text-primary">{method.contact}</p>
                  <p className="text-xs text-muted-foreground mt-1">{method.availability}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Send us a Message</CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Inquiry Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type of Inquiry</label>
                    <div className="grid grid-cols-2 gap-2">
                      {inquiryTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            formData.type === type.value
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-input hover:bg-accent"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <type.icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{type.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone Number (Optional)</label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0712345678"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief description of your inquiry"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please provide details about your inquiry..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    variant="hero"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* FAQ & Quick Info */}
          <div className="space-y-6">
            {/* Quick Answers */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                  Quick Answers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    q: "How quickly do you respond?",
                    a: "We typically respond within 2-4 hours during business hours, and within 24 hours on weekends."
                  },
                  {
                    q: "Do you offer phone support?",
                    a: "Yes! Phone support is available Mon-Fri 8 AM - 6 PM EAT for urgent technical issues."
                  },
                  {
                    q: "Can schools get bulk pricing?",
                    a: "Absolutely! We offer special pricing for schools and educational institutions. Contact our sales team."
                  },
                  {
                    q: "Is there a free trial?",
                    a: "Yes! Every new user gets 3 free questions to experience our AI homework assistant."
                  }
                ].map((faq, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium text-sm">{faq.q}</h4>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Support Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Email Support</span>
                  <Badge variant="default">24/7</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Live Chat</span>
                  <span className="text-sm text-muted-foreground">8 AM - 8 PM EAT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Phone Support</span>
                  <span className="text-sm text-muted-foreground">8 AM - 6 PM EAT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Weekend Support</span>
                  <span className="text-sm text-muted-foreground">Email only</span>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Support */}
            <Card className="border-0 shadow-soft bg-gradient-card">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-primary" />
                  Emergency Support
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For urgent technical issues affecting homework deadlines, contact us via WhatsApp:
                </p>
                <p className="font-medium text-primary">+{env.whatsappNumber}</p>
                <p className="text-xs text-muted-foreground mt-1">Available 24/7 for subscribers</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}