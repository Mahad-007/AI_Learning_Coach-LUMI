import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  MessageSquare,
  BookOpen,
  Search,
  Brain,
  Zap,
  Target,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateStructuredContent } from "@/lib/geminiClient";
import { QuizResultService } from "@/services/quizResultService";
import { XPService } from "@/services/xpService";
import { useAuth } from "@/contexts/AuthContext";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface LocationState {
  fromChat?: boolean;
  chatContext?: ChatMessage[];
  timestamp?: number;
}

type Difficulty = "beginner" | "intermediate" | "advanced";
type QuizMode = "selection" | "generating" | "active" | "completed";

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const { user, updateProfile } = useAuth();

  // Quiz generation states
  const [mode, setMode] = useState<QuizMode>("selection");
  const [searchTopic, setSearchTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("intermediate");
  
  // Quiz data
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizTopic, setQuizTopic] = useState("");
  const [quizType, setQuizType] = useState<'from_chat' | 'by_topic'>('by_topic');
  
  // Quiz progress
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);

  useEffect(() => {
    if (state?.fromChat && state?.chatContext) {
      // Automatically generate quiz from chat
      setQuizType('from_chat');
      setQuizTopic('Your Learning');
      generateQuizFromChat(state.chatContext);
    }
  }, []);

  const generateQuizFromChat = async (chatContext: ChatMessage[]) => {
    setMode("generating");
    setQuizTitle("Your Learning Quiz");

    try {
      const conversation = chatContext
        .map((msg) => `${msg.role === "user" ? "Student" : "AI"}: ${msg.content}`)
        .join("\n\n");

      const prompt = `Based on this learning conversation, generate a 5-question multiple choice quiz to test the student's understanding:

${conversation}

Create questions that:
1. Test key concepts discussed in the conversation
2. Are clear, specific, and educational
3. Have 4 options each with only ONE correct answer
4. Include brief explanations for correct answers
5. Progress from easier to harder

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Clear question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}`;

      const result = await generateStructuredContent<{ questions: QuizQuestion[] }>(prompt, "scholar");

      if (result.questions && result.questions.length > 0) {
        setQuizData(result.questions);
        setMode("active");
        toast.success("Quiz generated from your conversation! 🎉");
      } else {
        throw new Error("Invalid quiz format");
      }
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      toast.error("Failed to generate quiz. Please try again.");
      setMode("selection");
    }
  };

  const generateQuizFromTopic = async () => {
    if (!searchTopic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setMode("generating");
    setQuizType('by_topic');
    setQuizTopic(searchTopic);
    setQuizTitle(`${searchTopic} Quiz - ${selectedDifficulty}`);

    try {
      const difficultyGuide = {
        beginner: "basic concepts and definitions, suitable for someone just starting",
        intermediate: "moderate complexity, requiring understanding and application of concepts",
        advanced: "challenging questions requiring deep knowledge and critical thinking"
      };

      const prompt = `Generate a 5-question multiple choice quiz about "${searchTopic}" at ${selectedDifficulty} difficulty level.

Difficulty guidelines: ${difficultyGuide[selectedDifficulty]}

Requirements:
1. Questions should be ${selectedDifficulty} level - ${difficultyGuide[selectedDifficulty]}
2. Cover different aspects of ${searchTopic}
3. Each question has 4 options with only ONE correct answer
4. Include brief explanations for correct answers
5. Make questions educational and interesting

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Clear question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}`;

      const result = await generateStructuredContent<{ questions: QuizQuestion[] }>(prompt, "scholar");

      if (result.questions && result.questions.length > 0) {
        setQuizData(result.questions);
        setMode("active");
        toast.success(`${selectedDifficulty} quiz on ${searchTopic} generated! 🎉`);
      } else {
        throw new Error("Invalid quiz format");
      }
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      toast.error("Failed to generate quiz. Please try again.");
      setMode("selection");
    }
  };

  const handleSelectAnswer = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    setShowFeedback(true);

    if (selectedAnswer === quizData[currentQuestion].correctAnswer) {
      setScore(score + 20);
    }

    setTimeout(() => {
      if (currentQuestion < quizData.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        completeQuizAndAwardXP();
      }
    }, 2500);
  };

  const completeQuizAndAwardXP = async () => {
    if (!user) return;

    try {
      const correctAnswers = score / 20; // Each correct = 20 points
      
      const result = await QuizResultService.completeQuiz(user.id, {
        quizType,
        topic: quizTopic,
        difficulty: selectedDifficulty,
        totalQuestions: quizData.length,
        correctAnswers,
      });

      setEarnedXP(result.xpEarned);
      setLeveledUp(result.leveledUp);

      // Update user context
      await updateProfile({ xp: result.newXP, level: result.newLevel });

      if (result.leveledUp) {
        toast.success(`🎉 Level Up! You're now Level ${result.newLevel}!`, {
          description: `You earned ${result.xpEarned} XP from this quiz!`,
        });
      } else {
        toast.success(`+${result.xpEarned} XP earned!`, {
          description: "Great job completing the quiz!",
        });
      }
    } catch (error) {
      console.error('Failed to save quiz results:', error);
    } finally {
      setMode("completed");
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setEarnedXP(0);
    setLeveledUp(false);
    setMode("selection");
    setSearchTopic("");
  };

  const handleBackToChat = () => {
    navigate("/chat");
  };

  // Selection Screen - Choose quiz type
  if (mode === "selection") {
    return (
      <div className="min-h-screen px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-500">
            <div className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
              <img src="/logo.png" alt="Lumi Logo" className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-bold mb-3">Test Your Knowledge</h1>
            <p className="text-muted-foreground text-lg">
              Choose how you want to challenge yourself today
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Option 1: Quiz from Learning */}
            <Card className="p-8 hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-primary/50 animate-in fade-in slide-in-from-left duration-500">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Quiz from Your Learning</h2>
                <p className="text-muted-foreground">
                  Generate a personalized quiz based on your recent AI chat conversations
                </p>
                <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                  <p>✓ Personalized to your learning</p>
                  <p>✓ Based on what you discussed</p>
                  <p>✓ Tests your understanding</p>
                </div>
                <Button 
                  onClick={handleBackToChat}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  size="lg"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Go to Chat to Generate
                </Button>
              </div>
            </Card>

            {/* Option 2: Quiz by Topic */}
            <Card className="p-8 border-2 border-primary/30 relative overflow-hidden animate-in fade-in slide-in-from-right duration-500">
              <div className="absolute top-0 right-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
                    <Search className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Quiz by Topic</h2>
                  <p className="text-muted-foreground text-sm">
                    Enter any topic and choose difficulty level
                  </p>
                </div>

                {/* Topic Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enter Topic</label>
                  <Input
                    placeholder="e.g. Quantum Physics, JavaScript, Ancient Rome..."
                    value={searchTopic}
                    onChange={(e) => setSearchTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && generateQuizFromTopic()}
                    className="text-base"
                  />
                </div>

                {/* Difficulty Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Select Difficulty</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={selectedDifficulty === "beginner" ? "default" : "outline"}
                      onClick={() => setSelectedDifficulty("beginner")}
                      className={cn(
                        "flex-col h-auto py-3",
                        selectedDifficulty === "beginner" && "bg-green-500 hover:bg-green-600"
                      )}
                    >
                      <Zap className="w-5 h-5 mb-1" />
                      <span className="text-xs">Beginner</span>
                    </Button>
                    <Button
                      variant={selectedDifficulty === "intermediate" ? "default" : "outline"}
                      onClick={() => setSelectedDifficulty("intermediate")}
                      className={cn(
                        "flex-col h-auto py-3",
                        selectedDifficulty === "intermediate" && "bg-orange-500 hover:bg-orange-600"
                      )}
                    >
                      <Target className="w-5 h-5 mb-1" />
                      <span className="text-xs">Intermediate</span>
                    </Button>
                    <Button
                      variant={selectedDifficulty === "advanced" ? "default" : "outline"}
                      onClick={() => setSelectedDifficulty("advanced")}
                      className={cn(
                        "flex-col h-auto py-3",
                        selectedDifficulty === "advanced" && "bg-red-500 hover:bg-red-600"
                      )}
                    >
                      <Flame className="w-5 h-5 mb-1" />
                      <span className="text-xs">Advanced</span>
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={generateQuizFromTopic}
                  disabled={!searchTopic.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Quiz
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Loading state while generating quiz
  if (mode === "generating") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <Card className="max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
              <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Generating Your Quiz...</h2>
          <p className="text-muted-foreground mb-4">
            AI is creating personalized questions just for you 🧠
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✨ Analyzing content...</p>
            <p>📝 Creating questions...</p>
            <p>🎯 Setting difficulty...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Quiz completion screen
  if (mode === "completed") {
    const percentage = (score / (quizData.length * 20)) * 100;
    const passed = percentage >= 60;

    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <Card className="max-w-2xl w-full p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="mb-6">
            <div className={cn(
              "inline-flex p-4 rounded-full mb-4 animate-bounce",
              passed ? "bg-gradient-to-br from-green-500 to-emerald-500" : "bg-gradient-to-br from-orange-500 to-yellow-500"
            )}>
              <Trophy className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              {passed ? "Excellent Work! 🎉" : "Good Effort! 💪"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {passed
                ? "You've mastered this topic!"
                : "Keep practicing, you're improving!"}
            </p>
            {leveledUp && (
              <div className="mt-4 inline-block px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold animate-bounce">
                🎉 LEVEL UP! Now Level {user?.level}!
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Score</p>
              <p className={cn(
                "text-3xl font-bold",
                passed ? "text-green-500" : "text-orange-500"
              )}>
                {percentage.toFixed(0)}%
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Correct</p>
              <p className="text-3xl font-bold text-primary">
                {score / 20}/{quizData.length}
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">XP Earned</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                +{earnedXP}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedDifficulty} difficulty
              </p>
            </Card>
          </div>

          <div className="mb-6 p-4 bg-primary/10 rounded-lg">
            <p className="text-sm font-semibold mb-1">{quizTitle}</p>
            <p className="text-xs text-muted-foreground">
              {state?.fromChat 
                ? "✨ Generated from your chat conversation"
                : `✨ AI-generated ${selectedDifficulty} level quiz`}
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              variant="default" 
              size="lg" 
              className="w-full bg-gradient-primary"
              onClick={handleBackToChat}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Continue Learning in Chat
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full"
              onClick={handleRetry}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Take Another Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Active Quiz - Question display
  if (mode === "active" && quizData.length > 0) {
    const question = quizData[currentQuestion];
    const progress = ((currentQuestion + 1) / quizData.length) * 100;
    const isCorrect = selectedAnswer === question.correctAnswer;

  return (
      <div className="min-h-screen px-4 py-24">
        <div className="max-w-3xl mx-auto">
        {/* Header */}
          <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold">{quizTitle}</h1>
                <p className="text-sm text-muted-foreground">
                  {state?.fromChat ? "From your learning" : `${selectedDifficulty} difficulty`}
                </p>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
              <span className="font-medium">
                  Question {currentQuestion + 1}/{quizData.length}
              </span>
            </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="p-8 mb-6 animate-in fade-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-semibold mb-6">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === question.correctAnswer;
                const showCorrect = showFeedback && isCorrectAnswer;
                const showWrong = showFeedback && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={showFeedback}
                  className={cn(
                      "w-full p-4 rounded-lg border-2 text-left transition-all hover:border-primary",
                      isSelected && !showFeedback && "border-primary bg-primary/5 scale-[1.02]",
                      showCorrect && "border-green-500 bg-green-50 dark:bg-green-950 scale-[1.02]",
                      showWrong && "border-red-500 bg-red-50 dark:bg-red-950",
                      !isSelected && !showFeedback && "border-border hover:scale-[1.01]",
                    showFeedback && "cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                      {showCorrect && <CheckCircle2 className="w-6 h-6 text-green-500 animate-in zoom-in" />}
                      {showWrong && <XCircle className="w-6 h-6 text-red-500 animate-in zoom-in" />}
                  </div>
                </button>
              );
            })}
          </div>

            {/* Explanation after answer */}
            {showFeedback && question.explanation && (
              <div className={cn(
                "mt-6 p-4 rounded-lg animate-in fade-in slide-in-from-bottom duration-300",
                isCorrect 
                  ? "bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800" 
                  : "bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800"
              )}>
                <p className="font-semibold mb-2 flex items-center gap-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Correct! Great job!
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      Learning Point:
                    </>
                  )}
                </p>
                <p className="text-sm">{question.explanation}</p>
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => {
                if (currentQuestion > 0 && !showFeedback) {
                  setCurrentQuestion(currentQuestion - 1);
                  setSelectedAnswer(null);
                }
              }}
              disabled={currentQuestion === 0 || showFeedback}
            >
              Previous
            </Button>

          <Button
            onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null || showFeedback}
            size="lg"
              className="bg-gradient-primary"
          >
              {currentQuestion === quizData.length - 1 ? "Finish Quiz" : "Next Question"}
              <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          </div>

          {/* Score indicator */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Current Score: <span className="font-bold text-primary">{score} XP</span>
              {" • "}
              <span className="font-bold">{Math.round((score / ((currentQuestion + 1) * 20)) * 100)}%</span>
            </p>
          </div>
        </div>
    </div>
  );
  }

  // Fallback
  return null;
}
