import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/Header";
import { Linkedin, ArrowRight, Target, TrendingUp, Users2, Briefcase, MessageSquare } from "lucide-react";
import kevinPhoto from "@/assets/profile-photo.jpg";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      
      {/* Hero Section */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            {/* Profile Photo */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-2xl animate-pulse" />
                <img 
                  src={kevinPhoto} 
                  alt="Kevin Chavanne" 
                  className="relative w-48 h-48 md:w-56 md:h-56 rounded-full object-cover border-4 border-primary/20 shadow-2xl hover-scale"
                />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-serif mb-6">
              Hi, I'm <span className="text-primary">Kevin Chavanne</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Nordic VC at Tenity • 10 Years in Early-Stage Investing
            </p>
          </div>

          {/* Main Content Card */}
          <ModernCard className="shadow-xl mb-8">
            <div className="space-y-8 text-base leading-relaxed">
              {/* Personal Story */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-3xl font-serif text-foreground">Why I Built This</h2>
                  
                  <p className="text-lg">
                    I'm tired of watching founders fail.
                  </p>

                  <p>
                    After <strong>10 years in VC</strong>, reviewing thousands of pitches and writing hundreds of investment analyses, 
                    I keep seeing the same pattern: talented founders with real traction getting rejected because they don't speak our language.
                  </p>

                  <p className="text-muted-foreground italic pl-4 border-l-2 border-primary">
                    They're asking me the same questions. Making the same mistakes. Getting ghosted for the same reasons.
                  </p>

                  <p>
                    So I built this platform. Not as another course or generic template, but as a way to give you <strong>direct access 
                    to the frameworks I use every single day</strong> to evaluate startups and write investment analyses.
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
                  {[
                    { icon: Briefcase, value: "10+", label: "Years in VC" },
                    { icon: TrendingUp, value: "1000+", label: "Pitches Reviewed" },
                    { icon: Target, value: "50+", label: "Investments Made" },
                    { icon: Users2, value: "100+", label: "Analyses Written" }
                  ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <div key={idx} className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 border border-border/50">
                        <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* What You Get */}
              <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                <h2 className="text-2xl font-serif text-foreground">What You Get</h2>
                <p>
                  This isn't theory from someone who's never written a check. This is the <strong>exact evaluation framework</strong> I use 
                  when I'm sitting across the table from you, deciding whether to invest or pass.
                </p>
                <p className="text-sm text-muted-foreground">
                  The same questions. The same structure. The same clarity that turns a "maybe" into a "yes."
                </p>
              </div>

              {/* My Background */}
              <div className="space-y-4">
                <h2 className="text-3xl font-serif text-foreground">My Background</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Nordic VC at Tenity</p>
                      <p className="text-sm text-muted-foreground">Leading early-stage investments across Europe</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Pre-Seed & Seed Specialist</p>
                      <p className="text-sm text-muted-foreground">Focusing on B2B SaaS, Fintech, and Deep Tech</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Active Mentor & Advisor</p>
                      <p className="text-sm text-muted-foreground">Helping founders navigate the fundraising journey</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModernCard>

          {/* LinkedIn CTA Card */}
          <div className="max-w-md mx-auto mb-8">
            <ModernCard className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-glow transition-all duration-300">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Linkedin className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-serif mb-2">Connect on LinkedIn</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Follow my insights on fundraising, VC trends, and startup growth
                  </p>
                </div>
                <Button 
                  className="w-full gradient-primary shadow-glow"
                  size="lg"
                  onClick={() => window.open('https://www.linkedin.com/in/kevin-chavanne-1b8a368a/', '_blank')}
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  Follow Me
                </Button>
              </div>
            </ModernCard>
          </div>

          {/* Bottom CTA */}
          <div className="text-center p-8 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20">
            <p className="text-lg mb-4">
              Ready to see your startup through a VC's eyes?
            </p>
            <Button 
              size="lg"
              className="gradient-primary shadow-glow hover:shadow-glow-strong"
              onClick={() => navigate('/')}
            >
              Get Started Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
