import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  MessageSquare,
  MapPin,
  Phone,
  Send,
  Clock,
  HelpCircle,
} from "lucide-react";
import AOS from "aos";

export default function ContactUs() {
  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us an email anytime",
      detail: "support@ailearningcoach.com",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our support team",
      detail: "Available 24/7",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak with our team",
      detail: "+1 (555) 123-4567",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  const offices = [
    {
      city: "San Francisco",
      address: "123 Innovation Drive, Suite 400",
      zip: "San Francisco, CA 94102",
      country: "United States",
    },
    {
      city: "New York",
      address: "456 Education Ave, Floor 12",
      zip: "New York, NY 10001",
      country: "United States",
    },
    {
      city: "London",
      address: "789 Learning Street",
      zip: "London, EC1A 1BB",
      country: "United Kingdom",
    },
  ];

  const faqs = [
    {
      question: "What's your response time?",
      answer: "We typically respond to all inquiries within 24 hours on business days.",
    },
    {
      question: "Do you offer phone support?",
      answer: "Yes! Phone support is available for Pro and Team plan members.",
    },
    {
      question: "Can I schedule a demo?",
      answer: "Absolutely! Use the form below or email us to schedule a personalized demo.",
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-16" data-aos="fade-down">
          <Badge className="mb-4">Get in Touch</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            We're Here to{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Help You Succeed
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Have questions? Need support? Want to share feedback? We'd love to hear from you!
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <Card
                key={index}
                className="p-8 text-center hover:shadow-xl transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className={`inline-flex p-4 bg-gradient-to-br ${method.gradient} rounded-lg mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{method.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                <p className="text-primary font-semibold">{method.detail}</p>
              </Card>
            );
          })}
        </div>

        {/* Contact Form & Info */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Form */}
          <Card className="p-8" data-aos="fade-right">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input placeholder="John Doe" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input type="email" placeholder="john@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input placeholder="How can we help?" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                />
              </div>
              <Button className="w-full gap-2">
                <Send className="w-4 h-4" />
                Send Message
              </Button>
            </form>
          </Card>

          {/* Additional Info */}
          <div data-aos="fade-left">
            {/* Office Hours */}
            <Card className="p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Support Hours</h3>
                  <p className="text-sm text-muted-foreground">
                    Monday - Friday: 9:00 AM - 6:00 PM PST
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Saturday - Sunday: 10:00 AM - 4:00 PM PST
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    *24/7 chat support available for Pro & Team plans
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick FAQs */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Quick Answers</h3>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <p className="font-semibold text-sm mb-1">{faq.question}</p>
                    <p className="text-xs text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Offices */}
        <div>
          <div className="text-center mb-12" data-aos="fade-down">
            <h2 className="text-3xl font-bold mb-4">Our Offices</h2>
            <p className="text-muted-foreground">
              Visit us at one of our locations around the world
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {offices.map((office, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <MapPin className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">{office.city}</h3>
                <p className="text-sm text-muted-foreground">{office.address}</p>
                <p className="text-sm text-muted-foreground">{office.zip}</p>
                <p className="text-sm text-muted-foreground">{office.country}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card
          className="mt-16 p-12 text-center bg-gradient-to-br from-primary/10 to-purple-500/10"
          data-aos="zoom-in"
        >
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Check out our comprehensive Help Center for detailed guides, tutorials, and FAQs.
          </p>
          <Button variant="outline" size="lg">
            Visit Help Center
          </Button>
        </Card>
      </div>
    </div>
  );
}

