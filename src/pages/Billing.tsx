import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentModal } from "@/components/PaymentModal";
import { dbHelpers, CustomPlan, BillingInfo, SubscriptionHistory } from "@/lib/supabase";
import { CreditCard, Crown, Users, Shield, Check, X, Calendar, DollarSign, TrendingUp, MessageCircle, Building, Star, Save, User } from "lucide-react";

export default function Billing() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customPlans, setCustomPlans] = useState<CustomPlan[]>([]);
  const [billingInfo, setBillingInfo] = useState<Partial<BillingInfo>>({});
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistory[]>([]);
  const [isSavingBilling, setIsSavingBilling] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [plans, billing, history] = await Promise.all([
        dbHelpers.getCustomPlans(),
        dbHelpers.getBillingInfo(user!.id),
        dbHelpers.getSubscriptionHistory(user!.id)
      ]);
      
      setCustomPlans(plans);
      if (billing) setBillingInfo(billing);
      setSubscriptionHistory(history);
    } catch (error) {
      console.error('Error loading billing data:', error);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Please log in to view billing information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Align with Pricing page plans
  const plans = [
    {
      id: "free" as const,
      name: "Free Plan",
      price: 0,
      originalPrice: 0,
      period: "Forever",
      description: "5 questions renewable every 24 hours",
      icon: <Shield className="h-6 w-6" />,
      color: "secondary",
      current: user.plan === "free",
      popular: false,
      custom: false,
      features: [
        { name: "5 questions (renewable daily)", included: true },
        { name: "Instant AI explanations", included: true },
        { name: "Photo or text input", included: true },
        { name: "All subjects covered", included: true },
        { name: "24/7 availability", included: true },
        { name: "Priority support", included: false },
        { name: "Progress tracking", included: false },
        { name: "Multiple children profiles", included: false },
      ]
    },
    {
      id: "family" as const,
      name: "Family Plan",
      price: 999,
      originalPrice: 999,
      period: "per month",
      description: "50 questions renewable every 24 hours",
      icon: <Users className="h-6 w-6" />,
      color: "default",
      current: user.plan === "family",
      popular: true,
      custom: false,
      features: [
        { name: "50 questions (renewable daily)", included: true },
        { name: "All Free Plan features", included: true },
        { name: "Priority support", included: true },
        { name: "Progress tracking", included: true },
        { name: "Multiple children profiles", included: true },
        { name: "Homework reminders", included: true },
        { name: "Parent guidance tips", included: true },
        { name: "Weekly progress reports", included: true },
      ]
    },
    {
      id: "enterprise" as const,
      name: "School Partnership",
      price: 0,
      originalPrice: 0,
      period: "Custom pricing",
      description: "For schools and educational institutions",
      icon: <Building className="h-6 w-6" />,
      color: "outline",
      current: user.plan === "enterprise",
      popular: false,
      custom: false,
      features: [
        { name: "All Family Plan features", included: true },
        { name: "Bulk student accounts", included: true },
        { name: "Teacher dashboard", included: true },
        { name: "Curriculum alignment", included: true },
        { name: "Analytics & reporting", included: true },
        { name: "Custom integrations", included: true },
        { name: "Training & support", included: true },
        { name: "Volume discounts", included: true },
      ]
    }
  ];

  const handleUpgrade = (plan: any) => {
    if (plan.name === "School Partnership") {
      // Redirect to contact page for enterprise plans
      window.location.href = "/contact";
      return;
    }
    
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      // This would typically call your backend to cancel the subscription
      // For now, we'll just show a message
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will be cancelled at the end of the current billing period.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel subscription. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsPaymentModalOpen(false);
    
    // Log subscription change
    if (selectedPlan) {
      await dbHelpers.logSubscriptionChange(
        user!.id,
        user!.plan,
        selectedPlan.id,
        'upgrade',
        undefined, // Payment ID would come from actual payment processor
        selectedPlan.price
      );
      
      await dbHelpers.logUserActivity(user!.id, 'subscription_upgraded', {
        from_plan: user!.plan,
        to_plan: selectedPlan.id,
        amount: selectedPlan.price
      });
    }
    
    setSelectedPlan(null);
    refreshUser();
    toast({
      title: "Payment Successful!",
      description: "Your plan has been upgraded successfully.",
      variant: "success",
    });
  };

  const handleSaveBillingInfo = async () => {
    setIsSavingBilling(true);
    try {
      const updatedBilling = await dbHelpers.updateBillingInfo(user!.id, billingInfo);
      
      if (updatedBilling) {
        await dbHelpers.logUserActivity(user!.id, 'billing_info_updated');
        toast({
          title: "Billing Information Updated!",
          description: "Your billing details have been saved successfully.",
          variant: "success",
        });
      }
    } catch (error: any) {
      console.error("Billing update error:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update billing information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingBilling(false);
    }
  };

  const handleBillingChange = (field: string, value: string) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
  };

  const currentPlan = plans.find(plan => plan.current);
  const customPlan = customPlans.find(plan => plan.name.toLowerCase().includes(user.plan));

  // Combine default plans with custom plans
  const allPlans = [
    ...plans,
    ...customPlans.map(plan => ({
      id: `custom-${plan.id}`,
      name: plan.name,
      price: plan.price,
      originalPrice: plan.price,
      period: plan.period,
      description: plan.description,
      icon: <Building className="h-6 w-6" />,
      color: "outline",
      current: false,
      popular: false,
      custom: true,
      features: plan.features.map(feature => ({ name: feature, included: true }))
    }))
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription and billing information</p>
        </div>

        {/* Current Plan Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  {currentPlan?.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{currentPlan?.name}</h3>
                  <p className="text-muted-foreground">
                    {currentPlan?.price === 0 ? 
                      (currentPlan?.name === "School Partnership" ? "Custom pricing" : "Free forever") : 
                      `KES ${currentPlan?.price} ${currentPlan?.period}`
                    }
                  </p>
                  {user.plan === "free" && user.questionsRemaining !== undefined && (
                    <p className="text-sm text-primary">
                      {user.questionsRemaining} questions remaining today
                    </p>
                  )}
                  {user.plan === "family" && (
                    <p className="text-sm text-primary">
                      50 questions renewable daily
                    </p>
                  )}
                </div>
              </div>
              <Badge variant={currentPlan?.color as any} className="flex items-center gap-1">
                {currentPlan?.icon}
                Active
              </Badge>
            </div>

            {user.plan !== "free" && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Next billing date</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your current billing period.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleCancelSubscription}
                          disabled={isLoading}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isLoading ? "Cancelling..." : "Cancel Subscription"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Plans */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {allPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''} ${plan.current ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit">
                    {plan.icon}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold">
                      {plan.name === "School Partnership" ? (
                        "Custom"
                      ) : plan.price === 0 ? (
                        "Free"
                      ) : (
                        <>
                          KES {plan.price}
                          <span className="text-sm font-normal text-muted-foreground">/{plan.period.split(' ')[1] || "month"}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Separator />
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={feature.included ? "" : "text-muted-foreground"}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Separator />

                  {plan.current ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : plan.id === "free" ? (
                    user.plan !== "free" ? (
                      <Button variant="outline" className="w-full" disabled>
                        Downgrade (Contact Support)
                      </Button>
                    ) : null
                  ) : plan.id === "enterprise" || plan.custom ? (
                    <Button 
                      onClick={() => handleUpgrade(plan)}
                      className="w-full"
                      variant="outline"
                    >
                      Contact Sales
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleUpgrade(plan)}
                      className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {user.plan === "free" ? "Upgrade" : "Switch Plan"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Usage Statistics
            </CardTitle>
            <CardDescription>Your question usage for the current period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.plan === "free" ? (
                <>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Daily Questions Used</span>
                      <span className="font-medium">{5 - (user.questionsRemaining || 0)}/5</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${((5 - (user.questionsRemaining || 0)) / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Questions reset daily at midnight. Upgrade to get 50 questions daily!
                  </p>
                </>
              ) : user.plan === "family" ? (
                <>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Daily Questions Available</span>
                      <span className="font-medium">50/50</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-gradient-primary h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Your 50 questions reset daily at midnight. Need more? Contact us about our enterprise plans.
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Contact your account manager for usage details.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Billing Information
            </CardTitle>
            <CardDescription>Manage your billing details and payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="billing-info" className="w-full">
              <TabsList>
                <TabsTrigger value="billing-info">Billing Details</TabsTrigger>
                <TabsTrigger value="payment-history">Payment History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="billing-info" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="billing-name">Full Name</Label>
                    <Input
                      id="billing-name"
                      value={billingInfo.full_name || ''}
                      onChange={(e) => handleBillingChange('full_name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="billing-email">Email Address</Label>
                    <Input
                      id="billing-email"
                      type="email"
                      value={billingInfo.email || user.email || ''}
                      onChange={(e) => handleBillingChange('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="billing-phone">Phone Number</Label>
                    <Input
                      id="billing-phone"
                      value={billingInfo.phone || ''}
                      onChange={(e) => handleBillingChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="billing-country">Country</Label>
                    <Input
                      id="billing-country"
                      value={billingInfo.country || ''}
                      onChange={(e) => handleBillingChange('country', e.target.value)}
                      placeholder="Enter your country"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="billing-address">Address</Label>
                    <Input
                      id="billing-address"
                      value={billingInfo.address || ''}
                      onChange={(e) => handleBillingChange('address', e.target.value)}
                      placeholder="Enter your full address"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="billing-city">City</Label>
                    <Input
                      id="billing-city"
                      value={billingInfo.city || ''}
                      onChange={(e) => handleBillingChange('city', e.target.value)}
                      placeholder="Enter your city"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="billing-postal">Postal Code</Label>
                    <Input
                      id="billing-postal"
                      value={billingInfo.postal_code || ''}
                      onChange={(e) => handleBillingChange('postal_code', e.target.value)}
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveBillingInfo}
                    disabled={isSavingBilling}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSavingBilling ? "Saving..." : "Save Billing Info"}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="payment-history" className="space-y-4">
                {subscriptionHistory.length > 0 ? (
                  <div className="space-y-4">
                    {subscriptionHistory.map((record) => (
                      <div key={record.id} className="flex items-center justify-between py-3 border-b">
                        <div>
                          <p className="font-medium">
                            {record.action_type === 'upgrade' ? 'Plan Upgrade' : 
                             record.action_type === 'downgrade' ? 'Plan Downgrade' : 
                             record.action_type === 'renewal' ? 'Subscription Renewal' : 
                             'Subscription Change'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {record.from_plan} → {record.to_plan}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(record.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {record.amount && (
                            <p className="font-medium">KES {record.amount}</p>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {record.payment_id ? 'Paid' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : user.plan === "free" ? (
                  <p className="text-muted-foreground text-center py-8">
                    No payment history available. You're currently on the free plan.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium">{currentPlan?.name} - Monthly</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">KES {currentPlan?.price}.00</p>
                        <Badge variant="outline" className="text-xs">Paid</Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      More payment history features coming soon.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

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
