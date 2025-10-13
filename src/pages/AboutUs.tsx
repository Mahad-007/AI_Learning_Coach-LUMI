import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Brain, Target, Users, Heart, Sparkles, TrendingUp } from "lucide-react";
import AOS from "aos";

export default function AboutUs() {
  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  const values = [
    {
      icon: Brain,
      title: "Innovation",
      description: "Leveraging cutting-edge AI technology to revolutionize education",
    },
    {
      icon: Users,
      title: "Accessibility",
      description: "Making quality education accessible to everyone, everywhere",
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Driven by our love for learning and helping others succeed",
    },
    {
      icon: Target,
      title: "Excellence",
      description: "Committed to delivering the best learning experience possible",
    },
  ];

  // Team section removed

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16" data-aos="fade-down">
          <div className="inline-flex p-3 bg-gradient-to-br from-primary to-purple-600 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Empowering Learners with{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              AI-Powered Education
            </span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We're on a mission to make personalized, high-quality education accessible to everyone through the power of artificial intelligence.
          </p>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto mb-20" data-aos="fade-up">
          <Card className="p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                AI Learning Coach was born from a simple observation: traditional education often fails to adapt to individual learning styles, paces, and interests. We believed there had to be a better way.
              </p>
              <p>
                In 2023, our founding team came together with a shared vision—to leverage artificial intelligence to create truly personalized learning experiences. We combined decades of experience in AI research, education, and product design to build a platform that adapts to each learner's unique needs.
              </p>
              <p>
                Today, thousands of learners worldwide use AI Learning Coach to master new skills, achieve their goals, and unlock their full potential. But we're just getting started.
              </p>
            </div>
          </Card>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <Card className="p-8" data-aos="fade-right">
            <div className="inline-flex p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To democratize education by providing personalized, AI-powered learning experiences that help every individual reach their full potential, regardless of their background or circumstances.
            </p>
          </Card>

          <Card className="p-8" data-aos="fade-left">
            <div className="inline-flex p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              A world where everyone has access to world-class education tailored to their unique learning style, enabling them to pursue their passions and achieve their dreams without barriers.
            </p>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-12" data-aos="fade-down">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="p-6 text-center hover:shadow-lg transition-all duration-300"
                  data-aos="zoom-in"
                  data-aos-delay={index * 100}
                >
                  <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Team section removed */}

        {/* Stats section removed */}
      </div>
    </div>
  );
}

