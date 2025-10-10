import { supabase } from '../lib/supabaseClient';

/**
 * XP Service
 * Handles all XP awarding and level calculations
 */

export class XPService {
  /**
   * Award XP to a user
   */
  static async awardXP(userId: string, xpAmount: number): Promise<{
    new_xp: number;
    new_level: number;
    leveled_up: boolean;
  }> {
    try {
      const { data, error } = await supabase.rpc('award_xp_to_user', {
        p_user_id: userId,
        p_xp_amount: xpAmount,
      });

      if (error) throw error;

      return {
        new_xp: data[0].new_xp,
        new_level: data[0].new_level,
        leveled_up: data[0].leveled_up,
      };
    } catch (error) {
      console.error('Failed to award XP:', error);
      throw error;
    }
  }

  /**
   * Calculate XP for quiz based on difficulty and performance
   */
  static calculateQuizXP(
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    correctAnswers: number,
    totalQuestions: number
  ): number {
    // Base XP per difficulty
    const baseXP = {
      beginner: 10,
      intermediate: 15,
      advanced: 25,
    };

    // XP per correct answer based on difficulty
    const xpPerCorrect = baseXP[difficulty];
    
    // Calculate total XP
    const earnedXP = correctAnswers * xpPerCorrect;

    // Bonus for perfect score
    const perfectBonus = correctAnswers === totalQuestions ? 20 : 0;

    return earnedXP + perfectBonus;
  }

  /**
   * Get XP needed for next level
   */
  static getXPForNextLevel(currentLevel: number): number {
    // Formula: XP needed = (level^2) * 100
    return currentLevel * currentLevel * 100;
  }

  /**
   * Get progress percentage to next level
   */
  static getLevelProgress(currentXP: number, currentLevel: number): number {
    const currentLevelXP = (currentLevel - 1) * (currentLevel - 1) * 100;
    const nextLevelXP = currentLevel * currentLevel * 100;
    const xpIntoCurrentLevel = currentXP - currentLevelXP;
    const xpNeededForLevel = nextLevelXP - currentLevelXP;
    
    return Math.min(100, Math.max(0, (xpIntoCurrentLevel / xpNeededForLevel) * 100));
  }

  /**
   * Calculate level from XP
   */
  static calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }
}

export default XPService;

