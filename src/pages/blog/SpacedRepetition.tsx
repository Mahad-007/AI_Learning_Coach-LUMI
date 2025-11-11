import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import AOS from "aos";

export default function SpacedRepetition() {
  useEffect(() => {
    AOS.init({ duration: 600, once: true });
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/blog">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        <article>
          <div className="mb-8" data-aos="fade-down">
            <Badge className="mb-4">Science</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              The Science of Spaced Repetition Learning
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground mb-6">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                March 5, 2024
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                6 min read
              </span>
            </div>
            <div className="text-6xl mb-8 text-center">🔬</div>
          </div>

          <div className="prose prose-lg max-w-none" data-aos="fade-up">
            <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <p className="text-xl text-muted-foreground italic">
                "The secret to remembering everything isn't studying harder—it's studying at the right intervals."
              </p>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-6">What Is Spaced Repetition?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Spaced repetition is a learning technique that involves reviewing information at increasing intervals. Instead of cramming everything at once, you review material just as you're about to forget it. This timing is crucial—it's what makes spaced repetition one of the most powerful learning strategies ever discovered.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-6">The Forgetting Curve</h2>
            <Card className="p-6 mb-6">
              <p className="text-muted-foreground mb-4">
                In 1885, psychologist Hermann Ebbinghaus discovered the forgetting curve: without reinforcement, we forget about 50% of new information within an hour, and 70% within 24 hours. Depressing, right?
              </p>
              <p className="text-muted-foreground">
                But here's the good news: each time you review information before forgetting it completely, the forgetting curve becomes shallower. Eventually, information moves into long-term memory.
              </p>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-6">The Optimal Schedule</h2>
            <Card className="p-6 mb-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
              <h3 className="text-lg font-bold mb-4">Ideal Review Intervals:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-32 font-semibold">First Review:</span>
                  <span className="text-muted-foreground">1 day after initial learning</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-32 font-semibold">Second Review:</span>
                  <span className="text-muted-foreground">3 days later</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-32 font-semibold">Third Review:</span>
                  <span className="text-muted-foreground">1 week later</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-32 font-semibold">Fourth Review:</span>
                  <span className="text-muted-foreground">2 weeks later</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-32 font-semibold">Fifth Review:</span>
                  <span className="text-muted-foreground">1 month later</span>
                </div>
              </div>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-6">Why It Works So Well</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <h3 className="font-bold mb-2">🧠 Strengthens Neural Pathways</h3>
                <p className="text-sm text-muted-foreground">
                  Each review strengthens the neural connections, making recall faster and more reliable.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold mb-2">⚡ Efficient Use of Time</h3>
                <p className="text-sm text-muted-foreground">
                  Focus only on what you're about to forget, not what you already know well.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold mb-2">💪 Builds Long-term Memory</h3>
                <p className="text-sm text-muted-foreground">
                  Information gradually moves from short-term to permanent storage.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold mb-2">🎯 Reduces Cramming Stress</h3>
                <p className="text-sm text-muted-foreground">
                  Spread out learning means less panic before exams.
                </p>
              </Card>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-6">How to Implement Spaced Repetition</h2>
            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Method 1: The Leitner System</h3>
              <p className="text-muted-foreground mb-3">
                Use flashcards organized into boxes. Cards you know well go into boxes you review less frequently. Cards you struggle with stay in boxes you review more often.
              </p>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Method 2: Digital Tools</h3>
              <p className="text-muted-foreground mb-3">
                Apps like Anki, Quizlet, and Lumi automatically calculate optimal review times based on your performance. Let technology do the scheduling for you.
              </p>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Method 3: Manual Calendar</h3>
              <p className="text-muted-foreground mb-3">
                Mark review dates in your calendar. Low-tech but effective if you're disciplined about following through.
              </p>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 my-12">
              <h2 className="text-2xl font-bold mb-4">The Research Says:</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Students using spaced repetition retain 80% more information after 1 month</li>
                <li>• It requires 50% less total study time than cramming</li>
                <li>• Medical students using spaced repetition score 10-15% higher on exams</li>
                <li>• Long-term retention improves by up to 200%</li>
              </ul>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-6">Common Mistakes to Avoid</h2>
            <ul className="list-disc list-inside space-y-3 text-muted-foreground mb-8">
              <li>Reviewing too early (wastes time on things you haven't forgotten yet)</li>
              <li>Waiting too long (information is already gone, harder to relearn)</li>
              <li>Not being consistent (the power is in the regularity)</li>
              <li>Only using spaced repetition (combine with other techniques for best results)</li>
            </ul>

            <h2 className="text-3xl font-bold mt-12 mb-6">Start Today</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Spaced repetition isn't magic—it's science. But the results feel magical. Information that used to slip away after days now stays with you for months or years. And it takes less time than traditional studying.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The best time to start was yesterday. The second best time is right now.
            </p>
          </div>

          <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-purple-500/10 mt-12">
            <h3 className="text-2xl font-bold mb-4">Remember More, Study Less</h3>
            <p className="text-muted-foreground mb-6">
              Lumi uses spaced repetition to optimize your learning
            </p>
            <Button size="lg" asChild>
              <Link to="/signup">Try It Free</Link>
            </Button>
          </Card>

          <div className="mt-12 text-center">
            <Link to="/blog">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Articles
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}

