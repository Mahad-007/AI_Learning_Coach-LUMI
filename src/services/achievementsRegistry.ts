/**
 * Achievements Registry
 * Central registry of all possible achievements in the system
 */

export interface AchievementDefinition {
  id: string;
  category: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  hidden?: boolean; // Hidden achievements only show after unlock
}

export const ACHIEVEMENTS_REGISTRY: AchievementDefinition[] = [
  // Welcome Achievement
  {
    id: 'welcome_aboard',
    category: 'Getting Started',
    name: 'Welcome Aboard',
    description: 'Created your account and joined the learning community',
    icon: '🎉',
    requirement: 'Sign up for an account',
  },
  
  // First-Time Achievements
  {
    id: 'first_steps',
    category: 'First Time',
    name: 'First Steps',
    description: 'Completed your first lesson',
    icon: '🎯',
    requirement: 'Complete 1 lesson',
  },
  {
    id: 'quiz_beginner',
    category: 'First Time',
    name: 'Quiz Beginner',
    description: 'Completed your first quiz',
    icon: '📝',
    requirement: 'Complete 1 quiz',
  },
  {
    id: 'perfect_start',
    category: 'First Time',
    name: 'Perfect Start',
    description: 'Achieved your first perfect score',
    icon: '🎊',
    requirement: 'Get 100% on a quiz',
  },
  {
    id: 'conversation_starter',
    category: 'First Time',
    name: 'Conversation Starter',
    description: 'Sent your first AI chat message',
    icon: '💬',
    requirement: 'Send 1 chat message',
  },

  // Level Milestones
  {
    id: 'level_5',
    category: 'Level',
    name: 'Level 5 Master',
    description: 'Reached level 5',
    icon: '⭐',
    requirement: 'Reach Level 5',
  },
  {
    id: 'level_10',
    category: 'Level',
    name: 'Level 10 Master',
    description: 'Reached level 10',
    icon: '⭐',
    requirement: 'Reach Level 10',
  },
  {
    id: 'level_25',
    category: 'Level',
    name: 'Level 25 Master',
    description: 'Reached level 25',
    icon: '⭐',
    requirement: 'Reach Level 25',
  },
  {
    id: 'level_50',
    category: 'Level',
    name: 'Level 50 Master',
    description: 'Reached level 50',
    icon: '⭐',
    requirement: 'Reach Level 50',
  },
  {
    id: 'level_100',
    category: 'Level',
    name: 'Level 100 Master',
    description: 'Reached level 100',
    icon: '⭐',
    requirement: 'Reach Level 100',
  },

  // XP Milestones
  {
    id: 'xp_novice',
    category: 'XP',
    name: 'XP Novice',
    description: 'Earned 1,000 total XP',
    icon: '💎',
    requirement: 'Earn 1,000 XP',
  },
  {
    id: 'xp_apprentice',
    category: 'XP',
    name: 'XP Apprentice',
    description: 'Earned 5,000 total XP',
    icon: '💠',
    requirement: 'Earn 5,000 XP',
  },
  {
    id: 'xp_expert',
    category: 'XP',
    name: 'XP Expert',
    description: 'Earned 10,000 total XP',
    icon: '💫',
    requirement: 'Earn 10,000 XP',
  },
  {
    id: 'xp_virtuoso',
    category: 'XP',
    name: 'XP Virtuoso',
    description: 'Earned 50,000 total XP',
    icon: '✨',
    requirement: 'Earn 50,000 XP',
  },
  {
    id: 'xp_legend',
    category: 'XP',
    name: 'XP Legend',
    description: 'Earned 100,000 total XP',
    icon: '🌟',
    requirement: 'Earn 100,000 XP',
  },

  // Lesson Count Achievements
  {
    id: 'study_starter',
    category: 'Lessons',
    name: 'Study Starter',
    description: 'Completed 10 lessons',
    icon: '📚',
    requirement: 'Complete 10 lessons',
  },
  {
    id: 'knowledge_seeker',
    category: 'Lessons',
    name: 'Knowledge Seeker',
    description: 'Completed 25 lessons',
    icon: '🔍',
    requirement: 'Complete 25 lessons',
  },
  {
    id: 'learning_enthusiast',
    category: 'Lessons',
    name: 'Learning Enthusiast',
    description: 'Completed 50 lessons',
    icon: '🌱',
    requirement: 'Complete 50 lessons',
  },
  {
    id: 'century_scholar',
    category: 'Lessons',
    name: 'Century Scholar',
    description: 'Completed 100 lessons',
    icon: '📖',
    requirement: 'Complete 100 lessons',
  },
  {
    id: 'wisdom_master',
    category: 'Lessons',
    name: 'Wisdom Master',
    description: 'Completed 250 lessons',
    icon: '🧙',
    requirement: 'Complete 250 lessons',
  },

  // Quiz Count Achievements
  {
    id: 'quiz_explorer',
    category: 'Quizzes',
    name: 'Quiz Explorer',
    description: 'Completed 10 quizzes',
    icon: '🧭',
    requirement: 'Complete 10 quizzes',
  },
  {
    id: 'quiz_veteran',
    category: 'Quizzes',
    name: 'Quiz Veteran',
    description: 'Completed 50 quizzes',
    icon: '🎓',
    requirement: 'Complete 50 quizzes',
  },
  {
    id: 'quiz_master',
    category: 'Quizzes',
    name: 'Quiz Master',
    description: 'Completed 100 quizzes',
    icon: '👨‍🎓',
    requirement: 'Complete 100 quizzes',
  },

  // Perfect Score Achievements
  {
    id: 'perfectionist',
    category: 'Perfect Scores',
    name: 'Perfectionist',
    description: 'Achieved 5 perfect scores',
    icon: '🎯',
    requirement: 'Get 100% on 5 quizzes',
  },
  {
    id: 'flawless_scholar',
    category: 'Perfect Scores',
    name: 'Flawless Scholar',
    description: 'Achieved 10 perfect scores',
    icon: '💯',
    requirement: 'Get 100% on 10 quizzes',
  },
  {
    id: 'precision_master',
    category: 'Perfect Scores',
    name: 'Precision Master',
    description: 'Achieved 25 perfect scores',
    icon: '🏅',
    requirement: 'Get 100% on 25 quizzes',
  },

  // High Score Achievement
  {
    id: 'almost_perfect',
    category: 'High Scores',
    name: 'Almost Perfect',
    description: 'Scored 90%+ on 10 quizzes',
    icon: '🌟',
    requirement: 'Score 90%+ on 10 quizzes',
  },

  // Engagement Achievements
  {
    id: 'chat_enthusiast',
    category: 'Engagement',
    name: 'Chat Enthusiast',
    description: 'Sent 50 chat messages',
    icon: '💭',
    requirement: 'Send 50 chat messages',
  },
  {
    id: 'conversationalist',
    category: 'Engagement',
    name: 'Conversationalist',
    description: 'Sent 100 chat messages',
    icon: '🗣️',
    requirement: 'Send 100 chat messages',
  },
  {
    id: 'ai_companion',
    category: 'Engagement',
    name: 'AI Companion',
    description: 'Sent 500 chat messages',
    icon: '🤖',
    requirement: 'Send 500 chat messages',
  },

  // Streak Achievements
  {
    id: 'week_warrior',
    category: 'Streaks',
    name: 'Week Warrior',
    description: 'Maintained a 7-day learning streak',
    icon: '🔥',
    requirement: '7-day streak',
  },
  {
    id: 'month_master',
    category: 'Streaks',
    name: 'Month Master',
    description: 'Maintained a 30-day learning streak',
    icon: '🌟',
    requirement: '30-day streak',
  },
  {
    id: 'century_champion',
    category: 'Streaks',
    name: 'Century Champion',
    description: 'Maintained a 100-day learning streak',
    icon: '👑',
    requirement: '100-day streak',
  },
  {
    id: 'year_legend',
    category: 'Streaks',
    name: 'Year Legend',
    description: 'Maintained a 365-day learning streak',
    icon: '🏆',
    requirement: '365-day streak',
  },

  // Time Pattern Achievements
  {
    id: 'night_owl',
    category: 'Time Patterns',
    name: 'Night Owl',
    description: 'Study sessions after 10 PM',
    icon: '🦉',
    requirement: 'Study after 10 PM',
  },
  {
    id: 'early_bird',
    category: 'Time Patterns',
    name: 'Early Bird',
    description: 'Study sessions before 8 AM',
    icon: '🐦',
    requirement: 'Study before 8 AM',
  },

  // Special Achievements
  {
    id: 'profile_pro',
    category: 'Profile',
    name: 'Profile Pro',
    description: 'Completed your full profile',
    icon: '✨',
    requirement: 'Complete all profile fields',
  },
  {
    id: 'champion',
    category: 'Leaderboard',
    name: 'Champion',
    description: 'Reached #1 on the leaderboard',
    icon: '👑',
    requirement: 'Reach rank #1',
    hidden: true,
  },
  {
    id: 'top_10_elite',
    category: 'Leaderboard',
    name: 'Top 10 Elite',
    description: 'Reached top 10 on the leaderboard',
    icon: '🏆',
    requirement: 'Reach top 10',
  },
  {
    id: 'well_rounded_learner',
    category: 'Diversity',
    name: 'Well-Rounded Learner',
    description: 'Explored 3+ different learning modes',
    icon: '🎨',
    requirement: 'Try 3+ learning modes',
  },
];

/**
 * Get all achievement definitions
 */
export function getAllAchievements(): AchievementDefinition[] {
  return ACHIEVEMENTS_REGISTRY;
}

/**
 * Get achievement definition by badge name
 */
export function getAchievementByName(name: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS_REGISTRY.find(
    (achievement) => achievement.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get achievement definition by ID
 */
export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS_REGISTRY.find((achievement) => achievement.id === id);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: string): AchievementDefinition[] {
  return ACHIEVEMENTS_REGISTRY.filter((achievement) => achievement.category === category);
}

/**
 * Get all achievement categories
 */
export function getAchievementCategories(): string[] {
  const categories = new Set(ACHIEVEMENTS_REGISTRY.map((a) => a.category));
  return Array.from(categories);
}

