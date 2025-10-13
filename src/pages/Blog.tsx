import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import AOS from "aos";

export default function Blog() {
  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  const featuredPost = {
    title: "The Future of AI-Powered Education: What's Next?",
    excerpt:
      "Discover how artificial intelligence is revolutionizing the way we learn and what groundbreaking developments are on the horizon.",
    category: "AI & Education",
    date: "March 15, 2024",
    readTime: "8 min read",
    image: "📚",
  };

  const posts = [
    {
      title: "10 Proven Strategies to Boost Your Learning Efficiency",
      excerpt: "Science-backed techniques to help you learn faster and retain more information.",
      category: "Learning Tips",
      date: "March 12, 2024",
      readTime: "5 min read",
      image: "🧠",
      slug: "learning-strategies",
    },
    {
      title: "How Gamification Makes Learning More Engaging",
      excerpt: "Explore the psychology behind gamified learning and why it works so well.",
      category: "Gamification",
      date: "March 10, 2024",
      readTime: "6 min read",
      image: "🎮",
      slug: "gamification-learning",
    },
    {
      title: "Mastering Time Management for Effective Study Sessions",
      excerpt: "Practical tips to maximize your productivity and make the most of your study time.",
      category: "Productivity",
      date: "March 8, 2024",
      readTime: "7 min read",
      image: "⏰",
      slug: "time-management",
    },
    {
      title: "The Science of Spaced Repetition Learning",
      excerpt: "Learn why spacing out your study sessions is one of the most effective learning techniques.",
      category: "Science",
      date: "March 5, 2024",
      readTime: "6 min read",
      image: "🔬",
      slug: "spaced-repetition",
    },
    {
      title: "Building a Sustainable Learning Habit: A Complete Guide",
      excerpt: "Transform learning into a daily habit with these proven strategies.",
      category: "Habits",
      date: "March 3, 2024",
      readTime: "9 min read",
      image: "💪",
      slug: "learning-habits",
    },
    {
      title: "AI Chat Tutors vs Traditional Tutoring: A Comparison",
      excerpt: "An honest look at the pros and cons of AI-powered education.",
      category: "AI & Education",
      date: "March 1, 2024",
      readTime: "8 min read",
      image: "🤖",
      slug: "ai-vs-traditional-tutoring",
    },
  ];

  const categories = [
    "All Posts",
    "AI & Education",
    "Learning Tips",
    "Productivity",
    "Success Stories",
    "Updates",
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-16" data-aos="fade-down">
          <Badge className="mb-4">Blog</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Insights &{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Learning Resources
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Expert tips, latest trends, and success stories from the world of AI-powered education
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-12" data-aos="fade-up">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={index === 0 ? "default" : "outline"}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Post */}
        <Link to="/blog/ai-education-future">
          <Card
            className="p-8 md:p-12 mb-12 bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20 hover:shadow-xl transition-all duration-300 cursor-pointer"
            data-aos="zoom-in"
          >
            <Badge className="mb-4">{featuredPost.category}</Badge>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">{featuredPost.title}</h2>
                <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime}
                  </span>
                </div>
                <Button className="gap-2">
                  Read Article
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-center">
                <div className="text-9xl">{featuredPost.image}</div>
              </div>
            </div>
          </Card>
        </Link>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {posts.map((post, index) => (
            <Link key={index} to={`/blog/${post.slug}`}>
              <Card
                className="p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <div className="text-6xl mb-4">{post.image}</div>
                <Badge variant="secondary" className="mb-3">
                  {post.category}
                </Badge>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Newsletter */}
        <Card
          className="p-12 text-center bg-gradient-to-br from-primary/10 to-purple-500/10"
          data-aos="zoom-in"
        >
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get the latest articles, tips, and updates delivered straight to your inbox every week
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-input bg-background"
            />
            <Button size="lg">Subscribe</Button>
          </div>
        </Card>

        {/* Popular Tags */}
        <div className="mt-12 text-center" data-aos="fade-up">
          <h3 className="text-lg font-semibold mb-4">Popular Topics</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {["AI", "Learning", "Productivity", "Study Tips", "Motivation", "EdTech", "Gamification", "Success"].map(
              (tag, index) => (
                <Badge key={index} variant="outline" className="cursor-pointer hover:bg-primary/10">
                  {tag}
                </Badge>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

