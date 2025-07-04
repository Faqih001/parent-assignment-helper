import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabaseUrl = env.supabaseUrl;
const supabaseAnonKey = env.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  plan: 'free' | 'family' | 'premium' | 'enterprise';
  questions_remaining: number;
  last_free_reset: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface ContactForm {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'pending' | 'resolved' | 'in_progress';
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  plan: 'family' | 'premium';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  type: 'user' | 'bot';
  content: string;
  image_url?: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  created_at: string;
  updated_at: string;
}

export interface BillingInfo {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  billing_name?: string;
  billing_email?: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postal_code?: string;
  billing_country?: string;
  tax_id?: string;
  company_name?: string;
  phone_number?: string;
  preferred_payment_method: 'card' | 'mobile_money' | 'bank_transfer';
  auto_renewal: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionHistory {
  id: string;
  user_id: string;
  from_plan?: string;
  to_plan: string;
  action_type: 'upgrade' | 'downgrade' | 'renewal' | 'cancellation';
  amount?: number;
  payment_id?: string;
  old_plan?: string;
  new_plan: string;
  change_reason?: string;
  effective_date: string;
  created_at: string;
}

export interface UsageAnalytics {
  id: string;
  user_id: string;
  action_type: string;
  metadata?: any;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface CustomPlan {
  id: string;
  name: string;
  price: number;
  questions_limit: number;
  period: string;
  description: string;
  features: string[];
  is_active: boolean;
  created_by: string; // admin user id
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// Types for the authentication
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: "free" | "family" | "premium" | "enterprise";
  questionsRemaining?: number;
  role?: "user" | "admin";
}

export interface AuthError {
  message: string;
  code?: string;
}

// Database helper functions
export const dbHelpers = {
  // User Profile operations
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  },

