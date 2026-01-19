import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Map, Users, Share2, TrendingUp, Network, Globe } from "lucide-react";
import { Header } from "@/components/Header";

const InvestorLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Network className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">For Capital Allocators & Ecosystem Builders</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Map Your <span className="text-primary">Investment Network</span>
            <br />Like Never Before
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Visualize your global investor network on an interactive map. Track relationships, 
            discover co-investment opportunities, and leverage a crowd-built ecosystem intelligence layer.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/investor/auth")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
            >
              Join the Network
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/investor/auth?mode=signin")}
              className="px-8 py-6 text-lg"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Your Network, Visualized
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            More than a CRM—an interactive ecosystem intelligence layer built by investors, for investors.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Map className="w-8 h-8" />}
              title="Interactive World Map"
              description="Visualize your investor network geographically. Zoom from global view to city level, with dots scaled by contact density."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Shared Investor Graph"
              description="Contribute to and benefit from a crowd-built database of investors and funds. Connections compound instead of fragmenting."
            />
            <FeatureCard
              icon={<Share2 className="w-8 h-8" />}
              title="Dealflow Sharing"
              description="Tag relevant contacts for investment opportunities and selectively share dealflow with your network."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Co-Investment Discovery"
              description="Find potential co-investors based on stage, sector, and geographic overlap. Build stronger syndicates."
            />
            <FeatureCard
              icon={<Network className="w-8 h-8" />}
              title="CRM-Style Management"
              description="Full contact book behind the map—search, filter, and manage relationships with private notes and overrides."
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8" />}
              title="City-Level Insights"
              description="Search for any city to instantly see your contacts there. Perfect for planning trips or finding local partners."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Map Your Network?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join the growing community of VCs, angels, and ecosystem builders using 
            the platform to navigate the global investment landscape.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/investor/auth")}
            className="bg-primary hover:bg-primary/90"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} VC Insight Builder. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => (
  <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors">
    <div className="text-primary mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

export default InvestorLanding;
