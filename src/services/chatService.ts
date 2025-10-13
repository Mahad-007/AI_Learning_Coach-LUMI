import { supabase } from '../lib/supabaseClient';
import { generateWithPersona, generateStreamWithPersona } from '../lib/geminiClient';
import { GamificationService } from './gamificationService';
import { AchievementSystem } from './achievementSystem';
import { XPUpdateService } from './xpUpdateService';
import type { ChatRequest, ChatResponse, ChatMessage, StreamChatRequest } from '../types/ai';
import type { Persona } from '../types/user';

/**
 * Chat Service
 * Handles AI-powered chat interactions using Gemini API
 */

export class ChatService {
  /**
   * Send a chat message and get AI response
   */
  static async sendMessage(userId: string | { id?: string }, request: ChatRequest): Promise<ChatResponse> {
    try {
      // Normalize user id
      const normalizedUserId = typeof userId === 'string' ? userId : (userId?.id || String(userId));
      if (!normalizedUserId) throw new Error('Missing user id');

      // Get user's persona
      const { data: user } = await supabase
        .from('users')
        .select('persona')
        .eq('id', normalizedUserId)
        .single();

      const persona: Persona = request.persona || user?.persona || 'friendly';

      // Build context-aware prompt
      const prompt = this.buildPrompt(request.message, request.topic, request.context);

      // Generate AI response
      const aiResponse = await generateWithPersona(prompt, persona);

      // Calculate XP reward (1 XP per message)
      const xpGained = 1;

      // Save to chat history
      const insertWithRoles = async (base: any) => {
        const roleCandidates = ['ai', 'assistant', 'system', 'bot'];
        let lastError: any = null;
        for (const role of roleCandidates) {
          const payload = { ...base, role };
          const res = await supabase
            .from('chat_history')
            .insert(payload)
            .select()
            .single();
          if (!res.error) return res;
          // if check constraint violation, try next role
          if (res.error.code === '23514' && (res.error.message || '').includes('check constraint')) {
            lastError = res.error;
            continue;
          }
          // if schema cache missing columns, caller will decide fallback
          return res;
        }
        return { data: null, error: lastError } as any;
      };

      // First try full payload
      let chatDataResp = await insertWithRoles({
        user_id: normalizedUserId,
        message: request.message,
        response: aiResponse,
        topic: request.topic || null,
        persona: persona,
        xp_gained: xpGained,
      });

      // If the REST schema cache doesn't know columns yet, progressively retry with minimal payload
      if (
        chatDataResp.error?.message?.includes("Could not find the 'persona' column") ||
        chatDataResp.error?.message?.includes("Could not find the 'response' column") ||
        chatDataResp.error?.message?.includes("Could not find the 'topic' column")
      ) {
        chatDataResp = await insertWithRoles({
          user_id: normalizedUserId,
          message: request.message,
          xp_gained: xpGained,
        });
      }

      if (chatDataResp.error) throw chatDataResp.error;
      const chatData = chatDataResp.data;

      // Update user XP using dedicated service
      await XPUpdateService.addXP(normalizedUserId, xpGained, 'chat_message');

      // Award first-time chat badge (if first message)
      await AchievementSystem.awardFirstTimeBadge(normalizedUserId, {
        badge_type: 'first_time',
        badge_name: 'Conversation Starter',
        badge_description: 'Sent your first AI chat message',
        badge_icon: '💬',
      });

      // Trigger database achievement evaluation (for count-based achievements)
      await AchievementSystem.evaluateAchievements();

      return {
        reply: aiResponse,
        timestamp: chatData.timestamp,
        xp_gained: xpGained,
        message_id: chatData.id,
      };
    } catch (error: any) {
      console.error('Chat error:', error);
      throw new Error(error.message || 'Failed to process chat message');
    }
  }

