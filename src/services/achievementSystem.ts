import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

/**
 * CENTRALIZED ACHIEVEMENT SYSTEM
 * 
 * This service provides a single point of interaction with the database-driven
 * achievement system. All achievement checks go through database triggers and RPCs.
 */

export interface AchievementResult {
  achievement_id: string;
  achievement_name: string;
  newly_unlocked: boolean;
}

export class AchievementSystem {
  /**
   * Manually trigger achievement evaluation for current user
   * Called after major events (lesson complete, quiz complete, etc.)
   */
  static async evaluateAchievements(): Promise<AchievementResult[]> {
    try {
      console.log('[AchievementSystem] Evaluating achievements...');
      
      const { data, error } = await supabase.rpc('check_my_achievements');
      
      if (error) {
        console.error('[AchievementSystem] RPC error:', error);
        throw error;
      }
      
      const results = (data || []) as AchievementResult[];
      const newlyUnlocked = results.filter(r => r.newly_unlocked);
      
      console.log('[AchievementSystem] Evaluation complete:', {
        total: results.length,
        newlyUnlocked: newlyUnlocked.length,
        names: newlyUnlocked.map(r => r.achievement_name)
      });
      
      // Show toast for newly unlocked achievements
      newlyUnlocked.forEach(achievement => {
        toast.success(`🎉 Achievement Unlocked: ${achievement.achievement_name}!`, {
          duration: 5000,
        });
      });
      
      return results;
    } catch (error) {
      console.error('[AchievementSystem] Failed to evaluate achievements:', error);
      return [];
    }
  }

  /**
   * Award a first-time achievement badge
   * Used for achievements that don't fit the count/level pattern
   */
  static async awardFirstTimeBadge(
    userId: string,
    achievementData: {
      badge_type: string;
      badge_name: string;
      badge_description: string;
      badge_icon: string;
    }
  ): Promise<boolean> {
    try {
      console.log(`[AchievementSystem] Awarding first-time badge: ${achievementData.badge_name}`);
      
      // Check if already exists
      const { data: existing, error: checkError } = await supabase
        .from('badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_name', achievementData.badge_name)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('[AchievementSystem] Error checking existing badge:', checkError);
      }

      if (existing) {
        console.log(`[AchievementSystem] Badge already exists: ${achievementData.badge_name}`);
        return false;
      }

      // Create badge
      const { error: insertError } = await supabase
        .from('badges')
        .insert({
          user_id: userId,
          ...achievementData,
        });

      if (insertError) {
        console.error('[AchievementSystem] Error creating badge:', insertError);
        throw insertError;
      }

      console.log(`[AchievementSystem] ✓ Badge awarded: ${achievementData.badge_name}`);
      
      // Show notification
      toast.success(`🎉 Achievement Unlocked: ${achievementData.badge_icon} ${achievementData.badge_name}!`, {
        duration: 5000,
      });

      return true;
    } catch (error) {
      console.error('[AchievementSystem] Failed to award first-time badge:', error);
      return false;
    }
  }

  /**
   * Setup realtime subscription for achievement updates
   */
  static setupRealtimeSubscription(
    userId: string,
    onNewBadge: (badge: any) => void
  ) {
    console.log('[AchievementSystem] Setting up realtime subscription for user:', userId);

    const channel = supabase
      .channel(`achievements:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'badges',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[AchievementSystem] 🎉 New badge via realtime:', payload.new);
          onNewBadge(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('[AchievementSystem] Realtime subscription status:', status);
      });

    return channel;
  }

  /**
   * Get user's achievement progress metrics
   */
  static async getProgressMetrics(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_achievement_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('[AchievementSystem] Error fetching progress:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[AchievementSystem] Failed to get progress metrics:', error);
      return null;
    }
  }
}

