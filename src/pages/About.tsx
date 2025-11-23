import { Win98Card } from "@/components/Win98Card";
import { Win98StartButton } from "@/components/Win98StartButton";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/sections/Footer";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Win98Card title="About_Me.exe" accentColor="teal">
            <div className="space-y-6 font-sans text-sm leading-relaxed">
              <div className="space-y-4">
                <h1 className="font-pixel text-lg mb-4">The Problem I'm Solving</h1>
                
                <p>
                  Having worked in the VC space for over ten years, met with thousands of founders, 
                  and written hundreds of investment memorandums, I've identified a critical gap in the startup ecosystem.
                </p>

                <p>
                  Having coached, advised, and worked with multiple internationally recognized accelerators, 
                  I have understood that <strong>most startups fail at actually becoming startups</strong> because they 
                  do not speak the VC language, and do not look at their companies the way VCs look at their company.
                </p>

                <p className="text-muted-foreground italic">
                  They get rejected without clarity, they build the wrong investment models, they over-complexify their product...
                </p>
              </div>

              <div className="win98-inset p-4 bg-muted/20 space-y-3">
                <h2 className="font-pixel text-base">My Solution</h2>
                <p>
                  I decided to translate my cognitive experience into a series of prompts that startups can use 
                  by inputting data about their company to extract multiple types of resources relevant to investors.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="font-pixel text-base">The Investment Memorandum</h2>
                
                <p>
                  The first product I'm releasing is the <strong>"Investment Memorandum"</strong>. 
                  By inputting information requested on my platform, startups will be able to generate a complete 
                  investor prompt that will:
                </p>

                <ul className="space-y-2 ml-6 list-none">
                  <li className="flex items-start gap-2">
                    <span className="text-primary flex-shrink-0">→</span>
                    <span>Best describe the company from an investor lens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary flex-shrink-0">→</span>
                    <span>Provide questions and feedback to adjust the model towards a more VC-suited approach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary flex-shrink-0">→</span>
                    <span>Help with narrative building and reflecting on better performance</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="font-pixel text-base">Future Products</h2>
                
                <p>
                  Companies will be able to request additional types of material later down the line, such as:
                </p>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="win98-raised p-3 bg-background">
                    <span className="text-xs">📊 Pitch Decks</span>
                  </div>
                  <div className="win98-raised p-3 bg-background">
                    <span className="text-xs">🎤 Pitch Scripts</span>
                  </div>
                  <div className="win98-raised p-3 bg-background">
                    <span className="text-xs">📁 Data Room Structure</span>
                  </div>
                  <div className="win98-raised p-3 bg-background">
                    <span className="text-xs">📈 Financial Models</span>
                  </div>
                </div>

                <p className="text-sm italic text-muted-foreground">
                  But for now, we're focused on building a professional VC investment memorandum about YOUR COMPANY.
                </p>
              </div>

              <div className="win98-inset p-4 bg-accent/10 space-y-3">
                <h2 className="font-pixel text-base">Investor Network Access</h2>
                <p>
                  Once your company has joined the platform and generated your memorandum, 
                  you can pay a little extra to be showcased to my list of <strong>100+ European investors</strong>.
                </p>
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <strong>10+ years in VC</strong> • <strong>1000+ founders met</strong> • <strong>100+ investment memorandums written</strong>
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Win98StartButton onClick={() => navigate('/')} variant="default">
                  ← Back to Home
                </Win98StartButton>
                <Win98StartButton 
                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} 
                  variant="primary"
                >
                  Join Waitlist
                </Win98StartButton>
              </div>
            </div>
          </Win98Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
