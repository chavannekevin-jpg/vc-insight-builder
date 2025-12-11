import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PageLoadingSkeleton } from "@/components/LoadingSkeleton";

// Eagerly load the index page for fast initial load
import Index from "./pages/Index";

// Lazy load all other pages
const VCBrainHub = lazy(() => import("./pages/VCBrainHub"));
const VCBrainHome = lazy(() => import("./pages/vcbrain/VCBrainHome"));
const AngelStage = lazy(() => import("./pages/vcbrain/AngelStage"));
const PreSeedStage = lazy(() => import("./pages/vcbrain/PreSeedStage"));
const SeedStage = lazy(() => import("./pages/vcbrain/SeedStage"));
const ProblemSlide = lazy(() => import("./pages/vcbrain/ProblemSlide"));
const SolutionSlide = lazy(() => import("./pages/vcbrain/SolutionSlide"));
const ProductSlide = lazy(() => import("./pages/vcbrain/ProductSlide"));
const MarketSlide = lazy(() => import("./pages/vcbrain/MarketSlide"));
const TractionSlide = lazy(() => import("./pages/vcbrain/TractionSlide"));
const TeamSlide = lazy(() => import("./pages/vcbrain/TeamSlide"));
const WhatAngelsWant = lazy(() => import("./pages/vcbrain/WhatAngelsWant"));
const EarlyTraction = lazy(() => import("./pages/vcbrain/EarlyTraction"));
const FakeTAMs = lazy(() => import("./pages/vcbrain/FakeTAMs"));
const WhyStartupsDie = lazy(() => import("./pages/vcbrain/WhyStartupsDie"));
const StageComparison = lazy(() => import("./pages/vcbrain/StageComparison"));
const VCGlossary = lazy(() => import("./pages/vcbrain/VCGlossary"));
const RedFlagDatabase = lazy(() => import("./pages/vcbrain/RedFlagDatabase"));
const PitchChecklist = lazy(() => import("./pages/vcbrain/PitchChecklist"));
const CompetitionSlide = lazy(() => import("./pages/vcbrain/CompetitionSlide"));
const FinancialsSlide = lazy(() => import("./pages/vcbrain/FinancialsSlide"));
const VisionSlide = lazy(() => import("./pages/vcbrain/VisionSlide"));
const AskSlide = lazy(() => import("./pages/vcbrain/AskSlide"));
const GTMSlide = lazy(() => import("./pages/vcbrain/GTMSlide"));
const ExecutiveSummarySlide = lazy(() => import("./pages/vcbrain/ExecutiveSummarySlide"));
const BuildingDemos = lazy(() => import("./pages/vcbrain/BuildingDemos"));
const PitchingWithoutHype = lazy(() => import("./pages/vcbrain/PitchingWithoutHype"));
const FounderMarketFit = lazy(() => import("./pages/vcbrain/FounderMarketFit"));
const FundraisingTimeline = lazy(() => import("./pages/vcbrain/FundraisingTimeline"));
const FatalErrors = lazy(() => import("./pages/vcbrain/FatalErrors"));
const RedFlagsVCsSpot = lazy(() => import("./pages/vcbrain/RedFlagsVCsSpot"));
const DeckDisasters = lazy(() => import("./pages/vcbrain/DeckDisasters"));
const EmailPitchFails = lazy(() => import("./pages/vcbrain/EmailPitchFails"));
const InvestorScorecard = lazy(() => import("./pages/vcbrain/InvestorScorecard"));
const FundingInstruments = lazy(() => import("./pages/vcbrain/FundingInstruments"));
const KeyTermsExplained = lazy(() => import("./pages/vcbrain/KeyTermsExplained"));
const NegotiationTactics = lazy(() => import("./pages/vcbrain/NegotiationTactics"));
const LimitedPartners = lazy(() => import("./pages/vcbrain/LimitedPartners"));
const SPVAndSyndication = lazy(() => import("./pages/vcbrain/SPVAndSyndication"));
const VCFundraisingCycles = lazy(() => import("./pages/vcbrain/VCFundraisingCycles"));
const VCDealflow = lazy(() => import("./pages/vcbrain/VCDealflow"));
const VCSelectionProcess = lazy(() => import("./pages/vcbrain/VCSelectionProcess"));
const DataRoomGuide = lazy(() => import("./pages/vcbrain/DataRoomGuide"));
const VCStructure = lazy(() => import("./pages/vcbrain/VCStructure"));
const InvestmentCommittee = lazy(() => import("./pages/vcbrain/InvestmentCommittee"));

