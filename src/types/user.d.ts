export type Persona = 'friendly' | 'strict' | 'fun' | 'scholar';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak: number;
  persona: Persona;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  total_lessons: number;
  completed_lessons: number;
  total_quizzes: number;
  average_quiz_score: number;
  badges: Badge[];
  rank: number;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  earned_at: string;
}

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

