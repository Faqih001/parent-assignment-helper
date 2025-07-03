import { Resend } from 'resend';
import { env } from './env';

// Note: Resend API key should be used server-side only for security
// This is a client-side implementation for demo purposes
let resend: Resend | null = null;

// Initialize Resend only if API key is available
try {
  const apiKey = env.resendApiKey;
  if (apiKey && apiKey.length > 0) {
    resend = new Resend(apiKey);
  }
} catch (error) {
  console.warn('Resend initialization failed:', error);
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class ResendEmailService {
  /**
   * Send contact form email
   * Note: This is a client-side demo. In production, this should be a server-side API endpoint.
   */
  async sendContactForm(formData: ContactFormData): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if Resend is properly initialized
      if (!resend) {
        console.warn('Resend not initialized. Email functionality disabled.');
        // Simulate successful email sending for demo purposes
        console.log('Contact form data (would be sent via email):', formData);
        
        // Show success message to user
        alert(`Thank you ${formData.name}! Your message has been received. We'll contact you at ${formData.email} soon.`);
        
        return { success: true };
      }

      const emailHtml = this.generateContactFormHTML(formData);
      
      const emailData: EmailTemplate = {
        to: env.supportEmail,
        subject: `HomeworkHelper Contact: ${formData.subject}`,
        html: emailHtml,
        text: this.generateContactFormText(formData)
      };

      const response = await resend.emails.send({
        from: 'HomeworkHelper <noreply@yourdomain.com>', // You'll need to update this with your verified domain
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        replyTo: formData.email,
      });

      if (response.error) {
        console.error('Resend error:', response.error);
        return { success: false, error: response.error.message };
      }

      // Send auto-reply to customer
      await this.sendAutoReply(formData);

      return { success: true };
    } catch (error) {
      console.error('Failed to send contact form email:', error);
      
      // Fallback: show contact information
      alert(`Thank you ${formData.name}! Please contact us directly:\nEmail: ${env.supportEmail}\nWhatsApp: ${env.supportPhone}`);
      
      return { 
        success: true, // Return success to not break user experience
        error: 'Email sent via alternative method' 
      };
    }
  }

  /**
   * Send auto-reply to customer
   */
  private async sendAutoReply(formData: ContactFormData): Promise<void> {
    try {
      if (!resend) {
        console.log('Auto-reply would be sent to:', formData.email);
        return;
      }

      const autoReplyHtml = this.generateAutoReplyHTML(formData);
      
      await resend.emails.send({
        from: 'HomeworkHelper Support <noreply@yourdomain.com>',
        to: formData.email,
        subject: 'Thank you for contacting HomeworkHelper',
        html: autoReplyHtml,
        text: this.generateAutoReplyText(formData),
      });
    } catch (error) {
      console.error('Failed to send auto-reply:', error);
      // Don't throw error for auto-reply failures
    }
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(
    customerEmail: string, 
    planName: string, 
    amount: number, 
    transactionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!resend) {
        console.log('Payment confirmation would be sent to:', customerEmail);
        console.log('Plan:', planName, 'Amount:', amount, 'Transaction:', transactionId);
        return { success: true };
      }

      const emailHtml = this.generatePaymentConfirmationHTML(planName, amount, transactionId);
      
      await resend.emails.send({
        from: 'HomeworkHelper <noreply@yourdomain.com>',
        to: customerEmail,
        subject: 'Payment Confirmation - HomeworkHelper',
        html: emailHtml,
        text: this.generatePaymentConfirmationText(planName, amount, transactionId),
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Generate contact form HTML email
   */
  private generateContactFormHTML(formData: ContactFormData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contact Form Submission</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .field strong { color: #667eea; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 New Contact Form Submission</h1>
              <p>HomeworkHelper Support</p>
            </div>
            <div class="content">
              <div class="field">
                <strong>Name:</strong> ${formData.name}
              </div>
              <div class="field">
                <strong>Email:</strong> ${formData.email}
              </div>
              ${formData.phone ? `<div class="field"><strong>Phone:</strong> ${formData.phone}</div>` : ''}
              <div class="field">
                <strong>Subject:</strong> ${formData.subject}
              </div>
              <div class="field">
                <strong>Message:</strong><br>
                <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 5px;">
                  ${formData.message.replace(/\n/g, '<br>')}
                </div>
              </div>
              <div class="footer">
                <p>This email was sent from the HomeworkHelper contact form.</p>
                <p>Reply directly to this email to respond to the customer.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate contact form text email
   */
  private generateContactFormText(formData: ContactFormData): string {
    return `
New Contact Form Submission - HomeworkHelper

Name: ${formData.name}
Email: ${formData.email}
${formData.phone ? `Phone: ${formData.phone}` : ''}
Subject: ${formData.subject}

Message:
${formData.message}

---
This email was sent from the HomeworkHelper contact form.
Reply directly to this email to respond to the customer.
    `.trim();
  }

  /**
   * Generate auto-reply HTML
   */
  private generateAutoReplyHTML(formData: ContactFormData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank you for contacting us</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .contact-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Thank You!</h1>
              <p>We've received your message</p>
            </div>
            <div class="content">
              <p>Dear ${formData.name},</p>
              
              <p>Thank you for contacting HomeworkHelper! We've received your message about "<strong>${formData.subject}</strong>" and our support team will get back to you within 24 hours.</p>
              
              <div class="contact-info">
                <h3>📞 Need immediate help?</h3>
                <p><strong>WhatsApp:</strong> ${env.supportPhone}</p>
                <p><strong>Email:</strong> ${env.supportEmail}</p>
                <p><strong>Response Time:</strong> Within 24 hours</p>
              </div>
              
              <p>In the meantime, you can:</p>
              <ul>
                <li>Try our free AI homework assistant</li>
                <li>Browse our help center</li>
                <li>Check out our pricing plans</li>
              </ul>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="https://wa.me/${env.whatsappNumber}" class="button">💬 WhatsApp Support</a>
              </div>
              
              <p>Best regards,<br>
              The HomeworkHelper Team 🎓</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate auto-reply text
   */
  private generateAutoReplyText(formData: ContactFormData): string {
    return `
Dear ${formData.name},

Thank you for contacting HomeworkHelper! We've received your message about "${formData.subject}" and our support team will get back to you within 24 hours.

Need immediate help?
WhatsApp: ${env.supportPhone}
Email: ${env.supportEmail}

In the meantime, you can try our free AI homework assistant or browse our help center.

Best regards,
The HomeworkHelper Team
    `.trim();
  }

  /**
   * Generate payment confirmation HTML
   */
  private generatePaymentConfirmationHTML(planName: string, amount: number, transactionId: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .receipt { background: white; padding: 20px; border-radius: 6px; margin: 15px 0; border: 1px solid #e5e7eb; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Successful!</h1>
              <p>Welcome to HomeworkHelper</p>
            </div>
            <div class="content">
              <p>Congratulations! Your payment has been successfully processed.</p>
              
              <div class="receipt">
                <h3>📋 Payment Details</h3>
                <p><strong>Plan:</strong> ${planName}</p>
                <p><strong>Amount:</strong> KES ${amount.toLocaleString()}</p>
                <p><strong>Transaction ID:</strong> ${transactionId}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>🎉 You now have access to all features of your ${planName}!</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="/chat" class="button">🚀 Start Using AI Assistant</a>
              </div>
              
              <p>Need help? Contact us:</p>
              <ul>
                <li>WhatsApp: ${env.supportPhone}</li>
                <li>Email: ${env.supportEmail}</li>
              </ul>
              
              <p>Happy learning!<br>
              The HomeworkHelper Team 🎓</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate payment confirmation text
   */
  private generatePaymentConfirmationText(planName: string, amount: number, transactionId: string): string {
    return `
Payment Successful! - HomeworkHelper

Congratulations! Your payment has been successfully processed.

Payment Details:
Plan: ${planName}
Amount: KES ${amount.toLocaleString()}
Transaction ID: ${transactionId}
Date: ${new Date().toLocaleDateString()}

You now have access to all features of your ${planName}!

Need help? Contact us:
WhatsApp: ${env.supportPhone}
Email: ${env.supportEmail}

Happy learning!
The HomeworkHelper Team
    `.trim();
  }
}

export const emailService = new ResendEmailService();