// Insider Takes
const PowerLaws = lazy(() => import("./pages/vcbrain/insider/PowerLaws"));
const ReturnProfile = lazy(() => import("./pages/vcbrain/insider/ReturnProfile"));
const GoodBusinessBadVC = lazy(() => import("./pages/vcbrain/insider/GoodBusinessBadVC"));
const ManagedPessimists = lazy(() => import("./pages/vcbrain/insider/ManagedPessimists"));
const Asymmetry = lazy(() => import("./pages/vcbrain/insider/Asymmetry"));
const LiquidityNotCustomer = lazy(() => import("./pages/vcbrain/insider/LiquidityNotCustomer"));
const AfterPitchRoom = lazy(() => import("./pages/vcbrain/insider/AfterPitchRoom"));
const ScoredNotInRoom = lazy(() => import("./pages/vcbrain/insider/ScoredNotInRoom"));
const OnePartnerKill = lazy(() => import("./pages/vcbrain/insider/OnePartnerKill"));
const WhyVCsGhost = lazy(() => import("./pages/vcbrain/insider/WhyVCsGhost"));
const FollowOnCapital = lazy(() => import("./pages/vcbrain/insider/FollowOnCapital"));
const OwnershipVsValuation = lazy(() => import("./pages/vcbrain/insider/OwnershipVsValuation"));

