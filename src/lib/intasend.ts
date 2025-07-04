import { env } from './env';

// Helper function to get the app URL
const getAppUrl = () => {
  return env.appUrl || 'https://parent-assignment-helper.vercel.app';
};

export interface PaymentRequest {
  amount: number;
  currency: string;
  phone_number?: string;
  email: string;
  first_name: string;
  last_name: string;
  method: 'M-PESA' | 'AIRTEL-MONEY' | 'CARD';
  redirect_url?: string;
  api_ref?: string;
}

export interface MPesaSTKPushRequest {
  amount: number;
  phone_number: string;
  api_ref: string;
  narrative?: string;
}

export interface PaymentResponse {
  id?: string;
  invoice: {
    id: string;
    state: string;
    provider: string;
    charges: string;
    net_amount: number;
    currency: string;
    value: string;
    account: string;
    api_ref: string;
    host: string;
    failed_reason: string | null;
    failed_code: string | null;
    created_at: string;
    updated_at: string;
  };
  customer?: {
    id: string;
    phone_number: string;
    email: string;
    first_name: string;
    last_name: string;
    country: string;
    zipcode: string | null;
    provider: string;
  };
  payment_link?: string;
  customer_comment?: string;
  challenge?: {
    id: string;
    status: string;
    request_reference: string;
    phone_number: string;
    amount: number;
    narrative: string;
    api_ref: string;
    created_at: string;
    updated_at: string;
  };
}

export interface PaymentStatusResponse {
  invoice: {
    id: string;
    state: 'PENDING' | 'COMPLETE' | 'FAILED';
    provider: string;
    charges: string;
    net_amount: number;
    currency: string;
    value: string;
    account: string;
    api_ref: string;
    host: string;
    failed_reason: string | null;
    failed_code: string | null;
    created_at: string;
    updated_at: string;
  };
}

export class IntaSendPaymentService {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = env.intasendTestMode 
      ? 'https://sandbox.intasend.com' 
      : 'https://payment.intasend.com';
    
    this.headers = {
      'Content-Type': 'application/json',
      'X-IntaSend-Public-Key-Test': env.intasendPublicKey,
      'Authorization': `Bearer ${env.intasendSecretKey}`,
    };
  }

  /**
   * Initiate M-Pesa STK Push payment
   * POST https://api.intasend.com/api/v1/payment/mpesa-stk-push/
   */
  async initiateMpesaPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const stkPushData: MPesaSTKPushRequest = {
        amount: paymentData.amount,
        phone_number: paymentData.phone_number!,
        api_ref: paymentData.api_ref || `HH-${Date.now()}`,
        narrative: `HomeworkHelper - ${paymentData.api_ref || 'Payment'}`,
      };

      const response = await fetch('https://api.intasend.com/api/v1/payment/mpesa-stk-push/', {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(stkPushData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform response to match our interface
      return {
        invoice: {
          id: data.challenge?.id || data.id,
          state: 'PENDING',
          provider: 'M-PESA',
          charges: '0',
          net_amount: paymentData.amount,
          currency: 'KES',
          value: paymentData.amount.toString(),
          account: paymentData.phone_number!,
          api_ref: data.challenge?.api_ref || stkPushData.api_ref,
          host: 'intasend.com',
          failed_reason: null,
          failed_code: null,
          created_at: data.challenge?.created_at || new Date().toISOString(),
          updated_at: data.challenge?.updated_at || new Date().toISOString(),
        },
        challenge: data.challenge,
      };
    } catch (error) {
      console.error('M-Pesa STK Push failed:', error);
      throw new Error(`M-Pesa payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initiate Airtel Money payment
   */
  async initiateAirtelPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const airtelData = {
        amount: paymentData.amount,
        phone_number: paymentData.phone_number!,
        api_ref: paymentData.api_ref || `HH-${Date.now()}`,
        narrative: `HomeworkHelper - ${paymentData.api_ref || 'Payment'}`,
      };

      const response = await fetch(`${this.baseUrl}/api/v1/payment/airtel-money/`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(airtelData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        invoice: {
          id: data.id || `airtel-${Date.now()}`,
          state: 'PENDING',
          provider: 'AIRTEL-MONEY',
          charges: '0',
          net_amount: paymentData.amount,
          currency: 'KES',
          value: paymentData.amount.toString(),
          account: paymentData.phone_number!,
          api_ref: airtelData.api_ref,
          host: 'intasend.com',
          failed_reason: null,
          failed_code: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Airtel Money payment failed:', error);
      throw new Error(`Airtel Money payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initiate card payment using checkout session
   */
  async initiateCardPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const checkoutData = {
        amount: paymentData.amount,
        currency: paymentData.currency || 'KES',
        email: paymentData.email,
        first_name: paymentData.first_name,
        last_name: paymentData.last_name,
        api_ref: paymentData.api_ref || `HH-${Date.now()}`,
        redirect_url: paymentData.redirect_url || `${getAppUrl()}/payment/success`,
      };

      const response = await fetch(`${this.baseUrl}/api/v1/checkout/`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        invoice: {
          id: data.id || `card-${Date.now()}`,
          state: 'PENDING',
          provider: 'CARD',
          charges: '0',
          net_amount: paymentData.amount,
          currency: paymentData.currency || 'KES',
          value: paymentData.amount.toString(),
          account: paymentData.email,
          api_ref: checkoutData.api_ref,
          host: 'intasend.com',
          failed_reason: null,
          failed_code: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        payment_link: data.url || data.payment_link,
        customer: {
          id: data.customer?.id || 'temp',
          phone_number: paymentData.phone_number || '',
          email: paymentData.email,
          first_name: paymentData.first_name,
          last_name: paymentData.last_name,
          country: 'KE',
          zipcode: null,
          provider: 'CARD',
        },
      };
    } catch (error) {
      console.error('Card payment failed:', error);
      throw new Error(`Card payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(invoiceId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payment/status/${invoiceId}/`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Payment status check failed:', error);
      throw new Error(`Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(invoiceId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payment/details/${invoiceId}/`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get payment details failed:', error);
      throw new Error(`Get details failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate webhook signature (for production use)
   */
  validateWebhook(payload: string, signature: string): boolean {
    // Implementation would depend on IntaSend's webhook signature verification
    // For now, return true for testing
    return true;
  }

  /**
   * Handle webhook payload
   */
  async handleWebhook(payload: any): Promise<void> {
    try {
      // Process webhook payload
      console.log('Webhook received:', payload);
      
      // Update payment status in your database
      // Send notifications to users
      // Update subscription status
      
    } catch (error) {
      console.error('Webhook processing failed:', error);
      throw error;
    }
  }
}

export const paymentService = new IntaSendPaymentService();
