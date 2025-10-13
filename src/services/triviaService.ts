import { supabase } from '../lib/supabaseClient';
import { FriendsService, FriendUser } from '@/services/friendsService';
import { generateStructuredContent } from '../lib/geminiClient';

/**
 * Trivia Service
 * Handles all trivia battle room operations
 */

export interface TriviaRoom {
  id: string;
  host_id: string;
  room_code: string | null;
  room_name: string;
  is_active: boolean;
  game_started: boolean;
  max_players: number;
  mode: 'global' | 'private' | 'friends';
  created_at: string;
}

export interface TriviaParticipant {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  score: number;
  correct_answers: number;
  joined_at: string;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string | null;
}

export class TriviaService {
  /**
   * Create a new trivia room
   */
  static async createRoom(
    userId: string,
    mode: 'global' | 'private' | 'friends' = 'private'
  ): Promise<{ room: TriviaRoom; roomCode: string | null }> {
    try {
      // Generate room code for private/friends mode
      let roomCode = null;
      if (mode !== 'global') {
        const { data: codeData } = await supabase.rpc('generate_room_code');
        roomCode = codeData;
      }

      const { data, error } = await supabase
        .from('trivia_rooms')
        .insert({
          host_id: userId,
          room_code: roomCode,
          mode: mode,
        })
        .select()
        .single();

      if (error) throw error;

      return { room: data as TriviaRoom, roomCode };
    } catch (error: any) {
      console.error('Failed to create room:', error);
      throw new Error(error.message || 'Failed to create trivia room');
    }
  }

  /**
   * Invite a friend to a trivia room and send notification
   */
  static async inviteFriend(roomId: string, toUserId: string, fromUser: { id: string; name: string }): Promise<void> {
    // record invite
    const { error: inviteErr } = await supabase.from('trivia_invites').insert({
      room_id: roomId,
      from_user_id: fromUser.id,
      to_user_id: toUserId,
    });
    if (inviteErr) throw inviteErr;

    // send notification
    await supabase.from('notifications').insert({
      user_id: toUserId,
      type: 'trivia_invite',
      payload: { room_id: roomId, from_id: fromUser.id, from_name: fromUser.name },
    });
  }

  /**
   * Get friends with presence
   */
  static async listFriendsWithPresence(currentUserId: string): Promise<Array<{ id: string; name: string; avatar_url?: string | null; presence: { status: string; last_active_at: string } }>> {
    // Get friends using existing service
    const friends: FriendUser[] = await FriendsService.listFriends();
    if (!friends || friends.length === 0) return [];

    const friendIds = friends.map((f) => f.id);
    const { data: presenceRows } = await supabase
      .from('user_presence')
      .select('user_id,status,last_active_at')
      .in('user_id', friendIds);
    const idToPresence = new Map<string, { status: string; last_active_at: string }>();
    (presenceRows || []).forEach((row: any) => idToPresence.set(row.user_id, { status: row.status, last_active_at: row.last_active_at }));

    return friends.map((f) => ({
      id: f.id,
      name: f.name,
      avatar_url: (f as any).avatar_url,
      presence: idToPresence.get(f.id) || { status: 'offline', last_active_at: new Date(0).toISOString() },
    }));
  }

