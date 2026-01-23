// Full-fidelity SignalFlow memo data matching paid analysis structure
// This provides the complete narrative structure with multiple paragraphs,
// emphasis levels, highlights with metrics, and structured VC questions

import type { MemoVCQuickTake, MemoVCQuestion } from "@/types/memo";
import type { ActionPlanData } from "@/lib/actionPlanExtractor";

export interface FullFidelityMemoSection {
  title: string;
  paragraphs: Array<{ text: string; emphasis: "high" | "normal" }>;
  highlights?: Array<{ label: string; metric: string }>;
  keyPoints: string[];
  vcReflection: {
    analysis: string;
    questions: MemoVCQuestion[];
    benchmarking: string;
    conclusion: string;
  };
}

export interface FullFidelityMemoData {
  vcQuickTake: MemoVCQuickTake;
  heroStatement: string;
  aiActionPlan?: ActionPlanData;
  sections: FullFidelityMemoSection[];
}

export const SIGNALFLOW_FULL_MEMO: FullFidelityMemoData = {
  vcQuickTake: {
    verdict: "SignalFlow demonstrates strong fundamentals with exceptional founder-market fit and validated product-market fit signals. The €32K MRR with 15% MoM growth and 4.9x LTV:CAC shows efficient economics. Competition from Gong is the primary concern, but the 'prediction vs. recording' positioning creates differentiation runway.",
    readinessLevel: "MEDIUM",
    readinessRationale: "Strong team and healthy unit economics, but needs to strengthen competitive moat and scale beyond founder-led sales before Series A readiness.",
    concerns: [
      "Gong's announced mid-market expansion with 'Essentials' tier",
      "Early traction base (28 customers) limits pattern confidence",
      "Founder-led sales motion may not scale predictably"
    ],
    strengths: [
      "Exceptional founder-market fit (Salesforce + Datadog pedigree)",
      "Strong unit economics (4.9x LTV:CAC, 7-month payback)",
      "Clear differentiation on prediction vs. recording",
      "High NPS (74) indicates organic growth potential"
    ],
    frameworkScore: 70,
    criteriaCleared: 6,
    rulingStatement: "Conditional pass — fundable with right investor who understands competitive dynamics"
  },

  heroStatement: "SignalFlow is building the AI intelligence layer for mid-market sales teams — predicting which deals will close and why, not just recording what happened.",

  aiActionPlan: {
    items: [
      {
        id: "action-1",
        priority: 1,
        category: "competition",
        problem: "Gong announced 'Essentials' tier targeting mid-market at $99/seat — direct competitive threat",
        impact: "Gong has $7B+ valuation, $200M+ ARR, and deep enterprise relationships. Their mid-market push could pressure pricing and positioning. VCs will ask: 'What happens when Gong comes down-market?'",
        howToFix: "Double down on the 'prediction' vs. 'recording' differentiation. Build competitive win documentation — every deal you win against Gong should be documented with specific reasons. Create a moat through data network effects and integration depth.",
        badExample: "Gong is focused on enterprise, they won't come after us.",
        goodExample: "We've won 8 competitive deals against Gong in the last quarter. Key differentiator: customers chose us for outcome prediction, not call recording. Our 89% accuracy on deal outcomes is the moat — Gong would need 18+ months to build comparable models."
      },
      {
        id: "action-2",
        priority: 2,
        category: "traction",
        problem: "€32K MRR with 28 customers is promising but founder-led — need to prove scalable GTM",
        impact: "VCs see founder-led sales as market validation, not product-market fit. Without evidence that non-founders can close deals, you're asking investors to bet on founders' hustle, not a repeatable business. This caps valuation and makes Series A conditional.",
        howToFix: "Hire 2 AEs in next 90 days. Document the sales playbook explicitly. Target: 3+ deals closed by non-founders within 6 months. Build pipeline visibility so you can show sales velocity, not just closed deals.",
        badExample: "Our founders are great at closing — we just need more of them.",
        goodExample: "Our first AE closed 2 deals in Month 2 using our documented playbook — 40% faster than founder average. We now have proof the motion transfers."
      },
      {
        id: "action-3",
        priority: 3,
        category: "team",
        problem: "Missing VP Marketing / demand generation leadership",
        impact: "Current growth is organic and founder-networked. Without systematic demand generation, scaling will hit a ceiling. VCs will ask: 'How do you get from €32K to €150K MRR without a marketing engine?'",
        howToFix: "Hire VP Marketing with B2B SaaS demand gen track record within 60 days. Priority: someone who has built lead generation at €10-50M ARR stage. Consider fractional initially if full-time hiring is slow.",
        badExample: "We'll figure out marketing once we have more revenue.",
        goodExample: "We're in final rounds with a VP Marketing candidate from Outreach. She built their mid-market lead gen engine from €20M to €80M ARR. Expected start date: Week 6."
      },
      {
        id: "action-4",
        priority: 4,
        category: "competition",
        problem: "No patents filed on core prediction algorithms — IP moat is informal",
        impact: "Without formal IP protection, your technical advantage is just execution speed. Well-funded competitors can hire ML talent and replicate. VCs investing in AI companies want to see IP strategy.",
        howToFix: "File provisional patent on the 'why' prediction methodology within 30 days. Document the trade secrets around your training data curation. Build the narrative: 'Our 2M+ deal outcomes dataset would take competitors 18+ months to replicate.'",
        badExample: "Our algorithms are proprietary — we don't need patents.",
        goodExample: "We filed a provisional patent on our outcome prediction methodology last month. Our 2M deal dataset is growing at 100K outcomes/quarter — this data moat compounds and is our real defensibility."
      },
      {
        id: "action-5",
        priority: 5,
        category: "narrative",
        problem: "Need stronger proof that 'prediction' is meaningfully different from 'conversation intelligence'",
        impact: "Investors hear 'AI sales tool' and think 'Gong competitor.' Your differentiation is subtle — predicting outcomes vs. analyzing calls. Without clear articulation, you blend into a crowded category.",
        howToFix: "Create side-by-side comparison content: 'What Gong tells you vs. what SignalFlow tells you.' Get 5 customers to testimonial specifically on the prediction value. Build the 'outcome intelligence' category narrative.",
        badExample: "We're like Gong but we predict outcomes.",
        goodExample: "Gong tells you what was said on a call. We tell you whether the deal will close and why — 45 days before the outcome. Three customers have quoted saving $500K+ by reallocating rep time from doomed deals."
      }
    ],
    overallUrgency: "high",
    summaryLine: "SignalFlow has strong fundamentals but needs to strengthen competitive moat, scale GTM beyond founders, and formalize IP protection before Series A."
  },

  sections: [
    {
      title: "Problem",
      paragraphs: [
        {
          emphasis: "high",
          text: "Enterprise sales teams lose 67% of qualified deals to 'no decision' — not to competitors. This is the most underappreciated reality in B2B sales: the biggest threat isn't another vendor winning; it's the deal dying from internal inertia, stakeholder churn, or budget reallocation. After interviewing 85 sales leaders across mid-market companies (100-1000 employees), SignalFlow identified a consistent, quantifiable pattern that costs organizations millions annually."
        },
        {
          emphasis: "normal",
          text: "The current workflow is fundamentally broken. Sales reps spend 40% of their time on deals that will never close — pursuing prospects who show surface-level engagement but lack the internal alignment, budget authority, or urgency to actually commit. Meanwhile, the deals that could close receive insufficient attention because there's no systematic way to distinguish winners from losers until the post-mortem. The process fails because the signals that predict deal outcomes are scattered across CRM notes, email threads, calendar patterns, and call transcripts — invisible to human analysis at scale."
        },
        {
          emphasis: "normal",
          text: "The financial impact is staggering: $2.1M average annual revenue leakage per 50-person sales organization. This calculation comes from analyzing closed-lost deal data across SignalFlow's pilot customers — quantifying the revenue that was forecasted but never materialized due to 'no decision' outcomes. The stakeholders feeling this pain are VPs of Sales watching quota attainment stall, Revenue Operations leaders unable to produce reliable forecasts, and CFOs explaining misses to boards. The pain intensifies as deal complexity increases, multiple stakeholders get involved, and sales cycles extend beyond 90 days."
        },
        {
          emphasis: "high",
          text: "Current solutions fail because they provide insight too late. Salesforce dashboards, manager gut checks, and spreadsheet forecasting all catch problems in the post-mortem — after the deal has already stalled. Gong and Clari analyze what happened on calls, but they don't predict what will happen with deals. This isn't a productivity problem or a coaching problem — it's a prediction problem. And the window for prediction intelligence is now: sales organizations are investing heavily in AI tools (85% increasing spend in 2025), and the first mover who owns 'deal outcome prediction' will define the category."
        }
      ],
      highlights: [
        { label: "Deals lost to 'no decision'", metric: "67%" },
        { label: "Sales leaders interviewed", metric: "85" },
        { label: "Rep time on doomed deals", metric: "40%" },
        { label: "Annual revenue leakage", metric: "$2.1M per 50-person team" }
      ],
      keyPoints: [
        "67% of deals lost to 'no decision' — not competitors",
        "$2.1M average revenue leakage per 50-person sales org",
        "Current tools catch problems too late — post-mortem vs. real-time",
        "Sales leaders validated through 85 customer discovery interviews"
      ],
      vcReflection: {
        analysis: "The problem framing is sophisticated and shows deep customer understanding. Quantifying revenue leakage at $2.1M per 50-person team gives investors a clear ROI narrative. The 67% 'no decision' statistic is memorable and creates urgency. This is above-average problem articulation for Seed stage. My biggest concern is ensuring this isn't just a sales execution problem dressed up as a technology problem — some VCs may argue that better sales management, not AI, is the solution. The 85 customer interviews significantly de-risk this objection by demonstrating systematic validation.",
        questions: [
          {
            question: "How does the problem intensity vary by industry vertical or deal complexity?",
            vcRationale: "I need to understand if this is a horizontal problem or concentrated in specific segments, which affects TAM and go-to-market strategy.",
            whatToPrepare: "Breakdown of the 85 interviews by industry and company size, with specific pain intensity ratings for each segment."
          },
          {
            question: "What percentage of your customers were actively looking for a solution before they found you vs. educated on the problem by your sales team?",
            vcRationale: "This indicates whether you're selling into 'hair on fire' urgency or creating demand — which dramatically affects CAC and sales velocity.",
            whatToPrepare: "Data on inbound vs. outbound mix, and specific quotes from customers about what triggered their search for a solution."
          },
          {
            question: "How does this problem manifest differently in mid-market vs. enterprise sales organizations?",
            vcRationale: "Your positioning is mid-market, but I need to understand if the problem is actually more severe at enterprise (which would suggest upmarket pressure) or genuinely differentiated for mid-market.",
            whatToPrepare: "Comparison of pain points and current solutions between mid-market (your ICP) and enterprise organizations."
          }
        ],
        benchmarking: "Top quartile for customer discovery depth. Most Seed companies conduct 20-30 customer interviews; SignalFlow's 85 puts them in the top 10%. The quantified impact ($2.1M) with clear methodology is rare and valuable — most founders use vague 'billions wasted' claims without specifics. The 67% 'no decision' framing is also distinctive, reframing the competitive narrative in a memorable way.",
        conclusion: "Strong problem validation with clear market evidence. The customer discovery depth and quantified pain point provide solid foundation for investment consideration. My primary remaining question is whether the pain is acute enough to drive immediate purchasing behavior, or whether this is an 'important but not urgent' problem that gets deprioritized against quota-attainment tools. The 85 interviews significantly increase my confidence."
      }
    },
    {
      title: "Solution",
      paragraphs: [
        {
          emphasis: "high",
          text: "SignalFlow analyzes CRM data, email patterns, call transcripts, and calendar activity to predict deal outcomes with 89% accuracy — 45 days before the outcome materializes. Unlike conversation intelligence tools that tell you what happened, SignalFlow tells you what will happen and why. The core technology is a machine learning system trained on 2M+ historical deal outcomes that identifies the 3-5 signals determining close probability for each specific deal. The product surfaces these signals as actionable coaching insights: not just 'this deal is at risk,' but 'this deal lacks technical champion engagement and has 40% less email velocity than won deals at this stage.'"
        },
        {
          emphasis: "normal",
          text: "The platform integrates with existing sales infrastructure in 5 minutes — connecting to Salesforce, HubSpot, Outreach, Gong (yes, complementary to their recording), Gmail, Outlook, and 6 other tools. This integration depth is critical: the more data sources connected, the higher the prediction accuracy. SignalFlow doesn't require behavioral change from reps; it observes existing activity and surfaces insights in the tools they already use (Slack notifications, Salesforce embedded, email digest). This 'invisible infrastructure' approach drives 85% weekly active usage across customer base."
        },
        {
          emphasis: "normal",
          text: "The mechanism creates a flywheel effect. Every deal that closes (won or lost) becomes training data for the model. With 28 customers generating ~200 deals/month of outcome data, the model improves continuously. Early customers with 6+ months of usage report accuracy improvements from 82% to 91% as the model learns their specific deal patterns. This data network effect creates compounding advantage — new customers benefit from the aggregate learning, while existing customers see improving performance over time."
        },
        {
          emphasis: "high",
          text: "The ROI is concrete and measurable. Pilot data shows: 15 hours/week saved per manager on deal review (they focus on the 20% of deals that matter), 23% improvement in forecast accuracy at 90-day horizon, and — most importantly — 18% increase in win rate by reallocating rep time from doomed deals to winnable ones. Three customers have calculated $500K+ in annual recovered revenue directly attributable to SignalFlow's predictions. These aren't projections; they're measured outcomes from live implementations. Why now: sales organizations are investing heavily in AI (85% increasing spend in 2025), the data infrastructure (modern CRMs, email APIs, calendar access) finally exists, and the mid-market segment is underserved by enterprise-focused incumbents."
        }
      ],
      highlights: [
        { label: "Deal prediction accuracy", metric: "89%" },
        { label: "Prediction lead time", metric: "45 days" },
        { label: "Integration time", metric: "5 minutes" },
        { label: "Win rate improvement", metric: "18%" }
      ],
      keyPoints: [
        "89% accuracy on deal outcome prediction — 45 days ahead",
        "Identifies 'why' not just 'if' — actionable coaching insights",
        "5-minute integration with 12 CRM/email/calendar tools",
        "Data flywheel: accuracy improves with every deal outcome"
      ],
      vcReflection: {
        analysis: "The 'prediction vs. recording' positioning is smart differentiation in a crowded market. Having 28 paying customers with 89% accuracy demonstrates execution capability that's rare at Seed stage. The 5-minute integration claim, if true, removes major adoption friction — most enterprise sales tools require weeks of implementation. I particularly like the 'invisible infrastructure' framing that explains the 85% WAU; it shows product thinking maturity. My main concern is defensibility: what prevents Gong from adding a prediction layer to their existing data advantage?",
        questions: [
          {
            question: "What's the baseline for 89% accuracy — random chance, manager intuition, or Salesforce forecasting?",
            vcRationale: "The accuracy claim is compelling but needs context. If managers already predict at 70%, then 89% is an improvement. If the baseline is 50%, it's transformational.",
            whatToPrepare: "Baseline comparison data showing prediction accuracy before SignalFlow vs. after, ideally with the same customer cohort."
          },
          {
            question: "How does accuracy vary by deal type, sales cycle length, and industry?",
            vcRationale: "89% is an aggregate number. I need to understand where the model excels and where it struggles to assess product roadmap needs.",
            whatToPrepare: "Accuracy breakdown by deal size ($), sales cycle length, and industry vertical — identifying any segments below 80%."
          },
          {
            question: "What's preventing Gong from building this feature on top of their existing conversation data?",
            vcRationale: "This is the elephant in the room. Gong has more data, more customers, and a $7B war chest. I need to believe your moat is durable.",
            whatToPrepare: "Technical explanation of why prediction requires different data architecture, training data specificity to deal outcomes (not call transcripts), and the 12-18 month development timeline estimate for competitors."
          }
        ],
        benchmarking: "NPS of 74 is exceptional — typical B2B SaaS is 30-50. The 85% weekly active usage suggests genuine product engagement, not shelfware. 5-minute integration, if validated, would be best-in-class for the category. The accuracy improvement from 82% to 91% over 6 months demonstrates the data flywheel in action, which is the type of compounding advantage VCs look for.",
        conclusion: "Solid product execution with strong customer satisfaction signals. The differentiation angle is credible, but technical moat needs reinforcement through IP protection. I'd want to see the provisional patent filed and a clear articulation of why the 2M deal outcomes dataset creates durable advantage. The 18% win rate improvement is a powerful ROI story — make sure you have 3+ customers who can speak to this on reference calls."
      }
    },
    {
      title: "Market",
      paragraphs: [
        {
          emphasis: "high",
          text: "The ICP is mid-market B2B companies (100-1000 employees) with 20-100 person sales teams selling $50K+ ACV products. These organizations are large enough to have complex, multi-stakeholder deals (where prediction adds value) but underserved by enterprise solutions designed for 500+ rep deployments. At €14K ACV, the Total Addressable Market is €2.5B: 180,000 mid-market B2B companies globally × €14K average contract value. This is bottom-up math, not top-down industry reports — each number is defensible."
        },
        {
          emphasis: "normal",
          text: "The Serviceable Addressable Market filters to €630M — tech-forward industries (SaaS, fintech, professional services) in the US and Western Europe where sales technology adoption is highest. The Serviceable Obtainable Market of €112M represents accounts reachable through current channels: existing customer referrals, content marketing, sales tech community, and targeted outbound. At 5% market penetration, SignalFlow would be a €50M ARR company — proving the market supports venture-scale outcomes."
        },
        {
          emphasis: "normal",
          text: "The category is validated by massive exits. Gong's $7.25B valuation demonstrates investor appetite for sales intelligence. Clari's $2.6B proves revenue operations is investable. Chorus.ai's $575M acquisition by ZoomInfo shows strategic acquirer interest. Combined, the category has produced $10B+ in enterprise value — and the mid-market segment within it remains underserved. Gong's average customer has 200+ reps; SignalFlow targets the 20-100 rep sweet spot that's too small for enterprise sales motion but too valuable to ignore."
        },
        {
          emphasis: "high",
          text: "Timing is favorable for three reasons. First, 85% of sales organizations plan to increase AI tool spending in 2025 — the budget environment is expanding, not contracting. Second, the data infrastructure enabling prediction (modern CRMs with APIs, connected email, calendar integration) reached maturity in the last 2-3 years. Third, economic pressure on sales efficiency is intensifying: companies can't just hire more reps, they need each rep to perform better. The mid-market is particularly acute because they lack the RevOps resources of enterprise to build homegrown solutions. SignalFlow is positioned at the intersection of budget expansion, infrastructure maturity, and acute need."
        }
      ],
      highlights: [
        { label: "Total Addressable Market", metric: "€2.5B" },
        { label: "Serviceable Available Market", metric: "€630M" },
        { label: "Serviceable Obtainable Market", metric: "€112M" },
        { label: "Category validated", metric: "$10B+ in exit value" }
      ],
      keyPoints: [
        "€2.5B TAM with bottom-up methodology (180K mid-market B2B companies)",
        "Category validated by $10B+ in Gong + Clari + Chorus value",
        "85% of sales orgs increasing AI spend in 2025",
        "Mid-market underserved — too small for enterprise, too valuable to ignore"
      ],
      vcReflection: {
        analysis: "The bottom-up TAM methodology is credible and shows founder sophistication — most Seed companies throw out top-down numbers from analyst reports. The €2.5B is defensible: I can trace each number. The category validation ($10B+) is compelling proof that investors and acquirers value this space. My concern is whether mid-market is a durable position or a stepping stone. If SignalFlow wins mid-market, does that make them an acquisition target before they can scale, or do they have a path to move upmarket?",
        questions: [
          {
            question: "Is mid-market a defensible long-term position, or does success inevitably lead to upmarket expansion?",
            vcRationale: "I need to understand if you're building a mid-market company or using mid-market as a wedge into enterprise. Both are valid, but they imply different valuations and exit outcomes.",
            whatToPrepare: "5-year vision for market positioning: stay mid-market (like Pipedrive) or expand upmarket (like HubSpot). Include the strategic logic for either path."
          },
          {
            question: "What happens when Gong launches an 'Essentials' tier at $99/seat targeting your ICP?",
            vcRationale: "This is a predictable competitive move. I need to believe you've war-gamed this scenario and have a response strategy.",
            whatToPrepare: "Competitive response plan for Gong's mid-market entry, including differentiation points, pricing strategy, and customer lock-in tactics."
          },
          {
            question: "What's the expansion path beyond deal prediction — is this a feature or a platform?",
            vcRationale: "€14K ACV is healthy for Seed, but Series A investors will want to see a path to €50K+ ACV. How do you expand within accounts?",
            whatToPrepare: "Product roadmap showing enterprise tier features, expansion modules (forecasting, territory planning, etc.), and path to €50K+ ACV."
          }
        ],
        benchmarking: "Bottom-up TAM methodology puts SignalFlow in the top 15% of Seed pitches — most founders use lazy top-down sizing. The €2.5B TAM comfortably supports €100M+ outcomes required for venture returns. The 85% AI spending increase statistic is timely and creates urgency. SAM/SOM filters are realistic, not overly aggressive.",
        conclusion: "Market size and methodology are solid. The mid-market wedge strategy is credible given enterprise incumbents' structural constraints. The remaining question is long-term positioning: is mid-market the destination or the starting point? Either answer is valid, but I need to understand the strategic intent to model the outcome."
      }
    },
    {
      title: "Competition",
      paragraphs: [
        {
          emphasis: "high",
          text: "The competitive landscape breaks into three archetypes. First, conversation intelligence leaders: Gong ($70M+ ARR, $7.25B valuation) and Chorus.ai (acquired by ZoomInfo for $575M) analyze call recordings to surface coaching insights. They're dominant in enterprise but focused on 'what happened' rather than 'what will happen.' Second, revenue platforms: Clari ($40M+ ARR, $2.6B valuation) and 6sense provide forecasting and intent data — complementary but not direct competitors. Third, point solutions for activity capture, forecasting, and deal scoring that lack SignalFlow's integrated prediction approach."
        },
        {
          emphasis: "normal",
          text: "Gong is the primary competitive threat and requires honest assessment. They have $200M+ ARR, a $7B valuation, deep enterprise relationships, and announced an 'Essentials' tier at $99/seat targeting mid-market. If anyone can build prediction features, it's Gong — they have the data, the engineers, and the customer base. The question is execution priority: Gong's core business is enterprise, their sales motion is designed for 200+ seat deployments, and prediction is a different technical architecture than conversation analysis. Building prediction would require significant investment that competes with their enterprise roadmap."
        },
        {
          emphasis: "normal",
          text: "SignalFlow's differentiation is structural, not just positioning. First, prediction requires different data: deal outcomes, not call transcripts. Gong optimizes for understanding conversations; SignalFlow optimizes for predicting wins. Second, the training data is specific: SignalFlow's 2M+ deal outcomes dataset would take any competitor 18+ months to replicate, even with resources. Third, mid-market optimization: SignalFlow's 5-minute integration and 20-100 seat pricing is designed for the segment, not bolted on. Enterprise tools consistently fail when they move downmarket because their DNA is wrong."
        },
        {
          emphasis: "high",
          text: "The competitive win data is encouraging but early. SignalFlow has won 8 competitive deals against Gong in the last 6 months, with documented reasons for each win. Key patterns: customers chose SignalFlow for outcome prediction (not available in Gong), faster implementation (5 minutes vs. weeks), and right-sized pricing (€14K vs. €50K+). The 45% win rate in competitive situations is above typical challenger benchmarks. The 12-18 month moat estimate is based on: (1) data collection time for comparable outcome dataset, (2) ML model training and iteration, (3) integration depth with 12 tools. Gong could close the gap eventually, but SignalFlow has a window to establish category leadership in prediction."
        }
      ],
      highlights: [
        { label: "Competitive win rate", metric: "45%" },
        { label: "Deal outcomes in training set", metric: "2M+" },
        { label: "Moat duration estimate", metric: "12-18 months" },
        { label: "Integration advantage", metric: "5 min vs. weeks" }
      ],
      keyPoints: [
        "Primary threat: Gong's mid-market expansion with 'Essentials' tier",
        "Differentiation: prediction vs. recording (different data, different architecture)",
        "Data moat: 2M+ deal outcomes would take 18+ months to replicate",
        "45% competitive win rate in head-to-head situations"
      ],
      vcReflection: {
        analysis: "I appreciate the honest assessment of Gong as a threat — founders who dismiss competitive risk lose credibility. The 'prediction vs. recording' differentiation is substantive, not just marketing. The 45% competitive win rate with 8 documented deals is encouraging early data. My main concern is moat duration: 12-18 months feels aggressive given Gong's resources. If they prioritize mid-market, they could move faster. The provisional patent filing and data moat narrative need to be rock solid.",
        questions: [
          {
            question: "Walk me through the 8 competitive wins against Gong — what specifically did customers cite as the deciding factor?",
            vcRationale: "I need to verify that the differentiation is real and repeatable, not situational or based on pricing alone.",
            whatToPrepare: "Competitive win documentation for each of the 8 deals: customer segment, deal size, evaluation criteria, and verbatim quotes on why they chose SignalFlow."
          },
          {
            question: "What's your response plan if Gong acquires a prediction-focused startup tomorrow?",
            vcRationale: "Gong has acquisition history (Engage.ai). A prediction acqui-hire would compress your moat timeline significantly.",
            whatToPrepare: "Scenario analysis for Gong M&A in the prediction space, including acceleration tactics and defensive positioning."
          },
          {
            question: "How does your relationship with Gong work given that you integrate with their tool? Are you frenemies or enemies?",
            vcRationale: "I need to understand the platform dynamics — does Gong benefit from your integration (ecosystem play) or view you as a threat?",
            whatToPrepare: "Gong partnership/integration history, any communication with their BD team, and analysis of whether they would ever block your integration."
          }
        ],
        benchmarking: "45% competitive win rate is above typical challenger benchmarks (30-40% is normal for startups competing against incumbents). The 8 documented wins is good discipline — most startups can't produce this data. The 12-18 month moat estimate aligns with typical ML development timelines, though it assumes competitors don't acquire their way to parity.",
        conclusion: "Competitive awareness is good and the differentiation is substantive. The 45% win rate with documentation is the strongest evidence that the positioning works. I remain cautious about moat duration — Gong has resources to move fast if they prioritize. Series A will require proving sustained competitive wins and ideally a provisional patent on the prediction methodology."
      }
    },
    {
      title: "Team",
      paragraphs: [
        {
          emphasis: "high",
          text: "The founding team has earned the right to build this company. Elena Vasquez (CEO, 52% equity) spent 8 years at Salesforce leading enterprise sales strategy, including 3 years running a 45-person sales enablement team. She's seen the deal intelligence problem from the inside — understanding exactly why forecasts miss, how reps waste time on doomed deals, and what sales leaders actually need from their tools. Her relationships with major sales tech buyers (she knows the VPs of Sales at 50+ mid-market companies personally) created the initial customer pipeline. Marcus Chen (CTO, 48% equity) led ML engineering at Datadog for 4 years, building production systems serving 10,000+ customers. His PhD from Stanford focused on time-series prediction — directly applicable to deal outcome forecasting. The combination of sales domain expertise and technical depth is rare."
        },
        {
          emphasis: "normal",
          text: "The team has expanded thoughtfully. Three engineers hired from Stripe and Twilio bring infrastructure rigor essential for a data-intensive product. The first VP Sales, hired from Outreach 4 months ago, has already closed 6 deals and proven the sales motion transfers beyond founders. An SDR and customer success manager round out the team of 8. The hiring velocity (6 in last 12 months) demonstrates ability to attract talent despite Seed-stage constraints — referencing Datadog and Salesforce pedigree helps."
        },
        {
          emphasis: "normal",
          text: "The advisory bench adds strategic depth. A current Gong board member provides competitive intelligence and category perspective (carefully managed to avoid conflict). A former Clari CRO advises on revenue operations go-to-market. A Stanford ML professor consults on model architecture. This isn't a decorative advisory board — each person has specific engagement: monthly calls, customer introductions, and technical review. The board composition is lean for now: just founders, with plan to add independent board member with next round."
        },
        {
          emphasis: "high",
          text: "The gap is VP Marketing, actively in hiring process. Current growth is organic (word of mouth, founder network, content) but lacks systematic demand generation. Two final-round candidates with relevant experience: one from Outreach (demand gen at €20-80M ARR stage), one from Gong (built mid-market marketing engine). Expected close in 6-8 weeks. This hire is critical to scaling from €32K to €150K MRR — without it, growth will plateau at the limits of founder network. Beyond VP Marketing, the next hires are 2 additional AEs (Q2) and a Head of Product (Q3) as the team scales toward Series A."
        }
      ],
      highlights: [
        { label: "CEO Salesforce experience", metric: "8 years" },
        { label: "CTO Datadog ML experience", metric: "4 years" },
        { label: "Current team size", metric: "8 people" },
        { label: "VP Marketing expected", metric: "6-8 weeks" }
      ],
      keyPoints: [
        "CEO: 8 years Salesforce enterprise sales strategy, 45-person team management",
        "CTO: Datadog ML Lead for 4 years, Stanford PhD in time-series prediction",
        "Advisory: Gong board member, former Clari CRO, Stanford ML professor",
        "Gap: VP Marketing in final hiring rounds, expected close in 6-8 weeks"
      ],
      vcReflection: {
        analysis: "This is a high-quality founding team with rare combination of sales domain expertise and ML technical depth. The Salesforce + Datadog pedigree is exactly what I'd want to see for this company. The 8-year tenure at Salesforce (not a quick rotation) suggests deep domain knowledge, not surface-level experience. The CTO's PhD in time-series prediction is directly applicable — this isn't a generic ML background forced into the domain. The team expansion has been thoughtful, and the VP Sales hire proving the motion transfers is important signal. The VP Marketing gap is real but actively being addressed.",
        questions: [
          {
            question: "Elena, what specific patterns from your Salesforce experience informed the product design? What did you see that others missed?",
            vcRationale: "I'm testing founder-market fit depth. Generic answers suggest surface-level understanding; specific operational insights suggest real domain expertise.",
            whatToPrepare: "3-5 specific examples of insights from Salesforce that directly shaped SignalFlow's product decisions — ideally things that surprised you or contradicted conventional wisdom."
          },
          {
            question: "Marcus, how does your time-series PhD work apply to deal prediction specifically? What's the technical insight?",
            vcRationale: "I'm testing whether the academic background is actually relevant or just credential signaling. The connection should be specific and substantive.",
            whatToPrepare: "Technical explanation (accessible to non-ML audience) of how time-series forecasting methods apply to deal outcome prediction, including any novel approaches SignalFlow uses."
          },
          {
            question: "How do you manage the Gong board member relationship given competitive dynamics? Isn't this a conflict?",
            vcRationale: "This is unusual and needs explanation. I'm testing judgment and governance thinking.",
            whatToPrepare: "Clear explanation of boundaries, information sharing protocols, and why this relationship is net positive despite the apparent conflict."
          }
        ],
        benchmarking: "Top 5% for founder domain experience — 8 years at Salesforce with team management is exceptional depth. The CTO's Datadog ML experience (4 years at a scaling company) is exactly the right profile for production ML. The advisory board is substantive, not decorative — specific engagement is described. The hiring velocity (6 in 12 months) is appropriate for stage.",
        conclusion: "Team is a significant strength and de-risks execution considerably. The founder-market fit here is genuinely exceptional for the stage — this isn't founders who researched a market, but founders who lived the problem. The VP Marketing gap is the main team concern, but with two final-round candidates, it's actively being addressed. I'd want to meet the VP Sales to validate that the sales motion truly transfers."
      }
    },
    {
      title: "Business Model",
      paragraphs: [
        {
          emphasis: "high",
          text: "SignalFlow sells SaaS subscriptions at €1,200/month per team, with average deployment of 15 seats yielding €14K ACV. The pricing model is 'per-team' rather than 'per-seat' — a deliberate choice that encourages full team adoption (critical for prediction accuracy) while simplifying procurement for mid-market buyers who resist per-seat negotiations. Gross margin is 82%, healthy for SaaS and sustainable at scale. The margin structure reflects low infrastructure costs (ML inference is efficient) and minimal implementation services (5-minute integration means no professional services drag)."
        },
        {
          emphasis: "normal",
          text: "Unit economics are healthy and improving. Current CAC is €8,500 (blended across organic and outbound channels). LTV is €42,000, based on 2.1% monthly churn and current expansion rates. This yields LTV:CAC of 4.9x — well above the 3x threshold VCs want to see. Payback period is 7 months, enabling aggressive customer acquisition without excessive cash burn. The efficiency comes from three sources: (1) inbound demand from content marketing (40% of pipeline at near-zero CAC), (2) founder network effects (warm introductions), (3) fast sales cycles (4.5 months average, target 3 months with sales team scaling)."
        },
        {
          emphasis: "normal",
          text: "Expansion mechanics are built into the product. Net Revenue Retention is 108%, driven by seat expansion as customer sales teams grow. Annual contracts at 15% discount are driving 45% of new ARR, improving cash efficiency and reducing churn risk. Two expansion vectors in development: (1) enterprise tier at €50K+ ACV with advanced features (forecasting, territory optimization) targeting launch in Q2, (2) professional services for large implementations that justify higher touch — cautiously, to avoid margin erosion. The path to €50K ACV is important for Series A narrative; €14K is efficient but may raise questions about expansion potential."
        },
        {
          emphasis: "high",
          text: "Stress-testing the model reveals areas of resilience and concern. Resilience: if churn doubles to 4.2%, LTV drops to €21K but LTV:CAC remains above 2.5x — survivable. If CAC increases 50% due to competitive pressure, payback extends to 10.5 months — manageable with annual contracts. Concern: if ACV compression forces pricing from €14K to €10K (competitive pressure or segment shift), customer volume requirements increase 40% — more challenging but not fatal. The model is fundamentally sound with clear levers for optimization. The primary risk is CAC inflation as market gets competitive, mitigated by investment in product-led growth and referral mechanics."
        }
      ],
      highlights: [
        { label: "Average Contract Value", metric: "€14K" },
        { label: "Gross Margin", metric: "82%" },
        { label: "LTV:CAC Ratio", metric: "4.9x" },
        { label: "Payback Period", metric: "7 months" }
      ],
      keyPoints: [
        "€14K ACV with per-team pricing model (not per-seat)",
        "82% gross margin with minimal implementation services",
        "4.9x LTV:CAC, 7-month payback — efficient growth economics",
        "108% NRR from seat expansion; 45% on annual contracts"
      ],
      vcReflection: {
        analysis: "The unit economics are solid — 4.9x LTV:CAC and 7-month payback are well above benchmarks. The per-team pricing model is smart for mid-market where per-seat negotiations slow deals. 108% NRR shows expansion is real, not just logos. My main concern is ACV scalability: €14K is efficient but may limit Series A valuation discussions. The enterprise tier development is the right answer, but I'd want to see early signals that €50K ACV is achievable before Series A. The stress-test analysis shows mature thinking about model resilience.",
        questions: [
          {
            question: "What's the evidence that customers will pay €50K+ for the enterprise tier? Any early signals?",
            vcRationale: "Series A investors will want to see a path to higher ACV. Early enterprise interest or willingness-to-pay testing is important.",
            whatToPrepare: "Any enterprise tier conversations, pricing research, or customer requests for features that would justify €50K+ ACV."
          },
          {
            question: "What happens to unit economics if you need to hire a sales team (higher CAC) to hit €150K MRR?",
            vcRationale: "Current efficiency benefits from founder-led sales and organic inbound. As you scale, CAC typically increases. I want to see you've modeled this.",
            whatToPrepare: "Scenario analysis showing CAC with 2 AEs, 4 AEs, and full sales team — and the corresponding impact on LTV:CAC and payback."
          },
          {
            question: "How price-sensitive is your ICP? What happens if Gong enters at $99/seat?",
            vcRationale: "Competitive pricing pressure is coming. I need to understand if your customers are buying on value or price.",
            whatToPrepare: "Win/loss analysis by price sensitivity, any deals lost on pricing, and your response strategy if competitive pressure intensifies."
          }
        ],
        benchmarking: "LTV:CAC of 4.9x is top 20% — typical Seed companies show 2-3x. Payback of 7 months is top 15% — the benchmark is 12-18 months. Gross margin of 82% is healthy and sustainable. The 108% NRR with 45% annual contracts suggests strong product engagement and value delivery. These metrics suggest efficient growth potential.",
        conclusion: "Business model is solid and de-risked. The unit economics are well above thresholds and the stress-test analysis shows mature thinking. The path to €50K+ ACV is the open question for Series A — I'd want to see early enterprise tier signals before committing to that round. For Seed, these numbers are strong."
      }
    },
    {
      title: "Traction",
      paragraphs: [
        {
          emphasis: "high",
          text: "SignalFlow has €32K MRR with 28 paying customers, growing 15% month-over-month for 8 consecutive months. The company started charging 10 months ago after a 4-month free beta. Growth is compounding: from €10K MRR at month 2 to €32K at month 10, the trajectory suggests €55K+ MRR by month 12 if current rate continues. The growth is primarily organic — 60% inbound from content marketing and word-of-mouth, 40% outbound from founder network. This indicates genuine product-market fit, not manufactured traction from heavy sales spend."
        },
        {
          emphasis: "normal",
          text: "Customer quality is strong for the stage. Three YC-backed companies are paying customers, providing social proof and referral potential. Two publicly traded companies are customers under NDA — large enough to validate enterprise capability but requiring discretion. The customer roster spans SaaS (40%), fintech (25%), professional services (20%), and other B2B (15%). This distribution matches the ICP and demonstrates repeatability across segments. Average deal size has increased from €8K (early deals) to €16K (recent deals) as pricing confidence grows."
        },
        {
          emphasis: "normal",
          text: "Engagement metrics validate product value. NPS of 74 is exceptional — typical B2B SaaS is 30-50. Cohort retention of 94% at Month 6 suggests strong product stickiness. Weekly active usage of 85% indicates the product is genuinely integrated into workflows, not shelfware. Customer quotes consistently cite prediction accuracy and time savings: 'SignalFlow tells us which deals to focus on — we stopped wasting time on leads going nowhere' (VP Sales, YC-backed customer). These qualitative signals reinforce the quantitative growth."
        },
        {
          emphasis: "high",
          text: "Pipeline provides forward visibility. €180K in qualified opportunities represents 5.6x current MRR — healthy pipeline coverage. Five deals in final negotiation represent €65K potential ACV with expected close in next 30-60 days. Enterprise tier pilots are underway with 2 customers testing advanced features at €35K+ ACV. Inbound interest is accelerating — 40% increase in demo requests over last quarter, driven by content marketing and customer referrals. Series A trigger: €150K MRR with 75+ customers and proven non-founder sales motion. Current trajectory suggests 12-15 months to achieve this milestone with Seed capital."
        }
      ],
      highlights: [
        { label: "Monthly Recurring Revenue", metric: "€32K" },
        { label: "Paying Customers", metric: "28" },
        { label: "Month-over-Month Growth", metric: "15%" },
        { label: "Net Promoter Score", metric: "74" }
      ],
      keyPoints: [
        "€32K MRR with 28 customers, 15% MoM growth for 8 months",
        "NPS 74, 94% retention at Month 6, 85% weekly active usage",
        "€180K qualified pipeline, 5 deals in final stage (€65K ACV)",
        "Series A trigger: €150K MRR, 75 customers, non-founder sales"
      ],
      vcReflection: {
        analysis: "The traction is solid for Seed stage and demonstrates clear product-market fit signals. 15% MoM for 8 consecutive months shows consistency, not a one-time spike. The 60% organic mix is healthy — proves demand exists without heavy sales investment. NPS of 74 and 85% WAU are strong engagement signals. My main concern is proving the sales motion scales beyond founders. The VP Sales hire (6 deals closed) is encouraging but early. Series A will require more evidence that non-founders can replicate the success.",
        questions: [
          {
            question: "What's driving the 6% monthly churn (100% - 94% cohort retention)? Product issues or wrong customers?",
            vcRationale: "Churn at this stage is concerning. I need to understand if it's fixable (product gaps) or structural (wrong ICP in early cohort).",
            whatToPrepare: "Churn analysis by customer segment, reason codes from churned customers, and any patterns in who churns vs. who stays."
          },
          {
            question: "The VP Sales has closed 6 deals — what's the sales cycle length and close rate compared to founder-led deals?",
            vcRationale: "I need to validate that the sales motion truly transfers. If VP Sales deals take 2x as long or have lower close rates, that's a scaling concern.",
            whatToPrepare: "Side-by-side comparison of founder vs. VP Sales metrics: sales cycle length, close rate, deal size, and customer quality."
          },
          {
            question: "What's the breakdown of the €180K pipeline by stage and expected close date?",
            vcRationale: "Pipeline coverage of 5.6x is healthy, but I want to understand quality and timing. Is this realistic or optimistic?",
            whatToPrepare: "Pipeline stage analysis: discovery, demo, negotiation, verbal commit. Include expected close dates and confidence levels."
          }
        ],
        benchmarking: "€32K MRR at Seed is solid — not exceptional, but demonstrates execution. 15% MoM growth for 8 months is consistent and credible. NPS 74 is top 10% for B2B SaaS. 94% cohort retention at Month 6 is healthy. The 60% organic mix is unusual and positive — most Seed companies rely heavily on founder-led outbound. Pipeline coverage of 5.6x is healthy for the stage.",
        conclusion: "Traction demonstrates clear PMF signals and readiness for scaling. The combination of consistent growth, high NPS, and strong retention suggests genuine product value. The open question is sales scalability — proving non-founders can replicate success is the key unlock for Series A. The VP Sales early results are encouraging but need more data points."
      }
    },
    {
      title: "Vision",
      paragraphs: [
        {
          emphasis: "high",
          text: "SignalFlow is raising €2M Seed at €10M pre-money valuation. The capital provides 18 months of runway to reach Series A milestones. Use of funds is specific and defensible: 55% R&D (4 engineers for enterprise features and model improvements), 25% sales (2 AEs plus 1 SDR to prove scalable GTM), 15% marketing (VP Marketing hire, content, events), 5% ops (finance, legal, infrastructure). The burn rate of ~€110K/month is efficient for the team size and growth ambitions. Runway extends to 24 months if growth outpaces plan and revenue contribution increases."
        },
        {
          emphasis: "normal",
          text: "Key milestones define success. 18-month targets: €150K MRR (from €32K — 4.7x growth), 75 customers (from 28 — 2.7x growth), enterprise tier launched with 5+ customers at €50K+ ACV, and US market presence established through initial customer wins. The path from €32K to €150K MRR requires 15% MoM growth sustained for 12 months, then 10% MoM for final 6 months — aggressive but achievable given current trajectory. Series A unlock specifically requires proving sales velocity (3-month cycles vs. current 4.5) and demonstrating non-founder-led closes (target: 50%+ of new ARR from sales team)."
        },
        {
          emphasis: "normal",
          text: "Contingency planning addresses key risks. If growth lags: pivot to channel strategy through sales consulting firms and CRM implementation partners who can bundle SignalFlow. If competitive pressure intensifies: accelerate enterprise tier development and move upmarket where Gong is less focused. If VP Marketing hire fails: engage fractional CMO while continuing search. If churn increases: implement customer success playbook and reduce cohort risk. Each scenario has a defined trigger point and response plan — the founders have thought through failure modes."
        },
        {
          emphasis: "high",
          text: "Exit potential is realistic for the category. Strategic acquirers include: Salesforce (AI for sales is core strategy, €5B+ acquisition capacity), HubSpot (mid-market CRM expansion, €1B+ capacity), ZoomInfo (already acquired Chorus.ai for €575M, proven buyer), and Microsoft (Dynamics AI enhancement). Financial exits through IPO require €100M+ ARR scale — realistic at Series C+ timeline. Comparable outcomes: Chorus.ai (€575M, 5 years), Gong (€7B valuation, 10 years), Clari (€2.6B valuation, 9 years). A realistic outcome for SignalFlow: €500M-1B strategic acquisition at Series B/C stage, or €2B+ IPO track if category leadership is achieved. The €10M pre-money valuation provides investors with meaningful upside in all exit scenarios."
        }
      ],
      highlights: [
        { label: "Raising", metric: "€2M Seed" },
        { label: "Pre-money valuation", metric: "€10M" },
        { label: "Runway", metric: "18 months" },
        { label: "Series A target", metric: "€150K MRR" }
      ],
      keyPoints: [
        "€2M raise at €10M pre-money for 18 months runway",
        "Use of funds: 55% R&D, 25% sales, 15% marketing, 5% ops",
        "Milestones: €150K MRR, 75 customers, enterprise tier, US presence",
        "Exit comps: Chorus.ai (€575M), Gong (€7B), category consolidation"
      ],
      vcReflection: {
        analysis: "The ask is reasonable — €2M at €10M pre-money provides 18 months to hit meaningful Series A milestones. The use of funds is specific and appropriate: heavy R&D investment makes sense for an AI product, and the sales + marketing split shows understanding that GTM needs to scale. The €150K MRR target is aggressive but achievable given current trajectory. The contingency planning shows maturity — founders have thought through failure modes. My main concern is whether 18 months is sufficient if any milestone slips.",
        questions: [
          {
            question: "What's the contingency if you don't hit €150K MRR by month 18? Bridge round or pivot?",
            vcRationale: "I need to understand founder expectations and backup plans. Startups rarely hit exact milestones, and I want to see realistic thinking.",
            whatToPrepare: "Scenario analysis: what happens at €100K MRR, €75K MRR, and €50K MRR at month 18? Include fundraising implications and operational responses."
          },
          {
            question: "Why €10M pre-money? What's the logic behind the valuation?",
            vcRationale: "I want to understand valuation expectations and whether they're grounded in comparable analysis or arbitrary.",
            whatToPrepare: "Comparable analysis: other Seed-stage companies in the space with similar metrics and their valuations. Justify why €10M is appropriate."
          },
          {
            question: "How do you prioritize between US expansion and European depth?",
            vcRationale: "US presence is a milestone, but it's expensive and risky. I want to understand the strategic logic and resource allocation.",
            whatToPrepare: "US expansion plan: timeline, investment required, initial target customers, and how you'll execute remotely vs. with local hires."
          }
        ],
        benchmarking: "€2M Seed at €10M pre-money is reasonable for the metrics — €32K MRR with strong growth typically commands 10-15x ARR valuation at Seed. The 18-month runway is standard. Use of funds allocation (55% R&D) is appropriate for an AI company at this stage. The €150K MRR Series A target is at the higher end but achievable given category precedents.",
        conclusion: "Vision is credible and well-articulated. The path from €32K to €150K MRR is aggressive but supported by current trajectory. The use of funds is appropriate and the contingency planning shows maturity. The valuation is reasonable for the metrics. This is a fundable opportunity for investors who believe in the 'prediction vs. recording' differentiation and are comfortable with competitive dynamics."
      }
    }
  ]
};

// Helper to transform full-fidelity format to component-compatible format
export const getSignalFlowFullMemo = (): FullFidelityMemoData => {
  return SIGNALFLOW_FULL_MEMO;
};
