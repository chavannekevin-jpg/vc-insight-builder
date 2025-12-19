export interface MemoParagraph {
  text: string;
  emphasis?: "high" | "medium" | "normal" | "hero" | "narrative" | "quote";
}

export interface MemoHighlight {
  metric: string;
  label: string;
}

// Enhanced VC Question with economics perspective
export interface MemoVCQuestion {
  question: string;
  vcRationale: string;
  whatToPrepare: string;
}

export interface MemoVCReflection {
  analysis: string;
  questions: (string | MemoVCQuestion)[];
  benchmarking?: string;
  conclusion: string;
}

// VC Quick Take - visible in free preview
export interface MemoVCQuickTake {
  verdict: string;
  concerns: string[];
  strengths: string[];
  readinessLevel: "LOW" | "MEDIUM" | "HIGH";
  readinessRationale: string;
  // New diagnostic fields for conversion-optimized teaser
  frameworkScore?: number; // 0-100 score from IC evaluation
  criteriaCleared?: number; // out of 8 criteria
  icStoppingPoint?: string; // which section ended the discussion
  rulingStatement?: string; // e.g., "Not ready for partner discussion"
  killerQuestion?: string; // the single question that derailed the pitch
}

// ============================================
// CONDITIONAL ASSESSMENT SYSTEM (Week 4)
// ============================================

export type ConfidenceLevel = "high" | "medium" | "low" | "insufficient_data";

export interface ConditionalAssessment {
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0-100
  dataCompleteness: number; // 0-100 percentage of required data available
  whatWouldChangeThisAssessment: string[];
  assumptions: string[];
  caveats?: string[];
}

export interface ConditionalValue<T> {
  value: T;
  assessment: ConditionalAssessment;
}

// ============================================
// SECTION SCORING SYSTEM
// ============================================

