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
      whiteboard_sessions: {
        Row: {
          id: string
          title: string
          topic: string
          host_id: string
          host_name: string
          is_active: boolean
          max_participants: number
          current_participants: number
          room_code: string | null
          is_joinable: boolean
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          topic: string
          host_id: string
          host_name: string
          is_active?: boolean
          max_participants?: number
          current_participants?: number
          room_code?: string | null
          is_joinable?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          topic?: string
          host_id?: string
          host_name?: string
          is_active?: boolean
          max_participants?: number
          current_participants?: number
          room_code?: string | null
          is_joinable?: boolean
          settings?: Json
          updated_at?: string
        }
      }
      whiteboard_participants: {
        Row: {
          id: string
          session_id: string
          user_id: string
          user_name: string
          user_avatar: string | null
          role: 'host' | 'teacher' | 'student'
          joined_at: string
          is_active: boolean
          cursor_position: Json | null
          color: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          user_name: string
          user_avatar?: string | null
          role?: 'host' | 'teacher' | 'student'
          joined_at?: string
          is_active?: boolean
          cursor_position?: Json | null
          color?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          user_name?: string
          user_avatar?: string | null
          role?: 'host' | 'teacher' | 'student'
          joined_at?: string
          is_active?: boolean
          cursor_position?: Json | null
          color?: string
        }
      }
      whiteboard_elements: {
        Row: {
          id: string
          session_id: string
          type: 'drawing' | 'text' | 'shape' | 'image'
          data: Json
          created_by: string
          created_at: string
          updated_at: string
          layer: number
          visible: boolean
        }
        Insert: {
          id?: string
          session_id: string
          type: 'drawing' | 'text' | 'shape' | 'image'
          data: Json
          created_by: string
          created_at?: string
          updated_at?: string
          layer?: number
          visible?: boolean
        }
        Update: {
          id?: string
          session_id?: string
          type?: 'drawing' | 'text' | 'shape' | 'image'
          data?: Json
          created_by?: string
          created_at?: string
          updated_at?: string
          layer?: number
          visible?: boolean
        }
      }
      whiteboard_messages: {
        Row: {
          id: string
          session_id: string
          user_id: string
          user_name: string
          message: string
          timestamp: string
          type: 'chat' | 'system' | 'ai'
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          user_name: string
          message: string
          timestamp?: string
          type?: 'chat' | 'system' | 'ai'
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          user_name?: string
          message?: string
          timestamp?: string
          type?: 'chat' | 'system' | 'ai'
        }
      }
      friend_invitations: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string | null
          session_id: string
          invitation_type: 'global' | 'facebook'
          facebook_friend_id: string | null
          status: 'pending' | 'accepted' | 'declined'
          message: string | null
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id?: string | null
          session_id: string
          invitation_type: 'global' | 'facebook'
          facebook_friend_id?: string | null
          status?: 'pending' | 'accepted' | 'declined'
          message?: string | null
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string | null
          session_id?: string
          invitation_type?: 'global' | 'facebook'
          facebook_friend_id?: string | null
          status?: 'pending' | 'accepted' | 'declined'
          message?: string | null
          created_at?: string
          expires_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_whiteboard_session_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      join_whiteboard_session_by_code: {
        Args: {
          session_code: string
          user_id_param: string
          user_name_param: string
          user_avatar_param?: string | null
          role_param?: string
        }
        Returns: {
          session_id: string
          session_title: string
          session_topic: string
          participant_id: string
        }[]
      }
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

