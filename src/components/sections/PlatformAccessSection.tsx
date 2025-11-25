import { BookOpen, Lightbulb, FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PlatformAccessSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">Everything You Need</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            What You Get Access To
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete platform designed to help founders go from idea to funded
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Tier 1: Free Hub */}
          <div className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary">
              FREE
            </div>
            
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>

            <h3 className="text-2xl font-bold mb-3">Free Hub</h3>
            <p className="text-muted-foreground mb-6">
              Access guides, templates, and resources built from years of reviewing pitches
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Pre-Seed Deck Guide</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Problem & Solution Frameworks</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">PlayBook Articles</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Templates & Tools</span>
              </li>
            </ul>

            <button
              onClick={() => navigate('/hub')}
              className="w-full px-6 py-3 rounded-lg bg-muted border border-border hover:bg-muted/80 transition-all font-medium"
            >
              Explore Hub
            </button>
          </div>

          {/* Tier 2: Framework */}
          <div className="group relative p-8 rounded-2xl bg-card border-2 border-primary/50 hover:border-primary transition-all shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transform hover:-translate-y-1">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              INCLUDED
            </div>
            
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Lightbulb className="w-7 h-7 text-primary" />
            </div>

            <h3 className="text-2xl font-bold mb-3">Investment Framework</h3>
            <p className="text-muted-foreground mb-6">
              Learn the exact methodology VCs use to evaluate startups
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">VC Decision Framework</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Pitch Evaluation Criteria</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Common Rejection Patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">What Actually Gets Funded</span>
              </li>
            </ul>

            <button
              onClick={() => navigate('/auth')}
              className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium shadow-lg shadow-primary/20"
            >
              Get Free Access
            </button>
          </div>

          {/* Tier 3: Premium Memo */}
          <div className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-accent/10 text-xs font-semibold text-accent">
              PREMIUM
            </div>
            
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileText className="w-7 h-7 text-accent" />
            </div>

            <h3 className="text-2xl font-bold mb-3">Investment Memo</h3>
            <p className="text-muted-foreground mb-6">
              AI-powered personalized memo written from a VC's perspective
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm">Personalized to Your Startup</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm">VC-Quality Analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm">Actionable Feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm">Pitch Strengthening Insights</span>
              </li>
            </ul>

            <button
              onClick={() => {
                const pricingSection = document.getElementById('pricing-section');
                if (pricingSection) {
                  pricingSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full px-6 py-3 rounded-lg bg-muted border border-border hover:bg-muted/80 transition-all font-medium"
            >
              View Pricing
            </button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Start with free resources, upgrade when you're ready
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
          >
            Create Your Free Account
          </button>
        </div>
      </div>
    </section>
  );
};