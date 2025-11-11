import { config as loadEnv } from 'dotenv';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
type ToolContent = {
  type: 'text';
  text: string;
};

type ToolResult = {
  content: ToolContent[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
  error?: { message: string };
};
import { z } from 'zod';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';

loadEnv();

type Persona = 'friendly' | 'strict' | 'fun' | 'scholar';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

const personaPrompts: Record<Persona, string> = {
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

const exportedConfigSchema = z.object({
  supabaseUrl: z
    .string()
    .url()
    .describe('Supabase project URL (defaults to VITE_SUPABASE_URL environment variable)')
    .optional(),
  supabaseServiceRoleKey: z
    .string()
    .min(1)
    .describe('Supabase service role key for privileged access (defaults to SUPABASE_SERVICE_ROLE_KEY env var)')
    .optional(),
  supabaseAnonKey: z
    .string()
    .min(1)
    .describe('Supabase anonymous key used when service role key is not provided')
    .optional(),
  geminiApiKey: z
    .string()
    .min(1)
    .describe('Google Gemini API key (defaults to VITE_GEMINI_API_KEY env var)')
    .optional(),
  geminiModel: z
    .string()
    .min(1)
    .describe('Default Gemini model to use (defaults to gemini-2.0-flash-exp)')
    .optional(),
});

const resolvedConfigSchema = z
  .object({
    supabaseUrl: z.string().url(),
    supabaseServiceRoleKey: z.string().min(1).optional(),
    supabaseAnonKey: z.string().min(1).optional(),
    geminiApiKey: z.string().min(1),
    geminiModel: z.string().min(1),
  })
  .refine(
    (value) => Boolean(value.supabaseServiceRoleKey || value.supabaseAnonKey),
    'Provide either supabaseServiceRoleKey or supabaseAnonKey'
  );

type ResolvedConfig = z.infer<typeof resolvedConfigSchema>;

class GeminiProvider {
  private readonly client: GoogleGenerativeAI;

  constructor(private readonly apiKey: string, private readonly defaultModel: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  private getModel(modelName?: string): GenerativeModel {
    return this.client.getGenerativeModel({ model: modelName ?? this.defaultModel });
  }

  async generateStructuredContent<T>(prompt: string, persona: Persona, modelName?: string): Promise<T> {
    const fullPrompt = `${personaPrompts[persona]}\n\n${prompt}\n\nIMPORTANT: Return ONLY valid JSON, no markdown formatting or additional text.`;
    const model = this.getModel(modelName);
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/,\s*(\]|\})/g, '$1')
      .trim();

    try {
      return JSON.parse(cleaned) as T;
    } catch (error) {
      console.error('Failed to parse Gemini structured output', { cleaned, original: text });
      throw new Error('Gemini response was not valid JSON');
    }
  }

  async generateText(prompt: string, persona: Persona, modelName?: string): Promise<string> {
    const fullPrompt = `${personaPrompts[persona]}\n\n${prompt}`;
    const model = this.getModel(modelName);
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  }
}

class LearningCoachBackend {
  constructor(private readonly supabase: SupabaseClient, private readonly gemini: GeminiProvider) {}

  async generateLesson(input: {
    userId: string;
    subject: string;
    topic: string;
    difficulty: Difficulty;
    duration: number;
    persona?: Persona;
    model?: string;
  }) {
    const persona = await this.resolvePersona(input.userId, input.persona);
    const prompt = buildLessonPrompt(input);
    const lessonContent = await this.gemini.generateStructuredContent<GeneratedLessonContent>(prompt, persona, input.model);
    const xpReward = calculateLessonXPReward(input.difficulty, input.duration);
    const formattedContent = formatLessonContent(lessonContent);

    const { data: lessonData, error: lessonError } = await this.supabase
      .from('lessons')
      .insert({
        user_id: input.userId,
        topic: input.topic,
        subject: input.subject,
        difficulty: input.difficulty,
        duration: input.duration,
        content: formattedContent,
        objectives: lessonContent.objectives,
        key_points: lessonContent.key_points,
        xp_reward: xpReward,
      })
      .select()
      .single();

    if (lessonError) throw new Error(`Failed to save lesson: ${lessonError.message}`);
    if (!lessonData) throw new Error('Supabase did not return lesson data');

    const { error: progressError } = await this.supabase.from('user_progress').insert({
      user_id: input.userId,
      lesson_id: lessonData.id,
      completed: false,
      time_spent: 0,
    });

    if (progressError) {
      console.warn('Failed to create initial progress row', progressError);
    }

    await this.awardLessonCreationXP(input.userId);

    return {
      lesson: lessonData,
      xpReward,
      message: 'Lesson generated successfully',
    };
  }

