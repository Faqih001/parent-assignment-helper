// Environment variables configuration and validation

interface EnvironmentVariables {
  // IntaSend Configuration
  VITE_INTASEND_PUBLISHABLE_KEY: string;
  INTASEND_SECRET_KEY: string;
  VITE_INTASEND_TEST_MODE: string;
  
  // Google Gemini Configuration
  VITE_GOOGLE_GEMINI_API_KEY: string;
}

class Environment {
  private vars: Partial<EnvironmentVariables>;

  constructor() {
    this.vars = {
      VITE_INTASEND_PUBLISHABLE_KEY: import.meta.env.VITE_INTASEND_PUBLISHABLE_KEY,
      INTASEND_SECRET_KEY: import.meta.env.INTASEND_SECRET_KEY,
      VITE_INTASEND_TEST_MODE: import.meta.env.VITE_INTASEND_TEST_MODE,
      VITE_GOOGLE_GEMINI_API_KEY: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY,
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

  /**
   * Validate that all required environment variables are set
   */
  validate(): { isValid: boolean; missing: string[] } {
    const required: (keyof EnvironmentVariables)[] = [
      'VITE_INTASEND_PUBLISHABLE_KEY',
      'VITE_GOOGLE_GEMINI_API_KEY'
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