const Portal = lazy(() => import("./pages/Portal"));
const Auth = lazy(() => import("./pages/Auth"));
const About = lazy(() => import("./pages/About"));
const Product = lazy(() => import("./pages/Product"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CompanyProfile = lazy(() => import("./pages/CompanyProfile"));
const CompanyProfileEdit = lazy(() => import("./pages/CompanyProfileEdit"));
const RaiseEducation = lazy(() => import("./pages/RaiseEducation"));
const RaiseCalculator = lazy(() => import("./pages/RaiseCalculator"));
const ValuationCalculator = lazy(() => import("./pages/ValuationCalculator"));
const VentureScaleDiagnostic = lazy(() => import("./pages/VentureScaleDiagnostic"));
const InvestorEmailGenerator = lazy(() => import("./pages/InvestorEmailGenerator"));
const ToolsHub = lazy(() => import("./pages/ToolsHub"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminArticles = lazy(() => import("./pages/AdminArticles"));
const AdminCompanyDetail = lazy(() => import("./pages/AdminCompanyDetail"));
const AdminPrompts = lazy(() => import("./pages/AdminPrompts"));
const MemoBuilder = lazy(() => import("./pages/MemoBuilder"));
const Intake = lazy(() => import("./pages/Intake"));
const FreemiumHub = lazy(() => import("./pages/FreemiumHub"));
const EducationalContent = lazy(() => import("./pages/EducationalContent"));
const GeneratedMemo = lazy(() => import("./pages/GeneratedMemo"));
const MemoOverview = lazy(() => import("./pages/MemoOverview"));
const MemoSectionView = lazy(() => import("./pages/MemoSectionView"));
const MemoCompletionScreen = lazy(() => import("./pages/MemoCompletionScreen"));
const PreSeedGuide = lazy(() => import("./pages/PreSeedGuide"));
const ProblemSlideGuide = lazy(() => import("./pages/ProblemSlideGuide"));
const SolutionSlideGuide = lazy(() => import("./pages/SolutionSlideGuide"));
const AdminDiscountCodes = lazy(() => import("./pages/AdminDiscountCodes"));
const AdminUserAccess = lazy(() => import("./pages/AdminUserAccess"));
const AdminPricing = lazy(() => import("./pages/AdminPricing"));
const CheckoutMemo = lazy(() => import("./pages/CheckoutMemo"));
const SampleMemo = lazy(() => import("./pages/SampleMemo"));
const SampleMemoSectionView = lazy(() => import("./pages/SampleMemoSectionView"));
const SampleMemoCompletionScreen = lazy(() => import("./pages/SampleMemoCompletionScreen"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));
const RoastYourBaby = lazy(() => import("./pages/RoastYourBaby"));
const DilutionLab = lazy(() => import("./pages/DilutionLab"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Toaster />
        <Sonner />
        <Suspense fallback={<PageLoadingSkeleton />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/intake" element={<Intake />} />
            <Route path="/hub" element={<FreemiumHub />} />
            <Route path="/roast-your-baby" element={<RoastYourBaby />} />
            <Route path="/dilution-lab" element={<DilutionLab />} />
            <Route path="/hub/:slug" element={<EducationalContent />} />
            <Route path="/vcbrain" element={<VCBrainHub />}>
              <Route index element={<VCBrainHome />} />
              {/* Insider Takes */}
              <Route path="insider/power-laws" element={<PowerLaws />} />
              <Route path="insider/return-profile" element={<ReturnProfile />} />
              <Route path="insider/good-business-bad-vc" element={<GoodBusinessBadVC />} />
              <Route path="insider/managed-pessimists" element={<ManagedPessimists />} />
              <Route path="insider/asymmetry" element={<Asymmetry />} />
              <Route path="insider/liquidity-not-customer" element={<LiquidityNotCustomer />} />
              <Route path="insider/after-pitch-room" element={<AfterPitchRoom />} />
              <Route path="insider/scored-not-in-room" element={<ScoredNotInRoom />} />
              <Route path="insider/one-partner-kill" element={<OnePartnerKill />} />
              <Route path="insider/why-vcs-ghost" element={<WhyVCsGhost />} />
              <Route path="insider/follow-on-capital" element={<FollowOnCapital />} />
              <Route path="insider/ownership-vs-valuation" element={<OwnershipVsValuation />} />
              {/* How VCs Work */}
              <Route path="how-vcs-work/structure" element={<VCStructure />} />
              <Route path="how-vcs-work/dealflow" element={<VCDealflow />} />
              <Route path="how-vcs-work/selection-process" element={<VCSelectionProcess />} />
              <Route path="how-vcs-work/investment-committee" element={<InvestmentCommittee />} />
              <Route path="how-vcs-work/data-room" element={<DataRoomGuide />} />
              {/* VC Fund Dynamics */}
              <Route path="vc-mechanics/limited-partners" element={<LimitedPartners />} />
              <Route path="vc-mechanics/fundraising-cycles" element={<VCFundraisingCycles />} />
              {/* Stage Guides */}
              <Route path="stages/angel" element={<AngelStage />} />
              <Route path="stages/pre-seed" element={<PreSeedStage />} />
              <Route path="stages/seed" element={<SeedStage />} />
              <Route path="stages/comparison" element={<StageComparison />} />
              <Route path="stages/spv-syndication" element={<SPVAndSyndication />} />
              {/* Legacy routes */}
              <Route path="angel" element={<AngelStage />} />
              <Route path="pre-seed" element={<PreSeedStage />} />
              <Route path="seed" element={<SeedStage />} />
              <Route path="stage-comparison" element={<StageComparison />} />
              <Route path="vc-operations/limited-partners" element={<LimitedPartners />} />
              <Route path="vc-operations/spv-syndication" element={<SPVAndSyndication />} />
              <Route path="vc-operations/fundraising-cycles" element={<VCFundraisingCycles />} />
              {/* Pitch Deck Library */}
              <Route path="deck-building/executive-summary" element={<ExecutiveSummarySlide />} />
              <Route path="deck-building/problem" element={<ProblemSlide />} />
              <Route path="deck-building/solution" element={<SolutionSlide />} />
              <Route path="deck-building/product" element={<ProductSlide />} />
              <Route path="deck-building/market" element={<MarketSlide />} />
              <Route path="deck-building/competition" element={<CompetitionSlide />} />
              <Route path="deck-building/traction" element={<TractionSlide />} />
              <Route path="deck-building/financials" element={<FinancialsSlide />} />
              <Route path="deck-building/team" element={<TeamSlide />} />
              <Route path="deck-building/gtm" element={<GTMSlide />} />
              <Route path="deck-building/vision" element={<VisionSlide />} />
              <Route path="deck-building/ask" element={<AskSlide />} />
              {/* Legacy deck routes */}
              <Route path="deck/problem" element={<ProblemSlide />} />
              <Route path="deck/solution" element={<SolutionSlide />} />
              <Route path="deck/product" element={<ProductSlide />} />
              <Route path="deck/market" element={<MarketSlide />} />
              <Route path="deck/traction" element={<TractionSlide />} />
              <Route path="deck/team" element={<TeamSlide />} />
              <Route path="deck/competition" element={<CompetitionSlide />} />
              <Route path="deck/financials" element={<FinancialsSlide />} />
              <Route path="deck/vision" element={<VisionSlide />} />
              <Route path="deck/ask" element={<AskSlide />} />
              <Route path="deck/gtm" element={<GTMSlide />} />
              <Route path="deck/executive-summary" element={<ExecutiveSummarySlide />} />
              {/* Tactical Guides */}
              <Route path="guides/angels" element={<WhatAngelsWant />} />
              <Route path="guides/traction" element={<EarlyTraction />} />
              <Route path="guides/tam" element={<FakeTAMs />} />
              <Route path="guides/demos" element={<BuildingDemos />} />
              <Route path="guides/pitching" element={<PitchingWithoutHype />} />
              <Route path="guides/founder-fit" element={<FounderMarketFit />} />
              <Route path="guides/timeline" element={<FundraisingTimeline />} />
              <Route path="guides/death" element={<WhyStartupsDie />} />
              {/* Founder Mistakes */}
              <Route path="mistakes/fatal" element={<FatalErrors />} />
              <Route path="mistakes/red-flags" element={<RedFlagsVCsSpot />} />
              <Route path="mistakes/deck-disasters" element={<DeckDisasters />} />
              <Route path="mistakes/email-fails" element={<EmailPitchFails />} />
              {/* Tools & Resources */}
              <Route path="tools/glossary" element={<VCGlossary />} />
              <Route path="tools/red-flags" element={<RedFlagDatabase />} />
              <Route path="tools/checklist" element={<PitchChecklist />} />
              <Route path="tools/scorecard" element={<InvestorScorecard />} />
              {/* Term Sheets & Deals */}
              <Route path="deals/instruments" element={<FundingInstruments />} />
              <Route path="deals/terms" element={<KeyTermsExplained />} />
              <Route path="deals/negotiation" element={<NegotiationTactics />} />
            </Route>
            <Route path="/pre-seed-guide" element={<PreSeedGuide />} />
            <Route path="/problem-slide-guide" element={<ProblemSlideGuide />} />
            <Route path="/solution-slide-guide" element={<SolutionSlideGuide />} />
            <Route path="/memo" element={<GeneratedMemo />} />
            <Route path="/memo/overview" element={<MemoOverview />} />
            <Route path="/memo/section" element={<MemoSectionView />} />
            <Route path="/memo/complete" element={<MemoCompletionScreen />} />
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
            <Route path="/sample-memo/section" element={<SampleMemoSectionView />} />
            <Route path="/sample-memo/complete" element={<SampleMemoCompletionScreen />} />
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