  async generateQuiz(input: {
    userId: string;
    lessonId: string;
    difficulty: Difficulty;
    numQuestions?: number;
    model?: string;
  }) {
    const persona = await this.resolvePersona(input.userId);
    const { data: lesson, error: lessonError } = await this.supabase
      .from('lessons')
      .select('content, topic, subject')
      .eq('id', input.lessonId)
      .single();

    if (lessonError) throw new Error(`Failed to load lesson: ${lessonError.message}`);
    if (!lesson) throw new Error('Lesson not found');

    const prompt = buildQuizPrompt(
      lesson.topic,
      lesson.subject,
      input.difficulty,
      input.numQuestions ?? 5,
      lesson.content
    );

    const quizData = await this.gemini.generateStructuredContent<{ questions: QuizQuestion[] }>(
      prompt,
      persona,
      input.model
    );

    const xpReward = calculateQuizXPReward(input.difficulty, quizData.questions.length);

    const { data: savedQuiz, error: quizError } = await this.supabase
      .from('quizzes')
      .insert({
        lesson_id: input.lessonId,
        user_id: input.userId,
        questions: quizData.questions,
        xp_reward: xpReward,
      })
      .select()
      .single();

    if (quizError) throw new Error(`Failed to save quiz: ${quizError.message}`);
    if (!savedQuiz) throw new Error('Supabase did not return quiz data');

    return {
      quiz: savedQuiz,
      xpReward,
      message: 'Quiz generated successfully',
    };
  }

  async sendChatMessage(input: {
    userId: string;
    message: string;
    topic?: string;
    persona?: Persona;
    context?: string[];
    model?: string;
  }) {
    const persona = await this.resolvePersona(input.userId, input.persona);
    const prompt = buildChatPrompt(input.message, input.topic, input.context);
    const reply = await this.gemini.generateText(prompt, persona, input.model);
    const xpGained = 5;

    const insertPayload: Record<string, unknown> = {
      user_id: input.userId,
      message: input.message,
      response: reply,
      topic: input.topic ?? null,
      persona,
      xp_gained: xpGained,
    };

    const rolesToTry = ['ai', 'assistant', 'system', 'bot'];
    let savedMessage: any = null;
    let lastError: Error | null = null;

    for (const role of rolesToTry) {
      const { data, error } = await this.supabase
        .from('chat_history')
        .insert({ ...insertPayload, role })
        .select()
        .single();

      if (!error && data) {
        savedMessage = data;
        break;
      }

      lastError = error ? new Error(error.message) : null;
    }

    if (!savedMessage) {
      throw lastError ?? new Error('Failed to write chat history');
    }

    await this.updateUserXP(input.userId, xpGained);

    return {
      reply,
      xpGained,
      messageId: savedMessage.id,
      timestamp: savedMessage.timestamp,
    };
  }

  private async resolvePersona(userId: string, override?: Persona): Promise<Persona> {
    if (override) return override;

    const { data } = await this.supabase
      .from('users')
      .select('persona')
      .eq('id', userId)
      .single();

    const persona = data?.persona as Persona | undefined;
    return persona ?? 'friendly';
  }

