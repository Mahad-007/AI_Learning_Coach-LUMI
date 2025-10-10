/**
 * Dashboard Service Examples
 * 
 * This file demonstrates comprehensive user statistics and analytics
 */

import { DashboardService } from '../services/dashboardService';

// ============================================================================
// EXAMPLE 1: Get Complete Dashboard Stats
// ============================================================================
export async function getDashboardStatsExample(userId: string) {
  try {
    const stats = await DashboardService.getDashboardStats(userId);

    console.log('=== USER PROFILE ===');
    console.log(`Name: ${stats.user.name}`);
    console.log(`Email: ${stats.user.email}`);
    console.log(`Persona: ${stats.user.persona}`);

    console.log('\n=== XP & LEVEL ===');
    console.log(`Total XP: ${stats.xp.total}`);
    console.log(`Current Level: ${stats.xp.level}`);
    console.log(`Progress to Next Level: ${stats.xp.progress_percentage}%`);
    console.log(`XP Needed for Next Level: ${stats.xp.xp_for_next_level}`);

    console.log('\n=== STREAK ===');
    console.log(`Current Streak: ${stats.streak.current} days 🔥`);
    console.log(`Longest Streak: ${stats.streak.longest} days`);

    console.log('\n=== LESSONS ===');
    console.log(`Total Lessons: ${stats.lessons.total}`);
    console.log(`Completed: ${stats.lessons.completed}`);
    console.log(`In Progress: ${stats.lessons.in_progress}`);
    console.log(`Completion Rate: ${stats.lessons.completion_rate}%`);

    console.log('\n=== QUIZZES ===');
    console.log(`Total Quizzes: ${stats.quizzes.total}`);
    console.log(`Completed: ${stats.quizzes.completed}`);
    console.log(`Average Score: ${stats.quizzes.average_score}%`);
    console.log(`Perfect Scores: ${stats.quizzes.perfect_scores}`);

    console.log('\n=== BADGES ===');
    console.log(`Total Badges: ${stats.badges.total}`);
    console.log('Recent Badges:');
    stats.badges.recent.forEach((badge) => {
      console.log(`  ${badge.icon} ${badge.name} - ${badge.earned_at}`);
    });

    console.log('\n=== RECENT ACTIVITY ===');
    stats.recent_activity.slice(0, 5).forEach((activity) => {
      console.log(`[${activity.type}] ${activity.description}`);
      console.log(`  ${activity.timestamp} | +${activity.xp_gained} XP`);
    });

    return stats;
  } catch (error) {
    console.error('Get dashboard stats failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 2: Get Learning Analytics
// ============================================================================
export async function getLearningAnalyticsExample(userId: string) {
  try {
    const analytics = await DashboardService.getLearningAnalytics(userId);

    console.log('=== LEARNING ANALYTICS ===');
    console.log(`Total Study Time: ${Math.floor(analytics.total_study_time / 60)} minutes`);
    console.log(
      `Average Session: ${Math.floor(analytics.average_session_time / 60)} minutes`
    );

    console.log('\nMost Studied Subjects:');
    analytics.most_studied_subjects.forEach((subject, index) => {
      console.log(`${index + 1}. ${subject.subject} (${subject.count} lessons)`);
    });

    console.log('\nCompletion Trend (Last 30 Days):');
    analytics.completion_trend.forEach((trend) => {
      console.log(`${trend.date}: ${trend.completed} lessons completed`);
    });

    console.log('\nQuiz Performance Trend (Last 30 Days):');
    analytics.quiz_performance_trend.forEach((trend) => {
      console.log(`${trend.date}: ${trend.score}% average`);
    });

    return analytics;
  } catch (error) {
    console.error('Get learning analytics failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 3: React Component - Dashboard Overview
// ============================================================================

/*
import React, { useState, useEffect } from 'react';
import { DashboardService } from '@/services/dashboardService';
import type { DashboardStats } from '@/types/gamification';

function DashboardOverview({ userId }: { userId: string }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [userId]);

  const loadDashboard = async () => {
    try {
      const data = await DashboardService.getDashboardStats(userId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (!stats) return <div>Failed to load dashboard</div>;

  return (
    <div className="dashboard">
      <div className="welcome">
        <h1>Welcome back, {stats.user.name}!</h1>
        <p>Keep up the great work! 🚀</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card xp-card">
          <h3>Level {stats.xp.level}</h3>
          <p>{stats.xp.total} Total XP</p>
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${stats.xp.progress_percentage}%` }}
            />
          </div>
          <p className="progress-text">
            {stats.xp.progress_percentage}% to Level {stats.xp.level + 1}
          </p>
        </div>

        <div className="stat-card streak-card">
          <h3>🔥 {stats.streak.current} Day Streak</h3>
          <p>Keep learning daily!</p>
          <p className="best">Best: {stats.streak.longest} days</p>
        </div>

        <div className="stat-card lessons-card">
          <h3>Lessons</h3>
          <p className="big-number">{stats.lessons.completed}</p>
          <p>of {stats.lessons.total} completed</p>
          <div className="completion-rate">
            {stats.lessons.completion_rate}% completion rate
          </div>
        </div>

        <div className="stat-card quizzes-card">
          <h3>Quizzes</h3>
          <p className="big-number">{stats.quizzes.average_score}%</p>
          <p>average score</p>
          <p>{stats.quizzes.perfect_scores} perfect scores 🏆</p>
        </div>
      </div>

      <div className="badges-section">
        <h2>Recent Badges ({stats.badges.total} total)</h2>
        <div className="badges-list">
          {stats.badges.recent.map((badge, index) => (
            <div key={index} className="badge">
              <span className="badge-icon">{badge.icon}</span>
              <span className="badge-name">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-feed">
          {stats.recent_activity.slice(0, 10).map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">{getActivityIcon(activity.type)}</div>
              <div className="activity-content">
                <p>{activity.description}</p>
                <span className="activity-time">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
              {activity.xp_gained > 0 && (
                <div className="activity-xp">+{activity.xp_gained} XP</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    lesson_created: '📝',
    lesson_completed: '✅',
    quiz_complete: '📊',
    chat_message: '💬',
    badge_earned: '🏆',
  };
  return icons[type] || '📌';
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'Just now';
}
*/

