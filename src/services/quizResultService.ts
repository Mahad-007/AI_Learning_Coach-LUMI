import { supabase } from '../lib/supabaseClient';
import { XPService } from './xpService';

/**
 * Quiz Result Service
 * Handles quiz completion, scoring, and XP awards
 */

export class QuizResultService {
  /**
   * Complete a quiz and save results
   */
  static async completeQuiz(
    userId: string,
    quizData: {
      quizType: 'from_chat' | 'by_topic';
      topic: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      totalQuestions: number;
      correctAnswers: number;
    }
  ): Promise<{
    quizId: string;
    xpEarned: number;
    newXP: number;
    newLevel: number;
    leveledUp: boolean;
  }> {
    try {
      // Calculate XP based on difficulty and performance
      const xpEarned = XPService.calculateQuizXP(
        quizData.difficulty,
        quizData.correctAnswers,
        quizData.totalQuestions
      );

      // Save quiz result and award XP
      const { data, error } = await supabase.rpc('complete_quiz', {
        p_user_id: userId,
        p_quiz_type: quizData.quizType,
        p_topic: quizData.topic,
        p_difficulty: quizData.difficulty,
        p_total_questions: quizData.totalQuestions,
        p_correct_answers: quizData.correctAnswers,
        p_xp_earned: xpEarned,
      });

      if (error) throw error;

      // Get updated user stats
      const xpResult = await XPService.awardXP(userId, 0); // Just to get current stats

      return {
        quizId: data,
        xpEarned,
        newXP: xpResult.new_xp,
        newLevel: xpResult.new_level,
        leveledUp: xpResult.leveled_up,
      };
    } catch (error) {
      console.error('Failed to complete quiz:', error);
      throw error;
    }
  }

  /**
   * Get user's quiz statistics
   */
  static async getUserQuizStats(userId: string): Promise<{
    totalCompleted: number;
    totalPassed: number;
    averageScore: number;
    totalXPFromQuizzes: number;
  }> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('quizzes_completed, quizzes_passed, total_quiz_score')
        .eq('id', userId)
        .single();

      const { data: results } = await supabase
        .from('quiz_results')
        .select('xp_earned, score_percentage')
        .eq('user_id', userId);

      const totalXP = results?.reduce((sum, r) => sum + r.xp_earned, 0) || 0;
      const avgScore = results?.length 
        ? results.reduce((sum, r) => sum + r.score_percentage, 0) / results.length 
        : 0;

      return {
        totalCompleted: user?.quizzes_completed || 0,
        totalPassed: user?.quizzes_passed || 0,
        averageScore: avgScore,
        totalXPFromQuizzes: totalXP,
      };
    } catch (error) {
      console.error('Failed to get quiz stats:', error);
      return {
        totalCompleted: 0,
        totalPassed: 0,
        averageScore: 0,
        totalXPFromQuizzes: 0,
      };
    }
  }

  /**
   * Get recent quiz results
   */
  static async getRecentQuizzes(userId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get recent quizzes:', error);
      return [];
    }
  }
}

export default QuizResultService;

