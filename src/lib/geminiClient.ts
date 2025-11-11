import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const importMetaEnv = typeof import.meta !== 'undefined' && (import.meta as any)?.env
  ? (import.meta as any).env
  : undefined;

const getEnv = (key: string) => {
  if (importMetaEnv && key in importMetaEnv) {
    return importMetaEnv[key] as string | undefined;
  }
  return process.env[key];
};

const apiKey =
  getEnv('VITE_GEMINI_API_KEY') ??
  getEnv('GEMINI_API_KEY');

if (!apiKey) {
  throw new Error('Missing VITE_GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Allow overriding the model via env; default to gemini-2.0-flash-exp
const DEFAULT_MODEL =
  getEnv('VITE_GEMINI_MODEL') ??
  getEnv('GEMINI_MODEL') ??
  'gemini-2.0-flash-exp';

// Get the Gemini model (defaults to fast 2.0 flash)
export const getGeminiModel = (modelName: string = DEFAULT_MODEL): GenerativeModel => {
  return genAI.getGenerativeModel({ model: modelName });
};

// Content filtering rules for all personas
const contentFilter = `
CONTENT FILTERING RULES - CRITICAL:
- You MUST NOT answer any questions, requests, or tasks that are 18+ (adult content)
- You MUST NOT provide information about explicit sexual content, violence, drugs, alcohol, gambling, or any inappropriate material
- You MUST NOT help with creating, writing, or generating adult content of any kind
- You MUST NOT provide instructions for illegal activities or harmful behaviors
- If asked about 18+ topics, politely decline and redirect to educational content
- Always maintain a professional, educational tone appropriate for all ages
- Focus exclusively on educational, academic, and learning-related topics
- If unsure whether content is appropriate, err on the side of caution and decline
`;

// Persona-based system prompts
export const personaPrompts = {
  friendly: `You are a friendly and encouraging AI tutor. Your teaching style is warm and supportive. 
  You explain concepts in simple terms, use positive reinforcement, and make students feel comfortable asking questions.
  Always encourage students and celebrate their progress.
  
  ${contentFilter}`,
  
  strict: `You are a strict and professional AI tutor. Your teaching style is formal and direct.
  You focus on accuracy, discipline, and proper understanding. Be concise, factual, and maintain high standards.
  Correct mistakes clearly and emphasize the importance of proper learning.
  
  ${contentFilter}`,
  
  fun: `You are a fun and entertaining AI tutor. Your teaching style is playful and engaging.
  Use humor, creative analogies, emojis, and casual language to make learning enjoyable.
  Make complex topics accessible through entertaining explanations and relatable examples.
  
  ${contentFilter}`,
  
  scholar: `You are a scholarly and academic AI tutor. Your teaching style is deeply informative and intellectual.
  Provide comprehensive explanations with proper terminology, historical context, and connections to broader concepts.
  Encourage critical thinking and deep understanding of subject matter.
  
  ${contentFilter}`,
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

