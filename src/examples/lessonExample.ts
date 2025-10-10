/**
 * Lesson Service Examples
 * 
 * This file demonstrates how to generate and manage AI-powered lessons
 */

import { LessonService } from '../services/lessonService';

// ============================================================================
// EXAMPLE 1: Generate a Beginner Lesson
// ============================================================================
export async function generateBeginnerLessonExample(userId: string) {
  try {
    const response = await LessonService.generateLesson(userId, {
      subject: 'French',
      topic: 'Basic Greetings and Introductions',
      difficulty: 'beginner',
      duration: 20, // minutes
    });

    console.log('Lesson Generated:', response.lesson);
    console.log('Topic:', response.lesson.topic);
    console.log('Objectives:', response.lesson.objectives);
    console.log('Key Points:', response.lesson.key_points);
    console.log('XP Reward:', response.lesson.xp_reward);

    return response;
  } catch (error) {
    console.error('Generate lesson failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 2: Generate an Advanced Lesson
// ============================================================================
export async function generateAdvancedLessonExample(userId: string) {
  try {
    const response = await LessonService.generateLesson(userId, {
      subject: 'Computer Science',
      topic: 'Advanced Algorithms - Dynamic Programming',
      difficulty: 'advanced',
      duration: 60,
      persona: 'scholar', // Use scholarly tone
    });

    console.log('Advanced Lesson:', response.lesson);

    return response;
  } catch (error) {
    console.error('Generate advanced lesson failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 3: Get a Lesson with Progress
// ============================================================================
export async function getLessonExample(userId: string, lessonId: string) {
  try {
    const lesson = await LessonService.getLesson(userId, lessonId);

    console.log('Lesson:', lesson.topic);
    console.log('Content:', lesson.content);
    console.log('Progress:', lesson.progress);

    if (lesson.progress) {
      console.log('Completed:', lesson.progress.completed);
      console.log('Time Spent:', lesson.progress.time_spent, 'seconds');
    }

    return lesson;
  } catch (error) {
    console.error('Get lesson failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 4: Get All User Lessons
// ============================================================================
export async function getUserLessonsExample(userId: string) {
  try {
    const lessons = await LessonService.getUserLessons(userId);

    console.log(`Total Lessons: ${lessons.length}`);

    lessons.forEach((lesson) => {
      console.log(`- ${lesson.topic} (${lesson.difficulty})`);
      console.log(`  Completed: ${lesson.progress?.completed ? 'Yes' : 'No'}`);
    });

    return lessons;
  } catch (error) {
    console.error('Get user lessons failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 5: Update Lesson Progress
// ============================================================================
export async function updateProgressExample(
  userId: string,
  lessonId: string,
  timeSpent: number
) {
  try {
    await LessonService.updateProgress(userId, lessonId, timeSpent);

    console.log(`Progress updated: ${timeSpent} seconds spent`);
  } catch (error) {
    console.error('Update progress failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 6: Complete a Lesson
// ============================================================================
export async function completeLessonExample(userId: string, lessonId: string) {
  try {
    const xpEarned = await LessonService.completeLesson(userId, lessonId);

    console.log('Lesson completed!');
    console.log('XP Earned:', xpEarned);

    return xpEarned;
  } catch (error) {
    console.error('Complete lesson failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 7: Search Lessons
// ============================================================================
export async function searchLessonsExample(userId: string, query: string) {
  try {
    const lessons = await LessonService.searchLessons(userId, query);

    console.log(`Found ${lessons.length} lessons matching "${query}"`);

    lessons.forEach((lesson) => {
      console.log(`- ${lesson.topic}`);
    });

    return lessons;
  } catch (error) {
    console.error('Search lessons failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 8: Delete a Lesson
// ============================================================================
export async function deleteLessonExample(userId: string, lessonId: string) {
  try {
    await LessonService.deleteLesson(userId, lessonId);
    console.log('Lesson deleted');
  } catch (error) {
    console.error('Delete lesson failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 9: React Component - Lesson Viewer
// ============================================================================

/*
import React, { useState, useEffect } from 'react';
import { LessonService } from '@/services/lessonService';

function LessonViewer({ userId, lessonId }: { userId: string; lessonId: string }) {
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    loadLesson();

    // Track time spent
    const interval = setInterval(() => {
      setTimeSpent((prev) => {
        const newTime = prev + 1;
        // Update progress every 30 seconds
        if (newTime % 30 === 0) {
          LessonService.updateProgress(userId, lessonId, newTime);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [userId, lessonId]);

  const loadLesson = async () => {
    try {
      const data = await LessonService.getLesson(userId, lessonId);
      setLesson(data);
    } catch (error) {
      console.error('Failed to load lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      const xp = await LessonService.completeLesson(userId, lessonId);
      alert(`Lesson completed! You earned ${xp} XP!`);
    } catch (error) {
      console.error('Failed to complete lesson:', error);
    }
  };

  if (loading) return <div>Loading lesson...</div>;
  if (!lesson) return <div>Lesson not found</div>;

  return (
    <div className="lesson-viewer">
      <h1>{lesson.topic}</h1>
      <div className="lesson-meta">
        <span>Difficulty: {lesson.difficulty}</span>
        <span>Duration: {lesson.duration} min</span>
        <span>XP Reward: {lesson.xp_reward}</span>
      </div>

      <div className="objectives">
        <h2>Learning Objectives</h2>
        <ul>
          {lesson.objectives.map((obj: string, i: number) => (
            <li key={i}>{obj}</li>
          ))}
        </ul>
      </div>

      <div className="content">
        <h2>Lesson Content</h2>
        <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
      </div>

      <div className="key-points">
        <h2>Key Points</h2>
        <ul>
          {lesson.key_points.map((point: string, i: number) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </div>

      <button onClick={handleComplete} disabled={lesson.progress?.completed}>
        {lesson.progress?.completed ? 'Completed ✓' : 'Mark as Complete'}
      </button>
    </div>
  );
}
*/

