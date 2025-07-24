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
  /**
   * Generate an AI video for a given prompt/topic, grade, and subject
   * Returns a video URL (simulate for now, structure for real API)
   */
  async generateVideo({ prompt, grade, subject }: { prompt: string, grade: string, subject: string }): Promise<string> {
    try {
      // Compose a prompt for the video model
      const fullPrompt = `Generate an educational video for a ${grade} student in Kenya about the following topic in ${subject}:\n${prompt}`;

      // Start the video generation operation
      let operation = await ai.models.generateVideos({
        model: "veo-3.0-generate-preview",
        prompt: fullPrompt,
        config: {
          aspectRatio: "16:9",
          negativePrompt: "cartoon, drawing, low quality"
        },
      });

      // Poll the operation status until the video is ready
      while (!operation.done) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      // Robustly handle the returned video file (URL, Blob, or base64)
      // The Gemini API may return a string (URL or base64), Blob, or an object with data/mimeType
      const videoFile: unknown = operation.response.generatedVideos[0].video;

      // If it's a direct URL (http/https), return as is
      if (typeof videoFile === 'string' && videoFile.startsWith('http')) {
        return videoFile;
      }

      // If it's a base64 string, convert to Blob and return a blob URL
      if (typeof videoFile === 'string' && /^[A-Za-z0-9+/=]+$/.test(videoFile)) {
        // Try to detect mime type (default to mp4)
        const mimeType = 'video/mp4';
        const byteCharacters = atob(videoFile);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        return URL.createObjectURL(blob);
      }

      // If it's a Blob (unlikely from API, but for completeness)
      if (videoFile instanceof Blob) {
        return URL.createObjectURL(videoFile);
      }

      // If it's an object with a data property (e.g., { data: base64, mimeType })
      if (
        typeof videoFile === 'object' &&
        videoFile !== null &&
        'data' in videoFile &&
        typeof (videoFile as { data: unknown }).data === 'string'
      ) {
        const mimeType =
          'mimeType' in videoFile && typeof (videoFile as { mimeType?: unknown }).mimeType === 'string'
            ? (videoFile as { mimeType: string }).mimeType
            : 'video/mp4';
        const base64 = (videoFile as { data: string }).data;
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        return URL.createObjectURL(blob);
      }

      throw new Error('Unknown video file format returned from Gemini API.');
    } catch (error) {
      console.error('Failed to generate AI video:', error);
      throw new Error('Failed to generate AI video. Please try again.');
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              4. Be patient and supportive
              5. Use simple language appropriate for the student's grade level
              6. Relate concepts to real-world examples when possible
              7. Format your responses with clear structure using:
                 - **Bold text** for emphasis
                 - Step 1:, Step 2:, etc. for step-by-step solutions
                 - "Example:" for examples
                 - "Note:" or "Remember:" for important points
                 - "Answer:" for final answers
                 - Use different list formats:
                   * Bullet points with - • * ▪ for general lists
                   * Numbered lists with 1. 2. 3. for ordered items
                   * Letter lists with a) b) c) for sub-categories
                   * Roman numerals with i. ii. iii. for formal outlines
                 - Separate different sections with double line breaks
                 - Use varied formatting to make content engaging and educational

              Always start your response by acknowledging the student's question and then provide a comprehensive, well-formatted explanation.`
            }]
          },
          {
            role: 'model',
            parts: [{ 
              text: `Hello! I'm **HomeworkHelper**, your AI tutor designed specifically for Kenyan students. I'm here to help you understand your homework better and learn step by step.

**I can help you with:**
- 📚 All subjects (Math, Science, English, Kiswahili, Social Studies, etc.)
- 🎯 Step-by-step explanations
- 💡 Real-world examples
- 📖 CBC curriculum alignment
- 🤔 Critical thinking questions

**What homework question can I help you with today?**

Remember: I'm here to guide you through learning, not just give you answers. Let's explore and understand concepts together!`
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
**Subject:** ${question.subject}
**Grade:** ${question.grade}
**Question:** ${question.question}

Please provide a helpful explanation that's appropriate for a ${question.grade} student studying ${question.subject} in Kenya. 

Format your response with:
- Clear structure using headings and sections
- Step-by-step solutions when applicable
- Examples and practical applications
- Important notes or reminders
- Final answer when appropriate

Use formatting like **bold**, Step 1:, Step 2:, Example:, Note:, Answer: to make it easy to read and understand.
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
        ? `Please help me solve this homework problem. Additional context: ${question}

Format your response clearly with:
- Step-by-step solution using Step 1:, Step 2:, etc.
- **Important concepts** in bold
- Example: for examples
- Note: for important reminders
- Answer: for the final solution`
        : `Please help me understand and solve this homework problem shown in the image.

Format your response clearly with:
- Step-by-step solution using Step 1:, Step 2:, etc.
- **Important concepts** in bold
- Example: for examples
- Note: for important reminders
- Answer: for the final solution`;

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
