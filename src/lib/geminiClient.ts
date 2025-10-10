import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Missing VITE_GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Allow overriding the model via env; default to gemini-2.5-flash
const DEFAULT_MODEL = (import.meta.env.VITE_GEMINI_MODEL as string) || 'gemini-2.5-flash';

// Get the Gemini model (defaults to fast 2.5 flash)
export const getGeminiModel = (modelName: string = DEFAULT_MODEL): GenerativeModel => {
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

// Generate content with streaming
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
    onChunk(chunkText);
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
  
  // Clean up the response (remove markdown code blocks, comments, and trailing commas)
  let cleanedText = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/^\s*\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/,\s*(\]|\})/g, '$1') // Remove trailing commas
    .trim();
  
  try {
    return JSON.parse(cleanedText) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', cleanedText);
    console.error('Original text:', text);
    throw new Error('Failed to parse AI response as JSON');
  }
};

export default genAI;

