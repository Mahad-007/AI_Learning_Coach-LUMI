import { supabase } from '../lib/supabaseClient';
import { generateStructuredContent, generateWithPersona } from '../lib/geminiClient';
import { XPUpdateService } from './xpUpdateService';
import { AchievementSystem } from './achievementSystem';
import type {
  Lesson,
  LessonWithProgress,
  LessonProgress,
  UserNote,
  UserHighlight,
  QuizQuestion,
  QuizAttempt,
  GeneratedSummary,
} from '../types/lesson';
import type { Persona } from '../types/user';

/**
 * Enhanced Lesson Service
 * Handles all lesson-related operations including notes, highlights, quizzes, and summaries
 */

export class EnhancedLessonService {
  /**
   * Get all lessons for listing (with optional filters)
   */
  static async getAllLessons(
    userId: string,
    filters?: {
      search?: string;
      difficulty?: string;
      subject?: string;
    }
  ): Promise<LessonWithProgress[]> {
    try {
      let query = supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.search) {
        query = query.or(
          `topic.ilike.%${filters.search}%,subject.ilike.%${filters.search}%,content.ilike.%${filters.search}%`
        );
      }
      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters?.subject) {
        query = query.eq('subject', filters.subject);
      }

      const { data: lessons, error: lessonsError } = await query;
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
      console.error('Get all lessons error:', error);
      throw new Error(error.message || 'Failed to fetch lessons');
    }
  }

  /**
   * Get a single lesson with progress
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
        .maybeSingle();

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
   * Get lessons that user has started but not completed
   */
  static async getInProgressLessons(userId: string): Promise<LessonWithProgress[]> {
    try {
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('lesson_id, percent_complete, last_section, time_spent')
        .eq('user_id', userId)
        .eq('is_completed', false)
        .gt('percent_complete', 0)
        .order('updated_at', { ascending: false });

      if (progressError) throw progressError;
      if (!progressData || progressData.length === 0) return [];

      const lessonIds = progressData.map((p) => p.lesson_id);
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .in('id', lessonIds);

      if (lessonsError) throw lessonsError;

      const progressMap = new Map(
        progressData.map((p: any) => [p.lesson_id, p])
      );

      return (lessons as Lesson[]).map((lesson) => ({
        ...lesson,
        progress: progressMap.get(lesson.id) || null,
      }));
    } catch (error: any) {
      console.error('Get in-progress lessons error:', error);
      throw new Error(error.message || 'Failed to fetch in-progress lessons');
    }
  }

  /**
   * Update progress heartbeat (time tracking)
   */
  static async updateProgressTime(
    userId: string,
    lessonId: string,
    additionalSeconds: number
  ): Promise<void> {
    try {
      // Try RPC function first
      const { error } = await supabase.rpc('update_lesson_progress_time', {
        p_user_id: userId,
        p_lesson_id: lessonId,
        p_additional_seconds: additionalSeconds,
      });

      if (error) {
        console.warn('RPC function not available, using fallback:', error.message);
        // Fallback to direct update
        await this.updateProgressTimeFallback(userId, lessonId, additionalSeconds);
      }
    } catch (error: any) {
      console.error('Update progress time error:', error);
      // Try fallback method
      try {
        await this.updateProgressTimeFallback(userId, lessonId, additionalSeconds);
      } catch (fallbackError) {
        console.error('Fallback update also failed:', fallbackError);
        // Non-critical, don't throw
      }
    }
  }

  /**
   * Fallback method for updating progress time
   */
  private static async updateProgressTimeFallback(
    userId: string,
    lessonId: string,
    additionalSeconds: number
  ): Promise<void> {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        time_spent: additionalSeconds,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,lesson_id',
        ignoreDuplicates: false
      });

    if (error) throw error;
  }

  /**
   * Update lesson progress (section and percent)
   */
  static async updateProgress(
    userId: string,
    lessonId: string,
    lastSection: string,
    percentComplete: number,
    isCompleted: boolean = false
  ): Promise<void> {
    try {
      // Try RPC function first
      const { error } = await supabase.rpc('update_lesson_progress', {
        p_user_id: userId,
        p_lesson_id: lessonId,
        p_last_section: lastSection,
        p_percent_complete: percentComplete,
        p_is_completed: isCompleted,
      });

      if (error) {
        console.warn('RPC function not available, using fallback:', error.message);
        // Fallback to direct update
        await this.updateProgressFallback(userId, lessonId, lastSection, percentComplete, isCompleted);
      }
    } catch (error: any) {
      console.error('Update progress error:', error);
      // Try fallback method
      try {
        await this.updateProgressFallback(userId, lessonId, lastSection, percentComplete, isCompleted);
      } catch (fallbackError) {
        console.error('Fallback update also failed:', fallbackError);
        throw new Error(error.message || 'Failed to update progress');
      }
    }
  }

  /**
   * Fallback method for updating progress
   */
  private static async updateProgressFallback(
    userId: string,
    lessonId: string,
    lastSection: string,
    percentComplete: number,
    isCompleted: boolean
  ): Promise<void> {
    const updateData: any = {
      user_id: userId,
      lesson_id: lessonId,
      updated_at: new Date().toISOString(),
    };

    // Only add these fields if they exist in the database
    if (lastSection) updateData.last_section = lastSection;
    if (percentComplete !== undefined) updateData.percent_complete = percentComplete;

    if (isCompleted) {
      updateData.completed = true;
      updateData.completed_at = new Date().toISOString();
    }

    console.log('[ProgressUpdate] Updating progress:', {
      userId,
      lessonId,
      isCompleted,
      percentComplete,
      updateData
    });

    const { error } = await supabase
      .from('user_progress')
      .upsert(updateData, {
        onConflict: 'user_id,lesson_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('[ProgressUpdate] Error:', error);
      throw error;
    }

    console.log('[ProgressUpdate] ✓ Progress updated successfully');
  }

  /**
   * Complete lesson and award XP (atomic)
   */
  static async completeLesson(
    userId: string,
    lessonId: string,
    timeSpentSeconds: number
  ): Promise<{ xpAwarded: number; newXP: number; newLevel: number; levelChanged: boolean }> {
    try {
      // Try RPC function first
      const { data, error } = await supabase.rpc('award_lesson_xp', {
        p_user_id: userId,
        p_lesson_id: lessonId,
        p_time_spent_seconds: timeSpentSeconds,
      });

      if (error) {
        console.warn('RPC function not available, using fallback:', error.message);
        // Fallback to manual XP calculation
        return await this.completeLessonFallback(userId, lessonId, timeSpentSeconds);
      }

      const result = data[0];
      const oldLevel = Math.floor(Math.sqrt((result.new_xp - result.xp_awarded) / 100)) + 1;
      const levelChanged = result.new_level > oldLevel;

      // Update progress to mark as completed
      await this.updateProgress(userId, lessonId, '', 100, true);

    // Trigger achievement evaluation (non-blocking)
    this.checkAndAwardFirstLessonBadge(userId).catch((err) =>
      console.error('Badge evaluation error:', err)
    );

      return {
        xpAwarded: result.xp_awarded,
        newXP: result.new_xp,
        newLevel: result.new_level,
        levelChanged,
      };
    } catch (error: any) {
      console.error('Complete lesson error:', error);
      // Try fallback method
      try {
        return await this.completeLessonFallback(userId, lessonId, timeSpentSeconds);
      } catch (fallbackError) {
        console.error('Fallback completion also failed:', fallbackError);
        throw new Error(error.message || 'Failed to complete lesson');
      }
    }
  }

  /**
   * Fallback method for completing lesson
   */
  private static async completeLessonFallback(
    userId: string,
    lessonId: string,
    timeSpentSeconds: number
  ): Promise<{ xpAwarded: number; newXP: number; newLevel: number; levelChanged: boolean }> {
    // Get lesson data
    const { data: lesson } = await supabase
      .from('lessons')
      .select('xp_reward, difficulty_numeric')
      .eq('id', lessonId)
      .single();

    if (!lesson) throw new Error('Lesson not found');

    // Calculate XP manually
    const difficultyMultiplier = lesson.difficulty_numeric === 1 ? 1.0 : 
                                lesson.difficulty_numeric === 2 ? 1.5 : 2.0;
    const timeBonus = Math.floor(timeSpentSeconds / 300) * 5; // 5 XP per 5 minutes
    const xpAwarded = Math.floor((lesson.xp_reward || 50) * difficultyMultiplier) + timeBonus;

    // Get current user data
    const { data: user } = await supabase
      .from('users')
      .select('xp, level')
      .eq('id', userId)
      .single();

    if (!user) throw new Error('User not found');

    const oldLevel = user.level || 1;
    const newXP = user.xp + xpAwarded;
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
    const levelChanged = newLevel > oldLevel;

    // Update user XP
    const { error: userError } = await supabase
      .from('users')
      .update({
        xp: newXP,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (userError) throw userError;

    // Update leaderboard
    await supabase
      .from('leaderboard')
      .upsert({
        user_id: userId,
        total_xp: newXP,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    // Update progress to mark as completed
    await this.updateProgress(userId, lessonId, '', 100, true);

    // Debug the database state
    await this.debugUserProgress(userId, lessonId);

    // Trigger achievement evaluation (non-blocking)
    this.checkAndAwardFirstLessonBadge(userId).catch((err) =>
      console.error('Badge evaluation error:', err)
    );

    return {
      xpAwarded,
      newXP,
      newLevel,
      levelChanged,
    };
  }

  // ==================== NOTES ====================

  /**
   * Get all notes for a lesson
   */
  static async getNotes(userId: string, lessonId: string): Promise<UserNote[]> {
    try {
      const { data, error } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserNote[];
    } catch (error: any) {
      console.error('Get notes error:', error);
      throw new Error(error.message || 'Failed to fetch notes');
    }
  }

  /**
   * Save or update a note
   */
  static async saveNote(
    userId: string,
    lessonId: string,
    noteId: string | null,
    content: string,
    sectionAnchor: string | null = null
  ): Promise<UserNote> {
    try {
      if (noteId) {
        // Update existing note
        const { data, error } = await supabase
          .from('user_notes')
          .update({
            content,
            section_anchor: sectionAnchor,
            updated_at: new Date().toISOString(),
          })
          .eq('id', noteId)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return data as UserNote;
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('user_notes')
          .insert({
            user_id: userId,
            lesson_id: lessonId,
            content,
            section_anchor: sectionAnchor,
          })
          .select()
          .single();

        if (error) throw error;
        return data as UserNote;
      }
    } catch (error: any) {
      console.error('Save note error:', error);
      throw new Error(error.message || 'Failed to save note');
    }
  }

  /**
   * Delete a note
   */
  static async deleteNote(userId: string, noteId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Delete note error:', error);
      throw new Error(error.message || 'Failed to delete note');
    }
  }

  // ==================== HIGHLIGHTS ====================

  /**
   * Get all highlights for a lesson
   */
  static async getHighlights(userId: string, lessonId: string): Promise<UserHighlight[]> {
    try {
      const { data, error } = await supabase
        .from('user_highlights')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserHighlight[];
    } catch (error: any) {
      console.error('Get highlights error:', error);
      throw new Error(error.message || 'Failed to fetch highlights');
    }
  }

  /**
   * Add a highlight
   */
  static async addHighlight(
    userId: string,
    lessonId: string,
    snippet: string,
    color: string = 'yellow',
    sectionAnchor: string | null = null
  ): Promise<UserHighlight> {
    try {
      const { data, error } = await supabase
        .from('user_highlights')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          snippet,
          color,
          section_anchor: sectionAnchor,
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserHighlight;
    } catch (error: any) {
      console.error('Add highlight error:', error);
      throw new Error(error.message || 'Failed to add highlight');
    }
  }

  /**
   * Delete a highlight
   */
  static async deleteHighlight(userId: string, highlightId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_highlights')
        .delete()
        .eq('id', highlightId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Delete highlight error:', error);
      throw new Error(error.message || 'Failed to delete highlight');
    }
  }

  // ==================== QUIZZES ====================

  /**
   * Generate quiz questions for a lesson using AI
   */
  static async generateQuiz(
    lessonContent: string,
    difficulty: string,
    count: number = 5,
    persona: Persona = 'friendly'
  ): Promise<QuizQuestion[]> {
    try {
      const prompt = `Based on the following lesson content, generate ${count} multiple-choice quiz questions at ${difficulty} level. 
      
Lesson Content:
${lessonContent.substring(0, 2000)} // Limit content length

Generate questions that test understanding of the key concepts. Return as a JSON array with this structure:
[
  {
    "id": "q1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Brief explanation of the correct answer"
  },
  ...
]`;

      const questions = await generateStructuredContent<QuizQuestion[]>(prompt, persona);
      return questions;
    } catch (error: any) {
      console.error('Generate quiz error:', error);
      throw new Error(error.message || 'Failed to generate quiz');
    }
  }

  /**
   * Submit quiz attempt
   */
  static async submitQuizAttempt(
    userId: string,
    lessonId: string,
    questionId: string,
    questionText: string,
    selectedOption: string,
    correct: boolean,
    score: number
  ): Promise<QuizAttempt> {
    try {
      const { data, error } = await supabase
        .from('user_quiz_attempts')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          question_id: questionId,
          question_text: questionText,
          selected_option: selectedOption,
          correct,
          score,
        })
        .select()
        .single();

      if (error) throw error;

      // Award XP for quiz (small bonus)
      if (correct) {
        await XPUpdateService.addXP(userId, score, `quiz_${questionId}`);
      }

      return data as QuizAttempt;
    } catch (error: any) {
      console.error('Submit quiz attempt error:', error);
      throw new Error(error.message || 'Failed to submit quiz attempt');
    }
  }

  /**
   * Get quiz attempts for a lesson
   */
  static async getQuizAttempts(userId: string, lessonId: string): Promise<QuizAttempt[]> {
    try {
      const { data, error } = await supabase
        .from('user_quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data as QuizAttempt[];
    } catch (error: any) {
      console.error('Get quiz attempts error:', error);
      throw new Error(error.message || 'Failed to fetch quiz attempts');
    }
  }

  // ==================== AI SUMMARIES ====================

  /**
   * Generate AI summary for lesson or section
   */
  static async generateSummary(
    userId: string,
    lessonId: string,
    content: string,
    sectionAnchor: string | null = null,
    persona: Persona = 'friendly'
  ): Promise<GeneratedSummary> {
    try {
      // Check if summary already exists
      let query = supabase
        .from('user_generated_summaries')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);

      if (sectionAnchor) {
        query = query.eq('section_anchor', sectionAnchor);
      } else {
        query = query.is('section_anchor', null);
      }

      const { data: existing } = await query.maybeSingle();

      if (existing) {
        return existing as GeneratedSummary;
      }

      // Generate new summary
      const prompt = `Create a concise but comprehensive summary of the following content. 
Include the main concepts, key takeaways, and important points. Format the summary in markdown with:
- A brief overview paragraph
- Key takeaways as bullet points
- Any important code examples or concepts highlighted

Content:
${content.substring(0, 3000)}

Return the summary as plain markdown text.`;

      const summaryContent = await generateWithPersona(prompt, persona);

      // Save summary
      const { data, error } = await supabase
        .from('user_generated_summaries')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          section_anchor: sectionAnchor,
          summary_content: summaryContent,
        })
        .select()
        .single();

      if (error) throw error;
      return data as GeneratedSummary;
    } catch (error: any) {
      console.error('Generate summary error:', error);
      throw new Error(error.message || 'Failed to generate summary');
    }
  }

  /**
   * Regenerate AI summary (overwrite existing if present)
   */
  static async regenerateSummary(
    userId: string,
    lessonId: string,
    content: string,
    sectionAnchor: string | null = null,
    persona: Persona = 'friendly'
  ): Promise<GeneratedSummary> {
    try {
      // Check if existing summary exists
      let query = supabase
        .from('user_generated_summaries')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);

      if (sectionAnchor) {
        query = query.eq('section_anchor', sectionAnchor);
      } else {
        query = query.is('section_anchor', null);
      }

      const { data: existing } = await query.maybeSingle();

      // Generate new content
      const prompt = `Create a concise but comprehensive summary of the following content. 
Include the main concepts, key takeaways, and important points. Format the summary in markdown with:
- A brief overview paragraph
- Key takeaways as bullet points
- Any important code examples or concepts highlighted

Content:
${content.substring(0, 3000)}

Return the summary as plain markdown text.`;

      const summaryContent = await generateWithPersona(prompt, persona);

      if (existing) {
        // Overwrite existing
        const { data, error } = await supabase
          .from('user_generated_summaries')
          .update({ summary_content: summaryContent })
          .eq('id', (existing as any).id)
          .select()
          .single();

        if (error) throw error;
        return data as GeneratedSummary;
      }

      // No existing record, insert new
      const { data, error } = await supabase
        .from('user_generated_summaries')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          section_anchor: sectionAnchor,
          summary_content: summaryContent,
        })
        .select()
        .single();

      if (error) throw error;
      return data as GeneratedSummary;
    } catch (error: any) {
      console.error('Regenerate summary error:', error);
      throw new Error(error.message || 'Failed to regenerate summary');
    }
  }

  /**
   * Get summary for lesson
   */
  static async getSummary(
    userId: string,
    lessonId: string,
    sectionAnchor: string | null = null
  ): Promise<GeneratedSummary | null> {
    try {
      let query = supabase
        .from('user_generated_summaries')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);

      if (sectionAnchor) {
        query = query.eq('section_anchor', sectionAnchor);
      } else {
        query = query.is('section_anchor', null);
      }

      const { data, error } = await query.maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as GeneratedSummary | null;
    } catch (error: any) {
      console.error('Get summary error:', error);
      return null;
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Debug function to check database schema and data
   */
  static async debugUserProgress(userId: string, lessonId: string): Promise<void> {
    try {
      console.log('[Debug] Checking user_progress table...');
      
      // Check current progress record
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      console.log('[Debug] Current progress record:', progress);
      if (progressError) console.error('[Debug] Progress error:', progressError);

      // Check all progress records for user
      const { data: allProgress, error: allError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      console.log('[Debug] All progress records for user:', allProgress);
      if (allError) console.error('[Debug] All progress error:', allError);

      // Check completed lessons specifically
      const { data: completed, error: completedError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true);

      console.log('[Debug] Completed lessons:', completed);
      if (completedError) console.error('[Debug] Completed error:', completedError);

    } catch (error) {
      console.error('[Debug] Error:', error);
    }
  }

  /**
   * Manually check and award missing badges for a user
   * This can be called to fix missing badges
   */
  static async checkAndAwardMissingBadges(userId: string): Promise<void> {
    try {
      console.log('[BadgeSystem] Manually checking for missing badges...');
      
      // Check completed lessons
      const { data: completedLessons } = await supabase
        .from('user_progress')
        .select('id, lesson_id, completed_at')
        .eq('user_id', userId)
        .eq('completed', true);

      console.log('[BadgeSystem] Found', completedLessons?.length || 0, 'completed lessons');

      // Check if First Steps badge exists
      const { data: firstStepsBadge } = await supabase
        .from('badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_name', 'First Steps')
        .maybeSingle();

      // Award First Steps badge if user has completed lessons but doesn't have the badge
      if (completedLessons && completedLessons.length >= 1 && !firstStepsBadge) {
        console.log('[BadgeSystem] Awarding missing First Steps badge...');
        
        const { error } = await supabase
          .from('badges')
          .insert({
            user_id: userId,
            badge_type: 'achievement',
            badge_name: 'First Steps',
            badge_description: 'Completed your first lesson!',
            badge_icon: '🎓',
            earned_at: new Date().toISOString(),
          });

        if (error) {
          console.error('[BadgeSystem] Error creating badge:', error);
        } else {
          console.log('[BadgeSystem] ✓ First Steps badge awarded!');
          const { toast } = await import('sonner');
          toast.success('🎉 Achievement Unlocked: 🎓 First Steps!', {
            duration: 5000,
          });
        }
      }

      // Add more badge checks here as needed
      // Example: 5 lessons, 10 lessons, etc.

    } catch (error) {
      console.error('[BadgeSystem] Error in manual badge check:', error);
    }
  }

  // ==================== PDF EXPORT ====================

  /**
   * Increment download count
   */
  static async incrementDownloadCount(userId: string, lessonId: string): Promise<void> {
    try {
      // Try RPC function first
      const { error } = await supabase.rpc('increment_lesson_download', {
        p_user_id: userId,
        p_lesson_id: lessonId,
      });

      if (error) {
        console.warn('RPC function not available, using fallback:', error.message);
        // Fallback to direct update
        await this.incrementDownloadCountFallback(userId, lessonId);
      }
    } catch (error: any) {
      console.error('Increment download count error:', error);
      // Try fallback method
      try {
        await this.incrementDownloadCountFallback(userId, lessonId);
      } catch (fallbackError) {
        console.error('Fallback increment also failed:', fallbackError);
        // Non-critical, don't throw
      }
    }
  }

  /**
   * Fallback method for incrementing download count
   */
  private static async incrementDownloadCountFallback(
    userId: string,
    lessonId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        download_count: 1,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,lesson_id',
        ignoreDuplicates: false
      });

    if (error) throw error;
  }

  /**
   * Check and award first lesson completion badge
   */
  private static async checkAndAwardFirstLessonBadge(userId: string): Promise<void> {
    try {
      console.log('[BadgeSystem] Checking for completed lessons for user:', userId);
      
      // Check if user has completed any lessons
      const { data: completedLessons, error: progressError } = await supabase
        .from('user_progress')
        .select('id, lesson_id, completed_at')
        .eq('user_id', userId)
        .eq('completed', true);

      if (progressError) {
        console.error('[BadgeSystem] Error checking completed lessons:', progressError);
        return;
      }

      console.log('[BadgeSystem] Found completed lessons:', completedLessons?.length || 0);

      // If this is their first completed lesson, award badge
      if (completedLessons && completedLessons.length === 1) {
        console.log('[BadgeSystem] First lesson completed! Awarding badge...');
        
        // Check if badge already exists
        const { data: existingBadge } = await supabase
          .from('badges')
          .select('id')
          .eq('user_id', userId)
          .eq('badge_name', 'First Steps')
          .maybeSingle();

        if (!existingBadge) {
          console.log('[BadgeSystem] Creating First Steps badge...');
          
          // Award the badge
          const { error: badgeError } = await supabase
            .from('badges')
            .insert({
              user_id: userId,
              badge_type: 'achievement',
              badge_name: 'First Steps',
              badge_description: 'Completed your first lesson!',
              badge_icon: '🎓',
              earned_at: new Date().toISOString(),
            });

          if (badgeError) {
            console.error('[BadgeSystem] Error creating badge:', badgeError);
          } else {
            console.log('[BadgeSystem] ✓ First lesson badge awarded!');
            // Show notification
            const { toast } = await import('sonner');
            toast.success('🎉 Achievement Unlocked: 🎓 First Steps!', {
              duration: 5000,
            });
          }
        } else {
          console.log('[BadgeSystem] First lesson badge already exists');
        }
      } else if (completedLessons && completedLessons.length > 1) {
        console.log('[BadgeSystem] User has completed', completedLessons.length, 'lessons');
      } else {
        console.log('[BadgeSystem] No completed lessons found');
      }

      // Try the general achievement system as well (in case RPC exists)
      try {
        await AchievementSystem.evaluateAchievements();
      } catch (rpcError) {
        console.log('[BadgeSystem] RPC achievement system not available, using direct badge awarding');
      }
    } catch (error) {
      console.error('[BadgeSystem] Error in badge evaluation:', error);
    }
  }
}

export default EnhancedLessonService;