  async createUserProfile(profile: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profile])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    
    return data;
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    
    return data;
  },

  async deleteUserProfile(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('Error deleting user profile:', error);
      return false;
    }
    
    return true;
  },

  // Contact Form operations
  async saveContactForm(contact: Omit<ContactForm, 'id' | 'created_at'>): Promise<ContactForm | null> {
    const { data, error } = await supabase
      .from('contact_forms')
      .insert([contact])
      .select()
      .single();
    
    if (error) {
      console.error('Error saving contact form:', error);
      return null;
    }
    
    return data;
  },

  // Payment operations
  async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating payment:', error);
      return null;
    }
    
    return data;
  },

  async updatePayment(paymentId: string, updates: Partial<Payment>): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', paymentId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating payment:', error);
      return null;
    }
    
    return data;
  },

  // Chat operations
  async saveChatMessage(message: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage | null> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([message])
      .select()
      .single();
    
    if (error) {
      console.error('Error saving chat message:', error);
      return null;
    }
    
    return data;
  },

  async getChatMessages(userId: string, sessionId?: string): Promise<ChatMessage[]> {
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (sessionId) {
      // Add session filtering when sessions are implemented
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
    
    return data || [];
  },

  async decrementUserQuestions(userId: string): Promise<boolean> {
    const { error } = await supabase.rpc('decrement_questions', {
      user_id: userId
    });

    if (error) {
      console.error('Error decrementing questions:', error);
      return false;
    }

    return true;
  },

  async addUserCredits(userId: string, credits: number): Promise<boolean> {
    const { error } = await supabase.rpc('add_user_credits', {
      user_id: userId,
      credits_to_add: credits
    });

    if (error) {
      console.error('Error adding credits:', error);
      return false;
    }

    return true;
  },

  async checkAndResetFreeQuestions(userId: string): Promise<number> {
    const { data, error } = await supabase.rpc('check_and_reset_free_questions', {
      user_id: userId
    });

    if (error) {
      console.error('Error checking/resetting free questions:', error);
      return 0;
    }

    return data || 0;
  },

  // Custom Plans operations (Admin only)
  async createCustomPlan(plan: Omit<CustomPlan, 'id' | 'created_at' | 'updated_at'>): Promise<CustomPlan | null> {
    const { data, error } = await supabase
      .from('custom_plans')
      .insert([plan])
      .select()
      .single();

    if (error) {
      console.error('Error creating custom plan:', error);
      return null;
    }

    return data;
  },

  async updateCustomPlan(planId: string, updates: Partial<CustomPlan>): Promise<CustomPlan | null> {
    const { data, error } = await supabase
      .from('custom_plans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      console.error('Error updating custom plan:', error);
      return null;
    }

    return data;
  },

  async deleteCustomPlan(planId: string): Promise<boolean> {
    const { error } = await supabase
      .from('custom_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      console.error('Error deleting custom plan:', error);
      return false;
    }

    return true;
  },

  async getCustomPlans(): Promise<CustomPlan[]> {
    const { data, error } = await supabase
      .from('custom_plans')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching custom plans:', error);
      return [];
    }

    return data || [];
  },

  async getAllCustomPlans(): Promise<CustomPlan[]> {
    const { data, error } = await supabase
      .from('custom_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all custom plans:', error);
      return [];
    }

    return data || [];
  },

  // Admin user operations
  async getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data || [];
  },

  async updateUserPlan(userId: string, plan: string, questionsLimit?: number): Promise<boolean> {
    const updates: any = { 
      plan, 
      updated_at: new Date().toISOString() 
    };
    
    if (questionsLimit !== undefined) {
      updates.questions_remaining = questionsLimit;
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user plan:', error);
      return false;
    }

    return true;
  },

  async makeUserAdmin(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        role: 'admin',
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId);

    if (error) {
      console.error('Error making user admin:', error);
      return false;
    }

    return true;
  },

  // Photo upload operations
  async uploadProfilePicture(userId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile.${fileExt}`;
      
      // Delete existing profile picture if it exists
      await supabase.storage
        .from('profile-pictures')
        .remove([fileName]);

      // Upload new picture
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading profile picture:', error);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error in uploadProfilePicture:', error);
      return null;
    }
  },

  async deleteProfilePicture(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('profile-pictures')
        .remove([`${userId}/profile.jpg`, `${userId}/profile.png`, `${userId}/profile.jpeg`]);

      if (error) {
        console.error('Error deleting profile picture:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProfilePicture:', error);
      return false;
    }
  },

  // User settings operations
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
    
    return data;
  },

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user settings:', error);
      return null;
    }
    
    return data;
  },

  // Billing info operations
  async getBillingInfo(userId: string): Promise<BillingInfo | null> {
    const { data, error } = await supabase
      .from('billing_info')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching billing info:', error);
      return null;
    }
    
    return data;
  },

  async updateBillingInfo(userId: string, billingInfo: Partial<BillingInfo>): Promise<BillingInfo | null> {
    const { data, error } = await supabase
      .from('billing_info')
      .update({ ...billingInfo, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating billing info:', error);
      return null;
    }
    
    return data;
  },

  // Subscription history operations
  async getSubscriptionHistory(userId: string): Promise<SubscriptionHistory[]> {
    const { data, error } = await supabase
      .from('subscription_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching subscription history:', error);
      return [];
    }
    
    return data || [];
  },

  async logSubscriptionChange(
    userId: string, 
    fromPlan: string | null, 
    toPlan: string, 
    actionType: 'upgrade' | 'downgrade' | 'renewal' | 'cancellation',
    paymentId?: string,
    amount?: number
  ): Promise<SubscriptionHistory | null> {
    const { data, error } = await supabase
      .from('subscription_history')
      .insert([{
        user_id: userId,
        from_plan: fromPlan,
        to_plan: toPlan,
        action_type: actionType,
        amount: amount,
        payment_id: paymentId,
        old_plan: fromPlan, // Keep for backward compatibility
        new_plan: toPlan,   // Keep for backward compatibility
        change_reason: actionType
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error logging subscription change:', error);
      return null;
    }
    
    return data;
  },

  // Usage analytics operations
  async logUserActivity(
    userId: string, 
    actionType: string, 
    metadata?: any,
    sessionId?: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('usage_analytics')
      .insert([{
        user_id: userId,
        action_type: actionType,
        metadata,
        session_id: sessionId
      }]);
    
    if (error) {
      console.error('Error logging user activity:', error);
      return false;
    }
    
    return true;
  },

  async getUserAnalytics(userId: string, limit: number = 100): Promise<UsageAnalytics[]> {
    const { data, error } = await supabase
      .from('usage_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching user analytics:', error);
      return [];
    }
    
    return data || [];
  }
};
