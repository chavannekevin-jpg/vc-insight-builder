import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";
import { ModernCard } from "@/components/ModernCard";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <ModernCard className="prose prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 20, 2025</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using UglyBaby (the "Platform"), operated by Kevin Chavanne, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform. We reserve the right to modify these Terms at any time, and your continued use constitutes acceptance of any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground mb-4">
              UglyBaby provides tools for startups and investors, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li><strong>Investment Memo Generation:</strong> AI-powered analysis of startup data to create investor-grade memorandums</li>
              <li><strong>VC Brain Educational Content:</strong> Resources explaining venture capital dynamics</li>
              <li><strong>Investor Dashboard:</strong> Tools for managing dealflow, contacts, and calendar bookings</li>
              <li><strong>Booking System:</strong> Calendar integration for scheduling meetings</li>
              <li><strong>Pitch Deck Analysis:</strong> Automated extraction and analysis of pitch deck content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">3. User Accounts</h2>
            
            <h3 className="text-lg font-medium text-foreground mb-3">Registration</h3>
            <p className="text-muted-foreground mb-4">
              To access certain features, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.
            </p>

            <h3 className="text-lg font-medium text-foreground mb-3">Account Security</h3>
            <p className="text-muted-foreground mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.
            </p>

            <h3 className="text-lg font-medium text-foreground mb-3">Account Types</h3>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li><strong>Founder Accounts:</strong> For startup founders seeking to generate investment memos</li>
              <li><strong>Investor Accounts:</strong> For VCs, angels, and other investors to manage dealflow</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Acceptable Use</h2>
            <p className="text-muted-foreground mb-4">
              You agree NOT to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Use the Platform for any illegal purpose or in violation of any laws</li>
              <li>Submit false, misleading, or fraudulent information</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the Platform's infrastructure</li>
              <li>Attempt to gain unauthorized access to other users' accounts or data</li>
              <li>Use automated systems (bots, scrapers) without our permission</li>
              <li>Transmit viruses, malware, or other harmful code</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Resell or redistribute Platform services without authorization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Content & Intellectual Property</h2>
            
            <h3 className="text-lg font-medium text-foreground mb-3">Platform Content</h3>
            <p className="text-muted-foreground mb-4">
              The Platform, including its design, text, graphics, logos, and software, is owned by UglyBaby and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our permission.
            </p>

            <h3 className="text-lg font-medium text-foreground mb-3">Your Content</h3>
            <p className="text-muted-foreground mb-4">
              You retain ownership of content you submit (company data, pitch decks, questionnaire responses). By submitting content, you grant us a license to use, process, and display it for providing our services. This includes using your data to generate memos and analysis.
            </p>

            <h3 className="text-lg font-medium text-foreground mb-3">Generated Content</h3>
            <p className="text-muted-foreground">
              Investment memos and analysis generated by the Platform are provided for your use. You may use generated content for your fundraising and business purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Payment Terms</h2>
            
            <h3 className="text-lg font-medium text-foreground mb-3">Pricing</h3>
            <p className="text-muted-foreground mb-4">
              Certain features require payment. Current pricing is displayed on the Platform. We reserve the right to change pricing with notice.
            </p>

            <h3 className="text-lg font-medium text-foreground mb-3">Payment Processing</h3>
            <p className="text-muted-foreground mb-4">
              Payments are processed securely by Stripe. By making a purchase, you agree to Stripe's terms of service.
            </p>

            <h3 className="text-lg font-medium text-foreground mb-3">Refunds</h3>
            <p className="text-muted-foreground">
              Due to the digital nature of our services, refunds are generally not provided once a memo has been generated. If you experience technical issues preventing service delivery, contact us at kevin@uglybaby.co for assistance. Refund requests are considered on a case-by-case basis.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Third-Party Services</h2>
            <p className="text-muted-foreground mb-4">
              The Platform integrates with third-party services including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li><strong>Google Calendar:</strong> For booking and availability management</li>
              <li><strong>Stripe:</strong> For payment processing</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Your use of these integrations is subject to their respective terms and privacy policies. We are not responsible for third-party service availability or changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Disclaimers</h2>
            
            <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
              <h3 className="text-lg font-medium text-foreground mb-3">Not Investment Advice</h3>
              <p className="text-muted-foreground">
                <strong>IMPORTANT:</strong> UglyBaby provides educational content and analysis tools. Nothing on this Platform constitutes investment advice, financial advice, or a recommendation to invest in any company. The memos and analysis generated are for informational purposes only. Always conduct your own due diligence and consult qualified professionals before making investment decisions.
              </p>
            </div>

            <h3 className="text-lg font-medium text-foreground mb-3">Service Availability</h3>
            <p className="text-muted-foreground mb-4">
              The Platform is provided "AS IS" and "AS AVAILABLE." We do not guarantee uninterrupted or error-free service. We may modify, suspend, or discontinue features at any time.
            </p>

            <h3 className="text-lg font-medium text-foreground mb-3">Accuracy of Analysis</h3>
            <p className="text-muted-foreground">
              While we strive for accuracy, AI-generated analysis may contain errors or omissions. The quality of output depends on the quality of input data provided by users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>UglyBaby shall not be liable for any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim</li>
              <li>We are not liable for decisions made based on Platform content or generated analysis</li>
              <li>We are not liable for third-party service failures or issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">10. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold harmless UglyBaby, its operators, and affiliates from any claims, damages, losses, or expenses arising from your use of the Platform, your content, or your violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">11. Termination</h2>
            <p className="text-muted-foreground mb-4">
              We may terminate or suspend your account at our discretion, including for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Abuse of Platform resources</li>
              <li>Extended inactivity</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              You may terminate your account at any time by contacting us. Upon termination, your right to use the Platform ceases immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">12. Governing Law & Disputes</h2>
            <p className="text-muted-foreground mb-4">
              These Terms are governed by the laws of the European Union and applicable member state laws. Any disputes shall be resolved through good-faith negotiation first. If negotiation fails, disputes may be submitted to the competent courts.
            </p>
            <p className="text-muted-foreground">
              For EU consumers: You have the right to access the EU Online Dispute Resolution platform at ec.europa.eu/consumers/odr.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">13. Miscellaneous</h2>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li><strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and UglyBaby</li>
              <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in effect</li>
              <li><strong>Waiver:</strong> Our failure to enforce any right does not constitute a waiver</li>
              <li><strong>Assignment:</strong> You may not assign these Terms; we may assign them in connection with a business transfer</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">14. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              Questions about these Terms? Contact us:
            </p>
            <ul className="list-none text-muted-foreground">
              <li><strong>Email:</strong> kevin@uglybaby.co</li>
              <li><strong>Website:</strong> uglybaby.co</li>
            </ul>
          </section>
        </ModernCard>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
