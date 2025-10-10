import { supabase } from '@/lib/supabaseClient';
import type { 
  WhiteboardSession, 
  WhiteboardParticipant, 
  WhiteboardElement, 
  WhiteboardMessage,
  FriendInvitation,
  WhiteboardSettings 
} from '@/types/whiteboard';

export class WhiteboardService {
  // Session Management
  static async createSession(data: {
    title: string;
    topic: string;
    max_participants?: number;
    settings?: Partial<WhiteboardSettings>;
  }): Promise<WhiteboardSession> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const sessionData = {
      title: data.title,
      topic: data.topic,
      host_id: user.id,
      max_participants: data.max_participants || 10,
      settings: {
        allow_drawing: true,
        allow_text: true,
        allow_shapes: true,
        allow_images: true,
        ai_assistant_enabled: true,
        recording_enabled: false,
        ...data.settings
      }
    };

    const { data: session, error } = await supabase
      .from('whiteboard_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) throw error;

    // Add host as participant
    await this.joinSession(session.id, 'host');
    
    return session;
  }

  static async getSession(sessionId: string): Promise<WhiteboardSession> {
    const { data: session, error } = await supabase
      .from('whiteboard_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return session;
  }

  static async getUserSessions(): Promise<WhiteboardSession[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: sessions, error } = await supabase
      .from('whiteboard_sessions')
      .select('*')
      .or(`host_id.eq.${user.id},id.in.(select session_id from whiteboard_participants where user_id.eq.${user.id})`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return sessions || [];
  }

  static async updateSession(sessionId: string, updates: Partial<WhiteboardSession>): Promise<void> {
    const { error } = await supabase
      .from('whiteboard_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) throw error;
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('whiteboard_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
  }

  // Participant Management
  static async joinSession(sessionId: string, role: 'host' | 'teacher' | 'student' = 'student'): Promise<WhiteboardParticipant> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: userProfile } = await supabase
      .from('users')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single();

    const participantData = {
      session_id: sessionId,
      user_id: user.id,
      user_name: userProfile?.name || 'Anonymous',
      user_avatar: userProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
      role,
      color: this.generateRandomColor()
    };

    const { data: participant, error } = await supabase
      .from('whiteboard_participants')
      .insert(participantData)
      .select()
      .single();

    if (error) throw error;

    // Update session participant count
    await supabase.rpc('increment_session_participants', { session_id: sessionId });

    return participant;
  }

  static async leaveSession(sessionId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('whiteboard_participants')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', user.id);

    if (error) throw error;

    // Update session participant count
    await supabase.rpc('decrement_session_participants', { session_id: sessionId });
  }

  static async getSessionParticipants(sessionId: string): Promise<WhiteboardParticipant[]> {
    const { data: participants, error } = await supabase
      .from('whiteboard_participants')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_active', true);

    if (error) throw error;
    return participants || [];
  }

  static async updateParticipantCursor(sessionId: string, cursorPosition: { x: number; y: number }): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('whiteboard_participants')
      .update({ cursor_position: cursorPosition })
      .eq('session_id', sessionId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // Whiteboard Elements
  static async addElement(sessionId: string, element: Omit<WhiteboardElement, 'id' | 'created_at' | 'updated_at'>): Promise<WhiteboardElement> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const elementData = {
      ...element,
      session_id: sessionId,
      created_by: user.id
    };

    const { data: newElement, error } = await supabase
      .from('whiteboard_elements')
      .insert(elementData)
      .select()
      .single();

    if (error) throw error;
    return newElement;
  }

  static async updateElement(elementId: string, updates: Partial<WhiteboardElement>): Promise<void> {
    const { error } = await supabase
      .from('whiteboard_elements')
      .update(updates)
      .eq('id', elementId);

    if (error) throw error;
  }

  static async deleteElement(elementId: string): Promise<void> {
    const { error } = await supabase
      .from('whiteboard_elements')
      .delete()
      .eq('id', elementId);

    if (error) throw error;
  }

  static async getSessionElements(sessionId: string): Promise<WhiteboardElement[]> {
    const { data: elements, error } = await supabase
      .from('whiteboard_elements')
      .select('*')
      .eq('session_id', sessionId)
      .eq('visible', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return elements || [];
  }

  // Chat Messages
  static async sendMessage(sessionId: string, message: string, type: 'chat' | 'system' | 'ai' = 'chat'): Promise<WhiteboardMessage> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: userProfile } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single();

    const messageData = {
      session_id: sessionId,
      user_id: user.id,
      user_name: userProfile?.name || 'Anonymous',
      message,
      type
    };

    const { data: newMessage, error } = await supabase
      .from('whiteboard_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;
    return newMessage;
  }

  static async getSessionMessages(sessionId: string): Promise<WhiteboardMessage[]> {
    const { data: messages, error } = await supabase
      .from('whiteboard_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return messages || [];
  }

  // Friend Invitations
  static async inviteFriend(data: {
    sessionId: string;
    toUserId?: string;
    invitationType: 'global' | 'facebook';
    facebookFriendId?: string;
  }): Promise<FriendInvitation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const invitationData = {
      from_user_id: user.id,
      to_user_id: data.toUserId,
      session_id: data.sessionId,
      invitation_type: data.invitationType,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    const { data: invitation, error } = await supabase
      .from('friend_invitations')
      .insert(invitationData)
      .select()
      .single();

    if (error) throw error;
    return invitation;
  }

  static async getPendingInvitations(): Promise<FriendInvitation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: invitations, error } = await supabase
      .from('friend_invitations')
      .select('*')
      .eq('to_user_id', user.id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if (error) throw error;
    return invitations || [];
  }

  static async respondToInvitation(invitationId: string, status: 'accepted' | 'declined'): Promise<void> {
    const { error } = await supabase
      .from('friend_invitations')
      .update({ status })
      .eq('id', invitationId);

    if (error) throw error;

    if (status === 'accepted') {
      const { data: invitation } = await supabase
        .from('friend_invitations')
        .select('session_id')
        .eq('id', invitationId)
        .single();

      if (invitation) {
        await this.joinSession(invitation.session_id, 'student');
      }
    }
  }

  // Utility functions
  private static generateRandomColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // AI Integration
  static async generateTeachingContent(topic: string, sessionId: string): Promise<{
    elements: Partial<WhiteboardElement>[];
    suggestions: string[];
  }> {
    // This would integrate with your existing AI service
    // For now, returning mock data
    return {
      elements: [
        {
          type: 'text',
          data: {
            text: `Let's learn about ${topic}`,
            x: 100,
            y: 100,
            fontSize: 24,
            fontFamily: 'Arial',
            color: '#333333',
            rotation: 0
          },
          layer: 1,
          visible: true
        }
      ],
      suggestions: [
        `Start with the basics of ${topic}`,
        `Draw a diagram to explain the concept`,
        `Ask students what they already know about ${topic}`
      ]
    };
  }
}