  /**
   * Join a trivia room
   */
  static async joinRoom(
    userId: string,
    username: string,
    roomCode: string,
    avatarUrl?: string
  ): Promise<{ room: TriviaRoom; participant: TriviaParticipant }> {
    try {
      // Find active room with code
      const { data: room, error: roomError } = await supabase
        .from('trivia_rooms')
        .select('*')
        .eq('room_code', roomCode)
        .eq('is_active', true)
        .eq('game_started', false)
        .single();

      if (roomError || !room) {
        throw new Error('Room not found or already started');
      }

      // Check room capacity
      const { count } = await supabase
        .from('trivia_participants')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id);

      if (count && count >= room.max_players) {
        throw new Error('Room is full');
      }

      // Add participant
      const { data: participant, error: participantError } = await supabase
        .from('trivia_participants')
        .insert({
          room_id: room.id,
          user_id: userId,
          username: username,
          avatar_url: avatarUrl,
        })
        .select()
        .single();

      if (participantError) throw participantError;

      return { room: room as TriviaRoom, participant: participant as TriviaParticipant };
    } catch (error: any) {
      console.error('Failed to join room:', error);
      throw new Error(error.message || 'Failed to join room');
    }
  }

  /**
   * Get room participants
   */
  static async getRoomParticipants(roomId: string): Promise<TriviaParticipant[]> {
    try {
      const { data, error } = await supabase
        .from('trivia_participants')
        .select('*')
        .eq('room_id', roomId)
        .order('score', { ascending: false });

      if (error) throw error;
      return data as TriviaParticipant[];
    } catch (error) {
      console.error('Failed to get participants:', error);
      return [];
    }
  }

  /**
   * Generate trivia questions using AI
   */
  static async generateTriviaQuestions(
    count: number = 10,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    category?: string
  ): Promise<TriviaQuestion[]> {
    try {
      const categoryText = category ? `about ${category}` : 'on various topics';
      
      const prompt = `Generate ${count} trivia questions ${categoryText} at ${difficulty} difficulty level.

Requirements:
1. Each question should have 4 multiple choice options
2. Questions should be fun, educational, and engaging
3. Mix of topics: science, history, technology, culture, general knowledge
4. Difficulty: ${difficulty}
5. Each question must have exactly one correct answer

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option B",
      "category": "Science"
    }
  ]
}`;

      const result = await generateStructuredContent<{ questions: any[] }>(prompt, 'scholar');

      if (!result.questions || result.questions.length === 0) {
        throw new Error('No questions generated');
      }

      // Helper function to shuffle array (Fisher-Yates algorithm)
      const shuffleArray = <T>(array: T[]): T[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
      };

      return result.questions.map(q => {
        // Shuffle the options to randomize correct answer position
        const shuffledOptions = shuffleArray(q.options);
        
        return {
          id: crypto.randomUUID(),
          question: q.question,
          options: shuffledOptions,
          correct_answer: q.correct_answer, // Still the same text, just in different position
          difficulty,
          category: q.category || category || null,
        };
      }) as TriviaQuestion[];
    } catch (error) {
      console.error('Failed to generate questions:', error);
      throw error;
    }
  }

  /**
   * Start trivia game
   */
  static async startGame(roomId: string, questions: TriviaQuestion[]): Promise<void> {
    try {
      // Mark game as started and remove room code
      const { error: updateError } = await supabase
        .from('trivia_rooms')
        .update({
          game_started: true,
          is_active: false,
          room_code: null,
          started_at: new Date().toISOString(),
        })
        .eq('id', roomId);

      if (updateError) throw updateError;

      // Store game questions
      const gameQuestions = questions.map((q, index) => ({
        room_id: roomId,
        question_id: q.id,
        question_order: index,
      }));

      // Note: Since questions are generated on-the-fly, we'll pass them via Realtime
      // No need to store in trivia_questions table for now
    } catch (error: any) {
      console.error('Failed to start game:', error);
      throw new Error(error.message || 'Failed to start game');
    }
  }

  /**
   * Submit answer
   */
  static async submitAnswer(
    roomId: string,
    userId: string,
    questionId: string,
    answer: string,
    correctAnswer: string,
    timeTaken: number
  ): Promise<{ isCorrect: boolean; newScore: number }> {
    try {
      const isCorrect = answer === correctAnswer;
      const points = isCorrect ? 10 : 0;

      // Save answer
      await supabase.from('trivia_answers').insert({
        room_id: roomId,
        user_id: userId,
        question_id: questionId,
        answer: answer,
        is_correct: isCorrect,
        time_taken: timeTaken,
      });

      // Update participant score
      const { data: participant } = await supabase
        .from('trivia_participants')
        .select('score, correct_answers')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .single();

      const newScore = (participant?.score || 0) + points;
      const newCorrect = (participant?.correct_answers || 0) + (isCorrect ? 1 : 0);

      await supabase
        .from('trivia_participants')
        .update({
          score: newScore,
          correct_answers: newCorrect,
        })
        .eq('room_id', roomId)
        .eq('user_id', userId);

      return { isCorrect, newScore };
    } catch (error: any) {
      console.error('Failed to submit answer:', error);
      throw new Error(error.message || 'Failed to submit answer');
    }
  }

  /**
   * End game and award XP
   */
  static async endGame(roomId: string): Promise<void> {
    try {
      await supabase
        .from('trivia_rooms')
        .update({
          ended_at: new Date().toISOString(),
          is_active: false,
        })
        .eq('id', roomId);

      // Award XP to all participants based on score
      const participants = await this.getRoomParticipants(roomId);
      
      for (const participant of participants) {
        const xp = participant.score; // 1 XP per point
        if (xp > 0) {
          await supabase.rpc('award_xp_to_user', {
            p_user_id: participant.user_id,
            p_xp_amount: xp,
          });
        }
      }
    } catch (error) {
      console.error('Failed to end game:', error);
    }
  }

  /**
   * Leave room
   */
  static async leaveRoom(roomId: string, userId: string): Promise<void> {
    try {
      await supabase
        .from('trivia_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Failed to leave room:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard for room
   */
  static async getRoomLeaderboard(roomId: string): Promise<TriviaParticipant[]> {
    return this.getRoomParticipants(roomId);
  }
}

export default TriviaService;

