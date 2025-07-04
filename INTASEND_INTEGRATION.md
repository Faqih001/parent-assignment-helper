# IntaSend Payment Integration Guide

This guide explains how to set up and use the IntaSend payment integration for MPesa STK Push, Airtel Money, and Card payments in the HomeworkHelper application.

## Table of Contents
1. [Setup](#setup)
2. [Configuration](#configuration)
3. [Payment Methods](#payment-methods)
4. [Testing](#testing)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

## Setup

### 1. IntaSend Account Setup
1. Visit [IntaSend](https://intasend.com/) and create an account
2. Complete the verification process
3. Navigate to Dashboard → API Keys
4. Copy your Publishable Key and Secret Key

### 2. Environment Configuration
1. Copy `.env.example` to `.env`
2. Fill in your IntaSend credentials:
```bash
VITE_INTASEND_PUBLISHABLE_KEY=your_publishable_key_here
INTASEND_SECRET_KEY=your_secret_key_here
VITE_INTASEND_TEST_MODE=true  # Set to false for production
```

### 3. Dependencies
The following packages are already installed:
- `intasend-node`: Official IntaSend SDK (not used in current implementation)
- Custom fetch-based implementation for better control

## Configuration

### API Endpoints
- **Sandbox**: `https://sandbox.intasend.com`
- **Production**: `https://payment.intasend.com`

### Payment Methods Supported
1. **MPesa STK Push**: Direct mobile money payments
2. **Airtel Money**: Airtel mobile money payments  
3. **Card Payments**: Credit/Debit card payments via checkout

## Payment Methods

### 1. MPesa STK Push
```typescript
const paymentData = {
  amount: 999,
  phone_number: "254712345678", // Format: 254XXXXXXXXX
  api_ref: "HH-Family-Plan-1234567890",
  narrative: "HomeworkHelper - Family Plan"
};

const response = await paymentService.initiateMpesaPayment(paymentData);
```

**Features:**
- Instant payment prompts on customer's phone
- Real-time status updates
- Automatic receipt generation

### 2. Airtel Money
```typescript
const paymentData = {
  amount: 999,
  phone_number: "254712345678",
  api_ref: "HH-Family-Plan-1234567890",
  narrative: "HomeworkHelper - Family Plan"
};

const response = await paymentService.initiateAirtelPayment(paymentData);
```

### 3. Card Payments
```typescript
const paymentData = {
  amount: 999,
  currency: "KES",
  email: "customer@example.com",
  first_name: "John",
  last_name: "Doe",
  api_ref: "HH-Family-Plan-1234567890",
  redirect_url: "https://yourdomain.com/payment/success"
};

const response = await paymentService.initiateCardPayment(paymentData);
```

## Phone Number Formatting

The system automatically formats Kenyan phone numbers:

| Input Format | Converted To |
|-------------|-------------|
| 0712345678 | 254712345678 |
| +254712345678 | 254712345678 |
| 254712345678 | 254712345678 |
| 712345678 | 254712345678 |

**Supported Networks:**
- Safaricom (07xx xxx xxx)
- Airtel (01xx xxx xxx)

## Payment Flow

### 1. User Initiates Payment
1. User selects a plan on the billing page
2. PaymentModal opens with payment method selection
3. User enters required information
4. Payment is initiated via IntaSend API

### 2. Payment Processing
1. **MPesa/Airtel**: User receives mobile prompt
2. **Card**: User redirected to secure checkout page
3. Payment status is tracked in real-time

### 3. Payment Completion
1. Webhook receives payment status update
2. User subscription is updated in database
3. Confirmation email is sent
4. User gains access to premium features

## Testing

### Test Phone Numbers (Sandbox Mode)
- **MPesa**: Use any valid format (254712345678)
- **Airtel**: Use any valid format (254712345678)

### Test Cards (Sandbox Mode)
- **Visa**: 4111 1111 1111 1111
- **Mastercard**: 5555 5555 5555 4444
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test Amounts
- **Success**: 10, 100, 1000 KES
- **Failure**: 11, 101, 1001 KES (will fail for testing)

## Payment Status Checking

```typescript
// Check payment status
const status = await paymentService.checkPaymentStatus(invoiceId);

// Possible states
switch (status.invoice.state) {
  case 'PENDING':
    // Payment initiated, waiting for completion
    break;
  case 'COMPLETE':
    // Payment successful
    break;
  case 'FAILED':
    // Payment failed
    break;
}
```

## Webhook Integration

### Setup Webhook URL
1. In IntaSend Dashboard → Settings → Webhooks
2. Add your webhook URL: `https://yourdomain.com/api/webhooks/intasend`
3. Select payment events to receive

### Webhook Handler
```typescript
import WebhookHandler from '@/lib/webhook';

// Express.js example
app.post('/api/webhooks/intasend', async (req, res) => {
  await WebhookHandler.handleWebhookEndpoint(req, res);
});
```

## Production Deployment

### 1. Environment Variables
```bash
VITE_INTASEND_TEST_MODE=false
INTASEND_WEBHOOK_SECRET=your_production_webhook_secret
```

### 2. Domain Verification
1. Add your production domain to IntaSend dashboard
2. Update redirect URLs in payment requests
3. Configure webhook URLs for production

### 3. SSL Certificate
Ensure your webhook endpoint has a valid SSL certificate.

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid phone number | Wrong format | Use 254XXXXXXXXX format |
| Payment failed | Insufficient funds | Ask user to check balance |
| Network timeout | Poor connection | Retry payment |
| Invalid API key | Wrong credentials | Check environment variables |

### Error Response Format
```json
{
  "error": "Payment failed",
  "detail": "Insufficient funds in account",
  "code": "INSUFFICIENT_FUNDS"
}
```

## Security Considerations

1. **API Keys**: Keep secret keys server-side only
2. **Webhook Validation**: Verify webhook signatures
3. **HTTPS**: Use SSL for all payment endpoints
4. **Data Validation**: Validate all payment data
5. **Logging**: Log all payment attempts for audit

## Support and Documentation

- **IntaSend Docs**: https://developers.intasend.com/
- **API Reference**: https://developers.intasend.com/reference/
- **Support**: support@intasend.com
- **Status Page**: https://status.intasend.com/

## Integration Checklist

- [ ] IntaSend account created and verified
- [ ] API keys configured in environment
- [ ] Test payments working in sandbox
- [ ] Webhook endpoint configured
- [ ] Payment confirmation emails working
- [ ] User subscription updates working
- [ ] Error handling implemented
- [ ] Production deployment configured
- [ ] SSL certificate installed
- [ ] Webhook signatures validated

## Troubleshooting

### Payment Not Processing
1. Check API keys in environment variables
2. Verify phone number format
3. Check IntaSend dashboard for errors
4. Review network connectivity

### Webhook Not Receiving
1. Verify webhook URL is accessible
2. Check SSL certificate
3. Review IntaSend webhook settings
4. Check server logs for errors

### User Plan Not Updating
1. Check database connection
2. Verify webhook processing logic
3. Review user lookup functionality
4. Check Supabase table structure

For additional support, contact the development team or refer to the IntaSend documentation.
