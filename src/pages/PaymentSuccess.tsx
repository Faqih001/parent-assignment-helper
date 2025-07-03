import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, Home, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { paymentService } from '@/lib/intasend';
import { emailService } from '@/lib/resend';
import { env } from '@/lib/env';

interface PaymentStatus {
  status: 'loading' | 'success' | 'failed' | 'pending';
  message: string;
  details?: any;
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'loading',
    message: 'Verifying your payment...'
  });

  const invoiceId = searchParams.get('invoice_id');
  const reference = searchParams.get('api_ref');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!invoiceId) {
        setPaymentStatus({
          status: 'failed',
          message: 'Payment verification failed. No invoice ID found.'
        });
        return;
      }

      try {
        const status = await paymentService.checkPaymentStatus(invoiceId);
        
        if (status.invoice?.state === 'COMPLETE') {
          setPaymentStatus({
            status: 'success',
            message: 'Payment completed successfully!',
            details: status
          });

          // Send payment confirmation email
          if (status.customer?.email) {
            try {
              await emailService.sendPaymentConfirmation(
                status.customer.email,
                'HomeworkHelper Subscription',
                status.invoice.net_amount || 0,
                invoiceId
              );
            } catch (emailError) {
              console.error('Failed to send confirmation email:', emailError);
              // Don't fail the payment success for email issues
            }
          }
        } else if (status.invoice?.state === 'FAILED') {
          setPaymentStatus({
            status: 'failed',
            message: 'Payment failed. Please try again or contact support.',
            details: status
          });
        } else if (status.invoice?.state === 'PENDING') {
          setPaymentStatus({
            status: 'pending',
            message: 'Payment is still being processed. Please wait...',
            details: status
          });
          
          // Check again after 5 seconds for pending payments
          setTimeout(checkPaymentStatus, 5000);
        } else {
          setPaymentStatus({
            status: 'failed',
            message: 'Payment status unknown. Please contact support.',
            details: status
          });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentStatus({
          status: 'failed',
          message: 'Failed to verify payment status. Please contact support if payment was deducted.'
        });
      }
    };

    checkPaymentStatus();
  }, [invoiceId]);

  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case 'loading':
      case 'pending':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-16 w-16 text-red-500" />;
      default:
        return <AlertCircle className="h-16 w-16 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus.status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-strong">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className={`text-2xl font-bold ${getStatusColor()}`}>
              {paymentStatus.status === 'loading' && 'Verifying Payment'}
              {paymentStatus.status === 'pending' && 'Payment Processing'}
              {paymentStatus.status === 'success' && 'Payment Successful!'}
              {paymentStatus.status === 'failed' && 'Payment Failed'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {paymentStatus.message}
              </p>

              {paymentStatus.status === 'success' && (
                <div className="space-y-4">
                  <Badge variant="default" className="bg-green-100 text-green-800 px-4 py-2">
                    ✅ Subscription Activated
                  </Badge>
                  
                  {paymentStatus.details && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Amount:</strong> KES {paymentStatus.details.invoice?.net_amount?.toLocaleString()}</p>
                      <p><strong>Reference:</strong> {reference || paymentStatus.details.invoice?.api_ref}</p>
                      <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}

              {paymentStatus.status === 'failed' && (
                <div className="space-y-4">
                  <Badge variant="destructive" className="px-4 py-2">
                    ❌ Payment Not Completed
                  </Badge>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>If money was deducted from your account, please contact our support team with the reference number: <strong>{reference || invoiceId}</strong></p>
                  </div>
                </div>
              )}

              {paymentStatus.status === 'pending' && (
                <div className="space-y-4">
                  <Badge variant="secondary" className="px-4 py-2">
                    ⏳ Payment Processing
                  </Badge>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Your payment is being processed. This usually takes a few minutes. You can close this page and check back later.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {paymentStatus.status === 'success' && (
                <>
                  <Link to="/chat" className="block">
                    <Button className="w-full" size="lg">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Start Using HomeworkHelper
                    </Button>
                  </Link>
                  <Link to="/" className="block">
                    <Button variant="outline" className="w-full">
                      <Home className="mr-2 h-5 w-5" />
                      Go to Homepage
                    </Button>
                  </Link>
                </>
              )}

              {paymentStatus.status === 'failed' && (
                <>
                  <Link to="/pricing" className="block">
                    <Button className="w-full" size="lg">
                      Try Payment Again
                    </Button>
                  </Link>
                  <Link to="/contact" className="block">
                    <Button variant="outline" className="w-full">
                      Contact Support
                    </Button>
                  </Link>
                  <Link to="/" className="block">
                    <Button variant="ghost" className="w-full">
                      <Home className="mr-2 h-5 w-5" />
                      Go to Homepage
                    </Button>
                  </Link>
                </>
              )}

              {(paymentStatus.status === 'loading' || paymentStatus.status === 'pending') && (
                <Link to="/" className="block">
                  <Button variant="outline" className="w-full">
                    <Home className="mr-2 h-5 w-5" />
                    Go to Homepage
                  </Button>
                </Link>
              )}
            </div>

            {/* Support Information */}
            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p>
                Need help? Contact us at{' '}
                <a href={`mailto:${env.supportEmail}`} className="text-primary hover:underline">
                  {env.supportEmail}
                </a>
                {' '}or WhatsApp{' '}
                <a href={`https://wa.me/${env.whatsappNumber}`} className="text-primary hover:underline">
                  +{env.whatsappNumber}
                </a>
              </p>
              <p className="mt-1">
                Reference: {reference || invoiceId || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
