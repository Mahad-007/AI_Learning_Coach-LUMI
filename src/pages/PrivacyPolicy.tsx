import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, FileText, Users, Bell } from "lucide-react";
import AOS from "aos";

export default function PrivacyPolicy() {
  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  const sections = [
    {
      icon: FileText,
      title: "Information We Collect",
      content: [
        "Personal information you provide (name, email, profile details)",
        "Usage data and learning progress",
        "Device and browser information",
        "Cookies and similar tracking technologies",
      ],
    },
    {
      icon: Shield,
      title: "How We Use Your Information",
      content: [
        "Provide and personalize our AI learning services",
        "Improve and optimize our platform",
        "Communicate important updates and support",
        "Ensure security and prevent fraud",
      ],
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        "Industry-standard encryption for data transmission",
        "Secure server infrastructure and access controls",
        "Regular security audits and updates",
        "Employee training on data protection",
      ],
    },
    {
      icon: Users,
      title: "Data Sharing",
      content: [
        "We never sell your personal data to third parties",
        "Limited sharing with service providers (hosting, analytics)",
        "Legal compliance when required by law",
        "Anonymous, aggregated data for research",
      ],
    },
    {
      icon: Eye,
      title: "Your Rights",
      content: [
        "Access and download your personal data",
        "Correct inaccurate information",
        "Request deletion of your data",
        "Opt-out of marketing communications",
      ],
    },
    {
      icon: Bell,
      title: "Cookies & Tracking",
      content: [
        "Essential cookies for platform functionality",
        "Analytics cookies to improve user experience",
        "You can manage cookie preferences in settings",
        "Third-party cookies from integrated services",
      ],
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-16" data-aos="fade-down">
          <Badge className="mb-4">Legal</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Privacy{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Your privacy is important to us. This policy explains how we collect, use, and protect your data.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: March 15, 2024
          </p>
        </div>

        {/* Introduction */}
        <Card className="p-8 mb-12" data-aos="fade-up">
          <h2 className="text-2xl font-bold mb-4">Introduction</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
            <p>
              At AI Learning Coach, we take your privacy seriously. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our platform and services.
            </p>
            <p>
              By using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </div>
        </Card>

        {/* Sections */}
        <div className="space-y-6 mb-12">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card
                key={index}
                className="p-8"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-4">{section.title}</h3>
                    <ul className="space-y-2">
                      {section.content.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Additional Sections */}
        <Card className="p-8 mb-8" data-aos="fade-up">
          <h3 className="text-xl font-bold mb-4">Children's Privacy</h3>
          <p className="text-muted-foreground mb-4">
            Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
          </p>
          <p className="text-muted-foreground">
            For users aged 13-18, we require parental consent before collecting personal information.
          </p>
        </Card>

        <Card className="p-8 mb-8" data-aos="fade-up">
          <h3 className="text-xl font-bold mb-4">International Data Transfers</h3>
          <p className="text-muted-foreground mb-4">
            Your information may be transferred to and maintained on servers located outside of your country. We ensure that all transfers comply with applicable data protection laws and implement appropriate safeguards.
          </p>
          <p className="text-muted-foreground">
            For users in the European Economic Area (EEA), we comply with GDPR requirements and use Standard Contractual Clauses approved by the European Commission.
          </p>
        </Card>

        <Card className="p-8 mb-8" data-aos="fade-up">
          <h3 className="text-xl font-bold mb-4">Data Retention</h3>
          <p className="text-muted-foreground mb-4">
            We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
          </p>
          <p className="text-muted-foreground">
            When you delete your account, we will delete or anonymize your personal data within 30 days, except where we are legally required to retain it.
          </p>
        </Card>

        <Card className="p-8" data-aos="fade-up">
          <h3 className="text-xl font-bold mb-4">Contact Us</h3>
          <p className="text-muted-foreground mb-4">
            If you have questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="text-muted-foreground space-y-2">
            <p>• Email: privacy@ailearningcoach.com</p>
            <p>• Mail: AI Learning Coach, 123 Innovation Drive, San Francisco, CA 94102</p>
            <p>• Data Protection Officer: dpo@ailearningcoach.com</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

