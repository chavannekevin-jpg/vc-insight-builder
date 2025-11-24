import { HeroSection } from "@/components/sections/HeroSection";
import { ProblemSolutionSection } from "@/components/sections/ProblemSolutionSection";
import { WhyYouNeedThisSection } from "@/components/sections/WhyYouNeedThisSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { WhyTrustMeSection } from "@/components/sections/WhyTrustMeSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <ProblemSolutionSection />
      <WhyYouNeedThisSection />
      <HowItWorksSection />
      <WhyTrustMeSection />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
