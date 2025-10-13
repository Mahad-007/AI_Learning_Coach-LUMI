import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

/**
 * DEDICATED XP UPDATE SERVICE
 * Handles all XP updates with proper error handling and logging
 */

export class XPUpdateService {
  /**
   * Add XP to user - GUARANTEED to work or throw visible error
   */
  static async addXP(
    userId: string,
    amount: number,
    source: string
  ): Promise<{ oldXP: number; newXP: number; levelChanged: boolean }> {
    console.log(`[XPUpdateService] Adding ${amount} XP from ${source} for user ${userId}`);

    try {
      // Step 1: Fetch current user data
      const { data: currentUser, error: fetchError } = await supabase
        .from('users')
        .select('xp, level')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('[XPUpdateService] ❌ Error fetching user:', fetchError);
        toast.error(`XP Error: ${fetchError.message}`);
        throw fetchError;
      }

      if (!currentUser) {
        console.error('[XPUpdateService] ❌ User not found');
        toast.error('User not found');
        throw new Error('User not found');
      }

      const oldXP = currentUser.xp || 0;
      const oldLevel = currentUser.level || 1;
      const newXP = oldXP + amount;
      const newLevel = this.calculateLevel(newXP);
      const levelChanged = newLevel > oldLevel;

      console.log(`[XPUpdateService] Current: ${oldXP} XP (Level ${oldLevel})`);
      console.log(`[XPUpdateService] Adding: ${amount} XP`);
      console.log(`[XPUpdateService] New: ${newXP} XP (Level ${newLevel})`);

      // Step 2: Update user XP and level
      const { error: updateError } = await supabase
        .from('users')
        .update({
          xp: newXP,
          level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('[XPUpdateService] ❌ Error updating user:', updateError);
        console.error('[XPUpdateService] Error details:', JSON.stringify(updateError, null, 2));
        toast.error(`XP Update Failed: ${updateError.message || 'Database error'}`, {
          description: updateError.hint || updateError.details || 'Check console for details',
        });
        throw updateError;
      }

      console.log(`[XPUpdateService] ✅ User XP updated in database`);

      // Step 3: Update leaderboard
      const { error: leaderboardError } = await supabase
        .from('leaderboard')
        .upsert({
          user_id: userId,
          total_xp: newXP,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (leaderboardError) {
        console.error('[XPUpdateService] ⚠️ Leaderboard update failed:', leaderboardError);
        // Don't throw - XP was still updated
      } else {
        console.log('[XPUpdateService] ✅ Leaderboard updated');
      }

      // Step 4: Update weekly/monthly XP
      try {
        await supabase.rpc('increment_weekly_xp', {
          user_id_param: userId,
          xp_amount: amount,
        });
        await supabase.rpc('increment_monthly_xp', {
          user_id_param: userId,
          xp_amount: amount,
        });
        console.log('[XPUpdateService] ✅ Weekly/Monthly XP updated');
      } catch (rpcError) {
        console.log('[XPUpdateService] ℹ️ Weekly/Monthly XP RPC not available (using fallback)');
      }

      // Show success notification
      if (levelChanged) {
        toast.success(`🎊 Level Up! You're now Level ${newLevel}!`, { duration: 5000 });
      }

      console.log(`[XPUpdateService] ✅ Complete! ${oldXP} → ${newXP} XP`);

      return { oldXP, newXP, levelChanged };

    } catch (error: any) {
      console.error('[XPUpdateService] ❌ Critical error:', error);
      throw error;
    }
  }

  /**
   * Calculate level from XP
   */
  private static calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  /**
   * Get XP needed for next level
   */
  static getXPForNextLevel(currentLevel: number): number {
    return currentLevel * currentLevel * 100;
  }

  /**
   * Get XP progress percentage to next level
   */
  static getProgressPercentage(currentXP: number, currentLevel: number): number {
    const currentLevelXP = (currentLevel - 1) * (currentLevel - 1) * 100;
    const nextLevelXP = currentLevel * currentLevel * 100;
    const xpIntoLevel = currentXP - currentLevelXP;
    const xpNeededForLevel = nextLevelXP - currentLevelXP;
    
    return Math.min(100, Math.max(0, Math.round((xpIntoLevel / xpNeededForLevel) * 100)));
  }
}

