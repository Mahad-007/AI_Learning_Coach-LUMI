import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  MessageSquare,
  Zap,
  Trophy,
  BookOpen,
  Target,
  Users,
  BarChart3,
  Sparkles,
  CheckCircle2,
  Clock,
  Globe,
} from "lucide-react";
import AOS from "aos";

export default function Features() {
  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  const mainFeatures = [
    {
      icon: MessageSquare,
      title: "AI Chat Coach",
      description: "24/7 personalized tutoring powered by advanced AI",
      features: [
        "Natural conversation",
        "Adaptive learning",
        "Instant feedback",
        "Multi-subject support",
      ],
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      title: "Intelligent Quizzes",
      description: "AI-generated quizzes that adapt to your level",
      features: [
        "Dynamic difficulty",
        "Instant scoring",
        "Detailed explanations",
        "Progress tracking",
      ],
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: "Trivia Battles",
      description: "Compete with learners worldwide in real-time",
      features: [
        "Multiplayer matches",
        "Live leaderboards",
        "XP rewards",
        "Global rankings",
      ],
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  const additionalFeatures = [
    {
      icon: Trophy,
      title: "Gamification System",
      description: "Earn XP, unlock badges, and level up as you learn",
    },
    {
      icon: BookOpen,
      title: "Personalized Lessons",
      description: "Custom learning paths tailored to your goals",
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set goals and monitor your progress over time",
    },
    {
      icon: Users,
      title: "Community Learning",
      description: "Connect with learners and share knowledge",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Detailed insights into your learning journey",
    },
    {
      icon: Clock,
      title: "Streak Tracking",
      description: "Build consistent learning habits with daily streaks",
    },
    {
      icon: Globe,
      title: "Multi-Language",
      description: "Learn in your preferred language",
    },
    {
      icon: Sparkles,
      title: "Smart Recommendations",
      description: "AI suggests next topics based on your progress",
    },
  ];

  const benefits = [
    "Learn at your own pace, anytime, anywhere",
    "Get instant feedback and explanations",
    "Track your progress with detailed analytics",
    "Stay motivated with gamification",
    "Access world-class educational content",
    "Connect with a global learning community",
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-16" data-aos="fade-down">
          <Badge className="mb-4">Feature Overview</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Excel in Learning
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover the powerful features that make AI Learning Coach the ultimate platform for personalized education
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {mainFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-8 hover:shadow-xl transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className={`inline-flex p-4 bg-gradient-to-br ${feature.gradient} rounded-lg mb-6`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        {/* Additional Features */}
        <div className="mb-20">
          <div className="text-center mb-12" data-aos="fade-down">
            <h2 className="text-3xl font-bold mb-4">Even More Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive toolkit to supercharge your learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="p-6 hover:shadow-lg transition-all duration-300 group"
                  data-aos="zoom-in"
                  data-aos-delay={index * 50}
                >
                  <Icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="p-8 md:p-12 mb-20" data-aos="fade-up">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Why Choose AI Learning Coach?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* CTA Section */}
        <div className="text-center" data-aos="zoom-in">
          <Card className="p-12 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Learning?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of learners who are already achieving their goals with AI Learning Coach
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Get Started Free
              </a>
              <a
                href="/demo"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary/10 transition-colors"
              >
                Request Demo
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

