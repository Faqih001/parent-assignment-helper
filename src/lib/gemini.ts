import { GoogleGenAI } from '@google/genai';
import { env } from './env';

// Initialize Google Gemini AI
const apiKey = env.geminiApiKey;

if (!apiKey) {
  throw new Error('Google Gemini API key not found. Please set VITE_GOOGLE_GEMINI_API_KEY in your .env file.');
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>;
}

export interface HomeworkQuestion {
  subject: string;
  grade: string;
  question: string;
  image?: File;
}

export class GeminiService {
  private chat: any = null;

  /**
   * Initialize chat session with context for homework assistance
   */
  async initializeChat(): Promise<void> {
    try {
      this.chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: [
          {
            role: 'user',
            parts: [{ 
              text: `You are HomeworkHelper, an AI assistant specialized in helping Kenyan students with their homework. 
              You should:
              1. Provide clear, step-by-step explanations
              2. Use examples relevant to Kenyan curriculum (CBC - Competency Based Curriculum)
              3. Encourage learning rather than just giving answers
              4. Ask clarifying questions when needed
              5. Be patient and supportive
              6. Use simple language appropriate for the student's grade level
              7. Relate concepts to real-world examples when possible
              
              Always start your response by acknowledging the student's question and then provide a comprehensive explanation.`
            }]
          },
          {
            role: 'model',
            parts: [{ 
              text: `Hello! I'm HomeworkHelper, your AI tutor designed specifically for Kenyan students. I'm here to help you understand your homework better and learn step by step.

              I can help you with:
              📚 All subjects (Math, Science, English, Kiswahili, Social Studies, etc.)
              🎯 Step-by-step explanations
              💡 Real-world examples
              📖 CBC curriculum alignment
              🤔 Critical thinking questions

              What homework question can I help you with today?`
            }]
          }
        ]
      });
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      throw new Error('Failed to initialize AI chat session');
    }
  }

  /**
   * Send a homework question and get AI response
   */
  async askHomeworkQuestion(question: HomeworkQuestion): Promise<string> {
    try {
      if (!this.chat) {
        await this.initializeChat();
      }

      const contextualPrompt = `
Subject: ${question.subject}
Grade: ${question.grade}
Question: ${question.question}

Please provide a helpful explanation that's appropriate for a ${question.grade} student studying ${question.subject} in Kenya.
`;

      const stream = await this.chat.sendMessageStream({
        message: contextualPrompt,
      });

      let response = '';
      for await (const chunk of stream) {
        response += chunk.text;
      }

      return response;
    } catch (error) {
      console.error('Failed to get homework help:', error);
      throw new Error('Failed to process your question. Please try again.');
    }
  }

  /**
   * Analyze an image with homework question
   */
  async analyzeHomeworkImage(imageFile: File, question?: string): Promise<string> {
    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      const prompt = question 
        ? `Please help me solve this homework problem. Additional context: ${question}`
        : 'Please help me understand and solve this homework problem shown in the image.';

      const contents = [
        {
          inlineData: {
            mimeType: imageFile.type,
            data: base64Image,
          },
        },
        { text: prompt },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
      });

      return response.text;
    } catch (error) {
      console.error('Failed to analyze image:', error);
      throw new Error('Failed to analyze the image. Please try again.');
    }
  }

  /**
   * Generate practice questions based on a topic
   */
  async generatePracticeQuestions(subject: string, topic: string, grade: string, count: number = 5): Promise<string> {
    try {
      const prompt = `Generate ${count} practice questions for ${grade} students studying ${topic} in ${subject}. 
      Make sure the questions are:
      1. Appropriate for Kenyan curriculum (CBC)
      2. Progressive in difficulty
      3. Include both theory and practical applications
      4. Relevant to Kenyan context where applicable
      
      Format as numbered list with clear questions.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error('Failed to generate practice questions:', error);
      throw new Error('Failed to generate practice questions. Please try again.');
    }
  }

  /**
   * Explain a concept in simple terms
   */
  async explainConcept(concept: string, subject: string, grade: string): Promise<string> {
    try {
      const prompt = `Explain the concept of "${concept}" in ${subject} to a ${grade} student in Kenya. 
      Use:
      1. Simple, clear language
      2. Real-world examples relevant to Kenya
      3. Step-by-step breakdown
      4. Visual descriptions where helpful
      5. Connection to everyday life
      
      Make it engaging and easy to understand.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Use Pro for more detailed explanations
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error('Failed to explain concept:', error);
      throw new Error('Failed to explain the concept. Please try again.');
    }
  }

  /**
   * Convert file to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data URL prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get study tips for a subject
   */
  async getStudyTips(subject: string, grade: string): Promise<string> {
    try {
      const prompt = `Provide study tips and learning strategies for ${grade} students studying ${subject} in Kenya. 
      Include:
      1. Effective study methods
      2. Time management tips
      3. Memory techniques
      4. Practice strategies
      5. Resources specific to Kenyan curriculum
      6. Tips for parents to help
      
      Make it practical and actionable.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error('Failed to get study tips:', error);
      throw new Error('Failed to get study tips. Please try again.');
    }
  }
}

export const geminiService = new GeminiService();
