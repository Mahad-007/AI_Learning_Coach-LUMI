import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Trophy, Star, Zap } from "lucide-react";
import AOS from "aos";

export default function GamificationLearning() {
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
            <Badge className="mb-4">Gamification</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How Gamification Makes Learning More Engaging
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground mb-6">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                March 10, 2024
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                6 min read
              </span>
            </div>
            <div className="text-6xl mb-8 text-center">🎮</div>
          </div>

          <div className="prose prose-lg max-w-none" data-aos="fade-up">
            <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <p className="text-xl text-muted-foreground italic">
                "Learning doesn't have to feel like work. When education feels like play, motivation becomes limitless."
              </p>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-6">What Is Gamification?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Gamification applies game-design elements and principles to non-game contexts. In education, this means incorporating points, badges, leaderboards, challenges, and rewards into the learning process. But it's far more than just adding superficial game elements—it's about tapping into the psychological drivers that make games so compelling.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-6">The Psychology Behind the Magic</h2>
            
            <Card className="p-6 mb-6 border-l-4 border-blue-500">
              <div className="flex items-start gap-4">
                <Star className="w-8 h-8 text-blue-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Immediate Feedback Loop</h3>
                  <p className="text-muted-foreground">
                    Games provide instant feedback on your actions. Got a question right? Instant points! Made progress? See your level go up! This immediate reinforcement keeps you engaged and motivated to continue.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 mb-6 border-l-4 border-purple-500">
              <div className="flex items-start gap-4">
                <Trophy className="w-8 h-8 text-purple-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Clear Goals and Progress</h3>
                  <p className="text-muted-foreground">
                    Unlike vague academic goals, gamified learning breaks everything into clear, achievable milestones. You always know what you're working toward and how close you are to achieving it.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 mb-6 border-l-4 border-green-500">
              <div className="flex items-start gap-4">
                <Zap className="w-8 h-8 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Dopamine Rewards</h3>
                  <p className="text-muted-foreground">
                    Every time you earn XP, unlock a badge, or level up, your brain releases dopamine—the same neurotransmitter associated with pleasure and motivation. This creates a positive association with learning.
                  </p>
                </div>
              </div>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-6">Key Elements That Work</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">🏆 Points & XP</h3>
                <p className="text-sm text-muted-foreground">
                  Quantifiable progress that makes improvement visible and rewarding
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">🎖️ Badges & Achievements</h3>
                <p className="text-sm text-muted-foreground">
                  Recognition of milestones that showcase your accomplishments
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">📊 Leaderboards</h3>
                <p className="text-sm text-muted-foreground">
                  Social comparison that drives healthy competition
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">📈 Level Systems</h3>
                <p className="text-sm text-muted-foreground">
                  Progressive difficulty that keeps challenges engaging
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">🔥 Streaks</h3>
                <p className="text-sm text-muted-foreground">
                  Consistency rewards that build lasting habits
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">🎯 Quests & Challenges</h3>
                <p className="text-sm text-muted-foreground">
                  Structured goals that provide direction and purpose
                </p>
              </Card>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-6">Real-World Success Stories</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Duolingo has taught over 500 million people new languages using gamification. Khan Academy's badge system has kept students engaged with math for hours. These aren't accidents—they're the result of carefully designed gamification that understands human psychology.
            </p>

            <Card className="p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 mb-8">
              <h3 className="text-2xl font-bold mb-4">The Science Says:</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Studies show gamified learning increases engagement by up to 60%</li>
                <li>• Learners using gamified platforms spend 40% more time studying</li>
                <li>• Retention rates improve by 35% with game elements</li>
                <li>• Motivation to continue learning increases by 50%</li>
              </ul>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-6">The Balance: When Gamification Goes Wrong</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Not all gamification is effective. Poorly implemented game elements can distract from learning or create extrinsic motivation that fades quickly. The key is ensuring game mechanics enhance rather than overshadow the actual learning content.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Good gamification makes the learning itself rewarding. Bad gamification makes you chase points while forgetting why you're learning in the first place.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-6">Your Turn to Play</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Ready to experience the power of gamified learning? With AI Learning Coach, you'll earn XP, unlock achievements, compete in trivia battles, and climb leaderboards—all while mastering the skills you want to learn.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The best part? You won't even realize you're learning because you'll be too busy having fun.
            </p>
          </div>

          <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-purple-500/10 mt-12">
            <h3 className="text-2xl font-bold mb-4">Start Your Learning Adventure</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of learners leveling up their skills every day
            </p>
            <Button size="lg" asChild>
              <Link to="/signup">Begin Your Journey</Link>
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

