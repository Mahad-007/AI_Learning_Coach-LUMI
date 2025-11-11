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
    chat_message: 1, // 1 XP per chat message
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
        .single() as { data: { xp: number; level: number; streak: number } | null };

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
        } as any)
        .eq('id', userId);

      // Update leaderboard
      await this.updateLeaderboard(userId, newXP);

      // Update weekly and monthly XP
      await LeaderboardService.updateWeeklyXP(userId, totalXP);
      await LeaderboardService.updateMonthlyXP(userId, totalXP);

      // Check for new badges
      const newBadges = await this.checkAndAwardBadges(userId, newLevel, newXP);

      // Check first-time badges
      await this.checkFirstTimeBadges(userId, activityType);

      // Check lesson count badges if completing a lesson
      if (activityType === 'lesson_complete' || activityType === 'first_lesson') {
        await this.checkLessonCountBadges(userId);
      }

      // Check engagement badges
      if (activityType === 'chat_message') {
        await this.checkEngagementBadges(userId);
      }

      // Check special milestones
      await this.checkSpecialMilestones(userId);

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
        .single() as { data: { streak: number; updated_at: string } | null };

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
            xp: supabase.rpc('increment', { x: streakBonusXP } as any),
            updated_at: now.toISOString(),
          } as any)
          .eq('id', userId);
      } else if (daysDiff > 1) {
        // Streak broken
        newStreak = 1;

        await supabase
          .from('users')
          .update({
            streak: newStreak,
            updated_at: now.toISOString(),
          } as any)
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
          } as any)
          .eq('user_id', userId);
      } else {
        // Create new entry
        await supabase.from('leaderboard').insert({
          user_id: userId,
          total_xp: totalXP,
          rank: 0, // Will be updated by periodic ranking job
        } as any);
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
        .order('total_xp', { ascending: false }) as { data: Array<{ id: string; user_id: string; total_xp: number }> | null };

      if (!entries) return;

      // Update ranks
      for (let i = 0; i < entries.length; i++) {
        await supabase
          .from('leaderboard')
          .update({ rank: i + 1 } as any)
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
            badge_name: `Level ${milestone} Master`,
            badge_description: `Reached level ${milestone}`,
            badge_icon: '⭐',
          });
          if (badge) newBadges.push(badge);
        }
      }

      // XP milestone badges
      const xpMilestones = [
        { xp: 1000, name: 'XP Novice', icon: '💎' },
        { xp: 5000, name: 'XP Apprentice', icon: '💠' },
        { xp: 10000, name: 'XP Expert', icon: '💫' },
        { xp: 50000, name: 'XP Virtuoso', icon: '✨' },
        { xp: 100000, name: 'XP Legend', icon: '🌟' },
      ];
      for (const milestone of xpMilestones) {
        if (xp >= milestone.xp && xp < milestone.xp + 100) {
          const badge = await this.awardBadge(userId, {
            badge_type: 'xp_milestone',
            badge_name: milestone.name,
            badge_description: `Earned ${milestone.xp.toLocaleString()} total XP`,
            badge_icon: milestone.icon,
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
   * Award first-time achievement badges
   */
  static async checkFirstTimeBadges(userId: string, activityType: ActivityType): Promise<void> {
    try {
      console.log(`[GamificationService] Checking first-time badge for activity: ${activityType}, user: ${userId}`);
      
      const achievements: Record<ActivityType, { name: string; description: string; icon: string } | null> = {
        first_lesson: {
          name: 'First Steps',
          description: 'Completed your first lesson',
          icon: '🎯',
        },
        quiz_complete: {
          name: 'Quiz Beginner',
          description: 'Completed your first quiz',
          icon: '📝',
        },
        perfect_quiz: {
          name: 'Perfect Start',
          description: 'Achieved your first perfect score',
          icon: '🎊',
        },
        chat_message: {
          name: 'Conversation Starter',
          description: 'Sent your first AI chat message',
          icon: '💬',
        },
        lesson_complete: null,
        daily_streak: null,
        lesson_created: null,
        milestone_reached: null,
      };

      const achievement = achievements[activityType];
      if (achievement) {
        console.log(`[GamificationService] Attempting to award badge: ${achievement.name}`);
        const badge = await this.awardBadge(userId, {
          badge_type: 'first_time',
          badge_name: achievement.name,
          badge_description: achievement.description,
          badge_icon: achievement.icon,
        });
        
        if (badge) {
          console.log(`[GamificationService] ✓ Badge awarded successfully: ${achievement.name}`);
        } else {
          console.log(`[GamificationService] ℹ User already has badge: ${achievement.name}`);
        }
      } else {
        console.log(`[GamificationService] No first-time badge for activity: ${activityType}`);
      }
    } catch (error) {
      console.error('[GamificationService] Failed to check first-time badges:', error);
    }
  }

  /**
   * Check and award lesson count badges
   */
  static async checkLessonCountBadges(userId: string): Promise<void> {
    try {
      // Get completed lessons from user_progress table instead
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('completed', true);

      const lessonCount = progressData?.length || 0;

      const milestones = [
        { count: 10, name: 'Study Starter', icon: '📚', description: 'Completed 10 lessons' },
        { count: 25, name: 'Knowledge Seeker', icon: '🔍', description: 'Completed 25 lessons' },
        { count: 50, name: 'Learning Enthusiast', icon: '🌱', description: 'Completed 50 lessons' },
        { count: 100, name: 'Century Scholar', icon: '📖', description: 'Completed 100 lessons' },
        { count: 250, name: 'Wisdom Master', icon: '🧙', description: 'Completed 250 lessons' },
      ];

      for (const milestone of milestones) {
        if (lessonCount === milestone.count) {
          await this.awardBadge(userId, {
            badge_type: 'lesson_count',
            badge_name: milestone.name,
            badge_description: milestone.description,
            badge_icon: milestone.icon,
          });
        }
      }
    } catch (error) {
      console.error('Failed to check lesson count badges:', error);
    }
  }

  /**
   * Check and award quiz performance badges
   */
  static async checkQuizPerformanceBadges(userId: string, score: number, isPerfect: boolean): Promise<void> {
    try {
      // Check total quiz count
      const { data: quizData } = await supabase
        .from('quiz_results')
        .select('id, score')
        .eq('user_id', userId) as { data: Array<{ id: string; score: number }> | null };

      const totalQuizzes = quizData?.length || 0;
      const perfectScores = quizData?.filter(q => q.score === 100).length || 0;

      // Quiz count milestones
      const countMilestones = [
        { count: 10, name: 'Quiz Explorer', icon: '🧭', description: 'Completed 10 quizzes' },
        { count: 50, name: 'Quiz Veteran', icon: '🎓', description: 'Completed 50 quizzes' },
        { count: 100, name: 'Quiz Master', icon: '👨‍🎓', description: 'Completed 100 quizzes' },
      ];

      for (const milestone of countMilestones) {
        if (totalQuizzes === milestone.count) {
          await this.awardBadge(userId, {
            badge_type: 'quiz_count',
            badge_name: milestone.name,
            badge_description: milestone.description,
            badge_icon: milestone.icon,
          });
        }
      }

      // Perfect score milestones
      const perfectMilestones = [
        { count: 5, name: 'Perfectionist', icon: '🎯', description: 'Achieved 5 perfect scores' },
        { count: 10, name: 'Flawless Scholar', icon: '💯', description: 'Achieved 10 perfect scores' },
        { count: 25, name: 'Precision Master', icon: '🏅', description: 'Achieved 25 perfect scores' },
      ];

      for (const milestone of perfectMilestones) {
        if (perfectScores === milestone.count) {
          await this.awardBadge(userId, {
            badge_type: 'perfect_score',
            badge_name: milestone.name,
            badge_description: milestone.description,
            badge_icon: milestone.icon,
          });
        }
      }

      // High score achievement (90+ but not perfect)
      if (score >= 90 && score < 100 && totalQuizzes >= 10) {
        const highScoreCount = quizData?.filter(q => q.score >= 90 && q.score < 100).length || 0;
        if (highScoreCount === 10) {
          await this.awardBadge(userId, {
            badge_type: 'high_score',
            badge_name: 'Almost Perfect',
            badge_description: 'Scored 90%+ on 10 quizzes',
            badge_icon: '🌟',
          });
        }
      }
    } catch (error) {
      console.error('Failed to check quiz performance badges:', error);
    }
  }

  /**
   * Check and award engagement badges
   */
  static async checkEngagementBadges(userId: string): Promise<void> {
    try {
      // Chat message count
      const { data: chatData } = await supabase
        .from('chat_history')
        .select('id')
        .eq('user_id', userId)
        .eq('role', 'user');

      const messageCount = chatData?.length || 0;

      const chatMilestones = [
        { count: 50, name: 'Chat Enthusiast', icon: '💭', description: 'Sent 50 chat messages' },
        { count: 100, name: 'Conversationalist', icon: '🗣️', description: 'Sent 100 chat messages' },
        { count: 500, name: 'AI Companion', icon: '🤖', description: 'Sent 500 chat messages' },
      ];

      for (const milestone of chatMilestones) {
        if (messageCount === milestone.count) {
          await this.awardBadge(userId, {
            badge_type: 'engagement',
            badge_name: milestone.name,
            badge_description: milestone.description,
            badge_icon: milestone.icon,
          });
        }
      }

      // Check study time patterns
      const currentHour = new Date().getHours();
      
      // Night Owl (studying between 10 PM - 2 AM)
      if (currentHour >= 22 || currentHour <= 2) {
        const { data: existingBadge } = await supabase
          .from('badges')
          .select('id')
          .eq('user_id', userId)
          .eq('badge_name', 'Night Owl')
          .single();

        if (!existingBadge && messageCount >= 20) {
          await this.awardBadge(userId, {
            badge_type: 'time_pattern',
            badge_name: 'Night Owl',
            badge_description: 'Study sessions after 10 PM',
            badge_icon: '🦉',
          });
        }
      }

      // Early Bird (studying between 5 AM - 8 AM)
      if (currentHour >= 5 && currentHour <= 8) {
        const { data: existingBadge } = await supabase
          .from('badges')
          .select('id')
          .eq('user_id', userId)
          .eq('badge_name', 'Early Bird')
          .single();

        if (!existingBadge && messageCount >= 20) {
          await this.awardBadge(userId, {
            badge_type: 'time_pattern',
            badge_name: 'Early Bird',
            badge_description: 'Study sessions before 8 AM',
            badge_icon: '🐦',
          });
        }
      }
    } catch (error) {
      console.error('Failed to check engagement badges:', error);
    }
  }

  /**
   * Check and award special milestone badges
   */
  static async checkSpecialMilestones(userId: string): Promise<void> {
    try {
      // Profile completion
      const { data: userData } = await supabase
        .from('users')
        .select('name, username, bio, avatar_url, persona, learning_mode')
        .eq('id', userId)
        .single() as { data: { name: string; username: string; bio: string; avatar_url: string; persona: string; learning_mode: string } | null };

      if (userData) {
        const isProfileComplete = 
          userData.name && 
          userData.username && 
          userData.bio && 
          userData.avatar_url && 
          userData.persona && 
          userData.learning_mode;

        if (isProfileComplete) {
          await this.awardBadge(userId, {
            badge_type: 'profile',
            badge_name: 'Profile Pro',
            badge_description: 'Completed your full profile',
            badge_icon: '✨',
          });
        }
      }

      // Check leaderboard position
      const { data: leaderboardData } = await supabase
        .from('leaderboard')
        .select('rank')
        .eq('user_id', userId)
        .single() as { data: { rank: number } | null };

      if (leaderboardData) {
        if (leaderboardData.rank === 1) {
          await this.awardBadge(userId, {
            badge_type: 'leaderboard',
            badge_name: 'Champion',
            badge_description: 'Reached #1 on the leaderboard',
            badge_icon: '👑',
          });
        } else if (leaderboardData.rank <= 10) {
          await this.awardBadge(userId, {
            badge_type: 'leaderboard',
            badge_name: 'Top 10 Elite',
            badge_description: 'Reached top 10 on the leaderboard',
            badge_icon: '🏆',
          });
        }
      }

      // Diverse learning (used multiple learning modes)
      // NOTE: Disabled until lesson_type and status columns are added to lessons table
      // const { data: lessonModes } = await supabase
      //   .from('lessons')
      //   .select('lesson_type')
      //   .eq('user_id', userId)
      //   .eq('status', 'completed');
      //
      // if (lessonModes) {
      //   const uniqueModes = new Set(lessonModes.map(l => l.lesson_type));
      //   if (uniqueModes.size >= 3) {
      //     await this.awardBadge(userId, {
      //       badge_type: 'diversity',
      //       badge_name: 'Well-Rounded Learner',
      //       badge_description: 'Explored 3+ different learning modes',
      //       badge_icon: '🎨',
      //     });
      //   }
      // }
    } catch (error) {
      console.error('Failed to check special milestones:', error);
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
      console.log(`[GamificationService] awardBadge - Checking for existing badge: "${badgeData.badge_name}" for user: ${userId}`);
      
      // Check if user already has this badge
      const { data: existingBadge, error: checkError } = await supabase
        .from('badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_name', badgeData.badge_name)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('[GamificationService] Error checking existing badge:', checkError);
      }

      if (existingBadge) {
        console.log(`[GamificationService] User already has badge: "${badgeData.badge_name}"`);
        return null;
      }

      console.log(`[GamificationService] Creating new badge in database:`, badgeData);

      // Award new badge
      const { data: newBadge, error } = await supabase
        .from('badges')
        .insert({
          user_id: userId,
          ...badgeData,
        } as any)
        .select()
        .single();

      if (error) {
        console.error('[GamificationService] Error inserting badge:', error);
        throw error;
      }

      console.log(`[GamificationService] ✓ Badge created successfully in DB:`, newBadge);

      return newBadge as Badge;
    } catch (error) {
      console.error('[GamificationService] Failed to award badge:', error);
      return null;
    }
  }
}

export default GamificationService;

