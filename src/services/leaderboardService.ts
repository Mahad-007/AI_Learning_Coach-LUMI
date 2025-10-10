import { supabase } from '../lib/supabaseClient';
import type { LeaderboardEntry, LeaderboardResponse } from '../types/gamification';

/**
 * Leaderboard Service
 * Handles global, weekly, and monthly leaderboards
 */

export class LeaderboardService {
  /**
   * Get comprehensive leaderboard data
   */
  static async getLeaderboard(userId?: string): Promise<LeaderboardResponse> {
    try {
      const [global, weekly, monthly, userPosition] = await Promise.all([
        this.getGlobalLeaderboard(),
        this.getWeeklyLeaderboard(),
        this.getMonthlyLeaderboard(),
        userId ? this.getUserPosition(userId) : Promise.resolve(null),
      ]);

      return {
        global,
        weekly,
        monthly,
        user_position: userPosition,
      };
    } catch (error: any) {
      console.error('Get leaderboard error:', error);
      throw new Error(error.message || 'Failed to fetch leaderboard');
    }
  }

  /**
   * Get global leaderboard (all-time)
   */
  static async getGlobalLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select(
          `
          id,
          user_id,
          total_xp,
          rank,
          users (
            name,
            avatar_url,
            level
          )
        `
        )
        .order('total_xp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return this.formatLeaderboardEntries(data);
    } catch (error: any) {
      console.error('Get global leaderboard error:', error);
      throw new Error(error.message || 'Failed to fetch global leaderboard');
    }
  }

  /**
   * Get weekly leaderboard
   */
  static async getWeeklyLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select(
          `
          id,
          user_id,
          weekly_xp,
          users (
            name,
            avatar_url,
            level
          )
        `
        )
        .order('weekly_xp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return this.formatLeaderboardEntries(data, 'weekly');
    } catch (error: any) {
      console.error('Get weekly leaderboard error:', error);
      throw new Error(error.message || 'Failed to fetch weekly leaderboard');
    }
  }

  /**
   * Get monthly leaderboard
   */
  static async getMonthlyLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select(
          `
          id,
          user_id,
          monthly_xp,
          users (
            name,
            avatar_url,
            level
          )
        `
        )
        .order('monthly_xp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return this.formatLeaderboardEntries(data, 'monthly');
    } catch (error: any) {
      console.error('Get monthly leaderboard error:', error);
      throw new Error(error.message || 'Failed to fetch monthly leaderboard');
    }
  }

  /**
   * Get user's position in leaderboard
   */
  static async getUserPosition(userId: string): Promise<LeaderboardEntry | null> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select(
          `
          id,
          user_id,
          total_xp,
          rank,
          weekly_xp,
          monthly_xp,
          users (
            name,
            avatar_url,
            level
          )
        `
        )
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      const formatted = this.formatLeaderboardEntries([data]);
      return formatted[0] || null;
    } catch (error: any) {
      console.error('Get user position error:', error);
      return null;
    }
  }

  /**
   * Get leaderboard by friend group (requires friends feature)
   */
  static async getFriendsLeaderboard(
    userId: string,
    friendIds: string[]
  ): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select(
          `
          id,
          user_id,
          total_xp,
          rank,
          users (
            name,
            avatar_url,
            level
          )
        `
        )
        .in('user_id', [...friendIds, userId])
        .order('total_xp', { ascending: false });

      if (error) throw error;

      return this.formatLeaderboardEntries(data);
    } catch (error: any) {
      console.error('Get friends leaderboard error:', error);
      throw new Error(error.message || 'Failed to fetch friends leaderboard');
    }
  }

  /**
   * Update weekly XP for a user
   */
  static async updateWeeklyXP(userId: string, xpGained: number): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_weekly_xp', {
        user_id_param: userId,
        xp_amount: xpGained,
      });

      if (error) {
        // If RPC doesn't exist, fallback to manual update
        const { data: current } = await supabase
          .from('leaderboard')
          .select('weekly_xp')
          .eq('user_id', userId)
          .single();

        if (current) {
          await supabase
            .from('leaderboard')
            .update({ weekly_xp: current.weekly_xp + xpGained })
            .eq('user_id', userId);
        }
      }
    } catch (error) {
      console.error('Update weekly XP error:', error);
    }
  }

  /**
   * Update monthly XP for a user
   */
  static async updateMonthlyXP(userId: string, xpGained: number): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_monthly_xp', {
        user_id_param: userId,
        xp_amount: xpGained,
      });

      if (error) {
        // If RPC doesn't exist, fallback to manual update
        const { data: current } = await supabase
          .from('leaderboard')
          .select('monthly_xp')
          .eq('user_id', userId)
          .single();

        if (current) {
          await supabase
            .from('leaderboard')
            .update({ monthly_xp: current.monthly_xp + xpGained })
            .eq('user_id', userId);
        }
      }
    } catch (error) {
      console.error('Update monthly XP error:', error);
    }
  }

  /**
   * Reset weekly leaderboard (should be called by a scheduled job)
   */
  static async resetWeeklyLeaderboard(): Promise<void> {
    try {
      const { error } = await supabase
        .from('leaderboard')
        .update({ weekly_xp: 0 })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      if (error) throw error;
    } catch (error) {
      console.error('Reset weekly leaderboard error:', error);
    }
  }

  /**
   * Reset monthly leaderboard (should be called by a scheduled job)
   */
  static async resetMonthlyLeaderboard(): Promise<void> {
    try {
      const { error } = await supabase
        .from('leaderboard')
        .update({ monthly_xp: 0 })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      if (error) throw error;
    } catch (error) {
      console.error('Reset monthly leaderboard error:', error);
    }
  }

  /**
   * Get user's rank change over time
   */
  static async getRankHistory(userId: string, days: number = 30): Promise<any[]> {
    try {
      // This would require a rank_history table to track changes over time
      // For now, return empty array as placeholder
      return [];
    } catch (error: any) {
      console.error('Get rank history error:', error);
      return [];
    }
  }

  /**
   * Private helper: Format leaderboard entries
   */
  private static formatLeaderboardEntries(
    data: any[],
    type: 'global' | 'weekly' | 'monthly' = 'global'
  ): LeaderboardEntry[] {
    return data.map((entry, index) => {
      const user = Array.isArray(entry.users) ? entry.users[0] : entry.users;
      
      let totalXP = entry.total_xp || 0;
      if (type === 'weekly') totalXP = entry.weekly_xp || 0;
      if (type === 'monthly') totalXP = entry.monthly_xp || 0;

      return {
        id: entry.id,
        user_id: entry.user_id,
        user_name: user?.name || 'Unknown',
        avatar_url: user?.avatar_url || null,
        total_xp: totalXP,
        rank: entry.rank || index + 1,
        weekly_xp: entry.weekly_xp || 0,
        monthly_xp: entry.monthly_xp || 0,
        level: user?.level || 1,
        badges_count: 0, // Would need to join with badges table
      };
    });
  }
}

export default LeaderboardService;

