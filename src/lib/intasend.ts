import IntaSend from 'intasend-node';
import { env } from './env';

// IntaSend configuration
const intasend = new IntaSend(
  env.intasendPublicKey,
  env.intasendSecretKey,
  env.intasendTestMode
);

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

export interface PaymentResponse {
  id: string;
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
  customer: {
    id: string;
    phone_number: string;
    email: string;
    first_name: string;
    last_name: string;
    country: string;
    zipcode: string | null;
    provider: string;
  };
  payment_link: string;
  customer_comment: string;
}

export class IntaSendPaymentService {
  private collection: any;

  constructor() {
    this.collection = intasend.collection();
  }

  /**
   * Initiate M-Pesa STK Push payment
   */
  async initiateMpesaPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await this.collection.mpesaStkPush({
        phone_number: paymentData.phone_number,
        email: paymentData.email,
        amount: paymentData.amount,
        narrative: `HomeworkHelper - ${paymentData.api_ref || 'Payment'}`,
        api_ref: paymentData.api_ref || `HH-${Date.now()}`,
      });

      return response;
    } catch (error) {
      console.error('M-Pesa payment failed:', error);
      throw new Error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initiate Airtel Money payment
   */
  async initiateAirtelPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await this.collection.airtelMoney({
        phone_number: paymentData.phone_number,
        email: paymentData.email,
        amount: paymentData.amount,
        narrative: `HomeworkHelper - ${paymentData.api_ref || 'Payment'}`,
        api_ref: paymentData.api_ref || `HH-${Date.now()}`,
      });

      return response;
    } catch (error) {
      console.error('Airtel Money payment failed:', error);
      throw new Error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initiate card payment
   */
  async initiateCardPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await this.collection.checkout({
        email: paymentData.email,
        amount: paymentData.amount,
        currency: paymentData.currency,
        first_name: paymentData.first_name,
        last_name: paymentData.last_name,
        redirect_url: paymentData.redirect_url || `${window.location.origin}/payment/success`,
        api_ref: paymentData.api_ref || `HH-${Date.now()}`,
      });

      return response;
    } catch (error) {
      console.error('Card payment failed:', error);
      throw new Error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(invoiceId: string): Promise<any> {
    try {
      const response = await this.collection.status(invoiceId);
      return response;
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
      const response = await this.collection.details(invoiceId);
      return response;
    } catch (error) {
      console.error('Get payment details failed:', error);
      throw new Error(`Get details failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const paymentService = new IntaSendPaymentService();
