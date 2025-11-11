import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import AOS from "aos";

export default function AIvsTraditionalTutoring() {
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
            <Badge className="mb-4">AI & Education</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI Chat Tutors vs Traditional Tutoring: A Comparison
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground mb-6">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                March 1, 2024
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                8 min read
              </span>
            </div>
            <div className="text-6xl mb-8 text-center">🤖</div>
          </div>

          <div className="prose prose-lg max-w-none" data-aos="fade-up">
            <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <p className="text-xl text-muted-foreground">
                The tutoring landscape is changing. Let's take an honest look at how AI tutors stack up against traditional human tutors—with no bias, just facts.
              </p>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-6">The Comparison: Side by Side</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <h3 className="text-2xl font-bold mb-4 text-center">🤖 AI Tutors</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Available 24/7, instant responses</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Affordable (often free or low-cost)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Covers unlimited subjects</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Infinitely patient, never judges</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Adapts to your pace instantly</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Consistent quality every session</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">No human empathy or emotional support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Can make factual errors</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Limited real-world context</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-2xl font-bold mb-4 text-center">👨‍🏫 Human Tutors</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Personal connection & mentorship</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Emotional intelligence & motivation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Real-world experience & stories</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Nuanced understanding of struggles</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Deep expertise in specific subjects</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Can provide career advice</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Expensive ($40-$100+ per hour)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Limited availability</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Quality varies greatly</span>
                  </div>
                </div>
              </Card>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-6">Where AI Tutors Excel</h2>
            
            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-3">Accessibility</h3>
              <p className="text-muted-foreground">
                AI tutors democratize education. Whether you're in New York or rural Montana, whether it's 2pm or 2am, whether you can afford $100/hour or nothing—AI tutors are there. This alone is revolutionary for educational equity.
              </p>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-3">Consistency</h3>
              <p className="text-muted-foreground">
                Human tutors have bad days. They get tired, distracted, or sick. AI tutors deliver the same quality every single time. No mood swings, no fatigue, no inconsistency.
              </p>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-3">Judgment-Free Zone</h3>
              <p className="text-muted-foreground">
                Many students hesitate to ask "stupid questions" with human tutors. AI tutors eliminate this fear entirely. Ask the same question 10 times—the AI won't judge you. This psychological safety encourages deeper learning.
              </p>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-6">Where Human Tutors Shine</h2>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-3">Motivation & Accountability</h3>
              <p className="text-muted-foreground">
                A good human tutor doesn't just teach content—they inspire. They push you when you want to quit. They celebrate your wins. They hold you accountable. This human element is irreplaceable.
              </p>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-3">Contextual Understanding</h3>
              <p className="text-muted-foreground">
                Human tutors understand context that AI might miss. They read body language, sense frustration, and adjust their approach dynamically. They connect concepts to your specific interests and goals in ways AI is still learning to do.
              </p>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-3">Mentorship Beyond Academics</h3>
              <p className="text-muted-foreground">
                Great tutors become mentors. They guide career choices, provide networking opportunities, and share life wisdom. They're invested in your success beyond just passing the next test.
              </p>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 my-12">
              <h2 className="text-2xl font-bold mb-4">The Verdict: It's Not Either/Or</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Here's the truth: The best approach is often using both. Use AI tutors for:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-6">
                <li>• Daily practice and homework help</li>
                <li>• Quick question-and-answer sessions</li>
                <li>• Building foundational knowledge</li>
                <li>• Subjects where you just need information</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Use human tutors for:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Complex subjects requiring deep expertise</li>
                <li>• Times when you need motivation or encouragement</li>
                <li>• Career guidance and mentorship</li>
                <li>• When you're truly stuck and need that human insight</li>
              </ul>
            </Card>

            <h2 className="text-3xl font-bold mt-12 mb-6">The Future: Collaboration, Not Competition</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The best educational systems of the future won't choose between AI and human tutors—they'll use both strategically. AI handles the scalable, repeatable aspects of tutoring, freeing human tutors to focus on what they do best: inspiring, motivating, and providing that irreplaceable human connection.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              At Lumi, we're not trying to replace human teachers. We're augmenting their impact, making quality education accessible to everyone while preserving the irreplaceable value of human guidance and mentorship.
            </p>
          </div>

          <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-purple-500/10 mt-12">
            <h3 className="text-2xl font-bold mb-4">Experience AI-Powered Learning</h3>
            <p className="text-muted-foreground mb-6">
              See for yourself why millions are choosing AI tutors as part of their learning journey
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

