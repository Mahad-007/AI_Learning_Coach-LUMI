/**
 * Central export for all backend services
 * Import services from this file for cleaner imports
 */

export { AuthService } from './authService';
export { ChatService } from './chatService';
export { LessonService } from './lessonService';
export { QuizService } from './quizService';
export { GamificationService } from './gamificationService';
export { LeaderboardService } from './leaderboardService';
export { DashboardService } from './dashboardService';
export { XPService } from './xpService';
export { QuizResultService } from './quizResultService';
export { TriviaService } from './triviaService';
export { WhiteboardService } from './whiteboardService';
export { AchievementSystem } from './achievementSystem';
export { AchievementsService } from './achievementsService';
export { XPUpdateService } from './xpUpdateService';

// Re-export types
export type { SignupData, LoginData, AuthResponse, User } from '../types/user';
export type { ChatRequest, ChatResponse, StreamChatRequest } from '../types/ai';
export type { LessonGenerateRequest, LessonGenerateResponse } from '../types/lesson';
export type { QuizGenerateRequest, QuizSubmission, QuizResult } from '../types/quiz';
export type { GamificationUpdate, LeaderboardResponse, DashboardStats } from '../types/gamification';
export type { 
  WhiteboardSession, 
  WhiteboardParticipant, 
  WhiteboardElement, 
  WhiteboardMessage,
  FriendInvitation,
  WhiteboardSettings 
} from '../types/whiteboard';

