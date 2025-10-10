import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Sparkles,
  Crown,
  Rocket,
  Star,
  Zap,
} from "lucide-react";
import AOS from "aos";

export default function Pricing() {
  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  const plans = [
    {
      name: "Free",
      icon: Sparkles,
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Basic AI chat access",
        "5 quizzes per day",
        "Community access",
        "Basic progress tracking",
        "Mobile app access",
      ],
      limitations: [
        "Limited chat sessions",
        "Standard response time",
        "Basic analytics",
      ],
      cta: "Get Started",
      popular: false,
      gradient: "from-gray-500 to-slate-600",
    },
    {
      name: "Pro",
      icon: Crown,
      price: "$9.99",
      period: "/month",
      description: "For serious learners",
      features: [
        "Unlimited AI chat",
        "Unlimited quizzes",
        "Trivia battles",
        "Advanced analytics",
        "Custom learning paths",
        "Priority support",
        "Ad-free experience",
        "Downloadable resources",
      ],
      cta: "Start Pro Trial",
      popular: true,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      name: "Team",
      icon: Rocket,
      price: "$49.99",
      period: "/month",
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "Up to 10 team members",
        "Team dashboard",
        "Custom branding",
        "Dedicated support",
        "API access",
        "Advanced reporting",
        "SSO integration",
        "Custom integrations",
      ],
      cta: "Contact Sales",
      popular: false,
      gradient: "from-blue-500 to-cyan-500",
    },
  ];

  const faqs = [
    {
      question: "Can I cancel anytime?",
      answer: "Yes! You can cancel your subscription at any time. No questions asked.",
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your payment.",
    },
    {
      question: "Can I switch plans later?",
      answer: "Absolutely! You can upgrade or downgrade your plan at any time.",
    },
    {
      question: "Is there a student discount?",
      answer: "Yes! Students get 50% off on Pro plans with a valid student email.",
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-16" data-aos="fade-down">
          <Badge className="mb-4">Pricing Plans</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Choose the Perfect Plan for{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Your Learning Journey
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Start free, upgrade when you need more. All plans include our core AI features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <Card
                key={index}
                className={`p-8 relative ${
                  plan.popular
                    ? "border-2 border-primary shadow-xl scale-105"
                    : "hover:shadow-lg"
                } transition-all duration-300`}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-primary text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1 inline" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className={`inline-flex p-3 bg-gradient-to-br ${plan.gradient} rounded-lg mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <Button
                  className={`w-full mb-6 ${
                    plan.popular
                      ? "bg-gradient-primary hover:opacity-90"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations?.map((limitation, idx) => (
                    <div key={idx} className="flex items-start gap-2 opacity-50">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Enterprise */}
        <Card
          className="p-12 text-center bg-gradient-to-br from-primary/5 to-purple-500/5 mb-20"
          data-aos="zoom-in"
        >
          <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl font-bold mb-4">Enterprise Solutions</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Need a custom plan for your organization? We offer tailored solutions with dedicated support, custom integrations, and volume pricing.
          </p>
          <Button size="lg" variant="outline">
            Contact Sales Team
          </Button>
        </Card>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12" data-aos="fade-down">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="p-6"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <h3 className="font-bold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

