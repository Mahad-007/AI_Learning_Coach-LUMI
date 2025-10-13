import { supabase } from '@/lib/supabaseClient';

export type FriendUser = { id: string; name: string; username?: string; avatar_url?: string; email?: string };
export type FriendRequest = { id: string; sender_id: string; receiver_id: string; status: 'pending'|'accepted'|'declined'|'cancelled'; created_at: string };

export const FriendsService = {
  async searchByEmailOrUsername(query: string): Promise<FriendUser | null> {
    const isEmail = query.includes('@');
    const { data, error } = await supabase
      .from('users')
      .select('id,name,username,avatar_url,email')
      .ilike(isEmail ? 'email' : 'username', query)
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
    if (accept) {
      const { error } = await supabase.rpc('accept_friend_request', { req_id: requestId });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('friend_requests').update({ status: 'declined', responded_at: new Date().toISOString() }).eq('id', requestId);
      if (error) throw error;
    }
  },

  async listFriends(): Promise<FriendUser[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('friends')
      .select('friend_id, users!friends_friend_id_fkey(id,name,username,avatar_url)')
      .eq('user_id', user.id);
    if (error) throw error;
    return (data || []).map((row: any) => row.users);
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
};


