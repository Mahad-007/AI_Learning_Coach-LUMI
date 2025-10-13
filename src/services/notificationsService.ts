import { supabase } from '@/lib/supabaseClient';

export type AppNotification = {
  id: string;
  user_id: string;
  type: string;
  payload: any;
  read_at: string | null;
  created_at: string;
};

export class NotificationsService {
  static async list(limit: number = 20): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []) as AppNotification[];
  }

  static async markRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }

  static async send(toUserId: string, type: string, payload: any): Promise<void> {
    const { error } = await supabase.from('notifications').insert({
      user_id: toUserId,
      type,
      payload,
    });
    if (error) throw error;
  }
}


