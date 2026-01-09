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
  register: (name: string, email: string, password: string, role: string) => Promise<boolean>;
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();

  // Check for existing session on component mount
  useEffect(() => {
    const getSession = async () => {
      try {
        // Check if there are auth tokens in the URL (skip session loading if redirecting)
        if (window.location.hash.includes('access_token') || window.location.hash.includes('error')) {
          // Let AuthRedirectHandler handle this
          setIsLoading(false);
          setIsInitialLoad(false);
          return;
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
        setIsInitialLoad(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Don't show notifications for initial page loads
          const isFromInitialLoad = isInitialLoad;
          
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
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (event === 'USER_UPDATED') {
          console.log('User updated');
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
          title: "Logged in successfully!",
          description: `Welcome back, ${profile.name}! Ready to tackle some homework?`,
          variant: "default",
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
            title: "Logged in successfully!",
            description: `Welcome back, ${createdProfile.name}! Ready to tackle some homework?`,
            variant: "default",
          });
          console.log('Success toast shown for new profile');
          
          return true;
        } else {
          throw new Error("Failed to create user profile");
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = "Please check your credentials and try again.";
      
      // Provide specific error messages for common issues
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = "Too many login attempts. Please wait a moment and try again.";
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Please check your email and confirm your account before logging in.";
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.log('Error toast shown');
      return false;
    } finally {
      console.log('Setting loading to false');
      setIsLoginLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string): Promise<boolean> => {
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
            role: role,
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
            description: "We've sent you a confirmation link to complete your registration. Please check your email and click the link to verify your account.",
            variant: "default",
          });
          return true; // Return true because registration was initiated successfully
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
              variant: "default",
            });
            return true;
          }
        }
      }
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = "Something went wrong. Please try again.";
      
      // Provide specific error messages for common registration issues
      if (error.message?.includes('User already registered')) {
        errorMessage = "An account with this email already exists. Please try logging in instead.";
      } else if (error.message?.includes('Password should be at least 6 characters')) {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = "Please enter a valid email address.";
      } else if (error.message?.includes('too many requests')) {
        errorMessage = "Too many registration attempts. Please wait a moment and try again.";
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
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
        throw error;
      }
      
      // Clear remember me data on logout
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberedEmail');
      
      setUser(null);
      toast({
        title: "Logged out",
        description: "You've been successfully logged out. See you again soon!",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout error",
        description: "There was an issue logging you out. Please try again.",
        variant: "destructive",
      });
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
        description: "Check your email for password reset instructions. The link will expire in 1 hour.",
        variant: "default",
      });
      return true;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      let errorMessage = "Failed to send reset email. Please try again.";
      
      if (error.message?.includes('For security purposes')) {
        errorMessage = "For security purposes, you can only request a password reset every 60 seconds.";
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = "Please enter a valid email address.";
      }
      
      toast({
        title: "Reset failed",
        description: errorMessage,
        variant: "destructive",
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