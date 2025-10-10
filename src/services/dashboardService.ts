import { supabase } from '../lib/supabaseClient';
import { GamificationService } from './gamificationService';
import type { DashboardStats } from '../types/gamification';

/**
 * Dashboard Service
 * Aggregates user statistics and activity data
 */

export class DashboardService {
  /**
   * Get comprehensive dashboard statistics
   */
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      const [
        userProfile,
        lessonsStats,
        quizzesStats,
        badges,
        recentActivity,
      ] = await Promise.all([
        this.getUserProfile(userId),
        this.getLessonsStats(userId),
        this.getQuizzesStats(userId),
        this.getUserBadges(userId),
        this.getRecentActivity(userId),
      ]);

      const levelInfo = GamificationService.getLevelInfo(userProfile.xp);

      return {
        user: {
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          avatar_url: userProfile.avatar_url,
          persona: userProfile.persona,
        },
        xp: {
          total: userProfile.xp,
          level: userProfile.level,
          xp_for_next_level: levelInfo.xp_for_next_level,
          progress_percentage: levelInfo.progress_percentage,
        },
        streak: {
          current: userProfile.streak,
          longest: userProfile.streak, // TODO: Track longest streak separately
          last_activity: userProfile.updated_at,
        },
        lessons: lessonsStats,
        quizzes: quizzesStats,
        badges: {
          total: badges.length,
          recent: badges.slice(0, 5).map((badge) => ({
            name: badge.badge_name,
            icon: badge.badge_icon,
            earned_at: badge.earned_at,
          })),
        },
        recent_activity: recentActivity,
      };
    } catch (error: any) {
      console.error('Get dashboard stats error:', error);
      throw new Error(error.message || 'Failed to fetch dashboard statistics');
    }
  }

  /**
   * Get user profile data
   */
  private static async getUserProfile(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get lessons statistics
   */
  private static async getLessonsStats(userId: string): Promise<{
    total: number;
    completed: number;
    in_progress: number;
    completion_rate: number;
  }> {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('user_id', userId);

    const { data: progress } = await supabase
      .from('user_progress')
      .select('completed')
      .eq('user_id', userId);

    const total = lessons?.length || 0;
    const completed = progress?.filter((p) => p.completed).length || 0;
    const inProgress = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      in_progress: inProgress,
      completion_rate: completionRate,
    };
  }

  /**
   * Get quizzes statistics
   */
  private static async getQuizzesStats(userId: string): Promise<{
    total: number;
    completed: number;
    average_score: number;
    perfect_scores: number;
  }> {
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('id')
      .eq('user_id', userId);

    const { data: progress } = await supabase
      .from('user_progress')
      .select('quiz_score')
      .eq('user_id', userId)
      .not('quiz_score', 'is', null);

    const total = quizzes?.length || 0;
    const completed = progress?.length || 0;
    const perfectScores = progress?.filter((p) => p.quiz_score === 100).length || 0;

    let averageScore = 0;
    if (progress && progress.length > 0) {
      const totalScore = progress.reduce((sum, p) => sum + (p.quiz_score || 0), 0);
      averageScore = Math.round(totalScore / progress.length);
    }

    return {
      total,
      completed,
      average_score: averageScore,
      perfect_scores: perfectScores,
    };
  }

  /**
   * Get user badges
   */
  private static async getUserBadges(userId: string): Promise<any[]> {
    const { data } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    return data || [];
  }

  /**
   * Get recent activity
   */
  private static async getRecentActivity(userId: string): Promise<
    Array<{
      type: string;
      description: string;
      timestamp: string;
      xp_gained: number;
    }>
  > {
    const activities: Array<{
      type: string;
      description: string;
      timestamp: string;
      xp_gained: number;
    }> = [];

    // Get recent lessons
    const { data: recentLessons } = await supabase
      .from('lessons')
      .select('topic, xp_reward, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentLessons) {
      recentLessons.forEach((lesson) => {
        activities.push({
          type: 'lesson_created',
          description: `Created lesson: ${lesson.topic}`,
          timestamp: lesson.created_at,
          xp_gained: 10,
        });
      });
    }

    // Get recent completed lessons
    const { data: completedLessons } = await supabase
      .from('user_progress')
      .select(
        `
        completed_at,
        lessons (
          topic,
          xp_reward
        )
      `
      )
      .eq('user_id', userId)
      .eq('completed', true)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(5);

    if (completedLessons) {
      completedLessons.forEach((progress: any) => {
        const lesson = Array.isArray(progress.lessons) 
          ? progress.lessons[0] 
          : progress.lessons;
        
        if (lesson) {
          activities.push({
            type: 'lesson_completed',
            description: `Completed lesson: ${lesson.topic}`,
            timestamp: progress.completed_at,
            xp_gained: lesson.xp_reward || 50,
          });
        }
      });
    }

    // Get recent chat messages
    const { data: recentChats } = await supabase
      .from('chat_history')
      .select('message, xp_gained, timestamp')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(5);

    if (recentChats) {
      recentChats.forEach((chat) => {
        activities.push({
          type: 'chat_message',
          description: `Asked: ${chat.message.substring(0, 50)}${chat.message.length > 50 ? '...' : ''}`,
          timestamp: chat.timestamp,
          xp_gained: chat.xp_gained,
        });
      });
    }

    // Get recent badges
    const { data: recentBadges } = await supabase
      .from('badges')
      .select('badge_name, badge_icon, earned_at')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })
      .limit(5);

    if (recentBadges) {
      recentBadges.forEach((badge) => {
        activities.push({
          type: 'badge_earned',
          description: `Earned badge: ${badge.badge_icon} ${badge.badge_name}`,
          timestamp: badge.earned_at,
          xp_gained: 0,
        });
      });
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Return top 20 most recent
    return activities.slice(0, 20);
  }

  /**
   * Get learning analytics
   */
  static async getLearningAnalytics(userId: string): Promise<{
    total_study_time: number;
    average_session_time: number;
    most_studied_subjects: Array<{ subject: string; count: number }>;
    completion_trend: Array<{ date: string; completed: number }>;
    quiz_performance_trend: Array<{ date: string; score: number }>;
  }> {
    try {
      // Get total study time
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('time_spent')
        .eq('user_id', userId);

      const totalStudyTime = progressData?.reduce((sum, p) => sum + (p.time_spent || 0), 0) || 0;
      const averageSessionTime = progressData && progressData.length > 0
        ? Math.round(totalStudyTime / progressData.length)
        : 0;

      // Get most studied subjects
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('subject')
        .eq('user_id', userId);

      const subjectCounts: Record<string, number> = {};
      lessonsData?.forEach((lesson) => {
        subjectCounts[lesson.subject] = (subjectCounts[lesson.subject] || 0) + 1;
      });

      const mostStudiedSubjects = Object.entries(subjectCounts)
        .map(([subject, count]) => ({ subject, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get completion trend (last 30 days)
      const completionTrend = await this.getCompletionTrend(userId, 30);

      // Get quiz performance trend (last 30 days)
      const quizPerformanceTrend = await this.getQuizPerformanceTrend(userId, 30);

      return {
        total_study_time: totalStudyTime,
        average_session_time: averageSessionTime,
        most_studied_subjects: mostStudiedSubjects,
        completion_trend: completionTrend,
        quiz_performance_trend: quizPerformanceTrend,
      };
    } catch (error: any) {
      console.error('Get learning analytics error:', error);
      throw new Error(error.message || 'Failed to fetch learning analytics');
    }
  }

  /**
   * Get completion trend over time
   */
  private static async getCompletionTrend(
    userId: string,
    days: number
  ): Promise<Array<{ date: string; completed: number }>> {
    const { data } = await supabase
      .from('user_progress')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('completed', true)
      .not('completed_at', 'is', null)
      .gte('completed_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (!data) return [];

    // Group by date
    const dateCounts: Record<string, number> = {};
    data.forEach((progress) => {
      const date = new Date(progress.completed_at).toISOString().split('T')[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    return Object.entries(dateCounts)
      .map(([date, completed]) => ({ date, completed }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get quiz performance trend over time
   */
  private static async getQuizPerformanceTrend(
    userId: string,
    days: number
  ): Promise<Array<{ date: string; score: number }>> {
    const { data } = await supabase
      .from('user_progress')
      .select('quiz_score, updated_at')
      .eq('user_id', userId)
      .not('quiz_score', 'is', null)
      .gte('updated_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (!data) return [];

    // Group by date and average scores
    const dateScores: Record<string, number[]> = {};
    data.forEach((progress) => {
      const date = new Date(progress.updated_at).toISOString().split('T')[0];
      if (!dateScores[date]) dateScores[date] = [];
      dateScores[date].push(progress.quiz_score || 0);
    });

    return Object.entries(dateScores)
      .map(([date, scores]) => ({
        date,
        score: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export default DashboardService;

