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

        // Only process if we have auth-related hash parameters
        if (!accessToken && !error) {
          return;
        }

        if (error) {
          toast({
            title: "Authentication Error",
            description: errorDescription || error,
            variant: "error",
          });
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
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
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
            navigate('/');
            return;
          }

          if (data.user) {
            toast({
              title: "Email verified successfully!",
              description: "Your email has been successfully verified. Welcome to HomeworkHelper!",
              variant: "success",
            });
          }

          // Clean up URL and redirect to home
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          navigate('/');
        } else if (accessToken && type === 'recovery') {
          // This is a password reset
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (!sessionError) {
            toast({
              title: "Password reset ready",
              description: "You can now set your new password.",
              variant: "default",
            });
            // Clean up URL and redirect to reset password page
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
            navigate('/reset-password');
          }
        } else if (accessToken) {
          // Handle other authentication flows (like direct login links)
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (!sessionError) {
            // Clean up URL and redirect without showing notification
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Auth redirect error:', error);
        // Clean up URL and redirect
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        navigate('/');
      }
    };

    // Only run if we have hash parameters that look like auth tokens
    if (window.location.hash.includes('access_token') || window.location.hash.includes('error')) {
      handleAuthRedirect();
    }
  }, [navigate, toast]);

  return null; // This component doesn't render anything
}
