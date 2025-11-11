import { supabase } from '../lib/supabaseClient';

export interface DailyProgress {
  date: string;
  xp_gained: number;
  lessons_completed: number;
  quizzes_taken: number;
  chat_messages: number;
  badges_earned: number;
  study_time_minutes: number;
  activity_count: number;
}

export interface ProgressCalendarData {
  daily_progress: DailyProgress[];
  total_days: number;
  active_days: number;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  total_lessons: number;
  total_quizzes: number;
  total_chat_messages: number;
  total_badges: number;
  total_study_time: number;
}

export class ProgressTrackingService {
  /**
   * Get comprehensive progress data for calendar visualization
   */
  static async getProgressCalendarData(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ProgressCalendarData> {
    try {
      const start = startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
      const end = endDate || new Date().toISOString();

      const [
        dailyProgress,
        totalStats,
        streakData
      ] = await Promise.all([
        this.getDailyProgress(userId, start, end),
        this.getTotalStats(userId),
        this.getStreakData(userId)
      ]);

      return {
        daily_progress: dailyProgress,
        total_days: this.calculateTotalDays(start, end),
        active_days: dailyProgress.filter(day => day.activity_count > 0).length,
        current_streak: streakData.current_streak,
        longest_streak: streakData.longest_streak,
        total_xp: totalStats.total_xp,
        total_lessons: totalStats.total_lessons,
        total_quizzes: totalStats.total_quizzes,
        total_chat_messages: totalStats.total_chat_messages,
        total_badges: totalStats.total_badges,
        total_study_time: totalStats.total_study_time,
      };
    } catch (error: any) {
      console.error('Get progress calendar data error:', error);
      throw new Error(error.message || 'Failed to fetch progress calendar data');
    }
  }

  /**
   * Get daily progress data for a date range
   */
  private static async getDailyProgress(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<DailyProgress[]> {
    // Get all activities in the date range
    const [lessonsData, quizzesData, chatData, badgesData, progressData] = await Promise.all([
      // Completed lessons
      supabase
        .from('user_progress')
        .select('completed_at, lessons(topic, xp_reward)')
        .eq('user_id', userId)
        .eq('completed', true)
        .not('completed_at', 'is', null)
        .gte('completed_at', startDate)
        .lte('completed_at', endDate),

      // Quiz results
      supabase
        .from('quiz_results')
        .select('created_at, score_percentage')
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate),

      // Chat messages
      supabase
        .from('chat_history')
        .select('timestamp, xp_gained')
        .eq('user_id', userId)
        .gte('timestamp', startDate)
        .lte('timestamp', endDate),

      // Badges earned
      supabase
        .from('badges')
        .select('earned_at')
        .eq('user_id', userId)
        .gte('earned_at', startDate)
        .lte('earned_at', endDate),

      // Study time from progress
      supabase
        .from('user_progress')
        .select('time_spent, updated_at')
        .eq('user_id', userId)
        .gte('updated_at', startDate)
        .lte('updated_at', endDate)
    ]);

    // Process data by date
    const dateMap = new Map<string, DailyProgress>();

    // Initialize all dates in range
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, {
        date: dateStr,
        xp_gained: 0,
        lessons_completed: 0,
        quizzes_taken: 0,
        chat_messages: 0,
        badges_earned: 0,
        study_time_minutes: 0,
        activity_count: 0
      });
    }

    // Process lessons
    if (lessonsData.data) {
      lessonsData.data.forEach((progress: any) => {
        const date = new Date(progress.completed_at).toISOString().split('T')[0];
        const existing = dateMap.get(date);
        if (existing) {
          existing.lessons_completed++;
          existing.xp_gained += progress.lessons?.xp_reward || 50;
          existing.activity_count++;
        }
      });
    }

    // Process quizzes
    if (quizzesData.data) {
      quizzesData.data.forEach((quiz: any) => {
        const date = new Date(quiz.created_at).toISOString().split('T')[0];
        const existing = dateMap.get(date);
        if (existing) {
          existing.quizzes_taken++;
          existing.activity_count++;
        }
      });
    }