  /**
   * Send a chat message with streaming response
   */
  static async sendMessageStream(
    userId: string,
    request: StreamChatRequest
  ): Promise<ChatResponse> {
    try {
      // Get user's persona
      const { data: user } = await supabase
        .from('users')
        .select('persona')
        .eq('id', userId)
        .single();

      const persona: Persona = request.persona || user?.persona || 'friendly';

      // Build context-aware prompt
      const prompt = this.buildPrompt(request.message, request.topic, request.context);

      // Generate AI response with streaming
      const aiResponse = await generateStreamWithPersona(prompt, persona, request.onChunk);

      // Calculate XP reward (1 XP per message)
      const xpGained = 1;

      // Save to chat history
      const { data: chatData, error: chatError } = await supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          message: request.message,
          response: aiResponse,
          topic: request.topic || null,
          persona: persona,
          xp_gained: xpGained,
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Update user XP using dedicated service
      await XPUpdateService.addXP(userId, xpGained, 'chat_message_stream');

      // Award first-time chat badge (if first message)
      await AchievementSystem.awardFirstTimeBadge(userId, {
        badge_type: 'first_time',
        badge_name: 'Conversation Starter',
        badge_description: 'Sent your first AI chat message',
        badge_icon: '💬',
      });

      // Trigger database achievement evaluation (for count-based achievements)
      await AchievementSystem.evaluateAchievements();

      return {
        reply: aiResponse,
        timestamp: chatData.timestamp,
        xp_gained: xpGained,
        message_id: chatData.id,
      };
    } catch (error: any) {
      console.error('Chat stream error:', error);
      throw new Error(error.message || 'Failed to process chat message');
    }
  }

  /**
   * Get chat history for a user
   */
  static async getChatHistory(
    userId: string,
    limit: number = 50,
    topic?: string
  ): Promise<ChatMessage[]> {
    try {
      let query = supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (topic) {
        query = query.eq('topic', topic);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data as ChatMessage[]).reverse(); // Return in chronological order
    } catch (error: any) {
      console.error('Get chat history error:', error);
      throw new Error(error.message || 'Failed to fetch chat history');
    }
  }

  /**
   * Get chat topics for a user
   */
  static async getChatTopics(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('topic')
        .eq('user_id', userId)
        .not('topic', 'is', null);

      if (error) throw error;

      // Get unique topics
      const topics = [...new Set(data.map((item: any) => item.topic).filter(Boolean))];
      return topics;
    } catch (error: any) {
      console.error('Get chat topics error:', error);
      throw new Error(error.message || 'Failed to fetch chat topics');
    }
  }

  /**
   * Delete chat message
   */
  static async deleteMessage(userId: string, messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('id', messageId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Delete message error:', error);
      throw new Error(error.message || 'Failed to delete message');
    }
  }

  /**
   * Clear all chat history for a user
   */
  static async clearHistory(userId: string, topic?: string): Promise<void> {
    try {
      let query = supabase.from('chat_history').delete().eq('user_id', userId);

      if (topic) {
        query = query.eq('topic', topic);
      }

      const { error } = await query;

      if (error) throw error;
    } catch (error: any) {
      console.error('Clear history error:', error);
      throw new Error(error.message || 'Failed to clear chat history');
    }
  }

  /**
   * Private helper: Build context-aware prompt
   */
  private static buildPrompt(
    message: string,
    topic?: string,
    context?: string[]
  ): string {
    let prompt = '';

    if (topic) {
      prompt += `Topic: ${topic}\n\n`;
    }

    if (context && context.length > 0) {
      prompt += `Previous context:\n${context.join('\n')}\n\n`;
    }

    prompt += `Student's question or message: ${message}\n\n`;
    prompt += `Please provide a helpful, educational response that encourages learning and understanding.`;

    return prompt;
  }

  /**
   * Private helper: Update user XP
   */
  private static async updateUserXP(userId: string, xpGained: number): Promise<void> {
    try {
      console.log(`[ChatService] Updating XP for user ${userId}: +${xpGained} XP`);
      
      // Get current user XP
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('xp, level')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('[ChatService] Error fetching user for XP update:', fetchError);
        throw fetchError;
      }

      if (!user) {
        console.error('[ChatService] User not found for XP update');
        return;
      }

      const oldXP = user.xp;
      const newXP = user.xp + xpGained;
      const oldLevel = user.level;
      const newLevel = this.calculateLevel(newXP);

      console.log(`[ChatService] XP update: ${oldXP} → ${newXP} (Level ${oldLevel} → ${newLevel})`);

      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          xp: newXP,
          level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('[ChatService] Error updating user XP:', updateError);
        throw updateError;
      }

      console.log(`[ChatService] ✓ XP updated successfully in database`);

      // Update leaderboard
      const { error: leaderboardError } = await supabase
        .from('leaderboard')
        .update({ 
          total_xp: newXP,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (leaderboardError) {
        console.error('[ChatService] Error updating leaderboard:', leaderboardError);
      } else {
        console.log('[ChatService] ✓ Leaderboard updated');
      }

    } catch (error) {
      console.error('[ChatService] Failed to update user XP:', error);
      throw error; // Re-throw to see errors
    }
  }

  /**
   * Private helper: Calculate level from XP
   */
  private static calculateLevel(xp: number): number {
    // Level formula: level = floor(sqrt(xp / 100)) + 1
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }
}

export default ChatService;

