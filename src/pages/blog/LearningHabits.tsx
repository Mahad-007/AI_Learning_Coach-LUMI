import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, CheckCircle } from "lucide-react";
import AOS from "aos";

export default function LearningHabits() {
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
            <Badge className="mb-4">Habits</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Building a Sustainable Learning Habit: A Complete Guide
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground mb-6">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                March 3, 2024
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                9 min read
              </span>
            </div>
            <div className="text-6xl mb-8 text-center">💪</div>
          </div>

          <div className="prose prose-lg max-w-none" data-aos="fade-up">
            <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <p className="text-xl text-muted-foreground italic">
                "Motivation gets you started. Habit keeps you going. The secret to lifelong learning isn't willpower—it's systems."
              </p>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-6">Why Habits Trump Motivation</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Motivation is unreliable. Some days you'll feel inspired; most days you won't. If you depend on motivation, you'll only learn when you feel like it—which means you won't learn much at all.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Habits, on the other hand, run on autopilot. Once established, they don't require decision-making or willpower. You just do them, like brushing your teeth. That's the power we're tapping into.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-6">The Science of Habit Formation</h2>
            <Card className="p-6 mb-6 border-l-4 border-blue-500">
              <h3 className="text-xl font-bold mb-3">The Habit Loop</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">1. Cue:</span>
                  <span className="text-muted-foreground"> A trigger that initiates the behavior (time, location, emotion, etc.)</span>
                </div>
                <div>
                  <span className="font-semibold">2. Routine:</span>
                  <span className="text-muted-foreground"> The behavior itself (studying, reading, practicing)</span>
                </div>
                <div>
                  <span className="font-semibold">3. Reward:</span>
                  <span className="text-muted-foreground"> The benefit you get from the behavior (knowledge, progress, satisfaction)</span>
                </div>
              </div>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-6">Your 30-Day Habit-Building Plan</h2>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-gradient-primary text-white flex items-center justify-center text-sm">1</span>
                Start Ridiculously Small
              </h3>
              <p className="text-muted-foreground mb-3">
                Don't start with "study 2 hours daily." Start with "open my textbook for 2 minutes." Sounds silly? That's the point. The goal is to establish the behavior, not achieve massive results immediately.
              </p>
              <div className="bg-green-500/10 p-4 rounded">
                <p className="text-sm"><strong>Week 1 Goal:</strong> Study for 5 minutes daily. No excuses—just 5 minutes.</p>
              </div>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-gradient-primary text-white flex items-center justify-center text-sm">2</span>
                Anchor to an Existing Habit
              </h3>
              <p className="text-muted-foreground mb-3">
                Pair your new learning habit with something you already do consistently. "After I pour my morning coffee, I will study for 5 minutes." The existing habit becomes your cue.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>After breakfast → 10 minutes of reading</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>After gym → Review flashcards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Before bed → Practice problems</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-gradient-primary text-white flex items-center justify-center text-sm">3</span>
                Make It Impossible to Skip
              </h3>
              <p className="text-muted-foreground mb-3">
                Design your environment for success:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Put your textbook on your pillow (you have to move it to sleep)</li>
                <li>• Set out study materials the night before</li>
                <li>• Schedule study time in your calendar like a meeting</li>
                <li>• Tell a friend your commitment (social accountability)</li>
              </ul>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-gradient-primary text-white flex items-center justify-center text-sm">4</span>
                Track Your Streak
              </h3>
              <p className="text-muted-foreground mb-3">
                Use a calendar and mark an X for each day you complete your habit. Seeing that chain of X's is psychologically powerful—you won't want to break it.
              </p>
              <div className="bg-amber-500/10 p-4 rounded">
                <p className="text-sm font-semibold mb-2">The Two-Day Rule:</p>
                <p className="text-sm text-muted-foreground">
                  Never skip two days in a row. Missing one day is recoverable. Missing two starts breaking the habit.
                </p>
              </div>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-gradient-primary text-white flex items-center justify-center text-sm">5</span>
                Increase Gradually
              </h3>
              <p className="text-muted-foreground mb-3">
                Once 5 minutes feels automatic (usually after 7-10 days), increase to 10 minutes. Then 15. Then 20. Gradual increases feel effortless.
              </p>
              <div className="bg-muted p-4 rounded">
                <p className="text-sm font-mono">
                  Week 1-2: 5 minutes daily<br/>
                  Week 3-4: 10 minutes daily<br/>
                  Week 5-6: 15 minutes daily<br/>
                  Week 7-8: 20 minutes daily
                </p>
              </div>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-6">Common Pitfalls and How to Avoid Them</h2>
            
            <div className="space-y-4 mb-8">
              <Card className="p-4 border-l-4 border-red-500">
                <p className="font-semibold mb-1">❌ Starting Too Big</p>
                <p className="text-sm text-muted-foreground">Solution: Start smaller than you think necessary</p>
              </Card>
              <Card className="p-4 border-l-4 border-red-500">
                <p className="font-semibold mb-1">❌ Relying on Willpower</p>
                <p className="text-sm text-muted-foreground">Solution: Design your environment to make the habit easy</p>
              </Card>
              <Card className="p-4 border-l-4 border-red-500">
                <p className="font-semibold mb-1">❌ Skipping Days "Just This Once"</p>
                <p className="text-sm text-muted-foreground">Solution: Remember the two-day rule—never skip twice</p>
              </Card>
              <Card className="p-4 border-l-4 border-red-500">
                <p className="font-semibold mb-1">❌ Going It Alone</p>
                <p className="text-sm text-muted-foreground">Solution: Find an accountability partner or join a community</p>
              </Card>
            </div>

            <Card className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 my-12">
              <h2 className="text-2xl font-bold mb-4">The Compound Effect</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Here's what happens when you study just 15 minutes daily for a year:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 365 days × 15 minutes = 91.25 hours of learning</li>
                <li>• That's equivalent to 2 full-time work weeks</li>
                <li>• That's enough to master a new skill, learn a language, or complete several courses</li>
                <li>• All from just 15 minutes a day</li>
              </ul>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-6">Your First Week Checklist</h2>
            <Card className="p-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1" />
                  <span>Choose your anchor habit (something you already do daily)</span>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1" />
                  <span>Set up your study space the night before</span>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1" />
                  <span>Get a calendar for tracking (digital or physical)</span>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1" />
                  <span>Tell at least one person about your commitment</span>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1" />
                  <span>Complete 5 minutes of learning after your anchor habit</span>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1" />
                  <span>Mark an X on your calendar</span>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1" />
                  <span>Repeat for 7 days straight—no exceptions!</span>
                </div>
              </div>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-6">The Bottom Line</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Building a learning habit isn't sexy. It's not about massive transformations overnight. It's about showing up, even when you don't feel like it, especially when you don't feel like it.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              But here's the magic: after 30 days, you won't need this guide anymore. Learning will be part of who you are, not something you force yourself to do. And that's when real transformation begins.
            </p>
          </div>

          <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-purple-500/10 mt-12">
            <h3 className="text-2xl font-bold mb-4">Build Your Learning Habit Today</h3>
            <p className="text-muted-foreground mb-6">
              Join AI Learning Coach and track your daily learning streak
            </p>
            <Button size="lg" asChild>
              <Link to="/signup">Start Your Streak</Link>
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

