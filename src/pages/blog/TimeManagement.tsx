import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import AOS from "aos";

export default function TimeManagement() {
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
            <Badge className="mb-4">Productivity</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Mastering Time Management for Effective Study Sessions
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground mb-6">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                March 8, 2024
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                7 min read
              </span>
            </div>
            <div className="text-6xl mb-8 text-center">⏰</div>
          </div>

          <div className="prose prose-lg max-w-none" data-aos="fade-up">
            <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <p className="text-xl text-muted-foreground">
                Time is your most valuable resource. Learning to manage it effectively can triple your productivity and reduce stress dramatically.
              </p>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-6">The Time Management Paradox</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We all have the same 24 hours, yet some students accomplish twice as much in half the time. The secret? They've mastered the art of time management. It's not about working harder—it's about working smarter.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-6">10 Practical Time Management Tips</h2>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-3">1. Time Blocking</h3>
              <p className="text-muted-foreground mb-3">
                Schedule specific blocks of time for specific tasks. Instead of vague "study time," block out "Math homework 2-3pm" and "Biology reading 3-4pm."
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-mono">
                  9:00-9:50: Deep work (hardest subject)<br/>
                  10:00-10:50: Medium difficulty tasks<br/>
                  11:00-11:30: Review & light tasks
                </p>
              </div>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-3">2. The Two-Minute Rule</h3>
              <p className="text-muted-foreground">
                If something takes less than two minutes, do it immediately. Quick tasks pile up and create mental clutter. Clear them fast and focus on what matters.
              </p>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-3">3. Eat the Frog</h3>
              <p className="text-muted-foreground">
                Do your hardest, most important task first thing. Your willpower is strongest in the morning. Tackle the big challenge while you're fresh, and everything else feels easier.
              </p>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-3">4. Batch Similar Tasks</h3>
              <p className="text-muted-foreground">
                Group similar activities together. Answer all emails at once. Do all your reading together. Switching between different types of work wastes time and mental energy.
              </p>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-3">5. Use Dead Time Wisely</h3>
              <p className="text-muted-foreground">
                Waiting for the bus? Review flashcards. In line at the store? Listen to an educational podcast. These minutes add up to hours each week.
              </p>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-3">6. Set Clear Boundaries</h3>
              <p className="text-muted-foreground">
                When it's study time, it's study time. Turn off notifications. Close unnecessary tabs. Tell people you're unavailable. Protect your focus time fiercely.
              </p>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-3">7. The 80/20 Rule</h3>
              <p className="text-muted-foreground">
                80% of your results come from 20% of your efforts. Identify which activities give you the most learning bang for your time buck, and prioritize those ruthlessly.
              </p>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-3">8. Schedule Breaks</h3>
              <p className="text-muted-foreground">
                Breaks aren't wasted time—they're essential for maintaining focus. Schedule them just as seriously as your study blocks. Rest is productive.
              </p>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-3">9. Plan Tomorrow Today</h3>
              <p className="text-muted-foreground">
                Spend 10 minutes each evening planning tomorrow. When you wake up, you'll know exactly what to do instead of wasting time deciding.
              </p>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-3">10. Track Your Time</h3>
              <p className="text-muted-foreground">
                For one week, track where every hour goes. You'll be shocked how much time disappears to distractions. Awareness is the first step to improvement.
              </p>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 my-12">
              <h2 className="text-2xl font-bold mb-4">Common Time Wasters to Avoid</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Checking phone every few minutes</li>
                <li>• Starting without a clear plan</li>
                <li>• Multitasking (it's a myth!)</li>
                <li>• Perfectionism on low-priority tasks</li>
                <li>• Not saying "no" to distractions</li>
              </ul>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-6">Your Action Plan</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Start small. Pick one technique from this list and implement it this week. Once it becomes habit, add another. Within a month, you'll have transformed your productivity.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Remember: Time management isn't about filling every second with work. It's about making the most of your study time so you have more time for everything else you love.
            </p>
          </div>

          <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-purple-500/10 mt-12">
            <h3 className="text-2xl font-bold mb-4">Master Your Time, Master Your Learning</h3>
            <p className="text-muted-foreground mb-6">
              Join Lumi for tools that help you study smarter, not harder
            </p>
            <Button size="lg" asChild>
              <Link to="/signup">Get Started Free</Link>
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

