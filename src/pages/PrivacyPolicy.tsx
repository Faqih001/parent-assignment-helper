import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Users, Database, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col py-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-4xl lg:text-5xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="space-y-8">
          
          {/* Information We Collect */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <Database className="h-6 w-6 text-primary" />
                <span>Information We Collect</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Name and email address when you create an account</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Profile information you choose to provide</li>
                <li>Contact information when you reach out to us</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-6">Usage Information</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Homework questions and AI responses</li>
                <li>Usage patterns and frequency of service use</li>
                <li>Device information and browser type</li>
                <li>IP address and general location information</li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <Eye className="h-6 w-6 text-primary" />
                <span>How We Use Your Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide and improve our AI homework assistance service</li>
                <li>Process payments and manage your subscription</li>
                <li>Send important updates about your account and service</li>
                <li>Respond to your questions and support requests</li>
                <li>Analyze usage patterns to improve our platform</li>
                <li>Ensure the security and integrity of our service</li>
                <li>Comply with legal obligations and protect our rights</li>
              </ul>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <Users className="h-6 w-6 text-primary" />
                <span>Information Sharing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We do not sell your personal information. We may share information in the following limited circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Service Providers:</strong> Third-party services that help us operate (payment processing, AI services, email delivery)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> Any other sharing with your explicit permission</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <Lock className="h-6 w-6 text-primary" />
                <span>Data Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal information on a need-to-know basis</li>
                <li>Secure payment processing through certified providers</li>
              </ul>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl">Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                HomeworkHelper is designed to help students of all ages with their homework. We take special care to protect children's privacy:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>We require parental consent for users under 13 years old</li>
                <li>We do not knowingly collect personal information from children without parental consent</li>
                <li>Parents can review, modify, or delete their child's information by contacting us</li>
                <li>We encourage parents to monitor their children's online activities</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl">Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Account Deletion:</strong> Delete your account and associated data</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl">Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We retain your information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Account information: Until you delete your account</li>
                <li>Chat history: Stored for your convenience; you can delete at any time</li>
                <li>Payment records: Retained for tax and legal compliance (typically 7 years)</li>
                <li>Usage analytics: Anonymized data may be retained indefinitely for service improvement</li>
              </ul>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl">International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than Kenya. We ensure adequate protection through:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Adequacy decisions or appropriate safeguards</li>
                <li>Standard contractual clauses with service providers</li>
                <li>Certification schemes and codes of conduct</li>
                <li>Compliance with applicable data protection laws</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <Mail className="h-6 w-6 text-primary" />
                <span>Contact Us</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy or want to exercise your rights, please contact us:
              </p>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p><strong>Email:</strong> fakiiahmad001@gmail.com</p>
                <p><strong>Phone:</strong> +254 741 140 250</p>
                <p><strong>Address:</strong> Nairobi, Kenya</p>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl">Policy Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Posting the updated policy on our website</li>
                <li>Sending you an email notification</li>
                <li>Displaying a prominent notice in our app</li>
              </ul>
              <p className="text-muted-foreground">
                Your continued use of our service after any changes indicates your acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

        </div>
      </section>
    </div>
  );
}
