import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedLessonService } from '@/services/enhancedLessonService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Brain, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import type { Lesson, QuizQuestion } from '@/types/lesson';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface QuizSectionProps {
  lesson: Lesson;
}

export function QuizSection({ lesson }: QuizSectionProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{
    [key: number]: { selected: number; correct: boolean };
  }>({});
  const [showResults, setShowResults] = useState(false);

  const generateQuiz = async () => {
    try {
      setLoading(true);
      const quiz = await EnhancedLessonService.generateQuiz(
        lesson.content,
        lesson.difficulty,
        5
      );
      setQuestions(quiz);
      setShowQuiz(true);
    } catch (error) {
      toast.error('Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;

    const question = questions[currentQuestion];
    const correct = selectedAnswer === question.correct_answer_index;

    // Save answer
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: { selected: selectedAnswer, correct },
    }));

    // Submit to backend
    try {
      await EnhancedLessonService.submitQuizAttempt(
        user!.id,
        lesson.id,
        question.id,
        question.question,
        question.options[selectedAnswer],
        correct,
        correct ? 10 : 0 // 10 XP per correct answer
      );

      if (correct) {
        toast.success('Correct! +10 XP');
      } else {
        toast.error('Incorrect');
      }
    } catch (error) {
      console.error('Failed to submit quiz attempt:', error);
    }

    // Move to next question or show results
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setShowResults(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowResults(false);
  };

  const score = Object.values(answers).filter((a) => a.correct).length;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  if (!showQuiz) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <img src="/logo.png" alt="Lumi Logo" className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">Test Your Knowledge</h3>
            <p className="text-muted-foreground mb-4">
              Take a quick quiz to test your understanding of this lesson. Earn bonus XP
              for each correct answer!
            </p>
            <Button onClick={generateQuiz} disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Quiz
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (showResults) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
            {percentage >= 70 ? (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            ) : (
              <XCircle className="w-8 h-8 text-yellow-500" />
            )}
          </div>
          <h3 className="font-bold text-2xl">Quiz Complete!</h3>
          <div className="text-4xl font-bold text-primary">{percentage}%</div>
          <p className="text-muted-foreground">
            You got {score} out of {questions.length} questions correct
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={resetQuiz}>Try Again</Button>
            <Button variant="outline" onClick={() => setShowQuiz(false)}>
              Close Quiz
            </Button>
          </div>

          <Separator className="my-4" />

          {/* Review Answers */}
          <div className="space-y-4 text-left">
            <h4 className="font-semibold">Review Your Answers</h4>
            {questions.map((question, index) => {
              const answer = answers[index];
              return (
                <Card
                  key={question.id}
                  className={cn(
                    'p-4',
                    answer.correct ? 'border-green-500/50' : 'border-red-500/50'
                  )}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {answer.correct ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-2">{question.question}</p>
                      <p className="text-sm text-muted-foreground">
                        Your answer: {question.options[answer.selected]}
                      </p>
                      {!answer.correct && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Correct answer: {question.options[question.correct_answer]}
                        </p>
                      )}
                      {question.explanation && (
                        <p className="text-sm text-muted-foreground mt-2">
                          💡 {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <Badge variant="secondary">
            {score} correct so far
          </Badge>
        </div>

        <Separator />

        {/* Question */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{question.question}</h3>

          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => setSelectedAnswer(parseInt(value))}
          >
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isAnswered = currentQuestion in answers;
                const isCorrect = question.correct_answer === index;
                const wasSelected = answers[currentQuestion]?.selected === index;

                return (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center space-x-3 p-4 rounded-lg border transition-colors',
                      !isAnswered && isSelected && 'border-primary bg-primary/5',
                      isAnswered &&
                        wasSelected &&
                        isCorrect &&
                        'border-green-500 bg-green-500/10',
                      isAnswered &&
                        wasSelected &&
                        !isCorrect &&
                        'border-red-500 bg-red-500/10'
                    )}
                  >
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                      disabled={isAnswered}
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option}
                    </Label>
                    {isAnswered && wasSelected && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    {isAnswered && wasSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </RadioGroup>

          {/* Explanation (shown after answering) */}
          {currentQuestion in answers && question.explanation && (
            <Card className="p-4 bg-muted/50">
              <p className="text-sm">
                <span className="font-semibold">💡 Explanation: </span>
                {question.explanation}
              </p>
            </Card>
          )}

          {/* Submit Button */}
          {!(currentQuestion in answers) && (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="w-full"
            >
              Submit Answer
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

