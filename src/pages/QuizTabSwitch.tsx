import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function QuizTabSwitch() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get quiz data from location state
  const quizData = location.state?.quizData;
  const quizTitle = location.state?.quizTitle;
  const quizTopic = location.state?.quizTopic;
  const quizType = location.state?.quizType;
  const chatContext = location.state?.chatContext;

  const handleRestartQuiz = () => {
    // Navigate back to quiz with the same data
    navigate('/quiz', {
      state: {
        quizData,
        quizTitle,
        quizTopic,
        quizType,
        chatContext,
        restart: true
      }
    });
  };

  const handleContinueToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="max-w-2xl w-full p-12 text-center animate-in fade-in zoom-in">
        <div className="mb-8">
          <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Tab Switch Detected</h2>
          <p className="text-lg text-muted-foreground mb-2">
            You switched tabs during the quiz.
          </p>
          <p className="text-base text-muted-foreground">
            Please choose what you'd like to do next.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleRestartQuiz} 
            className="w-full sm:w-auto px-8 py-3 text-lg"
            size="lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Restart Quiz
          </Button>
          <Button 
            onClick={handleContinueToDashboard} 
            variant="outline"
            className="w-full sm:w-auto px-8 py-3 text-lg"
            size="lg"
          >
            <LayoutDashboard className="w-5 h-5 mr-2" />
            Continue to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
