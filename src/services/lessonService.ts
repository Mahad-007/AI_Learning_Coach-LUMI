import { supabase } from '../lib/supabaseClient';
import { generateStructuredContent } from '../lib/geminiClient';
import { GamificationService } from './gamificationService';
import { AchievementSystem } from './achievementSystem';
import { XPUpdateService } from './xpUpdateService';
import type {
  Lesson,
  LessonGenerateRequest,
  LessonGenerateResponse,
  LessonWithProgress,
  GeneratedLessonContent,
  Difficulty,
} from '../types/lesson';
import type { Persona } from '../types/user';

/**
 * Lesson Service
 * Handles lesson generation, retrieval, and progress tracking
 */

export class LessonService {
  /**
   * Generate a new lesson using AI
   */
  static async generateLesson(
    userId: string,
    request: LessonGenerateRequest
  ): Promise<LessonGenerateResponse> {
    try {
      // Get user persona
      const { data: user } = await supabase
        .from('users')
        .select('persona')
        .eq('id', userId)
        .single();

      const persona: Persona = request.persona || user?.persona || 'friendly';

      // Build prompt for lesson generation
      const prompt = this.buildLessonPrompt(request);

      // Generate lesson content using Gemini
      const lessonContent = await generateStructuredContent<GeneratedLessonContent>(
        prompt,
        persona
      );

      // Calculate XP reward based on difficulty and duration
      const xpReward = this.calculateXPReward(request.difficulty, request.duration);

      // Combine content into a single string
      const fullContent = this.formatLessonContent(lessonContent);

      // Save lesson to database
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          user_id: userId,
          topic: request.topic,
          subject: request.subject,
          difficulty: request.difficulty,
          duration: request.duration,
          content: fullContent,
          objectives: lessonContent.objectives,
          key_points: lessonContent.key_points,
          xp_reward: xpReward,
        })
        .select()
        .single();

      if (lessonError) throw lessonError;

      // Create initial progress entry
      await supabase.from('user_progress').insert({
        user_id: userId,
        lesson_id: lessonData.id,
        completed: false,
        time_spent: 0,
      });

      // Award XP for creating a lesson
      await XPUpdateService.addXP(userId, 10, `lesson_created_${request.difficulty}`);

