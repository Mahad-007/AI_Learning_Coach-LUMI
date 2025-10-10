import type { Persona } from './user';

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  topic: string | null;
  persona: Persona;
  xp_gained: number;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  topic?: string;
  persona?: Persona;
  context?: string[];
}

export interface ChatResponse {
  reply: string;
  timestamp: string;
  xp_gained: number;
  message_id: string;
}

export interface StreamChatRequest extends ChatRequest {
  onChunk: (text: string) => void;
}

export interface TutorPersonaConfig {
  name: Persona;
  display_name: string;
  description: string;
  icon: string;
  system_prompt: string;
}

export interface AIGenerationConfig {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
}

