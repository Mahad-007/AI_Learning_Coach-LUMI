import { supabase } from '../lib/supabaseClient';
import { getAllAchievements, type AchievementDefinition } from './achievementsRegistry';
import type { Badge } from '@/types/user';

/**
 * Achievements Service
 * Handles fetching and managing achievement data from the database
 */

export interface AchievementWithStatus extends AchievementDefinition {
  isUnlocked: boolean;
  earnedAt?: string;
  earnedBadge?: Badge;
}

export interface AchievementProgress {
  userId: string;
  totalAchievements: number;
  unlockedCount: number;
  lockedCount: number;
  completionPercentage: number;
  recentAchievements: Badge[];
  achievements: AchievementWithStatus[];
}

export class AchievementsService {
  /**
   * Get all achievements for a user with their unlock status
   */
  static async getUserAchievements(userId: string): Promise<AchievementWithStatus[]> {
    try {
      console.log('[AchievementsService] Fetching achievements for user:', userId);
      
      // Fetch earned badges from database
      const { data: badges, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('[AchievementsService] Failed to fetch badges:', error);
        return this.getAllAchievementsWithStatus([]);
      }

      console.log('[AchievementsService] Fetched badges from DB:', badges?.length || 0, 'badges');
      console.log('[AchievementsService] Badge names:', badges?.map(b => b.badge_name) || []);

      return this.getAllAchievementsWithStatus(badges || []);
    } catch (error) {
      console.error('[AchievementsService] Get user achievements error:', error);
      return this.getAllAchievementsWithStatus([]);
    }
  }