export interface SectionScore {
  score: number; // 0-100
  label: "Critical" | "Weak" | "Developing" | "Strong" | "Excellent";
  vcBenchmark: number;
  percentile: string;
  whatThisTellsVC: string;
  fundabilityImpact: string;
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

// ============================================
// VC INVESTMENT LOGIC
// ============================================

export interface VCInvestmentLogic {
  decision: "PASS" | "CAUTIOUS" | "INTERESTED" | "EXCITED";
  reasoning: string;
  keyCondition: string;
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

// ============================================
// 90-DAY ACTION PLAN
// ============================================

export interface SectionActionItem {
  action: string;
  timeline: "Week 1-2" | "Week 3-4" | "Month 2" | "Month 3";
  metric: string;
  priority: "critical" | "important" | "nice-to-have";
}

export interface Section90DayPlan {
  actions: SectionActionItem[];
}

// ============================================
// LEAD INVESTOR REQUIREMENTS
// ============================================

export interface LeadInvestorRequirements {
  requirements: string[];
  dealbreakers: string[];
  wouldWantToSee: string[];
  investorParagraph: string;
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

// ============================================
// BENCHMARKS
// ============================================

export interface SectionBenchmark {
  metric: string;
  yourValue: string | number;
  seedBenchmark: string;
  seriesABenchmark: string;
  percentile: string;
  insight: string;
  // Week 4: Conditional assessment for each benchmark
  assessment?: ConditionalAssessment;
}

// ============================================
// MICRO CASE STUDIES
// ============================================

export interface MicroCaseStudy {
  company: string;
  problem: string;
  fix: string;
  outcome: string;
  timeframe: string;
  sector: string;
}

// ============================================
// EDITABLE TOOL BASE
// ============================================

export interface EditableTool<T> {
  aiGenerated: T;
  userOverrides?: Partial<T>;
  lastUpdated?: string;
  dataSource: "ai-complete" | "ai-partial" | "user-input";
  inputGuidance?: string[];
  // Week 4: Overall tool assessment
  assessment?: ConditionalAssessment;
}

// ============================================
// PROBLEM SECTION TOOLS
// ============================================

export interface EvidenceThreshold {
  verifiedPain: string[];
  unverifiedPain: string[];
  evidenceGrade: "A" | "B" | "C" | "D" | "F";
  missingEvidence: string[];
  whatVCsConsiderVerified: string[];
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

export interface FounderBlindSpot {
  potentialExaggerations: string[];
  misdiagnoses: string[];
  assumptions: string[];
  commonMistakes: string[];
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

// ============================================
// SOLUTION SECTION TOOLS
// ============================================

export interface TechnicalDefensibility {
  defensibilityScore: number;
  proofPoints: string[];
  expectedProofs: string[];
  gaps: string[];
  vcEvaluation: string;
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

export interface FeatureCommoditization {
  feature: string;
  commoditizationRisk: "Low" | "Medium" | "High";
  timeToClone: string;
  defensibility: string;
}

export interface CommoditizationTeardown {
  features: FeatureCommoditization[];
  overallRisk: "Low" | "Medium" | "High";
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

export interface CompetitorBuildAnalysis {
  couldBeBuilt: boolean;
  estimatedTime: string;
  requiredResources: string;
  barriers: string[];
  verdict: string;
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

// ============================================
// MARKET SECTION TOOLS
// ============================================

export interface TAMSegment {
  segment: string;
  count: number;
  acv: number;
  tam: number;
}

export interface BottomsUpTAM {
  targetSegments: TAMSegment[];
  totalTAM: number;
  sam: number;
  som: number;
  methodology: string;
  assumptions: string[];
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

export interface MarketReadinessIndex {
  regulatoryPressure: { score: number; evidence: string };
  urgency: { score: number; evidence: string };
  willingnessToPay: { score: number; evidence: string };
  switchingFriction: { score: number; evidence: string };
  overallScore: number;
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

export interface VCMarketNarrative {
  pitchToIC: string;
  marketTiming: string;
  whyNow: string;
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

// ============================================
// COMPETITION SECTION TOOLS
// ============================================

export interface CompetitorMove {
  name: string;
  currentPosition: string;
  likely12MonthMoves: string[];
  threat24Months: "Low" | "Medium" | "High";
}

export interface CompetitorChessboard {
  competitors: CompetitorMove[];
  marketDynamics: string;
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

export interface ReverseDiligence {
  weaknesses: string[];
  howCompetitorWouldExploit: string[];
  defenseStrategy: string[];
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

export interface MoatDurability {
  currentMoatStrength: number;
  erosionFactors: string[];
  estimatedDuration: string;
  reinforcementOpportunities: string[];
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

// ============================================
// TEAM SECTION TOOLS
// ============================================

export interface SkillGap {
  skill: string;
  severity: "Critical" | "Important" | "Minor";
  mitigation: string;
}

export interface CredibilityGapAnalysis {
  expectedSkills: string[];
  currentSkills: string[];
  gaps: SkillGap[];
  overallCredibility: number;
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

export interface SuccessfulFounderProfile {
  company: string;
  founderBackground: string;
  relevantTo: string;
}

export interface FounderMapping {
  successfulFounderProfiles: SuccessfulFounderProfile[];
  matchScore: number;
  gaps: string[];
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

// ============================================
// BUSINESS MODEL SECTION TOOLS
// ============================================

export interface StressScenario {
  scenario: string;
  impact: string;
  survivalProbability: number;
  mitigations: string[];
}

export interface ModelStressTest {
  scenarios: StressScenario[];
  overallResilience: "Low" | "Medium" | "High";
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

export interface CashEfficiencyBenchmark {
  burnMultiple: number;
  industryAverage: number;
  percentile: string;
  efficiency: "Excellent" | "Good" | "Average" | "Poor";
  recommendation: string;
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

export interface ProfitabilityPath {
  currentGrossMargin: number;
  targetGrossMargin: number;
  timeToTarget: string;
  keyLevers: string[];
  milestones: string[];
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

// ============================================
// TRACTION SECTION TOOLS
// ============================================

export interface TractionDepthTest {
  tractionType: "Founder-led" | "Discount-driven" | "Repeatable" | "Viral";
  sustainabilityScore: number;
  redFlags: string[];
  positiveSignals: string[];
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

export interface ChurnScenario {
  churnRate: number;
  impact: string;
}

export interface CohortStabilityProjection {
  currentRetention: number;
  industryBenchmark: number;
  projectedLTVImpact: string;
  churnScenarios: ChurnScenario[];
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

export interface PipelineOpportunity {
  stage: string;
  count: number;
  avgValue: number;
  conversionRate: number;
  quality: "Strong" | "Medium" | "Weak";
}

export interface PipelineQuality {
  opportunities: PipelineOpportunity[];
  overallQuality: "Strong" | "Medium" | "Weak";
  redFlags: string[];
  positiveSignals: string[];
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

// ============================================
// VISION SECTION TOOLS
// ============================================

export interface VCMilestone {
  month: number;
  milestone: string;
  metric: string;
  targetValue: string;
  currentValue?: string;
}

export interface VCMilestoneMap {
  milestones: VCMilestone[];
  criticalPath: string[];
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

export interface ScenarioCase {
  description: string;
  fundraisingImplication: string;
  probability: number;
}

export interface ScenarioPlanning {
  bestCase: ScenarioCase;
  baseCase: ScenarioCase;
  downside: ScenarioCase;
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

export interface ComparableExit {
  company: string;
  acquirer: string;
  value: string;
  multiple: string;
}

export interface ExitNarrative {
  potentialAcquirers: string[];
  strategicValue: string;
  comparableExits: ComparableExit[];
  pathToExit: string;
  // Week 4: Conditional assessment
  assessment?: ConditionalAssessment;
}

// ============================================
// ENHANCED SECTION STRUCTURE
// ============================================

export interface EnhancedSectionTools {
  sectionScore?: SectionScore;
  benchmarks?: SectionBenchmark[];
  caseStudy?: MicroCaseStudy;
  vcInvestmentLogic?: VCInvestmentLogic;
  actionPlan90Day?: Section90DayPlan;
  leadInvestorRequirements?: LeadInvestorRequirements;
  