  private async awardLessonCreationXP(userId: string): Promise<void> {
    const { data: user } = await this.supabase
      .from('users')
      .select('xp, level')
      .eq('id', userId)
      .single();

    if (!user) return;

    const newXP = (user.xp ?? 0) + 10;
    const newLevel = calculateLevel(newXP);

    await this.supabase
      .from('users')
      .update({
        xp: newXP,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  }

  private async updateUserXP(userId: string, xpGained: number): Promise<void> {
    const { data: user } = await this.supabase
      .from('users')
      .select('xp, level')
      .eq('id', userId)
      .single();

    if (!user) return;

    const newXP = (user.xp ?? 0) + xpGained;
    const newLevel = calculateLevel(newXP);

    await this.supabase
      .from('users')
      .update({
        xp: newXP,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  }
}

type GeneratedLessonContent = {
  introduction: string;
  objectives: string[];
  key_points: string[];
  detailed_content: string;
  summary: string;
  practice_exercises?: string[];
};

type QuizQuestion = {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
};

function buildLessonPrompt(input: {
  subject: string;
  topic: string;
  difficulty: Difficulty;
  duration: number;
}) {
  return `Create a comprehensive educational lesson with the following specifications:

Subject: ${input.subject}
Topic: ${input.topic}
Difficulty Level: ${input.difficulty}
Duration: ${input.duration} minutes

Please generate a structured lesson that includes:
1. An engaging introduction that captures interest
2. Clear learning objectives (3-5 specific goals)
3. Key points to cover (5-7 main concepts)
4. Detailed content explanation
5. A concise summary
6. Optional practice exercises

Return the response as a JSON object with this exact structure:
{
  "introduction": "engaging introduction text",
  "objectives": ["objective 1", "objective 2", ...],
  "key_points": ["point 1", "point 2", ...],
  "detailed_content": "comprehensive explanation of the topic",
  "summary": "brief recap of main points",
  "practice_exercises": ["exercise 1", "exercise 2", ...]
}`;
}

function formatLessonContent(content: GeneratedLessonContent): string {
  let formatted = `# Introduction\n\n${content.introduction}\n\n`;
  formatted += `# Learning Objectives\n\n${content.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}\n\n`;
  formatted += `# Key Points\n\n${content.key_points.map((point, i) => `${i + 1}. ${point}`).join('\n')}\n\n`;
  formatted += `# Detailed Content\n\n${content.detailed_content}\n\n`;
  formatted += `# Summary\n\n${content.summary}\n\n`;

  if (content.practice_exercises && content.practice_exercises.length > 0) {
    formatted += `# Practice Exercises\n\n${content.practice_exercises
      .map((exercise, i) => `${i + 1}. ${exercise}`)
      .join('\n')}`;
  }

  return formatted;
}

function calculateLessonXPReward(difficulty: Difficulty, duration: number): number {
  const baseXP = 50;
  const difficultyMultiplier: Record<Difficulty, number> = {
    beginner: 1.0,
    intermediate: 1.5,
    advanced: 2.0,
  };
  const durationBonus = Math.floor(duration / 10) * 10;

  return Math.floor(baseXP * difficultyMultiplier[difficulty] + durationBonus);
}

function buildQuizPrompt(
  topic: string,
  subject: string,
  difficulty: Difficulty,
  numQuestions: number,
  lessonContent: string
) {
  return `Create a multiple-choice quiz based on the following lesson:

Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}
Number of Questions: ${numQuestions}

Lesson Content:
${lessonContent.substring(0, 2000)} ${lessonContent.length > 2000 ? '...' : ''}

Please generate ${numQuestions} multiple-choice questions that:
1. Test understanding of key concepts from the lesson
2. Are appropriate for ${difficulty} level
3. Have 4 options each
4. Include an explanation for the correct answer

Return the response as a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Explanation of why this is correct"
    }
  ]
}`;
}

function calculateQuizXPReward(difficulty: Difficulty, numQuestions: number): number {
  const baseXP = 30;
  const difficultyMultiplier: Record<Difficulty, number> = {
    beginner: 1.0,
    intermediate: 1.4,
    advanced: 1.8,
  };
  return Math.floor(baseXP * difficultyMultiplier[difficulty] + numQuestions * 5);
}

function buildChatPrompt(message: string, topic?: string, context?: string[]): string {
  let prompt = '';

  if (topic) {
    prompt += `Topic: ${topic}\n\n`;
  }

  if (context && context.length > 0) {
    prompt += `Previous context:\n${context.join('\n')}\n\n`;
  }

  prompt += `Student's question or message: ${message}\n\n`;
  prompt += `Please provide a helpful, educational response that encourages learning and understanding.`;

  return prompt;
}

function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function resolveConfig(config: unknown): ResolvedConfig {
  const parsedUserConfig = exportedConfigSchema.parse(config ?? {});
  const merged = {
    supabaseUrl:
      parsedUserConfig.supabaseUrl ??
      process.env.VITE_SUPABASE_URL ??
      process.env.SUPABASE_URL,
    supabaseServiceRoleKey:
      parsedUserConfig.supabaseServiceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseAnonKey:
      parsedUserConfig.supabaseAnonKey ??
      process.env.VITE_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY,
    geminiApiKey:
      parsedUserConfig.geminiApiKey ??
      process.env.VITE_GEMINI_API_KEY ??
      process.env.GEMINI_API_KEY,
    geminiModel:
      parsedUserConfig.geminiModel ??
      process.env.VITE_GEMINI_MODEL ??
      process.env.GEMINI_MODEL ??
      'gemini-2.0-flash-exp',
  };

  return resolvedConfigSchema.parse(merged);
}

function createSupabaseClient(config: ResolvedConfig): SupabaseClient {
  const key = config.supabaseServiceRoleKey ?? config.supabaseAnonKey;
  if (!key) {
    throw new Error('Missing Supabase key');
  }

  return createClient(config.supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

function registerTools(server: McpServer, backend: LearningCoachBackend) {
  server.registerTool(
    'generate_lesson',
    {
      title: 'Generate Lesson',
      description: 'Generate and store an AI-powered lesson for a learner',
      inputSchema: {
        userId: z.string().min(1).describe('Supabase user id'),
        subject: z.string().min(1).describe('Lesson subject'),
        topic: z.string().min(1).describe('Lesson topic'),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe('Lesson difficulty'),
        duration: z.number().int().positive().describe('Estimated duration in minutes'),
        persona: z.enum(['friendly', 'strict', 'fun', 'scholar']).optional().describe('Tutor persona override'),
        model: z.string().optional().describe('Gemini model override for this request'),
      },
      outputSchema: {
        message: z.string(),
        xpReward: z.number(),
        lesson: z.object({}).passthrough(),
      },
    },
    async (args): Promise<ToolResult> => {
      const result = await backend.generateLesson({
        userId: args.userId,
        subject: args.subject,
        topic: args.topic,
        difficulty: args.difficulty as Difficulty,
        duration: args.duration,
        persona: args.persona as Persona | undefined,
        model: args.model,
      });

      const structuredContent = {
        message: result.message,
        xpReward: result.xpReward,
        lesson: result.lesson,
      };

      return {
        content: [
          {
            type: 'text',
            text: `${result.message}\nLesson ID: ${result.lesson.id}\nXP Reward: ${result.xpReward}`,
          },
        ],
        structuredContent,
      };
    }
  );

  server.registerTool(
    'generate_quiz',
    {
      title: 'Generate Quiz',
      description: 'Create an adaptive quiz for an existing lesson',
      inputSchema: {
        userId: z.string().min(1).describe('Supabase user id'),
        lessonId: z.string().min(1).describe('Lesson id to build the quiz from'),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe('Target quiz difficulty'),
        numQuestions: z.number().int().min(1).max(20).optional().describe('Number of quiz questions (default 5)'),
        model: z.string().optional().describe('Gemini model override for this request'),
      },
      outputSchema: {
        message: z.string(),
        xpReward: z.number(),
        quiz: z.object({}).passthrough(),
      },
    },
    async (args): Promise<ToolResult> => {
      const result = await backend.generateQuiz({
        userId: args.userId,
        lessonId: args.lessonId,
        difficulty: args.difficulty as Difficulty,
        numQuestions: args.numQuestions,
        model: args.model,
      });

      const structuredContent = {
        message: result.message,
        xpReward: result.xpReward,
        quiz: result.quiz,
      };

      return {
        content: [
          {
            type: 'text',
            text: `${result.message}\nQuiz ID: ${result.quiz.id}\nXP Reward: ${result.xpReward}`,
          },
        ],
        structuredContent,
      };
    }
  );

  server.registerTool(
    'chat_with_student',
    {
      title: 'Tutor Chat Message',
      description: 'Send a tutoring message and get the AI reply while logging chat history',
      inputSchema: {
        userId: z.string().min(1).describe('Supabase user id'),
        message: z.string().min(1).describe('Student message to respond to'),
        topic: z.string().optional().describe('Optional conversation topic'),
        persona: z.enum(['friendly', 'strict', 'fun', 'scholar']).optional().describe('Tutor persona override'),
        context: z.array(z.string()).optional().describe('Optional context messages to include'),
        model: z.string().optional().describe('Gemini model override for this request'),
      },
      outputSchema: {
        reply: z.string(),
        xpGained: z.number(),
        messageId: z.string(),
        timestamp: z.string().nullable().optional(),
      },
    },
    async (args): Promise<ToolResult> => {
      const result = await backend.sendChatMessage({
        userId: args.userId,
        message: args.message,
        topic: args.topic,
        persona: args.persona as Persona | undefined,
        context: args.context,
        model: args.model,
      });

      const structuredContent = {
        reply: result.reply,
        xpGained: result.xpGained,
        messageId: String(result.messageId),
        timestamp: result.timestamp ?? null,
      };

      return {
        content: [
          {
            type: 'text',
            text: result.reply,
          },
        ],
        structuredContent,
      };
    }
  );
}

export const configSchema = exportedConfigSchema;

export default function createServer({ config }: { config?: unknown } = {}) {
  const resolvedConfig = resolveConfig(config);
  const supabase = createSupabaseClient(resolvedConfig);
  const gemini = new GeminiProvider(resolvedConfig.geminiApiKey, resolvedConfig.geminiModel);
  const backend = new LearningCoachBackend(supabase, gemini);

  const server = new McpServer(
    {
      name: 'ai-learning-coach-mcp',
      version: '0.1.0',
    },
    {
      instructions:
        'Tools for interacting with the AI Learning Coach backend. Configure Supabase and Gemini credentials via smithery config or environment variables.',
    }
  );

  registerTools(server, backend);

  return server;
}

