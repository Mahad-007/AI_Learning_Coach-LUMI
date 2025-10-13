import { supabase } from '../lib/supabaseClient';
import type {
  ActivityType,
  XPReward,
  LevelSystem,
  StreakInfo,
  GamificationUpdate,
} from '../types/gamification';
import type { Badge } from '../types/user';
import { LeaderboardService } from './leaderboardService';

/**
 * Gamification Service
 * Handles XP, levels, streaks, and badges
 */

export class GamificationService {
  // XP rewards for different activities
  private static readonly XP_REWARDS: Record<ActivityType, number> = {
    lesson_complete: 50,
    quiz_complete: 30,
    perfect_quiz: 50,
    chat_message: 5,
    daily_streak: 20,
    lesson_created: 10,
    first_lesson: 100,
    milestone_reached: 100,
  };

  /**
   * Award XP for an activity
   */
  static async awardXP(
    userId: string,
    activityType: ActivityType,
    multiplier: number = 1.0
  ): Promise<GamificationUpdate> {
    try {
      // Get current user data
      const { data: user } = await supabase
        .from('users')
        .select('xp, level, streak')
        .eq('id', userId)
        .single();

      if (!user) throw new Error('User not found');

      // Calculate XP reward
      const baseXP = this.XP_REWARDS[activityType] || 0;
      const streakBonus = this.calculateStreakBonus(user.streak);
      const bonusXP = Math.floor(baseXP * streakBonus);
      const totalXP = Math.floor((baseXP + bonusXP) * multiplier);

      const newXP = user.xp + totalXP;
      const oldLevel = user.level;
      const newLevel = this.calculateLevel(newXP);
      const levelUp = newLevel > oldLevel;

      // Update user XP and level
      await supabase
        .from('users')
        .update({
          xp: newXP,
          level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      // Update leaderboard
      await this.updateLeaderboard(userId, newXP);

      // Update weekly and monthly XP
      await LeaderboardService.updateWeeklyXP(userId, totalXP);
      await LeaderboardService.updateMonthlyXP(userId, totalXP);

      // Check for new badges
      const newBadges = await this.checkAndAwardBadges(userId, newLevel, newXP);

      return {
        user_id: userId,
        activity_type: activityType,
        xp_gained: totalXP,
        new_xp: newXP,
        new_level: newLevel,
        level_up: levelUp,
        streak_updated: false,
        new_streak: user.streak,
        badges_earned: newBadges.map((b) => b.badge_name),
      };
    } catch (error: any) {
      console.error('Award XP error:', error);
      throw new Error(error.message || 'Failed to award XP');
    }
  }

  /**
   * Update daily streak
   */
  static async updateStreak(userId: string): Promise<StreakInfo> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('streak, updated_at')
        .eq('id', userId)
        .single();

      if (!user) throw new Error('User not found');

      const lastActivity = new Date(user.updated_at);
      const now = new Date();
      const daysDiff = Math.floor(
        (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );

      let newStreak = user.streak;
      let streakBonusXP = 0;

      if (daysDiff === 1) {
        // Consecutive day - increment streak
        newStreak = user.streak + 1;
        streakBonusXP = this.XP_REWARDS.daily_streak;

        await supabase
          .from('users')
          .update({
            streak: newStreak,
            xp: supabase.rpc('increment', { x: streakBonusXP }),
            updated_at: now.toISOString(),
          })
          .eq('id', userId);
      } else if (daysDiff > 1) {
        // Streak broken
        newStreak = 1;

        await supabase
          .from('users')
          .update({
            streak: newStreak,
            updated_at: now.toISOString(),
          })
          .eq('id', userId);
      }

      // Award streak milestone badges
      await this.checkStreakBadges(userId, newStreak);

      return {
        current_streak: newStreak,
        longest_streak: newStreak, // TODO: Track longest streak separately
        last_activity_date: now.toISOString(),
        streak_bonus_xp: streakBonusXP,
      };
    } catch (error: any) {
      console.error('Update streak error:', error);
      throw new Error(error.message || 'Failed to update streak');
    }
  }

  /**
   * Get level information for a user
   */
  static getLevelInfo(xp: number): LevelSystem {
    const level = this.calculateLevel(xp);
    const xpForCurrentLevel = this.getXPForLevel(level);
    const xpForNextLevel = this.getXPForLevel(level + 1);
    const xpRequired = xpForNextLevel - xpForCurrentLevel;
    const xpCurrent = xp - xpForCurrentLevel;
    const progressPercentage = Math.floor((xpCurrent / xpRequired) * 100);

    return {
      level,
      xp_required: xpRequired,
      xp_current: xpCurrent,
      xp_for_next_level: xpForNextLevel,
      progress_percentage: progressPercentage,
    };
  }

  /**
   * Get all badges for a user
   */
  static async getUserBadges(userId: string): Promise<Badge[]> {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      return data as Badge[];
    } catch (error: any) {
      console.error('Get user badges error:', error);
      throw new Error(error.message || 'Failed to fetch badges');
    }
  }

