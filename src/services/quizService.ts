import { supabase } from '../lib/supabaseClient';
import { generateStructuredContent } from '../lib/geminiClient';
import type {
  Quiz,
  QuizQuestion,
  QuizGenerateRequest,
  QuizGenerateResponse,
  QuizSubmission,
  QuizResult,
  QuizQuestionResult,
  AdaptiveQuizRequest,
} from '../types/quiz';
import type { Persona } from '../types/user';

/**
 * Quiz Service
 * Handles quiz generation, submission, and scoring
 */

export class QuizService {
  /**
   * Generate a quiz for a lesson using AI
   */
  static async generateQuiz(
    userId: string,
    request: QuizGenerateRequest
  ): Promise<QuizGenerateResponse> {
    try {
      // Get user persona
      const { data: user } = await supabase
        .from('users')
        .select('persona')
        .eq('id', userId)
        .single();

      const persona: Persona = user?.persona || 'friendly';

      // Get lesson content
      const { data: lesson } = await supabase
        .from('lessons')
        .select('content, topic, subject')
        .eq('id', request.lesson_id)
        .single();

      if (!lesson) throw new Error('Lesson not found');

      // Build prompt for quiz generation
      const prompt = this.buildQuizPrompt(
        lesson.topic,
        lesson.subject,
        request.difficulty,
        request.num_questions || 5,
        lesson.content
      );

      // Generate quiz using Gemini
      const quizData = await generateStructuredContent<{ questions: QuizQuestion[] }>(
        prompt,
        persona
      );

      // Calculate XP reward
      const xpReward = this.calculateQuizXPReward(
        request.difficulty,
        quizData.questions.length
      );

      // Save quiz to database
      const { data: savedQuiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          lesson_id: request.lesson_id,
          user_id: userId,
          questions: quizData.questions,
          xp_reward: xpReward,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      return {
        quiz: savedQuiz as Quiz,
        message: 'Quiz generated successfully',
      };
    } catch (error: any) {
      console.error('Generate quiz error:', error);
      throw new Error(error.message || 'Failed to generate quiz');
    }
  }

  /**
   * Generate an adaptive quiz based on previous performance
   */
  static async generateAdaptiveQuiz(
    userId: string,
    request: AdaptiveQuizRequest
  ): Promise<QuizGenerateResponse> {
    try {
      // Get user persona
      const { data: user } = await supabase
        .from('users')
        .select('persona')
        .eq('id', userId)
        .single();

      const persona: Persona = user?.persona || 'friendly';

      // Get lesson content
      const { data: lesson } = await supabase
        .from('lessons')
        .select('content, topic, subject, difficulty')
        .eq('id', request.lesson_id)
        .single();

      if (!lesson) throw new Error('Lesson not found');

      // Adjust difficulty based on previous performance
      let adaptedDifficulty = lesson.difficulty;
      if (request.previous_performance !== undefined) {
        if (request.previous_performance >= 80) {
          adaptedDifficulty = 'advanced';
        } else if (request.previous_performance >= 60) {
          adaptedDifficulty = 'intermediate';
        } else {
          adaptedDifficulty = 'beginner';
        }
      }

      // Build adaptive prompt
      const prompt = this.buildAdaptiveQuizPrompt(
        lesson.topic,
        lesson.subject,
        adaptedDifficulty,
        lesson.content,
        request.focus_areas
      );

      // Generate quiz using Gemini
      const quizData = await generateStructuredContent<{ questions: QuizQuestion[] }>(
        prompt,
        persona
      );

      // Calculate XP reward
      const xpReward = this.calculateQuizXPReward(adaptedDifficulty, quizData.questions.length);

      // Save quiz to database
      const { data: savedQuiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          lesson_id: request.lesson_id,
          user_id: userId,
          questions: quizData.questions,
          xp_reward: xpReward,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      return {
        quiz: savedQuiz as Quiz,
        message: 'Adaptive quiz generated successfully',
      };
    } catch (error: any) {
      console.error('Generate adaptive quiz error:', error);
      throw new Error(error.message || 'Failed to generate adaptive quiz');
    }
  }

  /**
   * Get a quiz by ID
   */
  static async getQuiz(quizId: string): Promise<Quiz> {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (error) throw error;

      return data as Quiz;
    } catch (error: any) {
      console.error('Get quiz error:', error);
      throw new Error(error.message || 'Failed to fetch quiz');
    }
  }

  /**
   * Submit quiz answers and get results
   */
  static async submitQuiz(
    userId: string,
    submission: QuizSubmission
  ): Promise<QuizResult> {
    try {
      // Get quiz
      const quiz = await this.getQuiz(submission.quiz_id);

      // Validate ownership
      if (quiz.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      // Calculate results
      const results: QuizQuestionResult[] = [];
      let correctCount = 0;

      quiz.questions.forEach((question, index) => {
        const selectedAnswer = submission.answers[index];
        const isCorrect = selectedAnswer === question.correct_answer;

        if (isCorrect) correctCount++;

        results.push({
          question: question.question,
          selected_answer: selectedAnswer || '',
          correct_answer: question.correct_answer,
          is_correct: isCorrect,
          explanation: question.explanation,
        });
      });

      const score = correctCount;
      const totalQuestions = quiz.questions.length;
      const percentage = Math.round((correctCount / totalQuestions) * 100);

      // Calculate XP earned (proportional to score)
      const xpEarned = Math.floor((quiz.xp_reward * percentage) / 100);

      // Update user progress
      await supabase
        .from('user_progress')
        .update({
          quiz_id: quiz.id,
          quiz_score: percentage,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('lesson_id', quiz.lesson_id);

      // Award XP
      await this.awardQuizXP(userId, xpEarned, percentage);

      // Award perfect score badge if applicable
      if (percentage === 100) {
        await this.awardPerfectScoreBadge(userId);
      }

      return {
        quiz_id: quiz.id,
        score,
        total_questions: totalQuestions,
        percentage,
        correct_answers: results
          .map((r, i) => (r.is_correct ? i : -1))
          .filter((i) => i >= 0),
        xp_earned: xpEarned,
        results,
      };
    } catch (error: any) {
      console.error('Submit quiz error:', error);
      throw new Error(error.message || 'Failed to submit quiz');
    }
  }

  /**
   * Get all quizzes for a lesson
   */
  static async getLessonQuizzes(lessonId: string): Promise<Quiz[]> {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as Quiz[];
    } catch (error: any) {
      console.error('Get lesson quizzes error:', error);
      throw new Error(error.message || 'Failed to fetch quizzes');
    }
  }

  /**
   * Get user's quiz history
   */
  static async getUserQuizzes(userId: string): Promise<Quiz[]> {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as Quiz[];
    } catch (error: any) {
      console.error('Get user quizzes error:', error);
      throw new Error(error.message || 'Failed to fetch user quizzes');
    }
  }

  /**
   * Delete a quiz
   */
  static async deleteQuiz(userId: string, quizId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Delete quiz error:', error);
      throw new Error(error.message || 'Failed to delete quiz');
    }
  }

  /**
   * Private helper: Build quiz generation prompt
   */
  private static buildQuizPrompt(
    topic: string,
    subject: string,
    difficulty: string,
    numQuestions: number,
    lessonContent: string
  ): string {
    return `Create a multiple-choice quiz based on the following lesson:

Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}
Number of Questions: ${numQuestions}

Lesson Content:
${lessonContent.substring(0, 2000)} ${lessonContent.length > 2000 ? '...' : ''}

Please generate ${numQuestions} multiple-choice questions that:
1. Test understanding of key concepts from the lesson
2. Are appropriate for ${difficulty} level
3. Have 4 options each
4. Include an explanation for the correct answer

Return the response as a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Explanation of why this is correct"
    }
  ]
}`;
  }

  /**
   * Private helper: Build adaptive quiz generation prompt
   */
  private static buildAdaptiveQuizPrompt(
    topic: string,
    subject: string,
    difficulty: string,
    lessonContent: string,
    focusAreas?: string[]
  ): string {
    let prompt = `Create an adaptive multiple-choice quiz based on the following lesson:

Subject: ${subject}
Topic: ${topic}
Adapted Difficulty: ${difficulty}

Lesson Content:
${lessonContent.substring(0, 2000)} ${lessonContent.length > 2000 ? '...' : ''}
`;

    if (focusAreas && focusAreas.length > 0) {
      prompt += `\nFocus Areas: ${focusAreas.join(', ')}`;
      prompt += `\nPlease emphasize questions related to these focus areas.`;
    }

    prompt += `

Generate 5 multiple-choice questions that:
1. Are tailored to ${difficulty} difficulty level
2. Test deep understanding of the concepts
3. Have 4 options each
4. Include detailed explanations

Return the response as a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Detailed explanation"
    }
  ]
}`;

    return prompt;
  }

  /**
   * Private helper: Calculate quiz XP reward
   */
  private static calculateQuizXPReward(difficulty: string, numQuestions: number): number {
    const baseXPPerQuestion = 10;
    const difficultyMultiplier: Record<string, number> = {
      beginner: 1.0,
      intermediate: 1.5,
      advanced: 2.0,
    };

    return Math.floor(
      baseXPPerQuestion * numQuestions * (difficultyMultiplier[difficulty] || 1.0)
    );
  }

  /**
   * Private helper: Award XP for quiz completion
   */
  private static async awardQuizXP(
    userId: string,
    xpEarned: number,
    percentage: number
  ): Promise<void> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('xp, level')
        .eq('id', userId)
        .single();

      if (!user) return;

      const newXP = user.xp + xpEarned;
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
      console.error('Failed to award quiz XP:', error);
    }
  }

  /**
   * Private helper: Award perfect score badge
   */
  private static async awardPerfectScoreBadge(userId: string): Promise<void> {
    try {
      // Check if user already has this badge
      const { data: existingBadge } = await supabase
        .from('badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_type', 'perfect_quiz')
        .single();

      if (!existingBadge) {
        await supabase.from('badges').insert({
          user_id: userId,
          badge_type: 'perfect_quiz',
          badge_name: 'Perfect Score',
          badge_description: 'Achieved 100% on a quiz',
          badge_icon: '🏆',
        });
      }
    } catch (error) {
      console.error('Failed to award perfect score badge:', error);
    }
  }
}

export default QuizService;

