import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Missing VITE_GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Get the Gemini 2.0 Flash model (faster and more capable than Pro)
export const getGeminiModel = (modelName: string = 'gemini-2.0-flash-exp'): GenerativeModel => {
  return genAI.getGenerativeModel({ model: modelName });
};

// Persona-based system prompts
export const personaPrompts = {
  friendly: `You are a friendly and encouraging AI tutor. Your teaching style is warm and supportive. 
  You explain concepts in simple terms, use positive reinforcement, and make students feel comfortable asking questions.
  Always encourage students and celebrate their progress.`,
  
  strict: `You are a strict and professional AI tutor. Your teaching style is formal and direct.
  You focus on accuracy, discipline, and proper understanding. Be concise, factual, and maintain high standards.
  Correct mistakes clearly and emphasize the importance of proper learning.`,
  
  fun: `You are a fun and entertaining AI tutor. Your teaching style is playful and engaging.
  Use humor, creative analogies, emojis, and casual language to make learning enjoyable.
  Make complex topics accessible through entertaining explanations and relatable examples.`,
  
  scholar: `You are a scholarly and academic AI tutor. Your teaching style is deeply informative and intellectual.
  Provide comprehensive explanations with proper terminology, historical context, and connections to broader concepts.
  Encourage critical thinking and deep understanding of subject matter.`,
};

// Generate content with persona
export const generateWithPersona = async (
  prompt: string,
  persona: keyof typeof personaPrompts = 'friendly'
): Promise<string> => {
  const model = getGeminiModel();
  const fullPrompt = `${personaPrompts[persona]}\n\n${prompt}`;
  
  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  return response.text();
};

// Generate content with streaming (character by character)
export const generateStreamWithPersona = async (
  prompt: string,
  persona: keyof typeof personaPrompts = 'friendly',
  onChunk: (text: string) => void
): Promise<string> => {
  const model = getGeminiModel();
  const fullPrompt = `${personaPrompts[persona]}\n\n${prompt}`;
  
  const result = await model.generateContentStream(fullPrompt);
  let fullText = '';
  
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullText += chunkText;
    
    // Stream character by character for smooth effect
    for (const char of chunkText) {
      onChunk(char);
      // Small delay for smooth streaming visual effect
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  return fullText;
};

// Generate content with streaming (word by word for faster display)
export const generateStreamWithPersonaFast = async (
  prompt: string,
  persona: keyof typeof personaPrompts = 'friendly',
  onChunk: (text: string) => void
): Promise<string> => {
  const model = getGeminiModel();
  const fullPrompt = `${personaPrompts[persona]}\n\n${prompt}`;
  
  const result = await model.generateContentStream(fullPrompt);
  let fullText = '';
  
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullText += chunkText;
    onChunk(chunkText); // Stream in larger chunks (faster)
  }
  
  return fullText;
};

// Generate structured JSON response
export const generateStructuredContent = async <T>(
  prompt: string,
  persona: keyof typeof personaPrompts = 'friendly'
): Promise<T> => {
  const model = getGeminiModel();
  const fullPrompt = `${personaPrompts[persona]}\n\n${prompt}\n\nIMPORTANT: Return ONLY valid JSON, no markdown formatting or additional text.`;
  
  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  const text = response.text();
  
  // Clean up the response (remove markdown code blocks if present)
  const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    return JSON.parse(cleanedText) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', cleanedText);
    throw new Error('Failed to parse AI response as JSON');
  }
};

export default genAI;

