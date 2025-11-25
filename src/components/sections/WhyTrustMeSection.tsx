import { ModernCard } from "../ModernCard";
import { Linkedin } from "lucide-react";
import kevinPhoto from "@/assets/kevin-chavanne.jpg";

export const WhyTrustMeSection = () => {
  return (
    <section className="py-20 px-6 sm:px-8 lg:px-12 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background -z-10" />
      
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8 items-center">
          {/* Photo Section */}
          <div className="md:col-span-2">
            <ModernCard className="overflow-hidden">
              <div className="aspect-square bg-muted/50 flex items-center justify-center relative">
                <img 
                  src={kevinPhoto} 
                  alt="Kevin Chavanne - Nordic VC at Tenity" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              </div>
            </ModernCard>
          </div>

          {/* Content Section */}
          <div className="md:col-span-3 space-y-6">
            <h2 
              className="text-3xl md:text-4xl font-serif leading-tight"
              style={{ 
                textShadow: '0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3)'
              }}
            >
              10 Years Reviewing Pitches. Now I'm Sharing Everything.
            </h2>
            
            <div className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                I'm <strong>Kevin Chavanne</strong>, and over the past decade in venture capital, I've reviewed thousands of pitches and invested in dozens of startups across Europe.
              </p>
              
              <p>
                <strong>Here's what I learned:</strong> Most founders spend 8+ months fundraising, not because their ideas are bad, but because they don't understand what VCs actually want. They obsess over features while we're evaluating market dynamics, defensibility, and scalability.
              </p>
              
              <p>
                I've spent countless hours as a mentor at <strong>Plug & Play</strong> and other accelerators, giving keynotes and workshops on how to think like a VC. I currently lead <strong>Tenity's Nordic branch</strong>, investing in early-stage fintech. Before this, I scaled <strong>Funderbeam</strong> across Iberia and Scandinavia, and deployed millions at <strong>Blast Club</strong> as Investment Manager.
              </p>
              
              <p className="text-primary font-semibold">
                But here's the problem: <strong>I don't have time to teach all of you personally.</strong>
              </p>
              
              <p>
                So I built this platform. Everything I teach in workshops, every framework I use to evaluate startups, every pattern I've seen in thousands of pitches—it's all here. Free. For you to use.
              </p>
              
              <p className="font-semibold">
                Stop guessing. Start speaking VC.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              {[
                { number: "10+", label: "Years in VC" },
                { number: "1000s", label: "Pitches Reviewed" },
                { number: "Dozens", label: "Invested" },
                { number: "Active", label: "Mentor" }
              ].map((stat, idx) => (
                <ModernCard key={idx} className="text-center p-4">
                  <div className="text-2xl font-bold text-primary mb-1">{stat.number}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </ModernCard>
              ))}
            </div>

            {/* LinkedIn Badge */}
            <div className="pt-2">
              <a 
                href="https://www.linkedin.com/in/kevinchavanne/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg backdrop-blur-sm hover:bg-primary/20 hover:border-primary/50 transition-all duration-300"
              >
                <Linkedin className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Connect with Kevin on LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};