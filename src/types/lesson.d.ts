export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Lesson {
  id: string;
  user_id: string;
  topic: string;
  subject: string;
  difficulty: Difficulty;
  duration: number; // in minutes
  content: string;
  objectives: string[];
  key_points: string[];
  xp_reward: number;
  created_at: string;
  updated_at: string;
}

export interface LessonGenerateRequest {
  subject: string;
  topic: string;
  difficulty: Difficulty;
  duration: number;
  persona?: Persona;
}

export interface LessonGenerateResponse {
  lesson: Lesson;
  message: string;
}

export interface LessonProgress {
  lesson_id: string;
  completed: boolean;
  time_spent: number;
  quiz_score: number | null;
  completed_at: string | null;
}

export interface LessonWithProgress extends Lesson {
  progress: LessonProgress | null;
}

export interface GeneratedLessonContent {
  introduction: string;
  objectives: string[];
  key_points: string[];
  detailed_content: string;
  summary: string;
  practice_exercises?: string[];
}

