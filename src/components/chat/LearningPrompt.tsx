import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface LearningPromptProps {
  onContinue: () => void;
  chatContext?: Message[];
  className?: string;
}

export function LearningPrompt({ onContinue, chatContext = [], className }: LearningPromptProps) {
  const navigate = useNavigate();

  const handleTakeQuiz = () => {
    // Navigate with chat context so quiz can be generated from conversation
    navigate("/quiz", {
      state: {
        fromChat: true,
        chatContext: chatContext.slice(-14), // Last 14 messages (7 exchanges)
        timestamp: Date.now(),
      },
    });
  };

  return (
    <div className={cn("flex justify-center py-4", className)}>
      <Card className="max-w-md w-full p-6 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/30 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-lg font-bold mb-2">Great progress! 🎉</h3>
            <p className="text-sm text-muted-foreground">
              You've been learning actively. Ready to test your knowledge?
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleTakeQuiz}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Brain className="w-4 h-4 mr-2" />
              Take a Quiz
            </Button>
            <Button
              onClick={onContinue}
              variant="outline"
              className="flex-1 border-primary/30 hover:bg-primary/10"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Continue Learning
            </Button>
          </div>

          {/* Subtext */}
          <p className="text-xs text-muted-foreground">
            Quizzes help reinforce what you've learned! 📚
          </p>
        </div>
      </Card>
    </div>
  );
}

