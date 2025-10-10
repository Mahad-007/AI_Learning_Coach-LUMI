/**
 * Quiz Service Examples
 * 
 * This file demonstrates how to generate and manage AI-powered quizzes
 */

import { QuizService } from '../services/quizService';
import type { QuizSubmission } from '../types/quiz';

// ============================================================================
// EXAMPLE 1: Generate a Quiz for a Lesson
// ============================================================================
export async function generateQuizExample(userId: string, lessonId: string) {
  try {
    const response = await QuizService.generateQuiz(userId, {
      lesson_id: lessonId,
      difficulty: 'intermediate',
      num_questions: 5,
      topic: 'Photosynthesis',
    });

    console.log('Quiz Generated:', response.quiz);
    console.log('Questions:', response.quiz.questions);
    console.log('XP Reward:', response.quiz.xp_reward);

    return response;
  } catch (error) {
    console.error('Generate quiz failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 2: Generate Adaptive Quiz Based on Performance
// ============================================================================
export async function generateAdaptiveQuizExample(userId: string, lessonId: string) {
  try {
    const response = await QuizService.generateAdaptiveQuiz(userId, {
      lesson_id: lessonId,
      previous_performance: 75, // 75% on last quiz
      focus_areas: ['cellular respiration', 'chloroplast structure'],
    });

    console.log('Adaptive Quiz:', response.quiz);
    // Quiz difficulty will be adjusted based on previous performance

    return response;
  } catch (error) {
    console.error('Generate adaptive quiz failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 3: Get a Quiz
// ============================================================================
export async function getQuizExample(quizId: string) {
  try {
    const quiz = await QuizService.getQuiz(quizId);

    console.log('Quiz:', quiz);
    console.log('Number of Questions:', quiz.questions.length);

    quiz.questions.forEach((q, index) => {
      console.log(`\nQuestion ${index + 1}: ${q.question}`);
      console.log('Options:', q.options);
      // Don't show correct answer yet!
    });

    return quiz;
  } catch (error) {
    console.error('Get quiz failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 4: Submit Quiz Answers
// ============================================================================
export async function submitQuizExample(userId: string, quizId: string) {
  try {
    const submission: QuizSubmission = {
      quiz_id: quizId,
      answers: {
        0: 'Option B', // Answer for question 0
        1: 'Option A', // Answer for question 1
        2: 'Option C', // Answer for question 2
        3: 'Option B', // Answer for question 3
        4: 'Option D', // Answer for question 4
      },
    };

    const result = await QuizService.submitQuiz(userId, submission);

    console.log('Quiz Results:');
    console.log(`Score: ${result.score}/${result.total_questions}`);
    console.log(`Percentage: ${result.percentage}%`);
    console.log(`XP Earned: ${result.xp_earned}`);

    console.log('\nDetailed Results:');
    result.results.forEach((r, index) => {
      console.log(`\nQuestion ${index + 1}: ${r.question}`);
      console.log(`Your Answer: ${r.selected_answer}`);
      console.log(`Correct Answer: ${r.correct_answer}`);
      console.log(`Result: ${r.is_correct ? '✓ Correct' : '✗ Incorrect'}`);
      if (r.explanation) {
        console.log(`Explanation: ${r.explanation}`);
      }
    });

    return result;
  } catch (error) {
    console.error('Submit quiz failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 5: Get All Quizzes for a Lesson
// ============================================================================
export async function getLessonQuizzesExample(lessonId: string) {
  try {
    const quizzes = await QuizService.getLessonQuizzes(lessonId);

    console.log(`Found ${quizzes.length} quizzes for this lesson`);

    quizzes.forEach((quiz) => {
      console.log(`- Quiz ID: ${quiz.id}`);
      console.log(`  Questions: ${quiz.questions.length}`);
      console.log(`  XP Reward: ${quiz.xp_reward}`);
    });

    return quizzes;
  } catch (error) {
    console.error('Get lesson quizzes failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 6: Get User's Quiz History
// ============================================================================
export async function getUserQuizzesExample(userId: string) {
  try {
    const quizzes = await QuizService.getUserQuizzes(userId);

    console.log(`Total Quizzes: ${quizzes.length}`);

    return quizzes;
  } catch (error) {
    console.error('Get user quizzes failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 7: React Component - Quiz Taker
// ============================================================================

/*
import React, { useState, useEffect } from 'react';
import { QuizService } from '@/services/quizService';
import type { Quiz, QuizSubmission } from '@/types/quiz';

function QuizTaker({ userId, quizId }: { userId: string; quizId: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      const data = await QuizService.getQuiz(quizId);
      setQuiz(data);
    } catch (error) {
      console.error('Failed to load quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    try {
      const submission: QuizSubmission = {
        quiz_id: quiz.id,
        answers,
      };

      const quizResult = await QuizService.submitQuiz(userId, submission);
      setResult(quizResult);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  if (loading) return <div>Loading quiz...</div>;
  if (!quiz) return <div>Quiz not found</div>;

  if (result) {
    return (
      <div className="quiz-results">
        <h2>Quiz Results</h2>
        <div className="score">
          <h3>{result.percentage}%</h3>
          <p>
            {result.score} out of {result.total_questions} correct
          </p>
          <p>XP Earned: {result.xp_earned}</p>
        </div>

        <div className="detailed-results">
          {result.results.map((r: any, index: number) => (
            <div
              key={index}
              className={`question-result ${r.is_correct ? 'correct' : 'incorrect'}`}
            >
              <h4>Question {index + 1}</h4>
              <p>{r.question}</p>
              <p>Your Answer: {r.selected_answer}</p>
              <p>Correct Answer: {r.correct_answer}</p>
              {r.explanation && <p>Explanation: {r.explanation}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-taker">
      <h2>Quiz</h2>
      <div className="questions">
        {quiz.questions.map((question, index) => (
          <div key={index} className="question">
            <h3>Question {index + 1}</h3>
            <p>{question.question}</p>
            <div className="options">
              {question.options.map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={answers[index] === option}
                    onChange={() => handleAnswerSelect(index, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={Object.keys(answers).length !== quiz.questions.length}
      >
        Submit Quiz
      </button>
    </div>
  );
}
*/