  /**
   * Get achievement progress summary for a user
   */
  static async getAchievementProgress(userId: string): Promise<AchievementProgress> {
    try {
      const achievements = await this.getUserAchievements(userId);
      const allAchievements = getAllAchievements();
      const visibleAchievements = allAchievements.filter(a => !a.hidden);
      
      const unlockedCount = achievements.filter(a => a.isUnlocked).length;
      const lockedCount = visibleAchievements.length - unlockedCount;
      const completionPercentage = Math.round((unlockedCount / visibleAchievements.length) * 100);

      // Get recent achievements (last 5)
      const recentAchievements = achievements
        .filter(a => a.isUnlocked && a.earnedBadge)
        .sort((a, b) => {
          const dateA = new Date(a.earnedAt || 0);
          const dateB = new Date(b.earnedAt || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5)
        .map(a => a.earnedBadge!)
        .filter(Boolean);

      return {
        userId,
        totalAchievements: visibleAchievements.length,
        unlockedCount,
        lockedCount,
        completionPercentage,
        recentAchievements,
        achievements,
      };
    } catch (error) {
      console.error('Get achievement progress error:', error);
      throw error;
    }
  }

  /**
   * Get achievements by category
   */
  static async getAchievementsByCategory(userId: string, category: string): Promise<AchievementWithStatus[]> {
    try {
      const allAchievements = await this.getUserAchievements(userId);
      
      if (category === 'all') {
        return allAchievements;
      }
      
      return allAchievements.filter(a => a.category === category);
    } catch (error) {
      console.error('Get achievements by category error:', error);
      return [];
    }
  }

  /**
   * Get only unlocked achievements
   */
  static async getUnlockedAchievements(userId: string): Promise<AchievementWithStatus[]> {
    try {
      const allAchievements = await this.getUserAchievements(userId);
      return allAchievements.filter(a => a.isUnlocked);
    } catch (error) {
      console.error('Get unlocked achievements error:', error);
      return [];
    }
  }

  /**
   * Get only locked achievements
   */
  static async getLockedAchievements(userId: string): Promise<AchievementWithStatus[]> {
    try {
      const allAchievements = await this.getUserAchievements(userId);
      return allAchievements.filter(a => !a.isUnlocked && !a.hidden);
    } catch (error) {
      console.error('Get locked achievements error:', error);
      return [];
    }
  }

  /**
   * Get achievement statistics
   */
  static async getAchievementStats(userId: string): Promise<{
    totalAchievements: number;
    unlockedCount: number;
    lockedCount: number;
    completionPercentage: number;
    categoriesProgress: Array<{
      category: string;
      total: number;
      unlocked: number;
      percentage: number;
    }>;
  }> {
    try {
      const achievements = await this.getUserAchievements(userId);
      const allAchievements = getAllAchievements();
      const visibleAchievements = allAchievements.filter(a => !a.hidden);
      
      const unlockedCount = achievements.filter(a => a.isUnlocked).length;
      const lockedCount = visibleAchievements.length - unlockedCount;
      const completionPercentage = Math.round((unlockedCount / visibleAchievements.length) * 100);

      // Calculate progress by category
      const categories = [...new Set(visibleAchievements.map(a => a.category))];
      const categoriesProgress = categories.map(category => {
        const categoryAchievements = achievements.filter(a => a.category === category && !a.hidden);
        const categoryUnlocked = categoryAchievements.filter(a => a.isUnlocked).length;
        const categoryTotal = categoryAchievements.length;
        
        return {
          category,
          total: categoryTotal,
          unlocked: categoryUnlocked,
          percentage: categoryTotal > 0 ? Math.round((categoryUnlocked / categoryTotal) * 100) : 0,
        };
      });

      return {
        totalAchievements: visibleAchievements.length,
        unlockedCount,
        lockedCount,
        completionPercentage,
        categoriesProgress,
      };
    } catch (error) {
      console.error('Get achievement stats error:', error);
      throw error;
    }
  }

  /**
   * Get recently earned badges
   */
  static async getRecentBadges(userId: string, limit: number = 5): Promise<Badge[]> {
    try {
      const { data: badges, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (badges || []) as Badge[];
    } catch (error) {
      console.error('Get recent badges error:', error);
      return [];
    }
  }

  /**
   * Get all earned badges for a user
   */
  static async getUserBadges(userId: string): Promise<Badge[]> {
    try {
      const { data: badges, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      return (badges || []) as Badge[];
    } catch (error) {
      console.error('Get user badges error:', error);
      return [];
    }
  }

  /**
   * Check if user has a specific achievement
   */
  static async hasAchievement(userId: string, achievementName: string): Promise<boolean> {
    try {
      const { data: badge, error } = await supabase
        .from('badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_name', achievementName)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Check achievement error:', error);
        return false;
      }

      return !!badge;
    } catch (error) {
      console.error('Has achievement error:', error);
      return false;
    }
  }

  /**
   * Get next achievements to unlock (closest to being earned)
   */
  static async getNextAchievements(userId: string, limit: number = 3): Promise<AchievementWithStatus[]> {
    try {
      const achievements = await this.getUserAchievements(userId);
      
      // Filter locked achievements and sort by priority
      // (You can customize this logic based on user progress)
      const locked = achievements.filter(a => !a.isUnlocked && !a.hidden);
      
      // Prioritize first-time achievements, then by category order
      const priorityOrder = ['First Time', 'Lessons', 'Quizzes', 'XP', 'Level'];
      
      locked.sort((a, b) => {
        const aPriority = priorityOrder.indexOf(a.category);
        const bPriority = priorityOrder.indexOf(b.category);
        
        if (aPriority !== -1 && bPriority !== -1) {
          return aPriority - bPriority;
        }
        if (aPriority !== -1) return -1;
        if (bPriority !== -1) return 1;
        return 0;
      });

      return locked.slice(0, limit);
    } catch (error) {
      console.error('Get next achievements error:', error);
      return [];
    }
  }

  /**
   * Private helper: Map achievements with unlock status
   */
  private static getAllAchievementsWithStatus(badges: Badge[]): AchievementWithStatus[] {
    const allAchievements = getAllAchievements();
    
    console.log('[AchievementsService] === BADGE MATCHING DEBUG ===');
    console.log('[AchievementsService] Database badges:', badges.map(b => b.badge_name));
    console.log('[AchievementsService] Registry achievements:', allAchievements.map(a => a.name));
    
    // Create map with normalized names for better matching
    const earnedBadgeMap = new Map(
      badges.map(badge => {
        const normalizedName = badge.badge_name.toLowerCase().trim();
        console.log(`[AchievementsService] DB Badge: "${badge.badge_name}" → normalized: "${normalizedName}"`);
        return [normalizedName, badge];
      })
    );

    console.log('[AchievementsService] Checking', allAchievements.length, 'achievements against', earnedBadgeMap.size, 'earned badges');

    const achievementsWithStatus = allAchievements.map(achievement => {
      const normalizedAchievementName = achievement.name.toLowerCase().trim();
      const earnedBadge = earnedBadgeMap.get(normalizedAchievementName);
      
      console.log(`[AchievementsService] Registry: "${achievement.name}" → normalized: "${normalizedAchievementName}" → ${earnedBadge ? '✓ MATCHED' : '✗ NOT FOUND'}`);
      
      return {
        ...achievement,
        isUnlocked: !!earnedBadge,
        earnedAt: earnedBadge?.earned_at,
        earnedBadge,
      };
    });

    const unlockedCount = achievementsWithStatus.filter(a => a.isUnlocked).length;
    console.log('[AchievementsService] === RESULT ===');
    console.log('[AchievementsService] Unlocked:', unlockedCount, '/ Total:', achievementsWithStatus.length);
    console.log('[AchievementsService] Unmatched badges:', badges.filter(b => 
      !allAchievements.some(a => a.name.toLowerCase().trim() === b.badge_name.toLowerCase().trim())
    ).map(b => b.badge_name));

    return achievementsWithStatus;
  }
}

export default AchievementsService;