      return {
        lesson: lessonData as Lesson,
        message: 'Lesson generated successfully',
      };
    } catch (error: any) {
      console.error('Generate lesson error:', error);
      throw new Error(error.message || 'Failed to generate lesson');
    }
  }

  /**
   * Get a lesson by ID with progress
   */
  static async getLesson(userId: string, lessonId: string): Promise<LessonWithProgress> {
    try {
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (lessonError) throw lessonError;

      // Get progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      return {
        ...(lesson as Lesson),
        progress: progress || null,
      };
    } catch (error: any) {
      console.error('Get lesson error:', error);
      throw new Error(error.message || 'Failed to fetch lesson');
    }
  }

  /**
   * Get all lessons for a user
   */
  static async getUserLessons(userId: string): Promise<LessonWithProgress[]> {
    try {
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (lessonsError) throw lessonsError;

      // Get progress for all lessons
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      const progressMap = new Map(
        (progressData || []).map((p: any) => [p.lesson_id, p])
      );

      return (lessons as Lesson[]).map((lesson) => ({
        ...lesson,
        progress: progressMap.get(lesson.id) || null,
      }));
    } catch (error: any) {
      console.error('Get user lessons error:', error);
      throw new Error(error.message || 'Failed to fetch lessons');
    }
  }

  /**
   * Update lesson progress
   */
  static async updateProgress(
    userId: string,
    lessonId: string,
    timeSpent: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_progress')
        .update({
          time_spent: timeSpent,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Update progress error:', error);
      throw new Error(error.message || 'Failed to update progress');
    }
  }

  /**
   * Mark lesson as completed
   */
  static async completeLesson(userId: string, lessonId: string): Promise<number> {
    try {
      // Get lesson XP reward
      const { data: lesson } = await supabase
        .from('lessons')
        .select('xp_reward')
        .eq('id', lessonId)
        .single();

      if (!lesson) throw new Error('Lesson not found');

      // Update progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);

      if (progressError) throw progressError;

      // Award XP using dedicated service
      await XPUpdateService.addXP(userId, lesson.xp_reward, `lesson_complete_${lesson.difficulty}`);

      // Award first-time lesson badge (if first lesson)
      await AchievementSystem.awardFirstTimeBadge(userId, {
        badge_type: 'first_time',
        badge_name: 'First Steps',
        badge_description: 'Completed your first lesson',
        badge_icon: '🎯',
      });

      // Trigger database achievement evaluation (for count-based achievements)
      await AchievementSystem.evaluateAchievements();

      return lesson.xp_reward;
    } catch (error: any) {
      console.error('Complete lesson error:', error);
      throw new Error(error.message || 'Failed to complete lesson');
    }
  }

  /**
   * Delete a lesson
   */
  static async deleteLesson(userId: string, lessonId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Delete lesson error:', error);
      throw new Error(error.message || 'Failed to delete lesson');
    }
  }

  /**
   * Search lessons by topic or subject
   */
  static async searchLessons(userId: string, query: string): Promise<Lesson[]> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('user_id', userId)
        .or(`topic.ilike.%${query}%,subject.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as Lesson[];
    } catch (error: any) {
      console.error('Search lessons error:', error);
      throw new Error(error.message || 'Failed to search lessons');
    }
  }

  /**
   * Private helper: Build lesson generation prompt
   */
  private static buildLessonPrompt(request: LessonGenerateRequest): string {
    // Content filtering check
    if (this.containsInappropriateContent(request.topic) || this.containsInappropriateContent(request.subject)) {
      throw new Error('The requested topic contains inappropriate content and cannot be used for lesson generation.');
    }

    return `Create a comprehensive educational lesson with the following specifications:

Subject: ${request.subject}
Topic: ${request.topic}
Difficulty Level: ${request.difficulty}
Duration: ${request.duration} minutes

IMPORTANT: This lesson must be appropriate for all ages and focus on educational content only. Do not include any 18+ content, violence, explicit material, or inappropriate topics.

Please generate a structured lesson that includes:
1. An engaging introduction that captures interest
2. Clear learning objectives (3-5 specific goals)
3. Key points to cover (5-7 main concepts)
4. Detailed content explanation
5. A concise summary
6. Optional practice exercises

Return the response as a JSON object with this exact structure:
{
  "introduction": "engaging introduction text",
  "objectives": ["objective 1", "objective 2", ...],
  "key_points": ["point 1", "point 2", ...],
  "detailed_content": "comprehensive explanation of the topic",
  "summary": "brief recap of main points",
  "practice_exercises": ["exercise 1", "exercise 2", ...]
}`;
  }

  /**
   * Private helper: Check for inappropriate content
   */
  private static containsInappropriateContent(text: string): boolean {
    const inappropriateKeywords = [
      // Adult content
      'sex', 'sexual', 'porn', 'pornography', 'adult', 'explicit', 'nude', 'naked',
      // Violence
      'violence', 'kill', 'murder', 'weapon', 'gun', 'bomb', 'terrorist',
      // Drugs and alcohol
      'drug', 'cocaine', 'heroin', 'marijuana', 'alcohol', 'drunk', 'high',
      // Gambling
      'gambling', 'casino', 'bet', 'poker', 'slot machine',
      // Other inappropriate content
      'suicide', 'self-harm', 'hate speech', 'racist', 'discrimination'
    ];

    const lowerText = text.toLowerCase();
    return inappropriateKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Private helper: Format lesson content
   */
  private static formatLessonContent(content: GeneratedLessonContent): string {
    let formatted = `# Introduction\n\n${content.introduction}\n\n`;
    formatted += `# Learning Objectives\n\n${content.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}\n\n`;
    formatted += `# Key Points\n\n${content.key_points.map((point, i) => `${i + 1}. ${point}`).join('\n')}\n\n`;
    formatted += `# Detailed Content\n\n${content.detailed_content}\n\n`;
    formatted += `# Summary\n\n${content.summary}\n\n`;

    if (content.practice_exercises && content.practice_exercises.length > 0) {
      formatted += `# Practice Exercises\n\n${content.practice_exercises.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}`;
    }

    return formatted;
  }

  /**
   * Private helper: Calculate XP reward
   */
  private static calculateXPReward(difficulty: Difficulty, duration: number): number {
    const baseXP = 50;
    const difficultyMultiplier = {
      beginner: 1.0,
      intermediate: 1.5,
      advanced: 2.0,
    };
    const durationBonus = Math.floor(duration / 10) * 10;

    return Math.floor(baseXP * difficultyMultiplier[difficulty] + durationBonus);
  }

  /**
   * Private helper: Award XP for lesson creation
   */
  private static async awardLessonCreationXP(userId: string): Promise<void> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('xp, level')
        .eq('id', userId)
        .single();

      if (!user) return;

      const xpGained = 10; // Bonus for creating a lesson
      const newXP = user.xp + xpGained;
      const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;

      await supabase
        .from('users')
        .update({
          xp: newXP,
          level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Failed to award lesson creation XP:', error);
    }
  }

  /**
   * Private helper: Award XP for lesson completion
   */
  private static async awardLessonCompletionXP(userId: string, xpReward: number): Promise<void> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('xp, level')
        .eq('id', userId)
        .single();

      if (!user) return;

      const newXP = user.xp + xpReward;
      const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;

      await supabase
        .from('users')
        .update({
          xp: newXP,
          level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      // Award badge for first lesson completion
      const { data: completedLessons } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('completed', true);

      if (completedLessons && completedLessons.length === 1) {
        await supabase.from('badges').insert({
          user_id: userId,
          badge_type: 'achievement',
          badge_name: 'First Steps',
          badge_description: 'Completed your first lesson',
          badge_icon: '🎓',
        });
      }
    } catch (error) {
      console.error('Failed to award lesson completion XP:', error);
    }
  }
}

export default LessonService;

