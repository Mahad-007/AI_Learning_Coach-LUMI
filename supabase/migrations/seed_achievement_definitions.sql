-- ============================================================================
-- SEED ACHIEVEMENT DEFINITIONS
-- ============================================================================

-- Clear existing data (idempotent)
TRUNCATE TABLE public.achievement_definitions;

-- Insert all achievement definitions
INSERT INTO public.achievement_definitions (id, category, name, description, icon, requirement, requirement_type, requirement_value, is_hidden) VALUES

-- Getting Started
('welcome_aboard', 'Getting Started', 'Welcome Aboard', 'Created your account and joined the learning community', '🎉', 'Sign up for an account', 'first_time', NULL, FALSE),

-- First Time Achievements
('first_steps', 'First Time', 'First Steps', 'Completed your first lesson', '🎯', 'Complete 1 lesson', 'first_time', NULL, FALSE),
('quiz_beginner', 'First Time', 'Quiz Beginner', 'Completed your first quiz', '📝', 'Complete 1 quiz', 'first_time', NULL, FALSE),
('perfect_start', 'First Time', 'Perfect Start', 'Achieved your first perfect score', '🎊', 'Get 100% on a quiz', 'first_time', NULL, FALSE),
('conversation_starter', 'First Time', 'Conversation Starter', 'Sent your first AI chat message', '💬', 'Send 1 chat message', 'first_time', NULL, FALSE),

-- Level Milestones
('level_5', 'Level', 'Level 5 Master', 'Reached level 5', '⭐', 'Reach Level 5', 'level', 5, FALSE),
('level_10', 'Level', 'Level 10 Master', 'Reached level 10', '⭐', 'Reach Level 10', 'level', 10, FALSE),
('level_25', 'Level', 'Level 25 Master', 'Reached level 25', '⭐', 'Reach Level 25', 'level', 25, FALSE),
('level_50', 'Level', 'Level 50 Master', 'Reached level 50', '⭐', 'Reach Level 50', 'level', 50, FALSE),
('level_100', 'Level', 'Level 100 Master', 'Reached level 100', '⭐', 'Reach Level 100', 'level', 100, FALSE),

-- XP Milestones
('xp_novice', 'XP', 'XP Novice', 'Earned 1,000 total XP', '💎', 'Earn 1,000 XP', 'xp', 1000, FALSE),
('xp_apprentice', 'XP', 'XP Apprentice', 'Earned 5,000 total XP', '💠', 'Earn 5,000 XP', 'xp', 5000, FALSE),
('xp_expert', 'XP', 'XP Expert', 'Earned 10,000 total XP', '💫', 'Earn 10,000 XP', 'xp', 10000, FALSE),
('xp_virtuoso', 'XP', 'XP Virtuoso', 'Earned 50,000 total XP', '✨', 'Earn 50,000 XP', 'xp', 50000, FALSE),
('xp_legend', 'XP', 'XP Legend', 'Earned 100,000 total XP', '🌟', 'Earn 100,000 XP', 'xp', 100000, FALSE),

-- Lesson Count
('lesson_study_starter', 'Lessons', 'Study Starter', 'Completed 10 lessons', '📚', 'Complete 10 lessons', 'count', 10, FALSE),
('lesson_knowledge_seeker', 'Lessons', 'Knowledge Seeker', 'Completed 25 lessons', '🔍', 'Complete 25 lessons', 'count', 25, FALSE),
('lesson_learning_enthusiast', 'Lessons', 'Learning Enthusiast', 'Completed 50 lessons', '🌱', 'Complete 50 lessons', 'count', 50, FALSE),
('lesson_century_scholar', 'Lessons', 'Century Scholar', 'Completed 100 lessons', '📖', 'Complete 100 lessons', 'count', 100, FALSE),
('lesson_wisdom_master', 'Lessons', 'Wisdom Master', 'Completed 250 lessons', '🧙', 'Complete 250 lessons', 'count', 250, FALSE),

-- Quiz Count
('quiz_explorer', 'Quizzes', 'Quiz Explorer', 'Completed 10 quizzes', '🧭', 'Complete 10 quizzes', 'count', 10, FALSE),
('quiz_veteran', 'Quizzes', 'Quiz Veteran', 'Completed 50 quizzes', '🎓', 'Complete 50 quizzes', 'count', 50, FALSE),
('quiz_master', 'Quizzes', 'Quiz Master', 'Completed 100 quizzes', '👨‍🎓', 'Complete 100 quizzes', 'count', 100, FALSE),

-- Perfect Scores
('perfect_perfectionist', 'Perfect Scores', 'Perfectionist', 'Achieved 5 perfect scores', '🎯', 'Get 100% on 5 quizzes', 'count', 5, FALSE),
('perfect_flawless_scholar', 'Perfect Scores', 'Flawless Scholar', 'Achieved 10 perfect scores', '💯', 'Get 100% on 10 quizzes', 'count', 10, FALSE),
('perfect_precision_master', 'Perfect Scores', 'Precision Master', 'Achieved 25 perfect scores', '🏅', 'Get 100% on 25 quizzes', 'count', 25, FALSE),

-- Chat Engagement
('chat_enthusiast', 'Engagement', 'Chat Enthusiast', 'Sent 50 chat messages', '💭', 'Send 50 chat messages', 'count', 50, FALSE),
('chat_conversationalist', 'Engagement', 'Conversationalist', 'Sent 100 chat messages', '🗣️', 'Send 100 chat messages', 'count', 100, FALSE),
('chat_ai_companion', 'Engagement', 'AI Companion', 'Sent 500 chat messages', '🤖', 'Send 500 chat messages', 'count', 500, FALSE),

-- Streaks
('streak_week_warrior', 'Streaks', 'Week Warrior', 'Maintained a 7-day learning streak', '🔥', '7-day streak', 'streak', 7, FALSE),
('streak_month_master', 'Streaks', 'Month Master', 'Maintained a 30-day learning streak', '🌟', '30-day streak', 'streak', 30, FALSE),
('streak_century_champion', 'Streaks', 'Century Champion', 'Maintained a 100-day learning streak', '👑', '100-day streak', 'streak', 100, FALSE),
('streak_year_legend', 'Streaks', 'Year Legend', 'Maintained a 365-day learning streak', '🏆', '365-day streak', 'streak', 365, FALSE),

-- Special Achievements (handled separately)
('night_owl', 'Time Patterns', 'Night Owl', 'Study sessions after 10 PM', '🦉', 'Study after 10 PM', 'time_based', NULL, FALSE),
('early_bird', 'Time Patterns', 'Early Bird', 'Study sessions before 8 AM', '🐦', 'Study before 8 AM', 'time_based', NULL, FALSE),
('profile_pro', 'Profile', 'Profile Pro', 'Completed your full profile', '✨', 'Complete all profile fields', 'special', NULL, FALSE),
('champion', 'Leaderboard', 'Champion', 'Reached #1 on the leaderboard', '👑', 'Reach rank #1', 'special', NULL, TRUE),
('top_10_elite', 'Leaderboard', 'Top 10 Elite', 'Reached top 10 on the leaderboard', '🏆', 'Reach top 10', 'special', NULL, FALSE);

