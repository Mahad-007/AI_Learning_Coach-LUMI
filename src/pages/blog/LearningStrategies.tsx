import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, CheckCircle } from "lucide-react";
import AOS from "aos";

export default function LearningStrategies() {
  useEffect(() => {
    AOS.init({ duration: 600, once: true });
    window.scrollTo(0, 0);
  }, []);

  const strategies = [
    {
      title: "Active Recall",
      description: "Instead of passively re-reading material, actively test yourself. Close your notes and try to recall the information. This strengthens memory pathways and reveals knowledge gaps.",
      benefits: ["Improves long-term retention", "Identifies weak areas", "Builds confidence"]
    },
    {
      title: "Spaced Repetition",
      description: "Review information at increasing intervals. Study today, review tomorrow, then in 3 days, then a week, then a month. This fights the forgetting curve.",
      benefits: ["Combats forgetting", "Efficient use of study time", "Long-term retention"]
    },
    {
      title: "Feynman Technique",
      description: "Explain concepts in simple terms as if teaching a child. If you struggle, you've found gaps in your understanding. Simplify, then try again.",
      benefits: ["Deepens understanding", "Reveals knowledge gaps", "Improves explanation skills"]
    },
    {
      title: "Interleaving Practice",
      description: "Mix different topics or problem types in one study session rather than focusing on one thing. This improves your ability to distinguish between concepts.",
      benefits: ["Better problem-solving", "Flexible thinking", "Real-world application"]
    },
    {
      title: "Elaborative Interrogation",
      description: "Ask yourself 'why' and 'how' questions about the material. Connect new information to what you already know. Create meaningful associations.",
      benefits: ["Deeper processing", "Better connections", "Enhanced recall"]
    },
    {
      title: "Dual Coding",
      description: "Combine words with visuals. Create diagrams, mind maps, or drawings alongside written notes. Your brain processes visual and verbal information differently.",
      benefits: ["Multiple memory pathways", "Better visualization", "Creative thinking"]
    },
    {
      title: "Practice Testing",
      description: "Take practice tests regularly, even before you feel ready. Testing isn't just assessment—it's one of the most effective learning strategies.",
      benefits: ["Reduces test anxiety", "Identifies weak spots", "Improves performance"]
    },
    {
      title: "Pomodoro Technique",
      description: "Study in focused 25-minute blocks with 5-minute breaks. After four blocks, take a longer 15-30 minute break. Maintains focus and prevents burnout.",
      benefits: ["Sustained concentration", "Prevents fatigue", "Better time management"]
    },
    {
      title: "SQ3R Method",
      description: "Survey, Question, Read, Recite, Review. A systematic approach to reading that improves comprehension and retention of textbook material.",
      benefits: ["Structured learning", "Better comprehension", "Active engagement"]
    },
    {
      title: "Teach Others",
      description: "Teaching forces you to organize knowledge, identify gaps, and explain clearly. Find a study partner or join a study group to teach and learn from each other.",
      benefits: ["Solidifies knowledge", "Builds confidence", "Social learning"]
    }
  ];

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
            <Badge className="mb-4">Learning Tips</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              10 Proven Strategies to Boost Your Learning Efficiency
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground mb-6">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                March 12, 2024
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                5 min read
              </span>
            </div>
            <div className="text-6xl mb-8 text-center">🧠</div>
          </div>

          <div className="prose prose-lg max-w-none" data-aos="fade-up">
            <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <p className="text-xl text-muted-foreground">
                Learning efficiently isn't about studying longer—it's about studying smarter. These science-backed strategies will help you learn faster and retain information better.
              </p>
            </Card>

            <p className="text-muted-foreground leading-relaxed mb-8">
              Whether you're a student, professional, or lifelong learner, mastering these techniques will transform how you absorb and retain information. Let's dive into the strategies that top learners use to maximize their study time.
            </p>

            {strategies.map((strategy, index) => (
              <Card key={index} className="p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">{strategy.title}</h3>
                    <p className="text-muted-foreground mb-4">{strategy.description}</p>
                    <div className="space-y-2">
                      {strategy.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <Card className="p-8 bg-gradient-to-br from-primary/10 to-purple-500/10 my-12">
              <h2 className="text-2xl font-bold mb-4">Putting It All Together</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You don't need to use all these strategies at once. Start with 2-3 that resonate with you, master them, then gradually incorporate others. The key is consistency—regular practice with these techniques will compound over time.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Remember: effective learning is a skill you can develop. With the right strategies and consistent practice, you'll be amazed at how much more you can learn in less time.
              </p>
            </Card>
          </div>

          <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-purple-500/10 mt-12">
            <h3 className="text-2xl font-bold mb-4">Ready to Learn Smarter?</h3>
            <p className="text-muted-foreground mb-6">
              Join Lumi and get personalized learning strategies
            </p>
            <Button size="lg" asChild>
              <Link to="/signup">Start Learning</Link>
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

