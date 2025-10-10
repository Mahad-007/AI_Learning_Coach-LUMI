import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Clock, Trophy, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const quizData = [
  {
    question: "What is the output of: console.log(typeof [])?",
    options: ["array", "object", "undefined", "null"],
    correctAnswer: 1,
  },
  {
    question: "Which method is used to add an element to the end of an array?",
    options: ["push()", "pop()", "shift()", "unshift()"],
    correctAnswer: 0,
  },
  {
    question: "What does 'this' keyword refer to in JavaScript?",
    options: [
      "The current function",
      "The global object",
      "The object it belongs to",
      "None of the above",
    ],
    correctAnswer: 2,
  },
];

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizCompleted, setQuizCompleted] = useState(false);

  const question = quizData[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.length) * 100;

  const handleSelectAnswer = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    setShowFeedback(true);

    if (selectedAnswer === question.correctAnswer) {
      setScore(score + 100);
    }

    setTimeout(() => {
      if (currentQuestion < quizData.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setQuizCompleted(true);
      }
    }, 1500);
  };

  if (quizCompleted) {
    const percentage = (score / (quizData.length * 100)) * 100;
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <Card className="max-w-2xl w-full p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex p-4 bg-gradient-primary rounded-full mb-4 animate-scale-in">
              <Trophy className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Quiz Complete! 🎉</h1>
            <p className="text-muted-foreground text-lg">Great job on finishing the quiz!</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Score</p>
              <p className="text-3xl font-bold text-primary">{percentage.toFixed(0)}%</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">XP Earned</p>
              <p className="text-3xl font-bold text-success">+{score}</p>
            </Card>
          </div>

          <div className="space-y-3">
            <Button variant="hero" size="lg" className="w-full">
              Continue Learning
            </Button>
            <Button variant="outline" size="lg" className="w-full">
              Retry Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-medium">{score} XP</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Question {currentQuestion + 1} of {quizData.length}
          </p>
        </Card>

        {/* Question */}
        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-8">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const showCorrect = showFeedback && isCorrect;
              const showIncorrect = showFeedback && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full p-4 text-left rounded-lg border-2 transition-all duration-300",
                    "hover:border-primary hover:bg-primary/5",
                    isSelected && !showFeedback && "border-primary bg-primary/10",
                    showCorrect && "border-success bg-success/10",
                    showIncorrect && "border-destructive bg-destructive/10",
                    showFeedback && "cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showCorrect && <CheckCircle2 className="w-6 h-6 text-success" />}
                    {showIncorrect && <XCircle className="w-6 h-6 text-destructive" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Feedback */}
        {showFeedback && (
          <Card
            className={cn(
              "p-6 mb-6 animate-scale-in",
              selectedAnswer === question.correctAnswer
                ? "border-success bg-success/5"
                : "border-destructive bg-destructive/5"
            )}
          >
            <div className="flex items-start gap-3">
              {selectedAnswer === question.correctAnswer ? (
                <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-1" />
              ) : (
                <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              )}
              <div>
                <h3 className="font-bold text-lg mb-1">
                  {selectedAnswer === question.correctAnswer ? "Correct! 🎉" : "Incorrect"}
                </h3>
                <p className="text-muted-foreground">
                  {selectedAnswer === question.correctAnswer
                    ? "Great job! You've earned 100 XP."
                    : `The correct answer is: ${question.options[question.correctAnswer]}`}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Submit Button */}
        {!showFeedback && (
          <Button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            variant="hero"
            size="lg"
            className="w-full"
          >
            Submit Answer <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
