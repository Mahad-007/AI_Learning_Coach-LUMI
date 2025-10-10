/**
 * Leaderboard Service Examples
 * 
 * This file demonstrates global, weekly, and monthly leaderboards
 */

import { LeaderboardService } from '../services/leaderboardService';

// ============================================================================
// EXAMPLE 1: Get Complete Leaderboard
// ============================================================================
export async function getLeaderboardExample(userId?: string) {
  try {
    const leaderboard = await LeaderboardService.getLeaderboard(userId);

    console.log('=== GLOBAL LEADERBOARD ===');
    leaderboard.global.slice(0, 10).forEach((entry, index) => {
      console.log(
        `${index + 1}. ${entry.user_name} - ${entry.total_xp} XP (Level ${entry.level})`
      );
    });

    console.log('\n=== WEEKLY LEADERBOARD ===');
    leaderboard.weekly.slice(0, 10).forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.user_name} - ${entry.weekly_xp} XP this week`);
    });

    console.log('\n=== MONTHLY LEADERBOARD ===');
    leaderboard.monthly.slice(0, 10).forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.user_name} - ${entry.monthly_xp} XP this month`);
    });

    if (leaderboard.user_position) {
      console.log('\n=== YOUR POSITION ===');
      console.log(`Global Rank: #${leaderboard.user_position.rank}`);
      console.log(`Total XP: ${leaderboard.user_position.total_xp}`);
    }

    return leaderboard;
  } catch (error) {
    console.error('Get leaderboard failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 2: Get Global Leaderboard Only
// ============================================================================
export async function getGlobalLeaderboardExample(limit: number = 100) {
  try {
    const global = await LeaderboardService.getGlobalLeaderboard(limit);

    console.log(`Top ${limit} Players Globally:`);
    global.forEach((entry) => {
      console.log(
        `#${entry.rank} ${entry.user_name} - ${entry.total_xp} XP (Lvl ${entry.level})`
      );
    });

    return global;
  } catch (error) {
    console.error('Get global leaderboard failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 3: Get Weekly Leaderboard
// ============================================================================
export async function getWeeklyLeaderboardExample() {
  try {
    const weekly = await LeaderboardService.getWeeklyLeaderboard(50);

    console.log('Top 50 This Week:');
    weekly.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.user_name} - ${entry.weekly_xp} XP`);
    });

    return weekly;
  } catch (error) {
    console.error('Get weekly leaderboard failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 4: Get Monthly Leaderboard
// ============================================================================
export async function getMonthlyLeaderboardExample() {
  try {
    const monthly = await LeaderboardService.getMonthlyLeaderboard(50);

    console.log('Top 50 This Month:');
    monthly.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.user_name} - ${entry.monthly_xp} XP`);
    });

    return monthly;
  } catch (error) {
    console.error('Get monthly leaderboard failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 5: Get User Position
// ============================================================================
export async function getUserPositionExample(userId: string) {
  try {
    const position = await LeaderboardService.getUserPosition(userId);

    if (position) {
      console.log('Your Leaderboard Stats:');
      console.log(`Global Rank: #${position.rank}`);
      console.log(`Total XP: ${position.total_xp}`);
      console.log(`Level: ${position.level}`);
      console.log(`Weekly XP: ${position.weekly_xp}`);
      console.log(`Monthly XP: ${position.monthly_xp}`);
    } else {
      console.log('Not on leaderboard yet');
    }

    return position;
  } catch (error) {
    console.error('Get user position failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 6: Get Friends Leaderboard
// ============================================================================
export async function getFriendsLeaderboardExample(
  userId: string,
  friendIds: string[]
) {
  try {
    const friends = await LeaderboardService.getFriendsLeaderboard(userId, friendIds);

    console.log('Friends Leaderboard:');
    friends.forEach((entry, index) => {
      const isYou = entry.user_id === userId;
      console.log(
        `${index + 1}. ${entry.user_name}${isYou ? ' (You)' : ''} - ${entry.total_xp} XP`
      );
    });

    return friends;
  } catch (error) {
    console.error('Get friends leaderboard failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 7: React Component - Leaderboard Display
// ============================================================================

/*
import React, { useState, useEffect } from 'react';
import { LeaderboardService } from '@/services/leaderboardService';
import type { LeaderboardResponse } from '@/types/gamification';

function LeaderboardDisplay({ userId }: { userId: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'global' | 'weekly' | 'monthly'>('global');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [userId]);

  const loadLeaderboard = async () => {
    try {
      const data = await LeaderboardService.getLeaderboard(userId);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading leaderboard...</div>;
  if (!leaderboard) return <div>Failed to load leaderboard</div>;

  const getCurrentLeaderboard = () => {
    switch (activeTab) {
      case 'weekly':
        return leaderboard.weekly;
      case 'monthly':
        return leaderboard.monthly;
      default:
        return leaderboard.global;
    }
  };

  const getXPValue = (entry: any) => {
    switch (activeTab) {
      case 'weekly':
        return entry.weekly_xp;
      case 'monthly':
        return entry.monthly_xp;
      default:
        return entry.total_xp;
    }
  };

  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>

      {leaderboard.user_position && (
        <div className="user-position">
          <h3>Your Rank: #{leaderboard.user_position.rank}</h3>
          <p>Total XP: {leaderboard.user_position.total_xp}</p>
        </div>
      )}

      <div className="tabs">
        <button
          className={activeTab === 'global' ? 'active' : ''}
          onClick={() => setActiveTab('global')}
        >
          Global
        </button>
        <button
          className={activeTab === 'weekly' ? 'active' : ''}
          onClick={() => setActiveTab('weekly')}
        >
          This Week
        </button>
        <button
          className={activeTab === 'monthly' ? 'active' : ''}
          onClick={() => setActiveTab('monthly')}
        >
          This Month
        </button>
      </div>

      <div className="leaderboard-list">
        {getCurrentLeaderboard().slice(0, 50).map((entry, index) => (
          <div
            key={entry.user_id}
            className={`leaderboard-entry ${
              entry.user_id === userId ? 'current-user' : ''
            }`}
          >
            <div className="rank">
              {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
            </div>
            <div className="avatar">
              {entry.avatar_url ? (
                <img src={entry.avatar_url} alt={entry.user_name} />
              ) : (
                <div className="avatar-placeholder">
                  {entry.user_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="info">
              <div className="name">{entry.user_name}</div>
              <div className="level">Level {entry.level}</div>
            </div>
            <div className="xp">{getXPValue(entry)} XP</div>
          </div>
        ))}
      </div>
    </div>
  );
}
*/

