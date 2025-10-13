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

    // Get user profile for host_name
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    const sessionData = {
      title: data.title,
      topic: data.topic,
      host_id: user.id,
      host_name: userProfile?.name || 'Anonymous',
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

    console.log('Creating session with data:', sessionData);

    const { data: session, error } = await supabase
      .from('whiteboard_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      throw new Error(`Failed to create session: ${error.message}`);
    }

    // Add host as participant
    try {
      await this.joinSession(session.id, 'host');
    } catch (participantError) {
      console.error('Error adding host as participant:', participantError);
      // Don't throw here, session was created successfully
    }
    
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

    console.log('Getting sessions for user:', user.id);

    // For now, just get sessions where user is the host
    const { data: sessions, error } = await supabase
      .from('whiteboard_sessions')
      .select('*')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting sessions:', error);
      throw error;
    }

    console.log('Found sessions:', sessions);
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

    // Check if user is already a participant
    const { data: existingParticipant, error: checkError } = await supabase
      .from('whiteboard_participants')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing participant:', checkError);
      throw checkError;
    }

    // If user is already a participant, return the existing one
    if (existingParticipant) {
      console.log('User already a participant, returning existing:', existingParticipant);
      return existingParticipant;
    }

    // Get user profile for participant data
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

    console.log('Creating new participant:', participantData);

    const { data: participant, error } = await supabase
      .from('whiteboard_participants')
      .insert(participantData)
      .select()
      .single();

    if (error) {
      console.error('Error creating participant:', error);
      throw error;
    }

    // Update session participant count
    try {
      await supabase.rpc('increment_session_participants', { session_id: sessionId });
    } catch (countError) {
      console.error('Error updating participant count:', countError);
      // Don't throw here, participant was created successfully
    }

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
    // Generate flowchart diagram elements
    return {
      elements: [
        // Title
        {
          type: 'text',
          data: {
            text: `${topic} Flowchart`,
            x: 200,
            y: 50,
            width: 200,
            fontSize: 18,
            fontFamily: 'Arial',
            color: '#333333',
            rotation: 0
          },
          layer: 1,
          visible: true
        },
        // Rectangle 1 - Start
        {
          type: 'drawing',
          data: {
            points: [100, 150, 300, 150, 300, 200, 100, 200, 100, 150],
            strokeWidth: 3,
            strokeColor: '#1976D2',
            tool: 'pen'
          },
          layer: 2,
          visible: true
        },
        {
          type: 'text',
          data: {
            text: 'Start',
            x: 180,
            y: 170,
            width: 50,
            fontSize: 14,
            fontFamily: 'Arial',
            color: '#000000',
            rotation: 0
          },
          layer: 3,
          visible: true
        },
        // Diamond - Decision
        {
          type: 'drawing',
          data: {
            points: [200, 250, 250, 280, 200, 310, 150, 280, 200, 250],
            strokeWidth: 3,
            strokeColor: '#F57C00',
            tool: 'pen'
          },
          layer: 4,
          visible: true
        },
        {
          type: 'text',
          data: {
            text: 'Decision',
            x: 170,
            y: 285,
            width: 60,
            fontSize: 12,
            fontFamily: 'Arial',
            color: '#000000',
            rotation: 0
          },
          layer: 5,
          visible: true
        },
        // Rectangle 2 - Process
        {
          type: 'drawing',
          data: {
            points: [100, 350, 300, 350, 300, 400, 100, 400, 100, 350],
            strokeWidth: 3,
            strokeColor: '#2E7D32',
            tool: 'pen'
          },
          layer: 6,
          visible: true
        },
        {
          type: 'text',
          data: {
            text: 'Process',
            x: 180,
            y: 370,
            width: 60,
            fontSize: 14,
            fontFamily: 'Arial',
            color: '#000000',
            rotation: 0
          },
          layer: 7,
          visible: true
        },
        // Circle - End
        {
          type: 'drawing',
          data: {
            points: [200, 450, 220, 450, 220, 470, 200, 470, 200, 450],
            strokeWidth: 3,
            strokeColor: '#D32F2F',
            tool: 'pen'
          },
          layer: 8,
          visible: true
        },
        {
          type: 'text',
          data: {
            text: 'End',
            x: 205,
            y: 455,
            width: 30,
            fontSize: 12,
            fontFamily: 'Arial',
            color: '#000000',
            rotation: 0
          },
          layer: 9,
          visible: true
        },
        // Arrows
        {
          type: 'drawing',
          data: {
            points: [200, 200, 200, 250],
            strokeWidth: 2,
            strokeColor: '#000000',
            tool: 'pen'
          },
          layer: 10,
          visible: true
        },
        {
          type: 'drawing',
          data: {
            points: [200, 310, 200, 350],
            strokeWidth: 2,
            strokeColor: '#000000',
            tool: 'pen'
          },
          layer: 11,
          visible: true
        },
        {
          type: 'drawing',
          data: {
            points: [200, 400, 200, 450],
            strokeWidth: 2,
            strokeColor: '#000000',
            tool: 'pen'
          },
          layer: 12,
          visible: true
        }
      ],
      suggestions: [
        `Create a flowchart for ${topic}`,
        `Add more decision points`,
        `Connect processes with arrows`
      ]
    };
  }
}
