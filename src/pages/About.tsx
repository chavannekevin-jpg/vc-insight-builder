import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/Header";
import { ArrowLeft, CheckCircle2, Target, TrendingUp, Users2 } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-8">

          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-serif mb-6">About Us</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Active early-stage VCs translating 10+ years of deal experience into tools that help growing startups succeed
            </p>
          </div>

          <ModernCard className="shadow-xl">
            <div className="space-y-8 text-base leading-relaxed">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-destructive" />
                  </div>
                  <h2 className="text-3xl font-serif">Who We Are</h2>
                </div>
                
                <p>
                  We're active venture capital investors specializing in early-stage companies across Europe. 
                  Over ten years, we've evaluated thousands of founding teams and deployed capital into pre-seed and seed rounds.
                </p>

                <p>
                  As active VCs sitting on the other side of the table, we've written hundreds of investment memorandums 
                  for real deals—and we've identified a critical gap in how founders present themselves to investors.
                </p>

                <p className="text-muted-foreground italic pl-4 border-l-2 border-destructive">
                  Most companies with real traction still get rejected because they don't speak the VC language. 
                  They frame their metrics incorrectly, miss the narrative that connects traction to venture scale, 
                  and present their business in ways that create doubt rather than conviction.
                </p>
              </div>

              <div className="p-6 rounded-xl gradient-accent border border-primary/20 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-serif">What We Built</h2>
                </div>
                <p>
                  As active investors who write checks, we've codified our evaluation framework—the same framework 
                  we use to assess deals—into a structured system that helps growing companies generate investor-grade 
                  materials that translate traction into compelling investment narratives.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-serif">The Investment Memorandum</h2>
                
                <p>
                  Our first product is the <strong>"Investment Memorandum"</strong>. 
                  By providing strategic information about your company, team, and traction, you'll generate a complete 
                  investor-grade document that will:
                </p>

                <ul className="space-y-3 ml-6">
                  {[
                    "Frame your company's traction and metrics through an investor lens",
                    "Identify gaps between your current narrative and what VCs need to see",
                    "Transform your team's expertise into competitive advantages"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-serif">Future Products</h2>
                
                <p>
                  We'll be adding additional materials for fundraising teams, such as:
                </p>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  {[
                    { icon: "📊", label: "Pitch Decks" },
                    { icon: "🎤", label: "Pitch Scripts" },
                    { icon: "📁", label: "Data Room Structure" },
                    { icon: "📈", label: "Financial Models" }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                      <span className="text-2xl mr-2">{item.icon}</span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>

                <p className="text-sm italic text-muted-foreground pt-2">
                  But for now, we're focused on building a professional VC investment memorandum about YOUR COMPANY.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                <div className="flex items-center gap-3">
                  <Users2 className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-serif">Investor Network Access</h2>
                </div>
                <p>
                  Once your company has generated your memorandum, 
                  you can pay extra to be showcased to our network of <strong>100+ European investors</strong> actively deploying capital.
                </p>
              </div>

              <div className="pt-6 border-t border-border flex items-center justify-center gap-8 flex-wrap">
                <div className="text-center">
                  <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-semibold">Active Early-Stage VCs</p>
                </div>
                <div className="text-center">
                  <Users2 className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-semibold">1000+ companies evaluated</p>
                </div>
                <div className="text-center">
                  <CheckCircle2 className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-semibold">100+ memos written</p>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <Button 
                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} 
                  className="w-full gradient-primary"
                  size="lg"
                >
                  Join Waitlist
                </Button>
              </div>
            </div>
          </ModernCard>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
