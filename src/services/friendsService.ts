import { supabase } from '@/lib/supabaseClient';
import { NotificationsService } from './notificationsService';

export type FriendUser = { id: string; name: string; username?: string; avatar_url?: string; email?: string };
export type FriendRequest = { id: string; sender_id: string; receiver_id: string; status: 'pending'|'accepted'|'declined'|'cancelled'; created_at: string };

export const FriendsService = {
  async searchByEmailOrUsername(query: string): Promise<FriendUser | null> {
    const trimmed = (query || '').trim();
    const isEmail = trimmed.includes('@');
    const normalized = isEmail ? trimmed : trimmed.replace(/^@+/, '');
    const { data, error } = await supabase
      .from('users')
      .select('id,name,username,avatar_url,email')
      // For usernames, allow partial matches and handle inputs like "@john"
      .ilike(isEmail ? 'email' : 'username', isEmail ? normalized : `%${normalized}%`)
      .limit(1)
      .maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async checkFriendshipStatus(targetUserId: string): Promise<{ isFriend: boolean; hasPendingRequest: boolean; requestStatus?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if already friends
    const { data: friendship } = await supabase
      .from('friends')
      .select('id')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${user.id})`)
      .maybeSingle();

    // Check for existing requests
    const { data: request } = await supabase
      .from('friend_requests')
      .select('status')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
      .maybeSingle();

    return {
      isFriend: !!friendship,
      hasPendingRequest: !!request && request.status === 'pending',
      requestStatus: request?.status
    };
  },

  async sendFriendRequest(receiverId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Prevent self-friending
    if (user.id === receiverId) {
      throw new Error('You cannot send a friend request to yourself');
    }
    
    // Check status first
    const status = await this.checkFriendshipStatus(receiverId);
    if (status.isFriend) {
      throw new Error('You are already friends with this user');
    }
    if (status.hasPendingRequest) {
      throw new Error('A friend request is already pending between you and this user');
    }

    const { error } = await supabase.from('friend_requests').insert({ sender_id: user.id, receiver_id: receiverId });
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('A friend request already exists between you and this user');
      }
      throw error;
    }

    // Send notification to receiver (don't fail the entire operation if notification fails)
    try {
      await NotificationsService.send(receiverId, 'friend_request', {
        from_user_id: user.id,
        from_user_name: user.user_metadata?.name || 'Someone',
        message: 'sent you a friend request'
      });
    } catch (notificationError) {
      console.warn('Failed to send friend request notification:', notificationError);
      // Don't throw - the friend request was created successfully
    }
  },

  async cancelRequest(requestId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestId)
      .eq('sender_id', user.id); // Only allow cancelling own requests
    if (error) throw error;
  },

  async respond(requestId: string, accept: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (accept) {
      // Get sender info before accepting
      const { data: requestData, error: requestError } = await supabase
        .from('friend_requests')
        .select('sender_id')
        .eq('id', requestId)
        .eq('receiver_id', user.id) // Ensure user can only respond to requests sent to them
        .single();

      if (requestError) {
        throw new Error('Friend request not found or you are not authorized to respond to it');
      }

      const { error } = await supabase.rpc('accept_friend_request', { req_id: requestId });
      if (error) throw error;

      // Send notification to sender that their request was accepted (don't fail if notification fails)
      if (requestData?.sender_id) {
        try {
          await NotificationsService.send(requestData.sender_id, 'friend_request_accepted', {
            from_user_id: user.id,
            from_user_name: user.user_metadata?.name || 'Someone',
            message: 'accepted your friend request'
          });
        } catch (notificationError) {
          console.warn('Failed to send acceptance notification:', notificationError);
          // Don't throw - the friend request was accepted successfully
        }
      }
    } else {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'declined', responded_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('receiver_id', user.id); // Ensure user can only decline requests sent to them
      if (error) throw error;
    }
  },

  async listFriends(): Promise<(FriendUser & { status?: string })[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    try {
      // Try the RPC function first
      const { data, error } = await supabase.rpc('get_friends_with_presence', { p_user_id: user.id });
      if (error) throw error;
      return (data || []).map((r: any) => ({ id: r.friend_id, name: r.name, username: r.username, avatar_url: r.avatar_url, status: r.status }));
    } catch (rpcError) {
      console.warn('RPC get_friends_with_presence failed, falling back to direct query:', rpcError);
      
      // Fallback: direct query without presence
      const { data: friends, error } = await supabase
        .from('friends')
        .select(`
          friend_id,
          users!friends_friend_id_fkey (
            id,
            name,
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return (friends || []).map((f: any) => ({
        id: f.friend_id,
        name: f.users?.name || 'Unknown',
        username: f.users?.username,
        avatar_url: f.users?.avatar_url,
        status: 'offline' // Default status when RPC fails
      }));
    }
  },

  async listRequests(): Promise<{ sent: FriendRequest[]; received: FriendRequest[] }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { sent: [], received: [] };
    
    const [{ data: sent }, { data: received }] = await Promise.all([
      supabase
        .from('friend_requests')
        .select(`
          *,
          receiver:users!friend_requests_receiver_id_fkey(id,name,username,email)
        `)
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('friend_requests')
        .select(`
          *,
          sender:users!friend_requests_sender_id_fkey(id,name,username,email)
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false }),
    ] as any);
    
    return { sent: sent || [], received: received || [] };
  },

  async unfriend(friendId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Prevent self-unfriending
    if (user.id === friendId) {
      throw new Error('You cannot unfriend yourself');
    }
    
    // Check if users are actually friends before attempting to unfriend
    const { data: friendship } = await supabase
      .from('friends')
      .select('id')
      .eq('user_id', user.id)
      .eq('friend_id', friendId)
      .maybeSingle();
    
    if (!friendship) {
      throw new Error('You are not friends with this user');
    }
    
    const { error } = await supabase.rpc('unfriend_friend', { p_friend_id: friendId });
    if (error) throw error;
  },
};


