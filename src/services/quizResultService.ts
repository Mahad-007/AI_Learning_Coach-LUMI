import { supabase } from '../lib/supabaseClient';
import { XPUpdateService } from './xpUpdateService';

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
      const baseXP = {
        beginner: 10,
        intermediate: 15,
        advanced: 25,
      };
      
      const xpPerCorrect = baseXP[quizData.difficulty];
      const earnedXP = quizData.correctAnswers * xpPerCorrect;
      const perfectBonus = quizData.correctAnswers === quizData.totalQuestions ? 20 : 0;
      const xpEarned = earnedXP + perfectBonus;

      console.log(`[QuizResultService] Quiz XP calculation:`, {
        difficulty: quizData.difficulty,
        correct: quizData.correctAnswers,
        total: quizData.totalQuestions,
        basePerQuestion: xpPerCorrect,
        earned: earnedXP,
        perfectBonus,
        total: xpEarned
      });

      // Award XP using dedicated service
      const xpResult = await XPUpdateService.addXP(userId, xpEarned, `quiz_${quizData.difficulty}`);

      // Save quiz result if table exists
      let quizResultId = 'unknown';
      try {
        const { data: quizResult, error: insertError } = await supabase
          .from('quiz_results')
          .insert({
            user_id: userId,
            quiz_type: quizData.quizType,
            topic: quizData.topic,
            difficulty: quizData.difficulty,
            total_questions: quizData.totalQuestions,
            correct_answers: quizData.correctAnswers,
            score_percentage: Math.round((quizData.correctAnswers / quizData.totalQuestions) * 100),
            xp_earned: xpEarned,
            completed_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (insertError) {
          console.warn('[QuizResultService] quiz_results table might not exist:', insertError.message);
        } else {
          quizResultId = quizResult?.id || 'unknown';
        }
      } catch (err) {
        console.warn('[QuizResultService] Could not save to quiz_results:', err);
      }

      return {
        quizId: quizResultId,
        xpEarned,
        newXP: xpResult.newXP,
        newLevel: Math.floor(Math.sqrt(xpResult.newXP / 100)) + 1,
        leveledUp: xpResult.levelChanged,
      };
    } catch (error) {
      console.error('[QuizResultService] Failed to complete quiz:', error);
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