  /**
   * Calculate level from XP
   */
  static calculateLevel(xp: number): number {
    // Formula: level = floor(sqrt(xp / 100)) + 1
    // This means:
    // Level 1: 0-99 XP
    // Level 2: 100-399 XP
    // Level 3: 400-899 XP
    // Level 4: 900-1599 XP
    // etc.
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  /**
   * Get XP required for a specific level
   */
  static getXPForLevel(level: number): number {
    // Inverse of level formula
    return (level - 1) * (level - 1) * 100;
  }

  /**
   * Calculate streak bonus multiplier
   */
  private static calculateStreakBonus(streak: number): number {
    if (streak >= 30) return 0.5; // 50% bonus for 30+ day streak
    if (streak >= 14) return 0.3; // 30% bonus for 14+ day streak
    if (streak >= 7) return 0.2; // 20% bonus for 7+ day streak
    if (streak >= 3) return 0.1; // 10% bonus for 3+ day streak
    return 0; // No bonus for streaks < 3 days
  }

  /**
   * Update leaderboard entry
   */
  private static async updateLeaderboard(userId: string, totalXP: number): Promise<void> {
    try {
      // Check if user has leaderboard entry
      const { data: existingEntry } = await supabase
        .from('leaderboard')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingEntry) {
        // Update existing entry
        await supabase
          .from('leaderboard')
          .update({
            total_xp: totalXP,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      } else {
        // Create new entry
        await supabase.from('leaderboard').insert({
          user_id: userId,
          total_xp: totalXP,
          rank: 0, // Will be updated by periodic ranking job
        });
      }

      // Recalculate ranks (simplified - in production, use a scheduled job)
      await this.recalculateRanks();
    } catch (error) {
      console.error('Failed to update leaderboard:', error);
    }
  }

  /**
   * Recalculate leaderboard ranks
   */
  private static async recalculateRanks(): Promise<void> {
    try {
      const { data: entries } = await supabase
        .from('leaderboard')
        .select('id, user_id, total_xp')
        .order('total_xp', { ascending: false });

      if (!entries) return;

      // Update ranks
      for (let i = 0; i < entries.length; i++) {
        await supabase
          .from('leaderboard')
          .update({ rank: i + 1 })
          .eq('id', entries[i].id);
      }
    } catch (error) {
      console.error('Failed to recalculate ranks:', error);
    }
  }

  /**
   * Check and award new badges
   */
  private static async checkAndAwardBadges(
    userId: string,
    level: number,
    xp: number
  ): Promise<Badge[]> {
    const newBadges: Badge[] = [];

    try {
      // Level milestone badges
      const levelMilestones = [5, 10, 25, 50, 100];
      for (const milestone of levelMilestones) {
        if (level === milestone) {
          const badge = await this.awardBadge(userId, {
            badge_type: 'level_milestone',
            badge_name: `Level ${milestone}`,
            badge_description: `Reached level ${milestone}`,
            badge_icon: '⭐',
          });
          if (badge) newBadges.push(badge);
        }
      }

      // XP milestone badges
      const xpMilestones = [1000, 5000, 10000, 50000, 100000];
      for (const milestone of xpMilestones) {
        if (xp >= milestone && xp < milestone + 100) {
          const badge = await this.awardBadge(userId, {
            badge_type: 'xp_milestone',
            badge_name: `${milestone} XP`,
            badge_description: `Earned ${milestone} total XP`,
            badge_icon: '💎',
          });
          if (badge) newBadges.push(badge);
        }
      }

      return newBadges;
    } catch (error) {
      console.error('Failed to check badges:', error);
      return newBadges;
    }
  }

  /**
   * Check and award streak badges
   */
  private static async checkStreakBadges(userId: string, streak: number): Promise<void> {
    try {
      const streakMilestones = [
        { days: 7, name: 'Week Warrior', icon: '🔥' },
        { days: 30, name: 'Month Master', icon: '🌟' },
        { days: 100, name: 'Century Champion', icon: '👑' },
        { days: 365, name: 'Year Legend', icon: '🏆' },
      ];

      for (const milestone of streakMilestones) {
        if (streak === milestone.days) {
          await this.awardBadge(userId, {
            badge_type: 'streak',
            badge_name: milestone.name,
            badge_description: `Maintained a ${milestone.days}-day learning streak`,
            badge_icon: milestone.icon,
          });
        }
      }
    } catch (error) {
      console.error('Failed to check streak badges:', error);
    }
  }

  /**
   * Award a badge to a user
   */
  private static async awardBadge(
    userId: string,
    badgeData: {
      badge_type: string;
      badge_name: string;
      badge_description: string;
      badge_icon: string;
    }
  ): Promise<Badge | null> {
    try {
      // Check if user already has this badge
      const { data: existingBadge } = await supabase
        .from('badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_name', badgeData.badge_name)
        .single();

      if (existingBadge) return null;

      // Award new badge
      const { data: newBadge, error } = await supabase
        .from('badges')
        .insert({
          user_id: userId,
          ...badgeData,
        })
        .select()
        .single();

      if (error) throw error;

      return newBadge as Badge;
    } catch (error) {
      console.error('Failed to award badge:', error);
      return null;
    }
  }
}

export default GamificationService;