    // Process chat messages
    if (chatData.data) {
      chatData.data.forEach((chat: any) => {
        const date = new Date(chat.timestamp).toISOString().split('T')[0];
        const existing = dateMap.get(date);
        if (existing) {
          existing.chat_messages++;
          existing.xp_gained += chat.xp_gained || 5;
          existing.activity_count++;
        }
      });
    }

    // Process badges
    if (badgesData.data) {
      badgesData.data.forEach((badge: any) => {
        const date = new Date(badge.earned_at).toISOString().split('T')[0];
        const existing = dateMap.get(date);
        if (existing) {
          existing.badges_earned++;
          existing.activity_count++;
        }
      });
    }

    // Process study time
    if (progressData.data) {
      progressData.data.forEach((progress: any) => {
        const date = new Date(progress.updated_at).toISOString().split('T')[0];
        const existing = dateMap.get(date);
        if (existing) {
          existing.study_time_minutes += Math.round((progress.time_spent || 0) / 60);
        }
      });
    }

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get total statistics
   */
  private static async getTotalStats(userId: string): Promise<{
    total_xp: number;
    total_lessons: number;
    total_quizzes: number;
    total_chat_messages: number;
    total_badges: number;
    total_study_time: number;
  }> {
    const [userData, lessonsData, quizzesData, chatData, badgesData, progressData] = await Promise.all([
      supabase.from('users').select('xp').eq('id', userId).single(),
      supabase.from('user_progress').select('id').eq('user_id', userId).eq('completed', true),
      supabase.from('quiz_results').select('id').eq('user_id', userId),
      supabase.from('chat_history').select('id').eq('user_id', userId),
      supabase.from('badges').select('id').eq('user_id', userId),
      supabase.from('user_progress').select('time_spent').eq('user_id', userId)
    ]);

    const totalStudyTime = progressData.data?.reduce((sum, p) => sum + (p.time_spent || 0), 0) || 0;

    return {
      total_xp: userData.data?.xp || 0,
      total_lessons: lessonsData.data?.length || 0,
      total_quizzes: quizzesData.data?.length || 0,
      total_chat_messages: chatData.data?.length || 0,
      total_badges: badgesData.data?.length || 0,
      total_study_time: Math.round(totalStudyTime / 60), // Convert to minutes
    };
  }

  /**
   * Get streak data
   */
  private static async getStreakData(userId: string): Promise<{
    current_streak: number;
    longest_streak: number;
  }> {
    // Get all days with activity
    const { data: activityDays } = await supabase
      .from('user_progress')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('completed', true)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false });

    if (!activityDays || activityDays.length === 0) {
      return { current_streak: 0, longest_streak: 0 };
    }

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const uniqueDays = new Set(
      activityDays.map(day => new Date(day.completed_at).toISOString().split('T')[0])
    );

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (uniqueDays.has(dateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    const sortedDays = Array.from(uniqueDays).sort();
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = new Date(sortedDays[i - 1]);
      const currDate = new Date(sortedDays[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      current_streak: currentStreak,
      longest_streak: longestStreak
    };
  }

  /**
   * Calculate total days in range
   */
  private static calculateTotalDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Get progress summary for a specific date range
   */
  static async getProgressSummary(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    total_activities: number;
    total_xp: number;
    average_daily_xp: number;
    most_active_day: string;
    least_active_day: string;
  }> {
    const progressData = await this.getDailyProgress(userId, startDate, endDate);
    
    const totalActivities = progressData.reduce((sum, day) => sum + day.activity_count, 0);
    const totalXp = progressData.reduce((sum, day) => sum + day.xp_gained, 0);
    const averageDailyXp = progressData.length > 0 ? Math.round(totalXp / progressData.length) : 0;
    
    const mostActiveDay = progressData.reduce((max, day) => 
      day.activity_count > max.activity_count ? day : max, 
      progressData[0] || { date: '', activity_count: 0 }
    );
    
    const leastActiveDay = progressData.reduce((min, day) => 
      day.activity_count < min.activity_count ? day : min, 
      progressData[0] || { date: '', activity_count: 0 }
    );

    return {
      total_activities,
      total_xp: totalXp,
      average_daily_xp: averageDailyXp,
      most_active_day: mostActiveDay.date,
      least_active_day: leastActiveDay.date,
    };
  }
}

export default ProgressTrackingService;
