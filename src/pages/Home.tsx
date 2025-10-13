import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Zap, Target, Users, ArrowRight, CheckCircle2, Star } from "lucide-react";
import AOS from "aos";
import heroImage from "@/assets/hero-illustration.jpg";

const features = [
  {
    icon: Brain,
    title: "AI Chat Coach",
    description: "Get personalized guidance from your AI tutor, available 24/7 to help you master any subject.",
  },
  {
    icon: Zap,
    title: "Gamified XP System",
    description: "Earn XP, unlock badges, and level up as you progress through your learning journey.",
  },
  {
    icon: Target,
    title: "Personalized Learning Paths",
    description: "Custom learning paths tailored to your goals, skill level, and learning style.",
  },
];

const steps = [
  { number: "01", title: "Choose Topic", description: "Select what you want to learn" },
  { number: "02", title: "Get Lesson Plan", description: "AI creates your personalized path" },
  { number: "03", title: "Chat & Learn", description: "Interactive lessons with AI tutor" },
  { number: "04", title: "Earn XP", description: "Track progress and unlock achievements" },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Medical Student",
    avatar: "👩‍⚕️",
    quote: "The AI tutor helped me understand complex concepts in a way that traditional methods couldn't. Highly recommend!",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Software Engineer",
    avatar: "👨‍💻",
    quote: "Gamification makes learning addictive! I've completed more courses in 3 months than I did in a year.",
    rating: 5,
  },
  {
    name: "Emily Watson",
    role: "High School Teacher",
    avatar: "👩‍🏫",
    quote: "I use this with my students and they love it. The progress tracking helps me support them better.",
    rating: 5,
  },
];

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out",
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Your Personal{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  AI Coach
                </span>{" "}
                for Every Skill
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Learn interactively, grow consistently, and have fun with AI-powered learning paths,
                gamification, and personalized progress tracking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/signup">
                    Start Learning <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div data-aos="fade-left" className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={heroImage}
                  alt="AI Learning Coach Interface"
                  className="w-full h-auto animate-float"
                />
                <div className="absolute inset-0 bg-gradient-primary opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose AI Learning Coach?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of education with AI-powered personalized learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="p-8 hover:shadow-lg transition-all duration-300 hover:scale-105 group"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="w-14 h-14 bg-gradient-primary rounded-lg flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="text-center"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-glow">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Learners Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of successful learners worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card
            className="relative overflow-hidden p-12 text-center"
            data-aos="zoom-in"
          >
            <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Your Learning Journey?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of learners and start achieving your goals today
              </p>
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
