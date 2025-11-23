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
              Translating 10+ years of VC experience into tools that help growing startups succeed
            </p>
          </div>

          <ModernCard className="shadow-xl">
            <div className="space-y-8 text-base leading-relaxed">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-destructive" />
                  </div>
                  <h2 className="text-3xl font-serif">The Problem We're Solving</h2>
                </div>
                
                <p>
                  After working in the VC space for over ten years, meeting with thousands of founding teams, 
                  and writing hundreds of investment memorandums, we've identified a critical gap in the startup ecosystem.
                </p>

                <p>
                  Through coaching and advising multiple internationally recognized accelerators, 
                  we've seen that <strong>most companies with real traction still fail to raise capital</strong> because they 
                  don't speak the VC language, and don't frame their business the way investors need to see it.
                </p>

                <p className="text-muted-foreground italic pl-4 border-l-2 border-destructive">
                  Teams get rejected without clarity, they frame their traction incorrectly, they miss the narrative that connects their metrics to venture scale...
                </p>
              </div>

              <div className="p-6 rounded-xl gradient-accent border border-primary/20 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-serif">Our Solution</h2>
                </div>
                <p>
                  We've translated our experience into a structured framework that growing companies can use 
                  to generate investor-grade materials that translate their traction into compelling investment narratives.
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
                  <p className="text-sm font-semibold">10+ years in VC</p>
                </div>
                <div className="text-center">
                  <Users2 className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-semibold">1000+ founders met</p>
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
