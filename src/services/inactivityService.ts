import { supabase } from '@/lib/supabaseClient';
import { NotificationsService } from './notificationsService';

export class InactivityService {
  /**
   * Update user's last activity timestamp
   */
  static async updateLastActivity(userId: string): Promise<void> {
    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: userId,
          status: 'online',
          last_active_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to update last activity:', error);
    }
  }

  /**
   * Check for inactive users and send reminder notifications
   * This should be called periodically (e.g., every hour)
   */
  static async checkInactiveUsers(): Promise<void> {
    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      
      // Find users who haven't been active in the last 2 hours
      const { data: inactiveUsers, error } = await supabase
        .from('user_presence')
        .select('user_id, users!inner(name)')
        .lt('last_active_at', twoHoursAgo)
        .eq('status', 'online');

      if (error) throw error;

      // Send reminder notifications to inactive users
      for (const user of inactiveUsers || []) {
        await NotificationsService.send(user.user_id, 'inactivity_reminder', {
          message: 'Reminder to continue your learning journey!',
          type: 'reminder'
        });

        // Update status to away
        await supabase
          .from('user_presence')
          .update({ status: 'away' })
          .eq('user_id', user.user_id);
      }

      console.log(`Sent ${inactiveUsers?.length || 0} inactivity reminders`);
    } catch (error) {
      console.error('Failed to check inactive users:', error);
    }
  }

  /**
   * Get user's current activity status
   */
  static async getUserActivityStatus(userId: string): Promise<{ status: string; last_active_at: string } | null> {
    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('status, last_active_at')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Failed to get user activity status:', error);
      return null;
    }
  }

  /**
   * Set user as offline
   */
  static async setUserOffline(userId: string): Promise<void> {
    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: userId,
          status: 'offline',
          last_active_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to set user offline:', error);
    }
  }
}
