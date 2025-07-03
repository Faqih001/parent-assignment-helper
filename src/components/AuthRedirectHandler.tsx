import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function AuthRedirectHandler() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        // Check if we have auth tokens in the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (error) {
          toast({
            title: "Authentication Error",
            description: errorDescription || error,
            variant: "error",
          });
          navigate('/');
          return;
        }

        if (accessToken && type === 'signup') {
          // This is an email confirmation
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (sessionError) {
            toast({
              title: "Session Error",
              description: "Failed to establish session after email verification",
              variant: "error",
            });
            navigate('/');
            return;
          }

          if (data.user) {
            toast({
              title: "Email Verified!",
              description: "Your email has been successfully verified. Welcome to HomeworkHelper!",
              variant: "success",
            });
          }

          // Clean up URL and redirect to home
          window.history.replaceState({}, document.title, '/');
          navigate('/');
        } else if (accessToken) {
          // Handle other authentication flows
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (!sessionError) {
            // Clean up URL and redirect
            window.history.replaceState({}, document.title, '/');
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Auth redirect error:', error);
        navigate('/');
      }
    };

    // Only run if we have hash parameters that look like auth tokens
    if (window.location.hash.includes('access_token')) {
      handleAuthRedirect();
    }
  }, [navigate, toast]);

  return null; // This component doesn't render anything
}
