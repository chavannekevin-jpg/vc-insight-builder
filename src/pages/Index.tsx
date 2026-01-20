import { HeroSection } from "@/components/sections/HeroSection";
import { InvestorNetworkBanner } from "@/components/sections/InvestorNetworkBanner";
import { WhatsIncludedSection } from "@/components/sections/WhatsIncludedSection";
import { ProblemSolutionSection } from "@/components/sections/ProblemSolutionSection";
import { WhyYouNeedThisSection } from "@/components/sections/WhyYouNeedThisSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { WhyTrustMeSection } from "@/components/sections/WhyTrustMeSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <InvestorNetworkBanner />
      <WhatsIncludedSection />
      <WhyTrustMeSection />
      <TestimonialsSection />
      <WhyYouNeedThisSection />
      <HowItWorksSection />
      <ProblemSolutionSection />
      <Footer />
    </div>
  );
};

export default Index;
