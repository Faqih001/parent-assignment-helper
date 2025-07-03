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

  /**
   * Validate that all required environment variables are set
   */
  validate(): { isValid: boolean; missing: string[] } {
    const required: (keyof EnvironmentVariables)[] = [
      'VITE_INTASEND_PUBLISHABLE_KEY',
      'VITE_GOOGLE_GEMINI_API_KEY',
      'VITE_SUPPORT_EMAIL',
      'VITE_WHATSAPP_NUMBER'
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
