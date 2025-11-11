export type ActivityType = 
  | 'lesson_complete'
  | 'quiz_complete'
  | 'perfect_quiz'
  | 'chat_message'
  | 'daily_streak'
  | 'lesson_created'
  | 'first_lesson'
  | 'milestone_reached';

export interface XPReward {
  activity: ActivityType;
  base_xp: number;
  multiplier: number;
  bonus_xp: number;
  total_xp: number;
}

export interface LevelSystem {
  level: number;
  xp_required: number;
  xp_current: number;
  xp_for_next_level: number;
  progress_percentage: number;
}

export interface StreakInfo {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  streak_bonus_xp: number;
}

export interface GamificationUpdate {
  user_id: string;
  activity_type: ActivityType;
  xp_gained: number;
  new_xp: number;
  new_level: number;
  level_up: boolean;
  streak_updated: boolean;
  new_streak: number;
  badges_earned: string[];
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  user_name: string;
  avatar_url: string | null;
  total_xp: number;
  rank: number;
  weekly_xp: number;
  monthly_xp: number;
  level: number;
  badges_count: number;
}

export interface LeaderboardResponse {
  global: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  user_position: LeaderboardEntry | null;
}

export interface DashboardStats {
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    persona: string;
  };
  xp: {
    total: number;
    level: number;
    xp_for_next_level: number;
    progress_percentage: number;
  };
  lessons: {
    total: number;
    completed: number;
    in_progress: number;
    completion_rate: number;
  };
  quizzes: {
    total: number;
    completed: number;
    average_score: number;
    perfect_scores: number;
  };
  badges: {
    total: number;
    recent: Array<{
      name: string;
      icon: string;
      earned_at: string;
    }>;
  };
  recent_activity: Array<{
    type: string;
    description: string;
    timestamp: string;
    xp_gained: number;
  }>;
}

