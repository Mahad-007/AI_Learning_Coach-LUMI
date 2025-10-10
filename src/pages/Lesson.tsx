import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Play, BookOpen, TrendingUp, Clock, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const objectives = [
  { title: "Understand array methods", completed: true },
  { title: "Learn map, filter, and reduce", completed: true },
  { title: "Practice with real examples", completed: false },
  { title: "Complete coding exercises", completed: false },
];

export default function Lesson() {
  const [progress] = useState(65);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <BookOpen className="w-4 h-4" />
            <span>JavaScript Course</span>
            <span>•</span>
            <span>Lesson 12 of 24</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Advanced JavaScript Array Methods</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>45 minutes</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>150 XP</span>
            </div>
            <div className="inline-flex items-center gap-1 bg-success/10 text-success px-3 py-1 rounded-full">
              <span className="font-medium">Intermediate</span>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold">Your Progress</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video/Content Card */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-hero flex items-center justify-center">
                <Button variant="hero" size="xl" className="shadow-glow">
                  <Play className="w-6 h-6 mr-2" />
                  Play Video Lesson
                </Button>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Introduction to Array Methods</h2>
                <p className="text-muted-foreground mb-4">
                  Array methods are powerful tools in JavaScript that allow you to manipulate and
                  transform arrays efficiently. In this lesson, we'll explore the most commonly
                  used array methods including map(), filter(), and reduce().
                </p>
                <p className="text-muted-foreground">
                  These methods are fundamental to modern JavaScript development and will help you
                  write cleaner, more maintainable code. By the end of this lesson, you'll be able
                  to chain multiple array methods together to solve complex data transformation
                  problems.
                </p>
              </div>
            </Card>

            {/* Article Content */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Key Concepts</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. The map() Method</h4>
                  <p className="text-muted-foreground">
                    Creates a new array by applying a function to each element of the original
                    array. Perfect for transforming data.
                  </p>
                  <div className="mt-2 p-4 bg-muted rounded-lg font-mono text-sm">
                    const doubled = [1, 2, 3].map(x =&gt; x * 2);
                    <br />
                    // Result: [2, 4, 6]
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">2. The filter() Method</h4>
                  <p className="text-muted-foreground">
                    Creates a new array containing only elements that pass a test function.
                    Essential for filtering data.
                  </p>
                  <div className="mt-2 p-4 bg-muted rounded-lg font-mono text-sm">
                    const evens = [1, 2, 3, 4].filter(x =&gt; x % 2 === 0);
                    <br />
                    // Result: [2, 4]
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">3. The reduce() Method</h4>
                  <p className="text-muted-foreground">
                    Reduces an array to a single value by applying a function to each element.
                    Great for aggregating data.
                  </p>
                  <div className="mt-2 p-4 bg-muted rounded-lg font-mono text-sm">
                    const sum = [1, 2, 3, 4].reduce((acc, x) =&gt; acc + x, 0);
                    <br />
                    // Result: 10
                  </div>
                </div>
              </div>
            </Card>

            {/* Navigation */}
            <div className="flex gap-4">
              <Button variant="outline" size="lg" className="flex-1">
                Previous Lesson
              </Button>
              <Button variant="hero" size="lg" className="flex-1">
                Next Lesson
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Objectives */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Learning Objectives</h3>
              <div className="space-y-3">
                {objectives.map((objective, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {objective.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        objective.completed ? "line-through text-muted-foreground" : ""
                      )}
                    >
                      {objective.title}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* AI Help */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-6 h-6 text-primary" />
                <h3 className="font-bold">Need Help?</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Ask your AI tutor for clarification on any topic in this lesson.
              </p>
              <Button variant="hero" className="w-full">
                Chat with AI Tutor
              </Button>
            </Card>

            {/* Take Quiz */}
            <Card className="p-6">
              <h3 className="font-bold mb-3">Ready to Test Your Knowledge?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Take the quiz to earn XP and unlock the next lesson.
              </p>
              <Button variant="accent" className="w-full">
                Take Quiz
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
