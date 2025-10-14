export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Lesson {
  id: string;
  user_id: string;
  topic: string;
  subject: string;
  difficulty: Difficulty;
  difficulty_numeric?: number; // 1-3
  duration: number; // in minutes
  estimated_minutes?: number;
  content: string;
  objectives: string[];
  key_points: string[];
  xp_reward: number;
  xp_base?: number;
  slug?: string;
  subtitle?: string;
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
  id?: string;
  user_id?: string;
  lesson_id: string;
  completed?: boolean;
  is_completed?: boolean;
  time_spent: number; // in seconds
  time_spent_seconds?: number;
  quiz_score: number | null;
  completed_at: string | null;
  last_section?: string | null;
  percent_complete?: number;
  download_count?: number;
  created_at?: string;
  updated_at?: string;
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

export interface UserNote {
  id: string;
  user_id: string;
  lesson_id: string;
  section_anchor: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface UserHighlight {
  id: string;
  user_id: string;
  lesson_id: string;
  section_anchor: string | null;
  snippet: string;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  lesson_id: string;
  question_id: string;
  question_text: string;
  selected_option: string;
  correct: boolean;
  score: number;
  timestamp: string;
}

export interface GeneratedSummary {
  id: string;
  user_id: string;
  lesson_id: string;
  section_anchor: string | null;
  summary_content: string;
  created_at: string;
}

