// Environment variables configuration and validation

interface EnvironmentVariables {
  // IntaSend Configuration
  VITE_INTASEND_PUBLISHABLE_KEY: string;
  INTASEND_SECRET_KEY: string;
  VITE_INTASEND_TEST_MODE: string;
  
  // Google Gemini Configuration
  VITE_GOOGLE_GEMINI_API_KEY: string;
  
  // Resend Configuration
  VITE_RESEND_API_KEY: string;
  RESEND_API_KEY: string;
  VITE_SUPPORT_EMAIL: string;
  VITE_SUPPORT_PHONE: string;
  
  // WhatsApp Configuration
  VITE_WHATSAPP_NUMBER: string;
  
  // Supabase Configuration
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  
  // Application Configuration
  VITE_APP_URL: string;
}

class Environment {
  private vars: Partial<EnvironmentVariables>;

  constructor() {
    this.vars = {
      VITE_INTASEND_PUBLISHABLE_KEY: import.meta.env.VITE_INTASEND_PUBLISHABLE_KEY,
      INTASEND_SECRET_KEY: import.meta.env.INTASEND_SECRET_KEY,
      VITE_INTASEND_TEST_MODE: import.meta.env.VITE_INTASEND_TEST_MODE,
      VITE_GOOGLE_GEMINI_API_KEY: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY,
      VITE_RESEND_API_KEY: import.meta.env.VITE_RESEND_API_KEY,
      RESEND_API_KEY: import.meta.env.RESEND_API_KEY,
      VITE_SUPPORT_EMAIL: import.meta.env.VITE_SUPPORT_EMAIL,
      VITE_SUPPORT_PHONE: import.meta.env.VITE_SUPPORT_PHONE,
      VITE_WHATSAPP_NUMBER: import.meta.env.VITE_WHATSAPP_NUMBER,
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_APP_URL: import.meta.env.VITE_APP_URL,
    };
  }

  get intasendPublicKey(): string {
    return this.vars.VITE_INTASEND_PUBLISHABLE_KEY || '';
  }

  get intasendSecretKey(): string {
    return this.vars.INTASEND_SECRET_KEY || '';
  }

  get intasendTestMode(): boolean {
    return this.vars.VITE_INTASEND_TEST_MODE === 'true';
  }

  get geminiApiKey(): string {
    return this.vars.VITE_GOOGLE_GEMINI_API_KEY || '';
  }

  get resendApiKey(): string {
    // Prefer client-side accessible key for demo purposes
    return this.vars.VITE_RESEND_API_KEY || this.vars.RESEND_API_KEY || '';
  }

  get supportEmail(): string {
    return this.vars.VITE_SUPPORT_EMAIL || '';
  }

  get supportPhone(): string {
    return this.vars.VITE_SUPPORT_PHONE || '';
  }

  get whatsappNumber(): string {
    return this.vars.VITE_WHATSAPP_NUMBER || '';
  }

  get supabaseUrl(): string {
    return this.vars.VITE_SUPABASE_URL || '';
  }

  get supabaseAnonKey(): string {
    return this.vars.VITE_SUPABASE_ANON_KEY || '';
  }

  get appUrl(): string {
    return this.vars.VITE_APP_URL || 'https://parent-assignment-helper.vercel.app';
  }

  /**
   * Validate that all required environment variables are set
   */
  validate(): { isValid: boolean; missing: string[] } {
    const required: (keyof EnvironmentVariables)[] = [
      'VITE_INTASEND_PUBLISHABLE_KEY',
      'VITE_GOOGLE_GEMINI_API_KEY',
      'VITE_SUPPORT_EMAIL',
      'VITE_WHATSAPP_NUMBER',
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    const missing = required.filter(key => !this.vars[key]);

    return {
      isValid: missing.length === 0,
      missing
    };
  }

  /**
   * Get all environment variables (for debugging)
   */
  getAll(): Record<string, string> {
    return {
      VITE_INTASEND_PUBLISHABLE_KEY: this.intasendPublicKey ? '***' + this.intasendPublicKey.slice(-4) : 'NOT_SET',
      INTASEND_SECRET_KEY: this.intasendSecretKey ? '***' + this.intasendSecretKey.slice(-4) : 'NOT_SET',
      VITE_INTASEND_TEST_MODE: this.vars.VITE_INTASEND_TEST_MODE || 'NOT_SET',
      VITE_GOOGLE_GEMINI_API_KEY: this.geminiApiKey ? '***' + this.geminiApiKey.slice(-4) : 'NOT_SET',
      VITE_RESEND_API_KEY: this.resendApiKey ? '***' + this.resendApiKey.slice(-4) : 'NOT_SET',
      RESEND_API_KEY: this.vars.RESEND_API_KEY ? '***' + this.vars.RESEND_API_KEY.slice(-4) : 'NOT_SET',
      VITE_SUPPORT_EMAIL: this.supportEmail || 'NOT_SET',
      VITE_SUPPORT_PHONE: this.supportPhone || 'NOT_SET',
      VITE_WHATSAPP_NUMBER: this.whatsappNumber || 'NOT_SET',
      VITE_SUPABASE_URL: this.supabaseUrl || 'NOT_SET',
      VITE_SUPABASE_ANON_KEY: this.supabaseAnonKey ? '***' + this.supabaseAnonKey.slice(-4) : 'NOT_SET',
      VITE_APP_URL: this.appUrl || 'NOT_SET',
    };
  }
}

export const env = new Environment();

// Validate environment variables on import
const validation = env.validate();
if (!validation.isValid) {
  console.warn('Missing environment variables:', validation.missing);
  console.warn('Current environment variables:', env.getAll());
}

export default env;
