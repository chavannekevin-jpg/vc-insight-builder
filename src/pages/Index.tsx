import { HeroSection } from "@/components/sections/HeroSection";
import { ProblemSolutionSection } from "@/components/sections/ProblemSolutionSection";
import { WhyYouNeedThisSection } from "@/components/sections/WhyYouNeedThisSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { WhyTrustMeSection } from "@/components/sections/WhyTrustMeSection";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/Header";
import { WaitlistBanner } from "@/components/WaitlistBanner";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <WaitlistBanner />
      <HeroSection />
      <ProblemSolutionSection />
      <WhyYouNeedThisSection />
      <HowItWorksSection />
      <WhyTrustMeSection />
      <Footer />
    </div>
  );
};

export default Index;
