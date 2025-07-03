import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { geminiService } from '@/lib/gemini';
import { paymentService } from '@/lib/intasend';
import { env } from '@/lib/env';
import { useToast } from '@/hooks/use-toast';
import { supabase, dbHelpers } from '@/lib/supabase';

export function IntegrationDemo() {
  const { toast } = useToast();

  const testGeminiAPI = async () => {
    try {
      await geminiService.initializeChat();
      const response = await geminiService.askHomeworkQuestion({
        subject: 'Mathematics',
        grade: 'Grade 6',
        question: 'What is 2 + 2?'
      });
      
      toast({
        title: "Gemini API Test Successful",
        description: `Response: ${response.substring(0, 100)}...`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Gemini API Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "error",
      });
    }
  };

  const testEnvironmentVariables = () => {
    const validation = env.validate();
    const allVars = env.getAll();
    
    toast({
      title: validation.isValid ? "Environment Variables OK" : "Missing Environment Variables",
      description: validation.isValid 
        ? "All required environment variables are set"
        : `Missing: ${validation.missing.join(', ')}`,
      variant: validation.isValid ? "success" : "error",
    });

    console.log('Environment Variables:', allVars);
  };

  const testPaymentService = async () => {
    try {
      // Test payment service initialization
      const testPaymentData = {
        amount: 10, // Test amount in KES
        currency: 'KES',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        phone_number: '254700000000',
        method: 'M-PESA' as const,
        api_ref: `TEST-${Date.now()}`
      };

      // Test service configuration
      const hasPublicKey = !!env.intasendPublicKey;
      const hasSecretKey = !!env.intasendSecretKey;
      const isTestMode = env.intasendTestMode;

      if (!hasPublicKey || !hasSecretKey) {
        toast({
          title: "Payment Service Configuration Error",
          description: "IntaSend API keys are not configured properly",
          variant: "error",
        });
        return;
      }

      toast({
        title: "Payment Service Test",
        description: `IntaSend configured correctly. Test mode: ${isTestMode ? 'ON' : 'OFF'}. Ready for ${testPaymentData.method} payments.`,
        variant: "success",
      });

      console.log('Payment Service Configuration:', {
        publicKey: hasPublicKey ? '✅ Set' : '❌ Missing',
        secretKey: hasSecretKey ? '✅ Set' : '❌ Missing',
        testMode: isTestMode ? '✅ Enabled' : '❌ Disabled',
        supportedMethods: ['M-PESA', 'AIRTEL-MONEY', 'CARD']
      });

    } catch (error) {
      toast({
        title: "Payment Service Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "error",
      });
    }
  };

  const testUserProfile = async () => {
    try {
      // Test current user's profile
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "No User Session",
          description: "Please log in first to test user profile",
          variant: "error",
        });
        return;
      }

      const profile = await dbHelpers.getUserProfile(session.user.id);
      
      if (profile) {
        toast({
          title: "User Profile Found",
          description: `Profile for ${profile.name} (${profile.email}) exists with ${profile.questions_remaining} questions remaining`,
          variant: "success",
        });
      } else {
        toast({
          title: "No User Profile",
          description: "User profile not found in database. This might be causing login issues.",
          variant: "error",
        });
      }

      console.log('Current user:', session.user);
      console.log('User profile:', profile);

    } catch (error) {
      toast({
        title: "Profile Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "error",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Integration Testing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testEnvironmentVariables} variant="outline" className="w-full">
          Test Environment Variables
        </Button>
        
        <Button onClick={testGeminiAPI} className="w-full">
          Test Gemini AI
        </Button>
        
        <Button onClick={testPaymentService} variant="secondary" className="w-full">
          Test Payment Service
        </Button>
        
        <Button onClick={testUserProfile} variant="destructive" className="w-full">
          Test User Profile (Login Required)
        </Button>
        
        <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted rounded">
          <p><strong>IntaSend:</strong> {env.intasendPublicKey ? '✅ Configured' : '❌ Not configured'}</p>
          <p><strong>Gemini API:</strong> {env.geminiApiKey ? '✅ Configured' : '❌ Not configured'}</p>
          <p><strong>Test Mode:</strong> {env.intasendTestMode ? '✅ Enabled' : '❌ Disabled'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
