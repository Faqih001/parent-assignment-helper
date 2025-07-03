# HomeworkHelper - AI-Powered Homework Assistant

## New Features Implemented

### 🔄 IntaSend Payment Integration
- Complete payment system supporting M-Pesa, Airtel Money, and Credit/Debit Cards
- Real-time payment verification and status checking
- Secure payment modal with form validation
- Payment success page with transaction details
- Test mode support for development

### 🤖 Google Gemini AI Integration
- Advanced AI homework assistance powered by Google Gemini 2.5 Flash
- Image analysis for homework questions
- Subject and grade-specific explanations
- Real-time chat interface
- Kenyan curriculum (CBC) alignment

### 📱 Enhanced User Experience
- Subject and grade selection for personalized responses
- Image upload for homework questions
- Real-time typing indicators
- Free question limits with subscription prompts
- Responsive design for all devices

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# IntaSend Payment Configuration
VITE_INTASEND_PUBLISHABLE_KEY=ISPubKey_test_5afdffbb-18ee-4df2-b997-5e630557bca4
INTASEND_SECRET_KEY=ISSecretKey_test_ffbc65bd-d597-4902-9d7e-a3e04c95a73b
VITE_INTASEND_TEST_MODE=true

# Google Gemini AI Configuration
VITE_GOOGLE_GEMINI_API_KEY=AIzaSyDnbWdDvKxrN4M2GIP9yMFmub9xJPQVMj4
```

## New Dependencies

The following packages have been added:

```json
{
  "intasend-node": "^1.1.2",
  "@google/genai": "^1.8.0"
}
```

## Features Overview

### Payment System
- **Multiple Payment Methods**: M-Pesa, Airtel Money, Credit/Debit Cards
- **Secure Processing**: All payments processed through IntaSend
- **Real-time Verification**: Automatic payment status checking
- **User-friendly Interface**: Clean, responsive payment modal
- **Error Handling**: Comprehensive error messages and retry options

### AI Homework Assistant
- **Text Questions**: Type homework questions for instant help
- **Image Analysis**: Upload photos of homework for AI analysis
- **Personalized Responses**: Subject and grade-specific explanations
- **Kenyan Curriculum**: Aligned with CBC and local educational standards
- **Step-by-step Solutions**: Clear, educational explanations

### Pricing Plans
- **Pay-Per-Use**: KES 10 per question
- **Family Plan**: KES 999 per month (unlimited questions)
- **School Partnership**: Custom pricing for institutions

## Usage

### Setting up the Payment System

1. **Environment Configuration**: Ensure all environment variables are properly set
2. **Test Mode**: The system is configured for test mode by default
3. **Payment Flow**: Users select a plan → Fill payment details → Complete payment → Access features

### Using the AI Assistant

1. **Initialize Chat**: The AI automatically initializes when the chat page loads
2. **Ask Questions**: Type questions or upload images
3. **Select Context**: Choose subject and grade for better responses
4. **Get Explanations**: Receive detailed, step-by-step explanations

### Payment Methods Supported

#### M-Pesa
- Enter Safaricom phone number
- Receive STK push prompt
- Complete payment on phone

#### Airtel Money
- Enter Airtel phone number
- Receive payment prompt
- Complete payment on phone

#### Credit/Debit Cards
- Redirected to secure IntaSend checkout
- Support for Visa, Mastercard, and local cards
- 3D Secure authentication supported

## API Integration Details

### IntaSend API
- **Collection API**: For M-Pesa and Airtel Money payments
- **Checkout API**: For card payments
- **Status API**: For payment verification
- **Webhook Support**: Ready for production webhook integration

### Google Gemini API
- **Gemini 2.5 Flash**: For fast, efficient responses
- **Gemini 2.5 Pro**: For complex explanations and concept teaching
- **Vision API**: For image analysis and homework photo processing
- **Chat API**: For maintaining conversation context

## Security Features

- Environment variables properly configured
- API keys secured and masked in logs
- Payment data never stored locally
- Secure HTTPS communication
- Input validation and sanitization

## Error Handling

### Payment Errors
- Network connectivity issues
- Invalid payment details
- Payment failures
- Timeout handling

### AI Service Errors
- API rate limiting
- Network errors
- Invalid image formats
- Service unavailability

## Testing

### Payment Testing
- Use test credentials provided
- Test all payment methods
- Verify payment status checking
- Test error scenarios

### AI Testing
- Test various subjects and grades
- Upload different image formats
- Test with and without context
- Verify response quality

## Production Deployment

### Environment Variables
1. Update IntaSend keys to production keys
2. Set `VITE_INTASEND_TEST_MODE=false`
3. Update Google Gemini API key if needed
4. Configure webhook URLs for payment notifications

### Additional Configuration
- Set up proper domain for payment redirects
- Configure email notifications
- Set up monitoring and logging
- Implement rate limiting

## Support and Documentation

- **IntaSend Documentation**: https://developers.intasend.com/reference/
- **Google Gemini Documentation**: https://ai.google.dev/docs
- **Payment Support**: Contact IntaSend support for payment-related issues
- **AI Support**: Contact Google AI support for API-related issues

## Features to Implement Next

1. **User Authentication**: Login/register system
2. **Subscription Management**: User dashboard for managing subscriptions
3. **Payment History**: Transaction history and receipts
4. **Advanced AI Features**: Practice question generation, study tips
5. **Webhook Integration**: Real-time payment notifications
6. **Admin Dashboard**: For managing users and payments
7. **Analytics**: Usage tracking and reporting
