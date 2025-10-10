import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import AOS from "aos";

export default function FAQ() {
  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      category: "General",
      questions: [
        {
          q: "What is AI Learning Coach?",
          a: "AI Learning Coach is an intelligent learning platform that uses artificial intelligence to provide personalized tutoring, adaptive quizzes, and gamified learning experiences. Our AI adapts to your learning style and pace to help you master any subject."
        },
        {
          q: "How does the AI tutor work?",
          a: "Our AI tutor uses advanced natural language processing to understand your questions and provide detailed, personalized explanations. It adapts to your learning level and style, offering examples and breaking down complex topics into digestible pieces."
        },
        {
          q: "What subjects can I learn?",
          a: "You can learn virtually any subject! From mathematics and science to languages, history, programming, and more. Our AI is trained on a broad knowledge base and can help with academic subjects, professional skills, and personal interests."
        },
      ],
    },
    {
      category: "Account & Billing",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click the 'Sign Up' button, enter your email, create a password, and verify your email. It takes less than a minute to get started with our free plan!"
        },
        {
          q: "Can I cancel my subscription anytime?",
          a: "Yes! You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period."
        },
        {
          q: "Do you offer refunds?",
          a: "We offer a 30-day money-back guarantee for first-time Pro subscribers. If you're not satisfied, contact support within 30 days for a full refund."
        },
        {
          q: "Is there a student discount?",
          a: "Yes! Students with valid .edu email addresses receive 50% off on all Pro plans. Verification is automatic during signup."
        },
      ],
    },
    {
      category: "Features",
      questions: [
        {
          q: "How does the XP system work?",
          a: "You earn XP (experience points) by completing lessons, taking quizzes, and engaging with learning activities. As you accumulate XP, you level up and unlock badges. Each activity awards different amounts of XP based on difficulty and performance."
        },
        {
          q: "What are Trivia Battles?",
          a: "Trivia Battles are real-time multiplayer quiz competitions where you compete against other learners worldwide. Answer AI-generated questions quickly and accurately to climb the leaderboard and earn XP rewards."
        },
        {
          q: "Can I track my progress?",
          a: "Absolutely! Your dashboard shows detailed analytics including total XP, lessons completed, quiz scores, learning streaks, and more. You can see your improvement over time and identify areas to focus on."
        },
        {
          q: "Does it work on mobile?",
          a: "Yes! Our platform is fully responsive and works on all devices. We also have dedicated mobile apps for iOS and Android for the best mobile experience."
        },
      ],
    },
    {
      category: "Privacy & Security",
      questions: [
        {
          q: "Is my data secure?",
          a: "Yes! We use industry-standard encryption for all data transmission and storage. Your personal information and learning data are protected with advanced security measures."
        },
        {
          q: "Do you share my data?",
          a: "We never sell your personal data to third parties. We only share anonymized, aggregated data for research purposes and with essential service providers under strict confidentiality agreements."
        },
        {
          q: "Can I delete my account?",
          a: "Yes, you can delete your account anytime from your settings. All your personal data will be permanently deleted within 30 days, except where legally required to retain it."
        },
      ],
    },
    {
      category: "Technical",
      questions: [
        {
          q: "What browsers are supported?",
          a: "We support the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using an updated browser."
        },
        {
          q: "Why is the AI response slow?",
          a: "Response times depend on question complexity and server load. Pro users get priority processing. If you experience persistent slowness, check your internet connection or contact support."
        },
        {
          q: "Can I use it offline?",
          a: "Some features like downloaded lessons and saved content can be accessed offline in our mobile apps. However, AI chat and real-time features require an internet connection."
        },
      ],
    },
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq =>
        faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-16" data-aos="fade-down">
          <Badge className="mb-4">FAQ</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find quick answers to common questions
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search FAQs..."
              className="pl-12 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {filteredFaqs.map((category, catIndex) => (
            <div key={catIndex} data-aos="fade-up" data-aos-delay={catIndex * 50}>
              <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
              <div className="space-y-3">
                {category.questions.map((faq, index) => {
                  const globalIndex = catIndex * 100 + index;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <Card
                      key={index}
                      className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
                      onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-bold text-lg flex-1">{faq.q}</h3>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                          )}
                        </div>

                        {isOpen && (
                          <p className="mt-4 text-muted-foreground leading-relaxed">
                            {faq.a}
                          </p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <Card className="p-12 text-center" data-aos="fade-up">
            <p className="text-muted-foreground">
              No results found for "{searchTerm}". Try different keywords or{" "}
              <a href="/contact" className="text-primary hover:underline">
                contact us
              </a>{" "}
              directly.
            </p>
          </Card>
        )}

        {/* CTA */}
        <Card className="mt-12 p-8 text-center bg-gradient-to-br from-primary/10 to-purple-500/10" data-aos="zoom-in">
          <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Contact Support
          </a>
        </Card>
      </div>
    </div>
  );
}

