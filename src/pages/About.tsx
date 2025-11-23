import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/sections/Footer";
import { ArrowLeft, CheckCircle2, Target, TrendingUp, Users2 } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-serif mb-6">About Me</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Translating 10+ years of VC experience into tools that help startups succeed
            </p>
          </div>

          <ModernCard className="shadow-xl">
            <div className="space-y-8 text-base leading-relaxed">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-destructive" />
                  </div>
                  <h2 className="text-3xl font-serif">The Problem I'm Solving</h2>
                </div>
                
                <p>
                  Having worked in the VC space for over ten years, met with thousands of founders, 
                  and written hundreds of investment memorandums, I've identified a critical gap in the startup ecosystem.
                </p>

                <p>
                  Having coached, advised, and worked with multiple internationally recognized accelerators, 
                  I have understood that <strong>most startups fail at actually becoming startups</strong> because they 
                  do not speak the VC language, and do not look at their companies the way VCs look at their company.
                </p>

                <p className="text-muted-foreground italic pl-4 border-l-2 border-destructive">
                  They get rejected without clarity, they build the wrong investment models, they over-complexify their product...
                </p>
              </div>

              <div className="p-6 rounded-xl gradient-accent border border-primary/20 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-serif">My Solution</h2>
                </div>
                <p>
                  I decided to translate my cognitive experience into a series of prompts that startups can use 
                  by inputting data about their company to extract multiple types of resources relevant to investors.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-serif">The Investment Memorandum</h2>
                
                <p>
                  The first product I'm releasing is the <strong>"Investment Memorandum"</strong>. 
                  By inputting information requested on my platform, startups will be able to generate a complete 
                  investor prompt that will:
                </p>

                <ul className="space-y-3 ml-6">
                  {[
                    "Best describe the company from an investor lens",
                    "Provide questions and feedback to adjust the model towards a more VC-suited approach",
                    "Help with narrative building and reflecting on better performance"
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
                  Companies will be able to request additional types of material later down the line, such as:
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
                  Once your company has joined the platform and generated your memorandum, 
                  you can pay a little extra to be showcased to my list of <strong>100+ European investors</strong>.
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
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Back to Home
                </Button>
                <Button 
                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} 
                  className="flex-1 gradient-primary"
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
