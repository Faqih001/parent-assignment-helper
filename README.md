# HomeworkHelper - AI-Powered Homework Assistant

## Project Overview

HomeworkHelper is an AI-powered educational platform that helps Kenyan students with their homework by providing step-by-step explanations and learning guidance. Built with modern web technologies and integrated with Google Gemini AI.

## Features

- 🤖 **AI-Powered Assistance**: Google Gemini integration for intelligent homework help
- 📚 **Multi-Subject Support**: Covers various subjects and grade levels
- 📸 **Image Analysis**: Upload homework photos for instant analysis
- 💰 **Flexible Pricing**: Free tier, family plans, and pay-per-use options
- 🔄 **Renewable Questions**: Daily question renewals for all plans
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🔐 **Secure Authentication**: User accounts and progress tracking
- 💳 **Payment Integration**: M-Pesa, Airtel Money, and credit card support

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Google Gemini API key
- IntaSend API keys (for payments)

### Installation

1. **Clone the repository**
```sh
git clone https://github.com/Faqih001/parent-assignment-helper.git
cd parent-assignment-helper
```

2. **Install dependencies**
```sh
npm install
```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your API keys and configuration

4. **Start the development server**
```sh
npm run dev
```

5. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Start using HomeworkHelper!

## Tech Stack

This project is built with:

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (Database & Authentication)
- **AI Integration**: Google Gemini API
- **Payment Processing**: IntaSend (M-Pesa, Airtel Money, Cards)
- **Email Service**: Resend
- **Deployment**: Vercel/Netlify compatible

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── auth/           # Authentication components
│   └── ...             # Feature components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and API clients
└── assets/             # Static assets

public/                 # Public assets
supabase/              # Database schema and functions
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini API
VITE_GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# IntaSend Payment Gateway
VITE_INTASEND_PUBLISHABLE_KEY=your_intasend_public_key
INTASEND_SECRET_KEY=your_intasend_secret_key
VITE_INTASEND_TEST_MODE=true

# Contact Information
VITE_SUPPORT_EMAIL=your_support_email
VITE_SUPPORT_PHONE=your_phone_number
VITE_WHATSAPP_NUMBER=your_whatsapp_number

# Email Service
VITE_RESEND_API_KEY=your_resend_api_key
```

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### Manual Deployment

```sh
# Build the project
npm run build

# Preview the build locally
npm run preview
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email fakiiahmad001@gmail.com or join our WhatsApp support at +254 741 140 250.
