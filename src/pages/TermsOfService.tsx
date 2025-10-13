import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Scale, Shield, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import AOS from "aos";

export default function TermsOfService() {
  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  const highlights = [
    {
      icon: CheckCircle,
      title: "You Can",
      items: [
        "Use our platform for personal or educational purposes",
        "Create and manage your learning profile",
        "Access AI-powered features included in your plan",
        "Share your progress and achievements",
      ],
      color: "text-green-500",
    },
    {
      icon: XCircle,
      title: "You Cannot",
      items: [
        "Share your account with others",
        "Attempt to access unauthorized features",
        "Use our services for illegal purposes",
        "Reproduce or resell our content without permission",
      ],
      color: "text-red-500",
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-16" data-aos="fade-down">
          <Badge className="mb-4">Legal</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Terms of{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Service
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Please read these terms carefully before using our services.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: March 15, 2024
          </p>
        </div>

        {/* Introduction */}
        <Card className="p-8 mb-12" data-aos="fade-up">
          <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
            <p>
              These Terms of Service ("Terms") govern your access to and use of AI Learning Coach's website, applications, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
            </p>
            <p>
              If you do not agree to these Terms, you may not access or use our Services. We reserve the right to modify these Terms at any time, and will notify you of significant changes.
            </p>
          </div>
        </Card>

        {/* Quick Reference */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {highlights.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card
                key={index}
                className="p-8"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Icon className={`w-8 h-8 ${section.color}`} />
                  <h3 className="text-xl font-bold">{section.title}</h3>
                </div>
                <ul className="space-y-3">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className={`${section.color} mt-0.5`}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        {/* Main Sections */}
        <Card className="p-8 mb-8" data-aos="fade-up">
          <div className="flex items-start gap-4 mb-4">
            <Scale className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-4">1. User Accounts</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  To access certain features, you must create an account. You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized access</li>
                  <li>Providing accurate and current information</li>
                </ul>
                <p>
                  You must be at least 13 years old to create an account. Users under 18 require parental consent.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-8" data-aos="fade-up">
          <div className="flex items-start gap-4 mb-4">
            <Shield className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-4">2. Acceptable Use</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>You agree to use our Services only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful code or malware</li>
                  <li>Harass, abuse, or harm others</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use automated systems to access the Services</li>
                  <li>Interfere with or disrupt the Services</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-8" data-aos="fade-up">
          <div className="flex items-start gap-4 mb-4">
            <FileText className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-4">3. Intellectual Property</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  All content on our Services, including text, graphics, logos, software, and AI-generated content, is owned by or licensed to AI Learning Coach and protected by intellectual property laws.
                </p>
                <p>
                  <strong>Your Content:</strong> You retain ownership of any content you submit. By submitting content, you grant us a license to use, modify, and display it as necessary to provide our Services.
                </p>
                <p>
                  <strong>AI-Generated Content:</strong> Content generated by our AI during your sessions is provided for your personal use and may not be redistributed commercially without permission.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-8" data-aos="fade-up">
          <h3 className="text-xl font-bold mb-4">4. Subscriptions and Payments</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong>Paid Plans:</strong> Some features require a paid subscription. By subscribing, you agree to pay all fees associated with your chosen plan.
            </p>
            <p>
              <strong>Billing:</strong> Subscriptions are billed in advance on a recurring basis (monthly or annually). Your subscription will automatically renew unless canceled.
            </p>
            <p>
              <strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period.
            </p>
            <p>
              <strong>Refunds:</strong> We offer a 30-day money-back guarantee for first-time subscribers. Contact support for refund requests.
            </p>
          </div>
        </Card>

        <Card className="p-8 mb-8" data-aos="fade-up">
          <div className="flex items-start gap-4 mb-4">
            <AlertCircle className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-4">5. Disclaimers and Limitations</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong>AS IS:</strong> Our Services are provided "as is" without warranties of any kind, either express or implied.
                </p>
                <p>
                  <strong>Educational Tool:</strong> AI Learning Coach is an educational supplement, not a replacement for formal education or professional advice.
                </p>
                <p>
                  <strong>AI Accuracy:</strong> While we strive for accuracy, AI-generated content may contain errors. Always verify important information.
                </p>
                <p>
                  <strong>Limitation of Liability:</strong> We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our Services.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-8" data-aos="fade-up">
          <h3 className="text-xl font-bold mb-4">6. Termination</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>
              We reserve the right to suspend or terminate your account if you violate these Terms or engage in behavior we deem harmful to our Services or other users.
            </p>
            <p>
              Upon termination, your right to use the Services will immediately cease. You may request a copy of your data within 30 days of termination.
            </p>
          </div>
        </Card>

        <Card className="p-8 mb-8" data-aos="fade-up">
          <h3 className="text-xl font-bold mb-4">7. Changes to Services</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>
              We reserve the right to modify, suspend, or discontinue any part of our Services at any time, with or without notice. We will not be liable to you or any third party for any such modifications.
            </p>
          </div>
        </Card>

        <Card className="p-8 mb-8" data-aos="fade-up">
          <h3 className="text-xl font-bold mb-4">8. Governing Law</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
            </p>
            <p>
              Any disputes arising from these Terms shall be resolved in the courts of San Francisco County, California.
            </p>
          </div>
        </Card>

        <Card className="p-8" data-aos="fade-up">
          <h3 className="text-xl font-bold mb-4">Contact Us</h3>
          <p className="text-muted-foreground mb-4">
            If you have questions about these Terms, please contact us:
          </p>
          <div className="text-muted-foreground space-y-2">
            <p>• Email: legal@ailearningcoach.com</p>
            <p>• Mail: AI Learning Coach, Legal Department, 123 Innovation Drive, San Francisco, CA 94102</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

