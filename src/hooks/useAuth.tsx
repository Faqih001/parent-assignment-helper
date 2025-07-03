import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase, User, AuthError, dbHelpers, UserProfile } from '@/lib/supabase';
import { env } from '@/lib/env';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing session on component mount
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        if (session?.user) {
          // Fetch user profile from database
          const profile = await dbHelpers.getUserProfile(session.user.id);
          if (profile) {
            const userData: User = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              avatar: profile.avatar_url,
              plan: profile.plan,
              questionsRemaining: profile.questions_remaining
            };
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Session error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch user profile from database
          const profile = await dbHelpers.getUserProfile(session.user.id);
          if (profile) {
            const userData: User = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              avatar: profile.avatar_url,
              plan: profile.plan,
              questionsRemaining: profile.questions_remaining
            };
            setUser(userData);
          } else {
            // Create profile if it doesn't exist (fallback)
            const newProfile: Omit<UserProfile, 'created_at' | 'updated_at'> = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              plan: 'free',
              questions_remaining: 5,
              last_free_reset: new Date().toISOString()
            };
            const createdProfile = await dbHelpers.createUserProfile(newProfile);
            if (createdProfile) {
              const userData: User = {
                id: createdProfile.id,
                name: createdProfile.name,
                email: createdProfile.email,
                avatar: createdProfile.avatar_url,
                plan: createdProfile.plan,
                questionsRemaining: createdProfile.questions_remaining
              };
              setUser(userData);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Handle remember me functionality
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('rememberedEmail');
        }

        // Fetch user profile from database
        const profile = await dbHelpers.getUserProfile(data.user.id);
        if (profile) {
          const userData: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar_url,
            plan: profile.plan,
            questionsRemaining: profile.questions_remaining
          };
          setUser(userData);
          
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in.",
          });
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: env.appUrl
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Check if user needs email confirmation
        if (!data.session) {
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link to complete your registration.",
          });
        } else {
          // User profile should be created automatically by the trigger
          // Fetch the created profile
          const profile = await dbHelpers.getUserProfile(data.user.id);
          if (profile) {
            const userData: User = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              avatar: profile.avatar_url,
              plan: profile.plan,
              questionsRemaining: profile.questions_remaining
            };
            setUser(userData);
            
            toast({
              title: "Account created!",
              description: `Welcome to HomeworkHelper, ${profile.name}! You have ${profile.questions_remaining} free questions to get started.`,
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      
      // Clear remember me data on logout
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberedEmail');
      
      setUser(null);
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${env.appUrl}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Reset email sent!",
        description: "Check your email for password reset instructions.",
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast({
        title: "Reset failed",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    
    try {
      const profile = await dbHelpers.getUserProfile(user.id);
      if (profile) {
        const userData: User = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar_url,
          plan: profile.plan,
          questionsRemaining: profile.questions_remaining
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}