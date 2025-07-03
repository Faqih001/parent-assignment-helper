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
  }
};
