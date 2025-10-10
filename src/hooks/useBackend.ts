/**
 * Custom hook to access all backend services
 * Makes it easy to use services in your components
 */

import { useAuth } from '@/contexts/AuthContext';
import { ChatService } from '@/services/chatService';
import { LessonService } from '@/services/lessonService';
import { QuizService } from '@/services/quizService';
import { GamificationService } from '@/services/gamificationService';
import { LeaderboardService } from '@/services/leaderboardService';
import { DashboardService } from '@/services/dashboardService';

export const useBackend = () => {
  const { user } = useAuth();

  if (!user) {
    throw new Error('useBackend must be used within authenticated context');
  }

  return {
    // User Info
    userId: user.id,
    user,

    // Chat Service
    chat: {
      sendMessage: (message: string, options?: { topic?: string; persona?: any }) =>
        ChatService.sendMessage(user.id, { message, ...options }),
      
      sendMessageStream: (message: string, onChunk: (text: string) => void, options?: { topic?: string }) =>
        ChatService.sendMessageStream(user.id, { message, onChunk, ...options }),
      
      getHistory: (limit?: number, topic?: string) =>
        ChatService.getChatHistory(user.id, limit, topic),
      
      getTopics: () =>
        ChatService.getChatTopics(user.id),
      
      clearHistory: (topic?: string) =>
        ChatService.clearHistory(user.id, topic),
    },

    // Lesson Service
    lessons: {
      generate: (params: {
        subject: string;
        topic: string;
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        duration: number;
        persona?: any;
      }) => LessonService.generateLesson(user.id, params),
      
      get: (lessonId: string) =>
        LessonService.getLesson(user.id, lessonId),
      
      getAll: () =>
        LessonService.getUserLessons(user.id),
      
      updateProgress: (lessonId: string, timeSpent: number) =>
        LessonService.updateProgress(user.id, lessonId, timeSpent),
      
      complete: (lessonId: string) =>
        LessonService.completeLesson(user.id, lessonId),
      
      search: (query: string) =>
        LessonService.searchLessons(user.id, query),
      
      delete: (lessonId: string) =>
        LessonService.deleteLesson(user.id, lessonId),
    },

    // Quiz Service
    quizzes: {
      generate: (params: {
        lesson_id: string;
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        num_questions?: number;
        topic: string;
      }) => QuizService.generateQuiz(user.id, params),
      
      generateAdaptive: (params: {
        lesson_id: string;
        previous_performance?: number;
        focus_areas?: string[];
      }) => QuizService.generateAdaptiveQuiz(user.id, params),
      
      get: (quizId: string) =>
        QuizService.getQuiz(quizId),
      
      submit: (quizId: string, answers: Record<number, string>) =>
        QuizService.submitQuiz(user.id, { quiz_id: quizId, answers }),
      
      getLessonQuizzes: (lessonId: string) =>
        QuizService.getLessonQuizzes(lessonId),
      
      getUserQuizzes: () =>
        QuizService.getUserQuizzes(user.id),
    },

    // Gamification Service
    gamification: {
      awardXP: (activityType: any, multiplier?: number) =>
        GamificationService.awardXP(user.id, activityType, multiplier),
      
      updateStreak: () =>
        GamificationService.updateStreak(user.id),
      
      getLevelInfo: (xp: number) =>
        GamificationService.getLevelInfo(xp),
      
      getBadges: () =>
        GamificationService.getUserBadges(user.id),
      
      calculateLevel: (xp: number) =>
        GamificationService.calculateLevel(xp),
      
      getXPForLevel: (level: number) =>
        GamificationService.getXPForLevel(level),
    },

    // Leaderboard Service
    leaderboard: {
      getAll: () =>
        LeaderboardService.getLeaderboard(user.id),
      
      getGlobal: (limit?: number) =>
        LeaderboardService.getGlobalLeaderboard(limit),
      
      getWeekly: (limit?: number) =>
        LeaderboardService.getWeeklyLeaderboard(limit),
      
      getMonthly: (limit?: number) =>
        LeaderboardService.getMonthlyLeaderboard(limit),
      
      getPosition: () =>
        LeaderboardService.getUserPosition(user.id),
    },

    // Dashboard Service
    dashboard: {
      getStats: () =>
        DashboardService.getDashboardStats(user.id),
      
      getAnalytics: () =>
        DashboardService.getLearningAnalytics(user.id),
    },
  };
};

