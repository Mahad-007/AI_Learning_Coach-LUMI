/**
 * Gamification Service Examples
 * 
 * This file demonstrates the XP, leveling, streaks, and badges system
 */

import { GamificationService } from '../services/gamificationService';

// ============================================================================
// EXAMPLE 1: Award XP for an Activity
// ============================================================================
export async function awardXPExample(userId: string) {
  try {
    const update = await GamificationService.awardXP(
      userId,
      'lesson_complete',
      1.0 // multiplier
    );

    console.log('XP Update:');
    console.log(`Activity: ${update.activity_type}`);
    console.log(`XP Gained: ${update.xp_gained}`);
    console.log(`New Total XP: ${update.new_xp}`);
    console.log(`New Level: ${update.new_level}`);
    console.log(`Level Up: ${update.level_up ? 'YES! 🎉' : 'No'}`);

    if (update.badges_earned.length > 0) {
      console.log('New Badges Earned:', update.badges_earned);
    }

    return update;
  } catch (error) {
    console.error('Award XP failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 2: Award XP with Multiplier (Perfect Quiz)
// ============================================================================
export async function awardPerfectQuizXPExample(userId: string) {
  try {
    // Award extra XP for perfect quiz
    const update = await GamificationService.awardXP(
      userId,
      'perfect_quiz',
      1.5 // 50% bonus multiplier
    );

    console.log('Perfect Quiz Bonus!');
    console.log(`XP Gained: ${update.xp_gained}`);

    return update;
  } catch (error) {
    console.error('Award perfect quiz XP failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 3: Update Daily Streak
// ============================================================================
export async function updateStreakExample(userId: string) {
  try {
    const streakInfo = await GamificationService.updateStreak(userId);

    console.log('Streak Info:');
    console.log(`Current Streak: ${streakInfo.current_streak} days 🔥`);
    console.log(`Longest Streak: ${streakInfo.longest_streak} days`);
    console.log(`Last Activity: ${streakInfo.last_activity_date}`);

    if (streakInfo.streak_bonus_xp > 0) {
      console.log(`Streak Bonus XP: ${streakInfo.streak_bonus_xp}`);
    }

    return streakInfo;
  } catch (error) {
    console.error('Update streak failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 4: Get Level Information
// ============================================================================
export function getLevelInfoExample(currentXP: number) {
  const levelInfo = GamificationService.getLevelInfo(currentXP);

  console.log('Level Information:');
  console.log(`Current Level: ${levelInfo.level}`);
  console.log(`XP in Current Level: ${levelInfo.xp_current}`);
  console.log(`XP Required for Next Level: ${levelInfo.xp_required}`);
  console.log(`Progress: ${levelInfo.progress_percentage}%`);

  return levelInfo;
}

// ============================================================================
// EXAMPLE 5: Calculate Level from XP
// ============================================================================
export function calculateLevelExample() {
  const examples = [
    { xp: 0, level: GamificationService.calculateLevel(0) },
    { xp: 100, level: GamificationService.calculateLevel(100) },
    { xp: 500, level: GamificationService.calculateLevel(500) },
    { xp: 1000, level: GamificationService.calculateLevel(1000) },
    { xp: 10000, level: GamificationService.calculateLevel(10000) },
  ];

  console.log('XP to Level Conversion:');
  examples.forEach(({ xp, level }) => {
    console.log(`${xp} XP = Level ${level}`);
  });

  return examples;
}

// ============================================================================
// EXAMPLE 6: Get XP Required for Level
// ============================================================================
export function getXPForLevelExample() {
  const examples = [
    { level: 1, xp: GamificationService.getXPForLevel(1) },
    { level: 5, xp: GamificationService.getXPForLevel(5) },
    { level: 10, xp: GamificationService.getXPForLevel(10) },
    { level: 25, xp: GamificationService.getXPForLevel(25) },
    { level: 50, xp: GamificationService.getXPForLevel(50) },
  ];

  console.log('Level to XP Requirements:');
  examples.forEach(({ level, xp }) => {
    console.log(`Level ${level} requires ${xp} total XP`);
  });

  return examples;
}

// ============================================================================
// EXAMPLE 7: Get All User Badges
// ============================================================================
export async function getUserBadgesExample(userId: string) {
  try {
    const badges = await GamificationService.getUserBadges(userId);

    console.log(`Total Badges: ${badges.length}`);

    badges.forEach((badge) => {
      console.log(`${badge.badge_icon} ${badge.badge_name}`);
      console.log(`  ${badge.badge_description}`);
      console.log(`  Earned: ${badge.earned_at}`);
    });

    return badges;
  } catch (error) {
    console.error('Get badges failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 8: React Component - XP Progress Bar
// ============================================================================

/*
import React, { useState, useEffect } from 'react';
import { GamificationService } from '@/services/gamificationService';

function XPProgressBar({ userId, currentXP }: { userId: string; currentXP: number }) {
  const [levelInfo, setLevelInfo] = useState<any>(null);

  useEffect(() => {
    const info = GamificationService.getLevelInfo(currentXP);
    setLevelInfo(info);
  }, [currentXP]);

  if (!levelInfo) return null;

  return (
    <div className="xp-progress">
      <div className="level-info">
        <h3>Level {levelInfo.level}</h3>
        <p>
          {levelInfo.xp_current} / {levelInfo.xp_required} XP
        </p>
      </div>
      
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${levelInfo.progress_percentage}%` }}
        />
      </div>

      <p className="progress-text">
        {levelInfo.progress_percentage}% to Level {levelInfo.level + 1}
      </p>
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 9: React Component - Streak Tracker
// ============================================================================

/*
import React, { useState, useEffect } from 'react';
import { GamificationService } from '@/services/gamificationService';

function StreakTracker({ userId }: { userId: string }) {
  const [streak, setStreak] = useState<any>(null);

  useEffect(() => {
    loadStreak();
  }, [userId]);

  const loadStreak = async () => {
    try {
      const data = await GamificationService.updateStreak(userId);
      setStreak(data);
    } catch (error) {
      console.error('Failed to load streak:', error);
    }
  };

  if (!streak) return null;

  const getStreakEmoji = (days: number) => {
    if (days >= 30) return '🔥🔥🔥';
    if (days >= 7) return '🔥🔥';
    if (days >= 3) return '🔥';
    return '✨';
  };

  return (
    <div className="streak-tracker">
      <div className="streak-display">
        <span className="streak-emoji">{getStreakEmoji(streak.current_streak)}</span>
        <span className="streak-count">{streak.current_streak}</span>
        <span className="streak-label">Day Streak</span>
      </div>

      {streak.streak_bonus_xp > 0 && (
        <div className="streak-bonus">
          <span>Bonus: +{streak.streak_bonus_xp} XP per activity</span>
        </div>
      )}

      <div className="streak-best">
        <span>Best: {streak.longest_streak} days</span>
      </div>
    </div>
  );
}
*/

