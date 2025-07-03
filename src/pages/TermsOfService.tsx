import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertTriangle, CreditCard, UserCheck, Shield, Gavel } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="flex flex-col py-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3">
            <FileText className="h-12 w-12 text-primary" />
            <h1 className="text-4xl lg:text-5xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            These terms govern your use of HomeworkHelper. Please read them carefully before using our service.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="space-y-8">
          
          {/* Acceptance of Terms */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <UserCheck className="h-6 w-6 text-primary" />
                <span>Acceptance of Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                By accessing or using HomeworkHelper ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you disagree with any part of these terms, then you may not access the Service.
              </p>
              <p className="text-muted-foreground">
                These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </CardContent>
          </Card>

          {/* Description of Service */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl">Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                HomeworkHelper is an AI-powered educational platform that provides:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Step-by-step explanations for homework questions</li>
                <li>Support for various subjects and grade levels</li>
                <li>Image analysis for handwritten or printed homework</li>
                <li>Educational guidance focused on learning, not just answers</li>
                <li>Progress tracking and usage analytics</li>
              </ul>
              <p className="text-muted-foreground">
                Our Service is designed to assist with learning and understanding, not to provide completed homework assignments.
              </p>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl">User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Account Creation</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the security of your account and password</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>You may not use another person's account without permission</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-6">Age Requirements</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Users under 13 must have parental consent to use the Service</li>
                <li>Users between 13-18 should have parental awareness of their use</li>
                <li>Parents are responsible for monitoring their children's use of the Service</li>
              </ul>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <Shield className="h-6 w-6 text-primary" />
                <span>Acceptable Use Policy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">You May:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Use the Service for legitimate educational purposes</li>
                <li>Ask questions about homework and academic subjects</li>
                <li>Share appropriate educational content</li>
                <li>Use the Service to enhance your learning and understanding</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-6">You May Not:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Use the Service for cheating or academic dishonesty</li>
                <li>Submit exam questions or test materials</li>
                <li>Share inappropriate, harmful, or offensive content</li>
                <li>Attempt to reverse engineer or hack the Service</li>
                <li>Use the Service for commercial purposes without permission</li>
                <li>Create multiple accounts to exceed usage limits</li>
                <li>Share your account credentials with others</li>
              </ul>
            </CardContent>
          </Card>

          {/* Subscription and Payment */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <CreditCard className="h-6 w-6 text-primary" />
                <span>Subscription and Payment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Subscription Plans</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Free plan includes 5 questions renewable every 24 hours</li>
                <li>Family plan includes 50 questions renewable every 24 hours</li>
                <li>Pay-per-use option available at KES 10 per question</li>
                <li>Prices are subject to change with reasonable notice</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-6">Payment Terms</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Subscriptions are billed monthly in advance</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>We accept M-Pesa, Airtel Money, and major credit cards</li>
                <li>Failed payments may result in service suspension</li>
                <li>You can cancel your subscription at any time</li>
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl">Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Our Rights</h3>
              <p className="text-muted-foreground">
                The Service and its original content, features, and functionality are owned by HomeworkHelper and are protected by 
                international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              
              <h3 className="text-lg font-semibold mt-6">Your Content</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You retain ownership of content you submit to the Service</li>
                <li>You grant us a license to use your content to provide and improve the Service</li>
                <li>You are responsible for ensuring you have rights to any content you submit</li>
                <li>We may remove content that violates these Terms or applicable laws</li>
              </ul>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl">Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information 
                when you use our Service. By using our Service, you agree to the collection and use of information in 
                accordance with our Privacy Policy.
              </p>
              <p className="text-muted-foreground">
                <a href="/privacy-policy" className="text-primary hover:underline">View our Privacy Policy</a>
              </p>
            </CardContent>
          </Card>

          {/* Prohibited Uses */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <AlertTriangle className="h-6 w-6 text-primary" />
                <span>Prohibited Uses</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">You may not use our Service:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>For any unlawful purpose or to solicit others to unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
                <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                <li>For any obscene or immoral purpose</li>
                <li>To interfere with or circumvent the security features of the Service</li>
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl">Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>The Service is provided "as is" without warranties of any kind</li>
                <li>We do not guarantee the accuracy of AI-generated responses</li>
                <li>You should verify important information from authoritative sources</li>
                <li>The Service is for educational assistance, not professional advice</li>
                <li>We are not responsible for how you use the information provided</li>
                <li>Service availability may be interrupted for maintenance or technical issues</li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl">Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                In no event shall HomeworkHelper, its directors, employees, partners, agents, suppliers, or affiliates be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Any loss of profits, revenues, data, use, goodwill, or other intangible losses</li>
                <li>Any damages resulting from your use or inability to use the Service</li>
                <li>Any damages resulting from unauthorized access to your account</li>
                <li>Any damages resulting from any other party's conduct or content on the Service</li>
              </ul>
              <p className="text-muted-foreground">
                Our total liability shall not exceed the amount paid by you for the Service in the 12 months preceding the claim.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <Gavel className="h-6 w-6 text-primary" />
                <span>Governing Law</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                These Terms shall be interpreted and governed by the laws of Kenya. Any disputes arising from these Terms 
                or your use of the Service shall be resolved in the courts of Kenya.
              </p>
              <p className="text-muted-foreground">
                If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will remain in effect.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl">Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide 
                at least 30 days' notice prior to any new terms taking effect.
              </p>
              <p className="text-muted-foreground">
                What constitutes a material change will be determined at our sole discretion. By continuing to access or use our 
                Service after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p><strong>Email:</strong> fakiiahmad001@gmail.com</p>
                <p><strong>Phone:</strong> +254 741 140 250</p>
                <p><strong>Address:</strong> Nairobi, Kenya</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>
    </div>
  );
}