  // Problem section specific
  evidenceThreshold?: EditableTool<EvidenceThreshold>;
  founderBlindSpot?: EditableTool<FounderBlindSpot>;
  
  // Solution section specific
  technicalDefensibility?: EditableTool<TechnicalDefensibility>;
  commoditizationTeardown?: EditableTool<CommoditizationTeardown>;
  competitorBuildAnalysis?: EditableTool<CompetitorBuildAnalysis>;
  
  // Market section specific
  bottomsUpTAM?: EditableTool<BottomsUpTAM>;
  marketReadinessIndex?: EditableTool<MarketReadinessIndex>;
  vcMarketNarrative?: EditableTool<VCMarketNarrative>;
  
  // Competition section specific
  competitorChessboard?: EditableTool<CompetitorChessboard>;
  reverseDiligence?: EditableTool<ReverseDiligence>;
  moatDurability?: EditableTool<MoatDurability>;
  
  // Team section specific
  credibilityGapAnalysis?: EditableTool<CredibilityGapAnalysis>;
  founderMapping?: EditableTool<FounderMapping>;
  
  // Business Model section specific
  modelStressTest?: EditableTool<ModelStressTest>;
  cashEfficiencyBenchmark?: EditableTool<CashEfficiencyBenchmark>;
  profitabilityPath?: EditableTool<ProfitabilityPath>;
  
  // Traction section specific
  tractionDepthTest?: EditableTool<TractionDepthTest>;
  cohortStabilityProjection?: EditableTool<CohortStabilityProjection>;
  pipelineQuality?: EditableTool<PipelineQuality>;
  
  // Vision section specific
  vcMilestoneMap?: EditableTool<VCMilestoneMap>;
  scenarioPlanning?: EditableTool<ScenarioPlanning>;
  exitNarrative?: EditableTool<ExitNarrative>;
}

export interface MemoStructuredSection {
  title: string;
  narrative?: {
    paragraphs?: MemoParagraph[];
    highlights?: MemoHighlight[];
    keyPoints?: string[];
  };
  // Legacy support - direct properties
  paragraphs?: MemoParagraph[];
  highlights?: MemoHighlight[];
  keyPoints?: string[];
  // VC reflection
  vcReflection?: MemoVCReflection;
  // Enhanced tools
  tools?: EnhancedSectionTools;
  // Week 4: Section-level assessment
  sectionAssessment?: ConditionalAssessment;
}

export interface MemoStructuredContent {
  sections: MemoStructuredSection[];
  vcQuickTake?: MemoVCQuickTake;
  generatedAt?: string;
  // Week 4: Overall memo assessment
  overallAssessment?: ConditionalAssessment;
}

// ============================================
// RESOURCE TEMPLATES
// ============================================

export interface ResourceTemplate {
  id: string;
  title: string;
  description: string;
  type: "email" | "checklist" | "template" | "matrix";
  content: string;
  relatedSections: string[];
}
