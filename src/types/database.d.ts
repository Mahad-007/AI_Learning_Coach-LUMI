export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url: string | null
          xp: number
          level: number
          streak: number
          persona: 'friendly' | 'strict' | 'fun' | 'scholar'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          avatar_url?: string | null
          xp?: number
          level?: number
          streak?: number
          persona?: 'friendly' | 'strict' | 'fun' | 'scholar'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          avatar_url?: string | null
          xp?: number
          level?: number
          streak?: number
          persona?: 'friendly' | 'strict' | 'fun' | 'scholar'
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          user_id: string
          topic: string
          subject: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          duration: number
          content: string
          objectives: string[]
          key_points: string[]
          xp_reward: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic: string
          subject: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          duration: number
          content: string
          objectives: string[]
          key_points: string[]
          xp_reward?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic?: string
          subject?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          duration?: number
          content?: string
          objectives?: string[]
          key_points?: string[]
          xp_reward?: number
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          lesson_id: string
          user_id: string
          questions: QuizQuestion[]
          xp_reward: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          user_id: string
          questions: QuizQuestion[]
          xp_reward?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          user_id?: string
          questions?: QuizQuestion[]
          xp_reward?: number
          updated_at?: string
        }
      }
      chat_history: {
        Row: {
          id: string
          user_id: string
          message: string
          response: string
          topic: string | null
          persona: 'friendly' | 'strict' | 'fun' | 'scholar'
          xp_gained: number
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          response: string
          topic?: string | null
          persona: 'friendly' | 'strict' | 'fun' | 'scholar'
          xp_gained?: number
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          response?: string
          topic?: string | null
          persona?: 'friendly' | 'strict' | 'fun' | 'scholar'
          xp_gained?: number
        }
      }
      leaderboard: {
        Row: {
          id: string
          user_id: string
          total_xp: number
          rank: number
          weekly_xp: number
          monthly_xp: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_xp: number
          rank: number
          weekly_xp?: number
          monthly_xp?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_xp?: number
          rank?: number
          weekly_xp?: number
          monthly_xp?: number
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          quiz_id: string | null
          quiz_score: number | null
          completed: boolean
          time_spent: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          quiz_id?: string | null
          quiz_score?: number | null
          completed?: boolean
          time_spent?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          quiz_id?: string | null
          quiz_score?: number | null
          completed?: boolean
          time_spent?: number
          completed_at?: string | null
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          user_id: string
          badge_type: string
          badge_name: string
          badge_description: string
          badge_icon: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_type: string
          badge_name: string
          badge_description: string
          badge_icon: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_type?: string
          badge_name?: string
          badge_description?: string
          badge_icon?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export interface QuizQuestion {
  question: string
  options: string[]
  correct_answer: string
  explanation?: string
}

