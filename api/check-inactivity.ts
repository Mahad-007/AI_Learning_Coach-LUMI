import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify this is a cron job or authorized request
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    
    // Find users who haven't been active in the last 2 hours
    const { data: inactiveUsers, error } = await supabase
      .from('user_presence')
      .select('user_id, users!inner(name)')
      .lt('last_active_at', twoHoursAgo)
      .eq('status', 'online');

    if (error) throw error;

    // Send reminder notifications to inactive users
    let notificationsSent = 0;
    for (const user of inactiveUsers || []) {
      await supabase.from('notifications').insert({
        user_id: user.user_id,
        type: 'inactivity_reminder',
        payload: {
          message: 'Reminder to continue your learning journey!',
          type: 'reminder'
        }
      });

      // Update status to away
      await supabase
        .from('user_presence')
        .update({ status: 'away' })
        .eq('user_id', user.user_id);

      notificationsSent++;
    }

    return res.status(200).json({ 
      success: true, 
      notificationsSent,
      inactiveUsers: inactiveUsers?.length || 0
    });

  } catch (error: any) {
    console.error('Inactivity check failed:', error);
    return res.status(500).json({ 
      error: 'Failed to check inactive users',
      message: error.message 
    });
  }
}
