import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { geminiService } from '@/lib/gemini';
import { paymentService } from '@/lib/intasend';
import { env } from '@/lib/env';
import { useToast } from '@/hooks/use-toast';

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
        
        <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted rounded">
          <p><strong>IntaSend:</strong> {env.intasendPublicKey ? '✅ Configured' : '❌ Not configured'}</p>
          <p><strong>Gemini API:</strong> {env.geminiApiKey ? '✅ Configured' : '❌ Not configured'}</p>
          <p><strong>Test Mode:</strong> {env.intasendTestMode ? '✅ Enabled' : '❌ Disabled'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
