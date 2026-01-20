import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";
import { ModernCard } from "@/components/ModernCard";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <ModernCard className="prose prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 20, 2025</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground mb-4">
              UglyBaby ("we", "our", or "us") is operated by Kevin Chavanne. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at uglybaby.co and vc-insight-builder.lovable.app.
            </p>
            <p className="text-muted-foreground">
              We are committed to protecting your privacy and being transparent about our data practices. By using UglyBaby, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            
            <h3 className="text-lg font-medium text-foreground mb-3">Account Information</h3>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Email address (for authentication and communication)</li>
              <li>Profile information you provide (name, organization, city)</li>
              <li>Investment preferences and professional details (for investors)</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mb-3">Company & Startup Data</h3>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Company profiles and pitch deck content</li>
              <li>Questionnaire responses for memo generation</li>
              <li>Business metrics and traction data you provide</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mb-3">Payment Information</h3>
            <p className="text-muted-foreground mb-4">
              Payment processing is handled securely by Stripe. We do not store your full credit card details on our servers. Stripe's privacy policy governs payment data handling.
            </p>

            <h3 className="text-lg font-medium text-foreground mb-3">Usage Data</h3>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Pages visited and features used</li>
              <li>Device and browser information</li>
              <li>IP address and approximate location</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Google Calendar Integration</h2>
            <p className="text-muted-foreground mb-4">
              If you choose to connect your Google Calendar, we access the following data:
            </p>
            
            <h3 className="text-lg font-medium text-foreground mb-3">What We Access</h3>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li><strong>Calendar Events (read-only):</strong> We read your calendar events to determine busy times and show accurate availability on your public booking page. This prevents double-bookings.</li>
              <li><strong>Create Calendar Events:</strong> When someone books a meeting with you, we create a calendar event on your behalf with meeting details. Both you and the booker receive Google Calendar invitations.</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mb-3">What We Do NOT Do</h3>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>We do NOT permanently store your calendar event details</li>
              <li>We do NOT access calendar data for advertising purposes</li>
              <li>We do NOT share calendar data with third parties</li>
              <li>We do NOT use calendar data for machine learning or AI training</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mb-3">Data Retention</h3>
            <p className="text-muted-foreground">
              Calendar data is accessed in real-time for availability checking and is not stored beyond the immediate request. Only booking records (time, attendee info) are stored to maintain your booking history.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Google API Services User Data Policy</h2>
            <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
              <p className="text-muted-foreground mb-4">
                UglyBaby's use and transfer of information received from Google APIs adheres to the{" "}
                <a 
                  href="https://developers.google.com/terms/api-services-user-data-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.
              </p>
              <p className="text-muted-foreground">
                Specifically, we limit our use of Google user data to providing and improving the calendar booking functionality. We do not use this data for serving advertisements or for any purpose unrelated to the core booking service.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">5. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>To provide and maintain our services (memo generation, booking system, dealflow management)</li>
              <li>To process transactions and send related information</li>
              <li>To communicate with you about updates, features, or support</li>
              <li>To analyze usage patterns and improve our platform</li>
              <li>To detect, prevent, and address technical issues or fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Data Sharing & Disclosure</h2>
            <p className="text-muted-foreground mb-4">
              We do NOT sell your personal data. We may share information only in these cases:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li><strong>Service Providers:</strong> Trusted third parties that help us operate (Stripe for payments, email providers for notifications)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to share data (e.g., sharing your startup profile with investors)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement appropriate technical and organizational measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Encryption in transit (HTTPS/TLS) and at rest</li>
              <li>Secure authentication with session management</li>
              <li>Regular security assessments</li>
              <li>Access controls limiting who can view your data</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us. Some data may be retained to comply with legal obligations or resolve disputes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your data</li>
              <li><strong>Portability:</strong> Request your data in a portable format</li>
              <li><strong>Withdraw Consent:</strong> Revoke consent for data processing (e.g., disconnect Google Calendar)</li>
              <li><strong>Object:</strong> Object to certain data processing activities</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, contact us at kevin@uglybaby.co.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">10. Third-Party Services</h2>
            <p className="text-muted-foreground">
              Our platform integrates with third-party services including Google Calendar, Stripe, and analytics providers. Each has their own privacy policies governing data they collect. We encourage you to review their policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">11. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date. Continued use of the platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about this Privacy Policy or our data practices, contact us:
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

export default PrivacyPolicy;
