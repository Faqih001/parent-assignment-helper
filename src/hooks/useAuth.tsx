import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase, User, AuthError, dbHelpers, UserProfile } from '@/lib/supabase';
import { env } from '@/lib/env';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoginLoading: boolean;
  isRegisterLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const { toast } = useToast();

  // Check for existing session on component mount
  useEffect(() => {
    const getSession = async () => {
      try {
        // Handle URL hash for authentication tokens
        if (window.location.hash.includes('access_token') || window.location.hash.includes('error')) {
          // Let Supabase handle the session from URL
          await supabase.auth.getSession();
          // Clean up the URL hash
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }
        
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
              questionsRemaining: profile.questions_remaining,
              role: profile.role || 'user'
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
        console.log('Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Show welcome message for email confirmations
          if (session.user.email_confirmed_at && !user) {
            toast({
              title: "Logged In!",
              description: "You have been successfully Signed In. Welcome to HomeworkHelper!",
              variant: "success",
            });
          }
          
          // Fetch user profile from database
          const profile = await dbHelpers.getUserProfile(session.user.id);
          if (profile) {
            const userData: User = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              avatar: profile.avatar_url,
              plan: profile.plan,
              questionsRemaining: profile.questions_remaining,
              role: profile.role || 'user'
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
              last_free_reset: new Date().toISOString(),
              role: 'user'
            };
            const createdProfile = await dbHelpers.createUserProfile(newProfile);
            if (createdProfile) {
              const userData: User = {
                id: createdProfile.id,
                name: createdProfile.name,
                email: createdProfile.email,
                avatar: createdProfile.avatar_url,
                plan: createdProfile.plan,
                questionsRemaining: createdProfile.questions_remaining,
                role: createdProfile.role || 'user'
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

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    setIsLoginLoading(true);
    
    try {
      console.log('Starting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Auth response:', { hasUser: !!data.user, error: error?.message });

      if (error) {
        console.error('Auth error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error("No user returned from authentication");
      }

      console.log('User authenticated, fetching profile...');

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
      console.log('Profile fetch result:', !!profile);
      
      if (profile) {
        const userData: User = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar_url,
          plan: profile.plan,
          questionsRemaining: profile.questions_remaining,
          role: profile.role || 'user'
        };
        setUser(userData);
        console.log('User state set successfully');
        
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
          variant: "success",
        });
        console.log('Success toast shown');
        
        return true;
      } else {
        console.log('No profile found, creating new one...');
        // Create profile if it doesn't exist
        const newProfile = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          plan: 'free' as const,
          questions_remaining: 5,
          last_free_reset: new Date().toISOString(),
          role: 'user' as const
        };
        
        const createdProfile = await dbHelpers.createUserProfile(newProfile);
        console.log('Profile creation result:', !!createdProfile);
        
        if (createdProfile) {
          const userData: User = {
            id: createdProfile.id,
            name: createdProfile.name,
            email: createdProfile.email,
            avatar: createdProfile.avatar_url,
            plan: createdProfile.plan,
            questionsRemaining: createdProfile.questions_remaining,
            role: createdProfile.role || 'user'
          };
          setUser(userData);
          console.log('New user state set successfully');
          
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in.",
            variant: "success",
          });
          console.log('Success toast shown for new profile');
          
          return true;
        } else {
          throw new Error("Failed to create user profile");
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      console.log('Error toast shown');
      return false;
    } finally {
      console.log('Setting loading to false');
      setIsLoginLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsRegisterLoading(true);
    try {
      // Always use production URL for email confirmations
      const redirectUrl = 'https://parent-assignment-helper.vercel.app';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: redirectUrl
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
            variant: "success",
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
              questionsRemaining: profile.questions_remaining,
              role: profile.role || 'user'
            };
            setUser(userData);
            
            toast({
              title: "Account created!",
              description: `Welcome to HomeworkHelper, ${profile.name}! You have ${profile.questions_remaining} free questions to get started.`,
              variant: "success",
            });
          }
        }
      }
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "error",
      });
      return false;
    } finally {
      setIsRegisterLoading(false);
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
        variant: "success",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoginLoading(true);
    try {
      // Always use production URL for email confirmations
      const redirectUrl = 'https://parent-assignment-helper.vercel.app/?reset=true';
        
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Reset email sent!",
        description: "Check your email for password reset instructions.",
        variant: "success",
      });
      return true;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast({
        title: "Reset failed",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "error",
      });
      return false;
    } finally {
      setIsLoginLoading(false);
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
          questionsRemaining: profile.questions_remaining,
          role: profile.role || 'user'
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    setIsLoginLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password Updated!",
        description: "Your password has been successfully updated.",
        variant: "success",
      });
      return true;
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update password. Please try again.",
        variant: "error",
      });
      return false;
    } finally {
      setIsLoginLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoginLoading, isRegisterLoading, login, register, logout, refreshUser, forgotPassword, updatePassword }}>
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