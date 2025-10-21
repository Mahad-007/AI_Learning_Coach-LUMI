export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  user_id: string;
  questions: QuizQuestion[];
  xp_reward: number;
  created_at: string;
  updated_at: string;
}

export interface QuizGenerateRequest {
  lesson_id: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  num_questions?: number;
  topic: string;
}

export interface QuizGenerateResponse {
  quiz: Quiz;
  message: string;
}

export interface QuizSubmission {
  quiz_id: string;
  answers: Record<number, string>; // question index -> selected answer
}

export interface QuizResult {
  quiz_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  correct_answers: number[];
  xp_earned: number;
  results: QuizQuestionResult[];
}

export interface QuizQuestionResult {
  question: string;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation?: string;
}

export interface AdaptiveQuizRequest {
  lesson_id: string;
  previous_performance?: number; // 0-100
  focus_areas?: string[];
}

