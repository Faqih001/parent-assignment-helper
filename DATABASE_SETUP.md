# Parent Assignment Helper - Setup Instructions

## Database Setup (Supabase)

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready

2. **Run the Database Schema**
   - In your Supabase dashboard, go to the SQL Editor
   - Copy and paste the contents of `supabase_schema.sql`
   - Run the script to create all tables, functions, and policies

3. **Update Environment Variables**
   - Copy your project URL and anon key from Supabase settings
   - Update your `.env` file with the correct values:

   ```bash
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## Environment Variables Setup

Make sure your `.env` file contains all required variables:

```env
# IntaSend Payment Configuration
VITE_INTASEND_PUBLISHABLE_KEY=your_intasend_key
INTASEND_SECRET_KEY=your_intasend_secret
VITE_INTASEND_TEST_MODE=true

# Google Gemini AI Configuration
VITE_GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Resend Configuration
VITE_RESEND_API_KEY=your_resend_key
RESEND_API_KEY=your_resend_key
VITE_SUPPORT_EMAIL=your_support_email
VITE_SUPPORT_PHONE=your_phone_number

# WhatsApp Configuration
VITE_WHATSAPP_NUMBER=your_whatsapp_number

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features Implemented

### Authentication

- ✅ Real Supabase authentication
- ✅ User registration and login
- ✅ Automatic user profile creation
- ✅ Session management
- ✅ Protected routes

### Database

- ✅ User profiles with plan management
- ✅ Contact forms storage
- ✅ Chat messages history
- ✅ Payment tracking
- ✅ Question limits by plan

### Chat System

- ✅ Real-time homework assistance (for logged-in users)
- ✅ Image upload and analysis
- ✅ Chat history persistence
- ✅ Question limits enforcement
- ✅ Plan-based restrictions

### Website Chatbot

- ✅ Limited to website information only
- ✅ No homework assistance in floating chatbot
- ✅ Guides users to sign up for real homework help

### Contact System

- ✅ Contact forms saved to database
- ✅ Email notifications (optional)
- ✅ Admin can track contact status

### Responsive Design

- ✅ Mobile-friendly chat interface
- ✅ Responsive authentication modals
- ✅ Adaptive layouts for all screen sizes

## Plan Types and Limits

- **Free Plan**: 5 questions
- **Family Plan**: 100 questions/month ($9.99)
- **Premium Plan**: 500 questions/month ($19.99)

## Running the Application

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. The application will be available at `http://localhost:5173`

## Payment Integration

The app is set up to integrate with IntaSend for payments. When a payment is successful, the user's plan will be updated automatically.

## Database Tables Created

1. **user_profiles** - User information and plan details
2. **contact_forms** - Contact form submissions
3. **payments** - Payment tracking
4. **chat_sessions** - Chat session management
5. **chat_messages** - Individual chat messages

## Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Contact forms allow public inserts only
- Secure authentication with Supabase Auth

## Additional Notes

- The floating chatbot is limited to website information only
- Real homework assistance is available in the `/chat` page after login
- All chat messages are saved to the database
- Contact forms are automatically saved to the database
- User question limits are enforced in real-time
