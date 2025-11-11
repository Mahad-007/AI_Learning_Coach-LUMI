import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  BookOpen,
  MessageSquare,
  Zap,
  Trophy,
  CreditCard,
  Shield,
  Settings,
  HelpCircle,
} from "lucide-react";
import AOS from "aos";

export default function HelpCenter() {
  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  const categories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics",
      articles: 12,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: MessageSquare,
      title: "Using AI Chat",
      description: "Master the AI tutor",
      articles: 8,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: "Trivia & Quizzes",
      description: "Game features guide",
      articles: 6,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: Trophy,
      title: "XP & Gamification",
      description: "Leveling up tips",
      articles: 10,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: CreditCard,
      title: "Billing & Plans",
      description: "Subscription help",
      articles: 7,
      gradient: "from-red-500 to-rose-500",
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Your data protection",
      articles: 5,
      gradient: "from-indigo-500 to-violet-500",
    },
  ];

  const popularArticles = [
    "How do I get started with Lumi?",
    "What's the difference between Free and Pro plans?",
    "How does the XP system work?",
    "Can I cancel my subscription anytime?",
    "How do I join a Trivia Battle?",
    "Is my learning data private?",
    "How do I reset my password?",
    "What subjects does the AI tutor cover?",
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-16" data-aos="fade-down">
          <Badge className="mb-4">Support</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            How Can We{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Help You?
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Search our knowledge base for answers and guides
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for help articles..."
              className="pl-12 h-14 text-lg"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <div className={`inline-flex p-3 bg-gradient-to-br ${category.gradient} rounded-lg mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                <Badge variant="secondary">{category.articles} articles</Badge>
              </Card>
            );
          })}
        </div>

        {/* Popular Articles */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8" data-aos="fade-down">
            <h2 className="text-3xl font-bold mb-4">Popular Articles</h2>
            <p className="text-muted-foreground">
              Most searched topics by our users
            </p>
          </div>

          <Card className="divide-y" data-aos="fade-up">
            {popularArticles.map((article, index) => (
              <div
                key={index}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-muted-foreground" />
                  <span className="group-hover:text-primary transition-colors">{article}</span>
                </div>
                <span className="text-muted-foreground">→</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-8 text-center hover:shadow-lg transition-all duration-300" data-aos="zoom-in">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Chat with our support team in real-time
            </p>
            <button className="text-primary font-semibold hover:underline">
              Start Chat →
            </button>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-all duration-300" data-aos="zoom-in" data-aos-delay={100}>
            <Settings className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2">Video Tutorials</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Watch step-by-step guides
            </p>
            <button className="text-primary font-semibold hover:underline">
              Watch Now →
            </button>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-all duration-300" data-aos="zoom-in" data-aos-delay={200}>
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2">Contact Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get help from our team
            </p>
            <button className="text-primary font-semibold hover:underline">
              Contact Us →
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

