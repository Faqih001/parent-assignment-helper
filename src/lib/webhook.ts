/**
 * IntaSend Webhook Handler
 * 
 * This module handles incoming webhook notifications from IntaSend
 * for payment status updates and processes them accordingly.
 */

import { paymentService } from './intasend';
import { emailService } from './resend';
import { dbHelpers } from './supabase';

export interface IntaSendWebhookPayload {
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
    failed_reason?: string;
    failed_code?: string;
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
    zipcode?: string;
    provider: string;
  };
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

export class WebhookHandler {
  /**
   * Process IntaSend webhook
   */
  static async processPaymentWebhook(payload: IntaSendWebhookPayload): Promise<void> {
    try {
      console.log('Processing IntaSend webhook:', payload);

      const { invoice, customer } = payload;
      
      // Extract plan information from API reference
      const planInfo = this.extractPlanFromApiRef(invoice.api_ref);
      
      switch (invoice.state) {
        case 'COMPLETE':
          await this.handleSuccessfulPayment(invoice, customer, planInfo);
          break;
          
        case 'FAILED':
          await this.handleFailedPayment(invoice, customer, planInfo);
          break;
          
        case 'PENDING':
          await this.handlePendingPayment(invoice, customer, planInfo);
          break;
          
        default:
          console.warn('Unknown payment state:', invoice.state);
      }
      
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment
   */
  private static async handleSuccessfulPayment(
    invoice: IntaSendWebhookPayload['invoice'],
    customer: IntaSendWebhookPayload['customer'],
    planInfo: { planId: string; planName: string; amount: number }
  ): Promise<void> {
    try {
      // Find user by email or phone
      const user = customer ? await this.findUserByContact(customer.email, customer.phone_number) : null;
      
      if (user) {
        // Update user plan in database
        await dbHelpers.updateUserPlan(user.id, planInfo.planId);
        
        // Log subscription change
        await dbHelpers.logSubscriptionChange(
          user.id,
          user.plan || 'free',
          planInfo.planId,
          'upgrade',
          invoice.id
        );
        
        // Log activity
        await dbHelpers.logUserActivity(user.id, 'payment_successful', {
          invoice_id: invoice.id,
          amount: invoice.net_amount,
          plan: planInfo.planId,
          provider: invoice.provider
        });
        
        // Send payment confirmation email
        if (customer?.email) {
          await emailService.sendPaymentConfirmation(
            customer.email,
            planInfo.planName,
            invoice.net_amount,
            invoice.id
          );
        }
        
        console.log(`Payment successful for user ${user.id}, upgraded to ${planInfo.planId}`);
      } else {
        console.warn('User not found for payment:', customer?.email, customer?.phone_number);
        
        // Still send confirmation email if customer email exists
        if (customer?.email) {
          await emailService.sendPaymentConfirmation(
            customer.email,
            planInfo.planName,
            invoice.net_amount,
            invoice.id
          );
        }
      }
      
    } catch (error) {
      console.error('Error handling successful payment:', error);
      throw error;
    }
  }

  /**
   * Handle failed payment
   */
  private static async handleFailedPayment(
    invoice: IntaSendWebhookPayload['invoice'],
    customer: IntaSendWebhookPayload['customer'],
    planInfo: { planId: string; planName: string; amount: number }
  ): Promise<void> {
    try {
      const user = customer ? await this.findUserByContact(customer.email, customer.phone_number) : null;
      
      if (user) {
        // Log failed payment
        await dbHelpers.logUserActivity(user.id, 'payment_failed', {
          invoice_id: invoice.id,
          amount: invoice.net_amount,
          plan: planInfo.planId,
          provider: invoice.provider,
          failed_reason: invoice.failed_reason,
          failed_code: invoice.failed_code
        });
        
        console.log(`Payment failed for user ${user.id}:`, invoice.failed_reason);
      }
      
      // TODO: Send payment failed notification email
      console.log('Payment failed:', invoice.failed_reason);
      
    } catch (error) {
      console.error('Error handling failed payment:', error);
      throw error;
    }
  }

  /**
   * Handle pending payment
   */
  private static async handlePendingPayment(
    invoice: IntaSendWebhookPayload['invoice'],
    customer: IntaSendWebhookPayload['customer'],
    planInfo: { planId: string; planName: string; amount: number }
  ): Promise<void> {
    try {
      const user = customer ? await this.findUserByContact(customer.email, customer.phone_number) : null;
      
      if (user) {
        // Log pending payment
        await dbHelpers.logUserActivity(user.id, 'payment_pending', {
          invoice_id: invoice.id,
          amount: invoice.net_amount,
          plan: planInfo.planId,
          provider: invoice.provider
        });
        
        console.log(`Payment pending for user ${user.id}`);
      }
      
    } catch (error) {
      console.error('Error handling pending payment:', error);
      throw error;
    }
  }

  /**
   * Find user by email or phone number
   */
  private static async findUserByContact(email?: string, phone?: string): Promise<any> {
    try {
      // This would typically be a database query
      // For now, we'll return null since we don't have user lookup by email/phone implemented
      console.log('Looking up user by:', { email, phone });
      return null;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  /**
   * Extract plan information from API reference
   */
  private static extractPlanFromApiRef(apiRef: string): { planId: string; planName: string; amount: number } {
    // API ref format: HH-Family-Plan-1234567890
    const parts = apiRef.split('-');
    
    if (parts.length >= 3 && parts[0] === 'HH') {
      const planPart = parts.slice(1, -1).join('-'); // Remove HH and timestamp
      
      // Map plan names to plan IDs and amounts
      const planMap: Record<string, { id: string; name: string; amount: number }> = {
        'Family-Plan': { id: 'family', name: 'Family Plan', amount: 999 },
        'Premium': { id: 'premium', name: 'Premium Plan', amount: 1999 },
        'Enterprise': { id: 'enterprise', name: 'Enterprise Plan', amount: 0 },
      };
      
      const plan = planMap[planPart];
      if (plan) {
        return {
          planId: plan.id,
          planName: plan.name,
          amount: plan.amount
        };
      }
    }
    
    // Default fallback
    return {
      planId: 'family',
      planName: 'Family Plan',
      amount: 999
    };
  }

  /**
   * Validate webhook signature (basic implementation)
   */
  static validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      // In production, implement proper signature validation
      // This would typically use HMAC-SHA256 with the webhook secret
      return true; // For now, always return true
    } catch (error) {
      console.error('Webhook signature validation error:', error);
      return false;
    }
  }

  /**
   * Handle webhook endpoint (for Express.js or similar)
   */
  static async handleWebhookEndpoint(req: any, res: any): Promise<void> {
    try {
      const signature = req.headers['x-intasend-signature'];
      const payload = JSON.stringify(req.body);
      
      // Validate signature (implement proper validation in production)
      if (!this.validateWebhookSignature(payload, signature, 'webhook-secret')) {
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }
      
      // Process the webhook
      await this.processPaymentWebhook(req.body);
      
      // Respond with success
      res.status(200).json({ success: true });
      
    } catch (error) {
      console.error('Webhook endpoint error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default WebhookHandler;
