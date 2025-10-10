import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { TriviaService, TriviaQuestion } from "@/services/triviaService";
import { supabase } from "@/lib/supabaseClient";

export default function TriviaGame() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [loading, setLoading] = useState(true);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    if (!roomId) return;

    // Load questions from localStorage (stored by host)
    const storedQuestions = localStorage.getItem(`trivia_questions_${roomId}`);
    if (storedQuestions) {
      const parsedQuestions = JSON.parse(storedQuestions) as TriviaQuestion[];
      setQuestions(parsedQuestions);
      setLoading(false);
    } else {
      // Fallback: generate questions (shouldn't happen)
      generateQuestions();
    }
  }, [roomId]);

  useEffect(() => {
    if (isAnswered || questions.length === 0) return;

    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, isAnswered, questions]);

  const generateQuestions = async () => {
    try {
      const generated = await TriviaService.generateTriviaQuestions(10, 'medium');
      setQuestions(generated);
    } catch (error) {
      console.error('Failed to generate questions:', error);
      toast.error("Failed to load questions");
      navigate('/trivia');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeout = () => {
    if (!isAnswered && currentQuestion) {
      handleAnswerSubmit(null, currentQuestion.correct_answer);
    }
  };

  const handleAnswerSubmit = async (answer: string | null, correctAnswer: string) => {
    if (!roomId || !user || isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    const currentQuestion = questions[currentQuestionIndex];

    try {
      const { isCorrect, newScore } = await TriviaService.submitAnswer(
        roomId,
        user.id,
        currentQuestion.id,
        answer || '',
        correctAnswer,
        timeTaken
      );

      setScore(newScore);
      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
        toast.success("Correct! +10 points", {
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        });
      } else {
        toast.error(answer ? "Incorrect!" : "Time's up!", {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          description: `Correct answer: ${correctAnswer}`,
        });
      }

      // Move to next question after 2 seconds
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
          setTimeLeft(15);
          setQuestionStartTime(Date.now());
        } else {
          // Game ended
          endGame();
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      toast.error("Failed to submit answer");
    }
  };

  const endGame = async () => {
    if (!roomId) return;
    
    try {
      await TriviaService.endGame(roomId);
      toast.success("Game completed!");
      navigate(`/trivia/leaderboard/${roomId}`);
    } catch (error) {
      console.error('Failed to end game:', error);
      navigate(`/trivia/leaderboard/${roomId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Questions Available</h2>
          <p className="text-muted-foreground mb-4">Unable to load trivia questions</p>
          <Button onClick={() => navigate('/trivia')}>Back to Lobby</Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen px-4 py-16 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl mx-auto">
        {/* Header Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{score}</div>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3" />
              Score
            </p>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{correctCount}</div>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Correct
            </p>
          </Card>
          
          <Card className={`p-4 text-center ${timeLeft <= 5 ? 'animate-pulse bg-red-500/10' : ''}`}>
            <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-primary'}`}>
              {timeLeft}s
            </div>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Time Left
            </p>
          </Card>
        </div>

        {/* Progress */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <Badge variant="outline" className="capitalize">
              {currentQuestion.difficulty}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </Card>

        {/* Question Card */}
        <Card className="p-8 mb-6">
          <div className="mb-6">
            {currentQuestion.category && (
              <Badge variant="secondary" className="mb-3">
                {currentQuestion.category}
              </Badge>
            )}
            <h2 className="text-2xl font-bold leading-tight">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correct_answer;
              const showCorrect = isAnswered && isCorrect;
              const showIncorrect = isAnswered && isSelected && !isCorrect;

              let buttonClass = "w-full justify-start text-left h-auto py-4 px-6 text-base";
              
              if (showCorrect) {
                buttonClass += " bg-green-500 hover:bg-green-600 text-white border-green-600";
              } else if (showIncorrect) {
                buttonClass += " bg-red-500 hover:bg-red-600 text-white border-red-600";
              } else if (isAnswered) {
                buttonClass += " opacity-50 cursor-not-allowed";
              } else {
                buttonClass += " border-2 hover:border-primary hover:bg-primary/5";
              }

              return (
                <Button
                  key={index}
                  variant={isSelected && !isAnswered ? "default" : "outline"}
                  className={buttonClass}
                  onClick={() => !isAnswered && handleAnswerSubmit(option, currentQuestion.correct_answer)}
                  disabled={isAnswered}
                >
                  <span className="flex-1">{option}</span>
                  {showCorrect && <CheckCircle2 className="w-5 h-5 ml-2" />}
                  {showIncorrect && <XCircle className="w-5 h-5 ml-2" />}
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Fun Encouragement */}
        {!isAnswered && (
          <Card className="p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-primary animate-pulse" />
              <span>Quick thinking earns you points!</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

