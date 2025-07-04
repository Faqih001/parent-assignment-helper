import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentService, PaymentRequest, PaymentResponse } from '@/lib/intasend';
import { env } from '@/lib/env';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amount: number;
  description: string;
  onPaymentSuccess?: (paymentData: PaymentResponse) => void;
}

type PaymentMethod = 'M-PESA' | 'AIRTEL-MONEY' | 'CARD';
type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

export function PaymentModal({
  isOpen,
  onClose,
  planName,
  amount,
  description,
  onPaymentSuccess
}: PaymentModalProps) {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('M-PESA');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [paymentData, setPaymentData] = useState({
    phoneNumber: '',
    email: '',
    firstName: '',
    lastName: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!paymentData.email || !paymentData.firstName || !paymentData.lastName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }

    if ((paymentMethod === 'M-PESA' || paymentMethod === 'AIRTEL-MONEY') && !paymentData.phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number for mobile money payment.",
        variant: "destructive",
      });
      return false;
    }

    // Validate phone number format for Kenyan numbers
    if (paymentData.phoneNumber && !/^(\+254|254|0)?[17]\d{8}$/.test(paymentData.phoneNumber.replace(/\s/g, ''))) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number (e.g., 0712345678 or 0112345678).",
        variant: "destructive",
      });
      return false;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove any spaces or special characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Convert to international format for IntaSend (254XXXXXXXXX)
    if (cleaned.startsWith('0')) {
      return `254${cleaned.substring(1)}`;
    } else if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.startsWith('+254')) {
      return cleaned.substring(1);
    }
    
    // If it's just 9 digits, assume it's missing the leading 0
    if (cleaned.length === 9) {
      return `254${cleaned}`;
    }
    
    return cleaned;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setStatus('processing');

    try {
      const paymentRequest: PaymentRequest = {
        amount,
        currency: 'KES',
        email: paymentData.email,
        first_name: paymentData.firstName,
        last_name: paymentData.lastName,
        method: paymentMethod,
        api_ref: `HH-${planName.replace(/\s+/g, '-')}-${Date.now()}`,
        redirect_url: `${env.appUrl || 'https://parent-assignment-helper.vercel.app'}/payment/success`,
      };

      if (paymentMethod === 'M-PESA' || paymentMethod === 'AIRTEL-MONEY') {
        paymentRequest.phone_number = formatPhoneNumber(paymentData.phoneNumber);
      }

      let response: PaymentResponse;

      switch (paymentMethod) {
        case 'M-PESA':
          response = await paymentService.initiateMpesaPayment(paymentRequest);
          break;
        case 'AIRTEL-MONEY':
          response = await paymentService.initiateAirtelPayment(paymentRequest);
          break;
        case 'CARD':
          response = await paymentService.initiateCardPayment(paymentRequest);
          // For card payments, redirect to IntaSend checkout page
          if (response.payment_link) {
            window.open(response.payment_link, '_blank');
          }
          break;
        default:
          throw new Error('Invalid payment method');
      }

      setStatus('success');
      
      toast({
        title: "Payment Initiated",
        description: paymentMethod === 'CARD' 
          ? "You'll be redirected to complete your payment."
          : `Please check your phone for the ${paymentMethod} payment prompt.`,
      });

      if (onPaymentSuccess) {
        onPaymentSuccess(response);
      }

      // For mobile money, we can check status after a delay
      if (paymentMethod !== 'CARD') {
        setTimeout(() => {
          checkPaymentStatus(response.invoice.id);
        }, 30000); // Check after 30 seconds
      }

    } catch (error) {
      setStatus('error');
      console.error('Payment error:', error);
      
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const checkPaymentStatus = async (invoiceId: string) => {
    try {
      const status = await paymentService.checkPaymentStatus(invoiceId);
      
      if (status.invoice?.state === 'COMPLETE') {
        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed successfully.",
        });
        onClose();
      } else if (status.invoice?.state === 'FAILED') {
        toast({
          title: "Payment Failed",
          description: "Your payment could not be processed. Please try again.",
          variant: "destructive",
        });
        setStatus('error');
      }
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  const resetForm = () => {
    setPaymentData({
      phoneNumber: '',
      email: '',
      firstName: '',
      lastName: '',
    });
    setStatus('idle');
    setPaymentMethod('M-PESA');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
          <DialogDescription>
            {description} - KES {amount.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        {status === 'success' ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold">Payment Initiated Successfully!</h3>
            <p className="text-muted-foreground">
              {paymentMethod === 'CARD' 
                ? "Complete your payment in the new tab that opened."
                : `Check your phone for the ${paymentMethod} payment prompt.`}
            </p>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : status === 'error' ? (
          <div className="text-center py-8 space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold">Payment Failed</h3>
            <p className="text-muted-foreground">
              There was an issue processing your payment. Please try again.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setStatus('idle')} variant="outline" className="flex-1">
                Try Again
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label>Choose Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                className="grid grid-cols-1 gap-3"
              >
                <Card className={`cursor-pointer transition-all ${paymentMethod === 'M-PESA' ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="flex items-center space-x-3 p-4">
                    <RadioGroupItem value="M-PESA" id="mpesa" />
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-5 w-5 text-green-600" />
                      <Label htmlFor="mpesa" className="cursor-pointer font-medium">M-Pesa</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer transition-all ${paymentMethod === 'AIRTEL-MONEY' ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="flex items-center space-x-3 p-4">
                    <RadioGroupItem value="AIRTEL-MONEY" id="airtel" />
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-5 w-5 text-red-600" />
                      <Label htmlFor="airtel" className="cursor-pointer font-medium">Airtel Money</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="flex items-center space-x-3 p-4">
                    <RadioGroupItem value="CARD" id="card" />
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <Label htmlFor="card" className="cursor-pointer font-medium">Credit/Debit Card</Label>
                    </div>
                  </CardContent>
                </Card>
              </RadioGroup>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={paymentData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                    disabled={status === 'processing'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={paymentData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                    disabled={status === 'processing'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={paymentData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john.doe@example.com"
                  disabled={status === 'processing'}
                />
              </div>

              {(paymentMethod === 'M-PESA' || paymentMethod === 'AIRTEL-MONEY') && (
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={paymentData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="0712345678"
                    disabled={status === 'processing'}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your {paymentMethod === 'M-PESA' ? 'Safaricom' : 'Airtel'} number
                  </p>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{planName}</span>
                  <span>KES {amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>KES {amount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={status === 'processing'}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                className="flex-1"
                disabled={status === 'processing'}
              >
                {status === 'processing' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay KES ${amount.toLocaleString()}`
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Your payment is secured by IntaSend. We do not store your payment information.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
