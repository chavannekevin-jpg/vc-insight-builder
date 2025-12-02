import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VCBrainHub from "./pages/VCBrainHub";
import VCBrainHome from "./pages/vcbrain/VCBrainHome";
import AngelStage from "./pages/vcbrain/AngelStage";
import PreSeedStage from "./pages/vcbrain/PreSeedStage";
import SeedStage from "./pages/vcbrain/SeedStage";
import ProblemSlide from "./pages/vcbrain/ProblemSlide";
import SolutionSlide from "./pages/vcbrain/SolutionSlide";
import ProductSlide from "./pages/vcbrain/ProductSlide";
import MarketSlide from "./pages/vcbrain/MarketSlide";
import TractionSlide from "./pages/vcbrain/TractionSlide";
import TeamSlide from "./pages/vcbrain/TeamSlide";
import WhatAngelsWant from "./pages/vcbrain/WhatAngelsWant";
import EarlyTraction from "./pages/vcbrain/EarlyTraction";
import FakeTAMs from "./pages/vcbrain/FakeTAMs";
import WhyStartupsDie from "./pages/vcbrain/WhyStartupsDie";
import StageComparison from "./pages/vcbrain/StageComparison";
import VCGlossary from "./pages/vcbrain/VCGlossary";
import RedFlagDatabase from "./pages/vcbrain/RedFlagDatabase";
import PitchChecklist from "./pages/vcbrain/PitchChecklist";
import CompetitionSlide from "./pages/vcbrain/CompetitionSlide";
import FinancialsSlide from "./pages/vcbrain/FinancialsSlide";
import VisionSlide from "./pages/vcbrain/VisionSlide";
import AskSlide from "./pages/vcbrain/AskSlide";
import GTMSlide from "./pages/vcbrain/GTMSlide";
import ExecutiveSummarySlide from "./pages/vcbrain/ExecutiveSummarySlide";
import BuildingDemos from "./pages/vcbrain/BuildingDemos";
import PitchingWithoutHype from "./pages/vcbrain/PitchingWithoutHype";
import FounderMarketFit from "./pages/vcbrain/FounderMarketFit";
import FundraisingTimeline from "./pages/vcbrain/FundraisingTimeline";
import FatalErrors from "./pages/vcbrain/FatalErrors";
import RedFlagsVCsSpot from "./pages/vcbrain/RedFlagsVCsSpot";
import DeckDisasters from "./pages/vcbrain/DeckDisasters";
import EmailPitchFails from "./pages/vcbrain/EmailPitchFails";
import InvestorScorecard from "./pages/vcbrain/InvestorScorecard";
import FundingInstruments from "./pages/vcbrain/FundingInstruments";
import KeyTermsExplained from "./pages/vcbrain/KeyTermsExplained";
import NegotiationTactics from "./pages/vcbrain/NegotiationTactics";
import Portal from "./pages/Portal";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Product from "./pages/Product";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import CompanyProfile from "./pages/CompanyProfile";
import CompanyProfileEdit from "./pages/CompanyProfileEdit";
import RaiseEducation from "./pages/RaiseEducation";
import RaiseCalculator from "./pages/RaiseCalculator";
import ValuationCalculator from "./pages/ValuationCalculator";
import VentureScaleDiagnostic from "./pages/VentureScaleDiagnostic";
import InvestorEmailGenerator from "./pages/InvestorEmailGenerator";
import ToolsHub from "./pages/ToolsHub";
import Admin from "./pages/Admin";
import AdminArticles from "./pages/AdminArticles";
import AdminCompanyDetail from "./pages/AdminCompanyDetail";
import AdminPrompts from "./pages/AdminPrompts";
import MemoBuilder from "./pages/MemoBuilder";
import Intake from "./pages/Intake";
import FreemiumHub from "./pages/FreemiumHub";
import EducationalContent from "./pages/EducationalContent";
import GeneratedMemo from "./pages/GeneratedMemo";
import PreSeedGuide from "./pages/PreSeedGuide";
import ProblemSlideGuide from "./pages/ProblemSlideGuide";
import SolutionSlideGuide from "./pages/SolutionSlideGuide";
import AdminDiscountCodes from "./pages/AdminDiscountCodes";
import AdminUserAccess from "./pages/AdminUserAccess";
import AdminPricing from "./pages/AdminPricing";
import CheckoutMemo from "./pages/CheckoutMemo";
import SampleMemo from "./pages/SampleMemo";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/intake" element={<Intake />} />
          <Route path="/hub" element={<FreemiumHub />} />
          <Route path="/hub/:slug" element={<EducationalContent />} />
          <Route path="/vcbrain" element={<VCBrainHub />}>
            <Route index element={<VCBrainHome />} />
            <Route path="angel" element={<AngelStage />} />
            <Route path="pre-seed" element={<PreSeedStage />} />
            <Route path="seed" element={<SeedStage />} />
            <Route path="deck/problem" element={<ProblemSlide />} />
            <Route path="deck/solution" element={<SolutionSlide />} />
            <Route path="deck/product" element={<ProductSlide />} />
            <Route path="deck/market" element={<MarketSlide />} />
            <Route path="deck/traction" element={<TractionSlide />} />
            <Route path="deck/team" element={<TeamSlide />} />
            <Route path="guides/angels" element={<WhatAngelsWant />} />
            <Route path="guides/traction" element={<EarlyTraction />} />
            <Route path="guides/tam" element={<FakeTAMs />} />
            <Route path="guides/death" element={<WhyStartupsDie />} />
            <Route path="stage-comparison" element={<StageComparison />} />
            <Route path="deck/competition" element={<CompetitionSlide />} />
            <Route path="deck/financials" element={<FinancialsSlide />} />
            <Route path="deck/vision" element={<VisionSlide />} />
            <Route path="deck/ask" element={<AskSlide />} />
            <Route path="deck/gtm" element={<GTMSlide />} />
            <Route path="deck/executive-summary" element={<ExecutiveSummarySlide />} />
            <Route path="guides/demos" element={<BuildingDemos />} />
            <Route path="guides/pitching" element={<PitchingWithoutHype />} />
            <Route path="guides/founder-fit" element={<FounderMarketFit />} />
            <Route path="guides/timeline" element={<FundraisingTimeline />} />
            <Route path="mistakes/fatal" element={<FatalErrors />} />
            <Route path="mistakes/red-flags" element={<RedFlagsVCsSpot />} />
            <Route path="mistakes/deck-disasters" element={<DeckDisasters />} />
            <Route path="mistakes/email-fails" element={<EmailPitchFails />} />
            <Route path="tools/glossary" element={<VCGlossary />} />
            <Route path="tools/red-flags" element={<RedFlagDatabase />} />
            <Route path="tools/checklist" element={<PitchChecklist />} />
            <Route path="tools/scorecard" element={<InvestorScorecard />} />
            <Route path="deals/instruments" element={<FundingInstruments />} />
            <Route path="deals/terms" element={<KeyTermsExplained />} />
            <Route path="deals/negotiation" element={<NegotiationTactics />} />
          </Route>
          <Route path="/pre-seed-guide" element={<PreSeedGuide />} />
          <Route path="/problem-slide-guide" element={<ProblemSlideGuide />} />
          <Route path="/solution-slide-guide" element={<SolutionSlideGuide />} />
          <Route path="/memo" element={<GeneratedMemo />} />
          <Route path="/company" element={<CompanyProfile />} />
          <Route path="/company-profile" element={<CompanyProfile />} />
          <Route path="/company/profile/edit" element={<CompanyProfileEdit />} />
          <Route path="/tools" element={<ToolsHub />} />
          <Route path="/raise-education" element={<RaiseEducation />} />
          <Route path="/raise-calculator" element={<RaiseCalculator />} />
          <Route path="/valuation-calculator" element={<ValuationCalculator />} />
          <Route path="/venture-scale-diagnostic" element={<VentureScaleDiagnostic />} />
          <Route path="/investor-email-generator" element={<InvestorEmailGenerator />} />
          <Route path="/about" element={<About />} />
          <Route path="/product" element={<Product />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/sample-memo" element={<SampleMemo />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/articles" element={<AdminArticles />} />
          <Route path="/admin/prompts" element={<AdminPrompts />} />
          <Route path="/admin/memo-builder" element={<MemoBuilder />} />
          <Route path="/admin/user-access" element={<AdminUserAccess />} />
          <Route path="/admin/discount-codes" element={<AdminDiscountCodes />} />
          <Route path="/admin/pricing" element={<AdminPricing />} />
          <Route path="/admin/company/:companyId" element={<AdminCompanyDetail />} />
          <Route path="/checkout-memo" element={<CheckoutMemo />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
