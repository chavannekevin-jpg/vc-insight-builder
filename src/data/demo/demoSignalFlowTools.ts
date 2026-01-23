// Full section tools for SignalFlow demo
// Comprehensive analysis data for all 8 sections

// Holistic verdicts for each section - used in MemoScoreRadar
export const DEMO_HOLISTIC_VERDICTS: Record<string, { verdict: string; stageContext: string }> = {
  "Problem": {
    verdict: "SignalFlow has done exceptional customer discovery work, interviewing 85 sales leaders to validate the 'no decision' problem. The $2.1M revenue leakage quantification gives VCs a clear ROI story. This is well above what we typically see at Seed stage.",
    stageContext: "At Seed, VCs expect at least 30 customer interviews with documented pain. SignalFlow exceeds this benchmark significantly."
  },
  "Solution": {
    verdict: "Working product with 28 paying customers and 89% prediction accuracy demonstrates execution ability. The 'prediction' vs. 'recording' positioning is smart differentiation, though technical moat needs reinforcement through patents.",
    stageContext: "For Seed stage, having a live product with paying customers substantially de-risks execution. Focus on building defensible IP."
  },
  "Market": {
    verdict: "The €2.5B TAM is supported by credible bottom-up methodology. Mid-market focus is a smart wedge strategy in a category validated by Gong's $7B valuation. Market timing is favorable with AI adoption surge.",
    stageContext: "Seed investors want to see a market large enough to support €100M+ outcomes. SignalFlow's TAM clears this bar comfortably."
  },
  "Competition": {
    verdict: "Competitive landscape is well-understood, but moat articulation needs work. Gong's mid-market push is a real risk. The 'prediction vs. recording' differentiation is good but needs sustained execution to become a defensible position.",
    stageContext: "At Seed, VCs accept competitive risk if the team can execute faster than incumbents. Need to demonstrate velocity."
  },
  "Team": {
    verdict: "Exceptional founder-market fit. CEO's 8 years at Salesforce provides deep domain expertise, while CTO's Datadog ML experience and Stanford PhD brings technical credibility. This team can execute on the vision.",
    stageContext: "Team is the primary bet at Seed. SignalFlow's founders have rare combination of domain expertise and technical depth."
  },
  "Business Model": {
    verdict: "Unit economics are healthy with 4.9x LTV:CAC and 7-month payback. The seat-based SaaS model is proven and predictable. Key is maintaining these metrics as the customer base scales beyond early adopters.",
    stageContext: "Seed benchmarks require 3x+ LTV:CAC and <18 month payback. SignalFlow exceeds both thresholds."
  },
  "Traction": {
    verdict: "€32K MRR with 15% MoM growth for 8 consecutive months demonstrates product-market fit. NPS of 74 and 94% retention are strong engagement signals. Ready for acceleration with capital.",
    stageContext: "For Seed, VCs want to see early revenue traction. SignalFlow's €384K ARR run-rate is solid for the stage."
  },
  "Vision": {
    verdict: "Clear 18-month roadmap to €150K MRR and Series A. Use of funds is specific and realistic. Exit scenarios through strategic acquisition or IPO path are well-mapped with comparable precedents.",
    stageContext: "Series A typically requires €100K+ MRR for B2B SaaS. SignalFlow's milestones are calibrated appropriately."
  }
};

export const DEMO_SECTION_TOOLS: Record<string, any> = {
  "Problem": {
    sectionScore: {
      score: 72,
      label: "Strong",
      percentile: "Top 25%",
      vcBenchmark: 65,
      whatThisTellsVC: "The problem is clearly articulated with quantified customer pain. Evidence from 85 customer interviews demonstrates systematic validation. The $2.1M revenue leakage framing gives VCs a clear ROI story to understand.",
      fundabilityImpact: "Strong problem definition reduces perceived market risk. VCs can easily explain this investment to their partners.",
      assessment: "above_bar"
    },
    vcInvestmentLogic: {
      decision: "INTERESTED",
      reasoning: "Clear, quantified pain point validated through extensive customer discovery. The 67% 'no decision' loss rate is memorable and defensible. Problem is urgent (revenue leakage) rather than nice-to-have.",
      keyCondition: "Would want to see continued evidence that mid-market specifically experiences this pain differently than enterprise (where Gong already serves).",
      assessment: "likely_to_explore"
    },
    actionPlan90Day: {
      objective: "Solidify problem evidence with quantitative proof points",
      actions: [
        {
          action: "Publish 'State of Deal Intelligence' report with anonymized customer data",
          timeline: "Week 1-4",
          priority: "critical",
          metric: "500+ downloads, 10+ press mentions"
        },
        {
          action: "Create ROI calculator showing revenue leakage by sales team size",
          timeline: "Week 2-3",
          priority: "important",
          metric: "50+ companies run calculation"
        },
        {
          action: "Record 5 customer video testimonials focusing on problem validation",
          timeline: "Week 3-6",
          priority: "important",
          metric: "5 videos produced, 1000+ views"
        },
        {
          action: "Present findings at 2 sales leadership conferences/podcasts",
          timeline: "Week 6-12",
          priority: "nice-to-have",
          metric: "2 speaking slots secured"
        }
      ]
    },
    benchmarks: [
      {
        metric: "Customer Interviews Conducted",
        yourValue: "85",
        benchmark: "30-50 typical",
        percentile: "Top 10%",
        insight: "Exceptional discovery depth. Most pre-seed companies do 20-30 interviews."
      },
      {
        metric: "Problem Quantification",
        yourValue: "$2.1M per org",
        benchmark: "Often unquantified",
        percentile: "Top 15%",
        insight: "Clear revenue impact framing is rare and valuable for enterprise sales."
      }
    ],
    evidenceThreshold: {
      // Correct field names matching TypeScript interface EvidenceThreshold
      evidenceGrade: "B",
      verifiedPain: [
        "67% of deals lost to 'no decision' — validated across 85 structured customer interviews with sales leaders at companies ranging from 100 to 1,000 employees",
        "40% of sales rep time spent pursuing deals that ultimately won't close — quantified through CRM activity analysis across 12 pilot companies with combined 450 sales reps",
        "$2.1M average annual revenue leakage per 50-person sales team — calculated using closed-lost deal data, win rates, and opportunity-to-close ratios from SignalFlow's pilot customer base",
        "3-4 week average deal slip before eventual loss — measured through calendar pattern analysis showing declining meeting frequency as leading indicator",
        "Current forecasting tools achieve only 45% accuracy at 90-day horizon — compared against actual outcomes across 15 quarters of historical data from pilot customers"
      ],
      unverifiedPain: [
        "Claim that AI prediction can identify at-risk deals 45 days before outcome — early data is promising but needs validation across larger sample sizes and more industry verticals",
        "Assumption that mid-market sales teams have same problem intensity as enterprise — may need more segmented evidence by company size and deal complexity",
        "Pattern detection accuracy improvement from 82% to 91% over 6 months — based on small cohort of early customers, needs replication",
        "Claim that managers currently spend 15+ hours/week on deal reviews — based on self-reported data, would benefit from time-tracking validation"
      ],
      whatVCsConsiderVerified: [
        "Third-party validation from industry analysts (Gartner, Forrester) — SignalFlow has had 2 analyst briefings but no formal coverage yet",
        "Customer interviews with specific, quotable pain points and quantified impact — SignalFlow has 85 documented interviews, exceeding Seed benchmarks",
        "Pilot data with measurable outcomes before/after implementation — SignalFlow has 12 companies with 3+ months of usage data",
        "Competitive loss data showing why customers chose you over alternatives — needs more systematic win/loss analysis documentation",
        "Industry survey data from reputable third-party sources — would strengthen the '67% no decision' statistic with external validation"
      ],
      missingEvidence: [
        "External validation from Gartner or Forrester analysts confirming the 'no decision' problem scale",
        "Systematic competitive win/loss analysis showing differentiation from Gong and Clari",
        "Longitudinal data showing prediction accuracy holds across different industries and deal types",
        "Customer churn data from competitors showing dissatisfaction with current solutions",
        "ROI case studies with named logos and specific before/after metrics"
      ]
    },
    founderBlindSpot: {
      // Correct field names matching TypeScript interface FounderBlindSpot  
      potentialExaggerations: [
        "The 89% prediction accuracy claim is compelling but may be overstated without clear baseline comparison — random chance in deal outcomes is around 50%, manager intuition is typically 60-70%, so 89% needs context to understand the actual improvement magnitude",
        "The '45 days before outcome' prediction window may be optimistic — early data shows wide variance (20-60 days) depending on deal complexity and sales cycle length",
        "Claiming to save '$2.1M per organization' is powerful but assumes every organization has 50-person sales team and similar deal economics — actual savings likely vary significantly by company profile"
      ],
      misdiagnoses: [
        "Framing this as a 'prediction problem' when some VCs may see it as a 'sales execution problem' that doesn't require AI — the counterargument is that better sales management, coaching, or process discipline could address the symptoms without technology investment",
        "Positioning the product as 'complementary to Gong' may be strategic mistake — if Gong adds prediction features, the 'complementary' positioning collapses. May need to more aggressively position as 'alternative to' rather than 'addition to'",
        "Assuming the mid-market segment has unique needs that justify a focused solution — enterprise solutions often move downmarket, and the feature gap may not be sustainable"
      ],
      assumptions: [
        "Assumes mid-market sales organizations have budget authority for €14K ACV tools — economic pressures may push decision-making up to enterprise or down to self-serve price points",
        "Assumes sales leaders will trust AI recommendations enough to change behavior — adoption risk is real, and 'prediction tools' have historically faced skepticism",
        "Assumes 5-minute integration is sufficient for enterprise-grade security and compliance requirements — mid-market companies with enterprise aspirations may have stricter IT requirements",
        "Assumes 85% WAU will translate to renewals — engagement doesn't always equal perceived value, especially if predictions don't visibly improve outcomes"
      ],
      commonMistakes: [
        "Over-indexing on technical accuracy metrics (89% prediction) vs. business outcome metrics (deals saved, revenue recovered) — VCs invest in business outcomes, not model performance",
        "Not addressing the 'do nothing' competitor clearly enough — for many sales orgs, the status quo (manager gut + Salesforce reports) is 'good enough'",
        "Underestimating Gong's ability to add prediction features — Gong has more data, more customers, and more resources. The 'recording vs. prediction' differentiation may not be durable",
        "Focusing on product features over distribution advantage — in competitive markets, go-to-market velocity often matters more than product differentiation"
      ]
    },
    caseStudy: {
      company: "Gong",
      sector: "Sales Tech / Revenue Intelligence",
      problem: "Enterprise sales teams lacked visibility into what was actually happening on customer calls. Win/loss reasons were based on rep self-reporting, which was often inaccurate or incomplete. Managers couldn't coach effectively without objective data on conversation patterns.",
      fix: "Built AI-powered conversation intelligence platform that records, transcribes, and analyzes every sales call. Surfaced patterns from winning deals (talk-to-listen ratios, competitive mentions, pricing discussions) and made them coachable. Created 'reality capture' — objective truth about sales conversations vs. subjective CRM notes.",
      outcome: "Grew to $200M+ ARR and $7.25B valuation, becoming the dominant player in 'conversation intelligence.' Achieved 95%+ retention rates and industry-leading NPS. Created an entirely new category and forced Salesforce, Microsoft, and others to respond with competitive offerings.",
      timeframe: "7 years from founding (2015) to $7B+ valuation (2022), with hypergrowth during 2020-2021 as remote selling created urgent demand for call visibility"
    },
    leadInvestorRequirements: {
      investorParagraph: "The ideal lead investor for SignalFlow has deep conviction in the 'AI-native sales intelligence' thesis and believes that prediction will become the new battleground after recording. They should have pattern recognition from investing in competitive B2B SaaS markets where execution speed determined winners — companies like Datadog, Figma, or Notion that won through product excellence rather than incumbent distribution. Critical: they need to be comfortable with the competitive dynamics of Gong's mid-market expansion and believe a focused player can win segment ownership.",
      requirements: [
        "Track record investing in competitive B2B SaaS categories where a focused player beat well-funded incumbents",
        "Ability to help with enterprise sales motion — network of sales leaders, CROs, and RevOps executives for customer intros and hiring",
        "Understanding of ML/AI company dynamics — data flywheel effects, model improvement curves, and technical moat building",
        "Pattern recognition in 'category creation' vs. 'feature addition' — believing SignalFlow can own 'deal prediction' as Gong owns 'conversation intelligence'"
      ],
      dealbreakers: [
        "Belief that Gong will inevitably dominate mid-market — if investor thinks the outcome is predetermined, they won't be helpful during competitive battles",
        "Requirement for €100K+ MRR before investing — SignalFlow is at €32K and needs investors who believe in the team and market, not just metrics",
        "Expectation of consumer-style viral growth — B2B sales tools sell through relationships and demonstrations, not viral loops",
        "Discomfort with AI/ML infrastructure investment — building accurate prediction models requires significant upfront investment in data and engineering"
      ],
      wantToSee: [
        "Evidence of product-led growth potential — self-serve or bottom-up adoption signals that reduce CAC dependency",
        "Clear competitive win documentation — specific deals won against Gong/Clari with reasons and customer quotes",
        "Founder domain expertise validation — references from Salesforce and Datadog colleagues confirming depth of experience",
        "Customer concentration analysis — ensuring early traction isn't dependent on a small number of relationships"
      ]
    }
  },

  "Solution": {
    sectionScore: {
      score: 68,
      label: "Solid",
      percentile: "Top 35%",
      vcBenchmark: 62,
      whatThisTellsVC: "Working product with paying customers demonstrates execution ability. The prediction focus (vs. recording) is a clear differentiator. Integration depth creates switching costs.",
      fundabilityImpact: "Product risk is largely de-risked. Remaining questions are around scalability and competitive moat durability.",
      assessment: "at_bar"
    },
    vcInvestmentLogic: {
      decision: "INTERESTED",
      reasoning: "Live product with 28 customers and strong retention signals product-market fit. The 'prediction' vs. 'recording' positioning is smart differentiation. 89% accuracy claim is compelling if validated.",
      keyCondition: "Need to see evidence that accuracy holds across different customer segments and deal types.",
      assessment: "likely_to_explore"
    },
    actionPlan90Day: {
      objective: "Strengthen technical moat and validate accuracy claims",
      actions: [
        {
          action: "Publish third-party validation of prediction accuracy methodology",
          timeline: "Week 1-6",
          priority: "critical",
          metric: "Independent audit completed"
        },
        {
          action: "Launch customer data contribution program to accelerate model training",
          timeline: "Week 2-8",
          priority: "important",
          metric: "10+ customers contributing data"
        },
        {
          action: "File provisional patent on core prediction algorithms",
          timeline: "Week 4-12",
          priority: "important",
          metric: "Patent application filed"
        },
        {
          action: "Build customer-facing accuracy dashboard showing real-time model performance",
          timeline: "Week 6-12",
          priority: "nice-to-have",
          metric: "Dashboard live with 100% customer adoption"
        }
      ]
    },
    benchmarks: [
      {
        metric: "Time to First Value",
        yourValue: "5 minutes",
        benchmark: "Days to weeks",
        percentile: "Top 5%",
        insight: "Fast integration is a major competitive advantage in crowded sales tech."
      },
      {
        metric: "Product NPS",
        yourValue: "74",
        benchmark: "30-50",
        percentile: "Top 10%",
        insight: "Exceptional product satisfaction suggests strong word-of-mouth potential."
      }
    ],
    technicalDefensibility: {
      defensibilityScore: 65,
      proofPoints: [
        "2M+ historical deal outcomes in proprietary training dataset — accumulated through partnerships with sales analytics platforms and early customer integrations. This dataset includes structured outcome labels (won, lost, no-decision) with associated conversation patterns, email velocity metrics, and calendar signals",
        "12 production-grade integration connectors built and maintained — covering major CRMs (Salesforce, HubSpot, Pipedrive), email systems (Gmail, Outlook, Exchange), calendar platforms, and conversation intelligence tools (including Gong integration for complementary use cases)",
        "Proprietary 'why' prediction layer that identifies causal factors, not just probability — while competitors focus on 'what' and 'when,' SignalFlow surfaces the 3-5 specific factors driving each deal's trajectory (champion engagement, multi-threading depth, procurement timing, competitive mentions, etc.)",
        "89% prediction accuracy at 45-day horizon — validated across 28 customer deployments with combined 2,400+ deal outcomes. Accuracy improves to 91% for customers with 6+ months of historical data",
        "5-minute integration architecture — developed custom OAuth and API integration patterns that allow enterprise-grade security without enterprise-grade implementation complexity. Enables product-led growth motion uncommon in B2B sales tools"
      ],
      expectedProofs: [
        "Patent filings or trade secret documentation — VCs expect formal IP protection for AI companies. Provisional patents on core prediction methodology would significantly strengthen the moat narrative",
        "Independent validation of accuracy claims — third-party audit or academic partnership validating the 89% accuracy claim would de-risk the core product promise",
        "Published research, whitepapers, or technical blog posts — demonstrating thought leadership and creating talent attraction in competitive ML hiring market",
        "Security certifications (SOC 2 Type II, ISO 27001) — mid-market companies increasingly require compliance before procurement, especially for tools touching CRM and email data",
        "Customer data contribution agreements — formalizing how customer usage data improves the model creates explicit data moat with legal protection"
      ],
      gaps: [
        "No patents filed yet — the provisional patent strategy has been discussed but not executed. Window for novel claims may narrow as competitors file in adjacent areas",
        "Accuracy claims not independently validated — all accuracy metrics are internal. External validation would significantly strengthen investor confidence and customer sales process",
        "Data moat could theoretically be replicated with sufficient capital — Gong has 4,000+ customers generating training data. The moat is execution speed, not absolute defensibility",
        "CTO-dependent architecture — significant technical decisions still require CTO involvement. Need to build engineering team depth for scalability",
        "Limited published content — no research papers, technical blogs, or conference talks establishing thought leadership in deal prediction domain"
      ],
      vcEvaluation: "SignalFlow's technical defensibility is moderate — stronger than average for Seed but not yet 'durable moat' territory. The 2M deal outcomes dataset is genuinely valuable, and the prediction accuracy is impressive. However, the moat is primarily about execution velocity rather than defensible IP. Gong could build similar features with their existing data advantage; the question is whether they will, and how fast. My recommendation: accelerate patent filings in the next 30 days, pursue SOC 2 certification to unlock enterprise pipeline, and begin building public technical content to establish category authority. Score: 65/100 — at bar for Seed, but needs strengthening for Series A."
    },
    commoditizationTeardown: {
      // Correct field names matching TypeScript interface CommoditizationTeardown
      overallRisk: "Medium",
      features: [
        {
          feature: "CRM Integration Layer",
          commoditizationRisk: "High",
          timeToClone: "2-3 months for any competent engineering team",
          defensibility: "Commodity feature — Salesforce, HubSpot, and Pipedrive APIs are well-documented. Every sales tool has CRM integration. This is table stakes, not differentiation. SignalFlow's advantage is speed (5-minute setup) but this is easily replicable."
        },
        {
          feature: "Basic Deal Scoring (Win Probability)",
          commoditizationRisk: "High",
          timeToClone: "3-4 months with available ML frameworks",
          defensibility: "Low — basic deal scoring using standard features (deal size, stage, age, activity count) is available in Salesforce Einstein and HubSpot. SignalFlow's differentiation is NOT basic scoring but the 'why' layer. However, basic scoring alone is easily commoditized."
        },
        {
          feature: "Email and Calendar Pattern Analysis",
          commoditizationRisk: "Medium",
          timeToClone: "6-8 months including data pipeline development",
          defensibility: "Moderate — requires OAuth integrations, data normalization, and pattern extraction. People.ai and Outreach have similar capabilities. The moat is in how the data is used for prediction, not the data collection itself."
        },
        {
          feature: "Conversation Intelligence (Call Transcription + Analysis)",
          commoditizationRisk: "Medium-High",
          timeToClone: "4-6 months using commercial transcription APIs",
          defensibility: "Low for transcription (commodity via Deepgram, AssemblyAI). Higher for analysis patterns, but Gong has 5+ years of head start. SignalFlow wisely positions as 'complementary' rather than competing on this axis."
        },
        {
          feature: "Predictive 'Why' Analysis (Causal Factor Identification)",
          commoditizationRisk: "Low",
          timeToClone: "12-18 months for accurate replication",
          defensibility: "Strong — this is SignalFlow's core IP. Identifying the 3-5 specific factors driving deal outcomes (champion engagement level, multi-threading depth, competitive positioning, procurement timing signals) requires: (1) large labeled outcome dataset, (2) domain-specific feature engineering, (3) extensive iteration on what signals matter. Competitors would need to replicate not just the model, but the learnings from 2M+ deal outcomes."
        },
        {
          feature: "45-Day Advance Prediction with 89% Accuracy",
          commoditizationRisk: "Low",
          timeToClone: "18-24 months to match claimed accuracy",
          defensibility: "Strong — the accuracy claim at this prediction horizon is the core product promise. Achieving it requires: (1) sufficient training data, (2) correct feature engineering, (3) extensive backtesting and iteration. Even with resources, this takes time. The data network effect also means early movers compound their advantage."
        }
      ]
    },
    competitorBuildAnalysis: {
      couldBeBuilt: true,
      estimatedTime: "12-18 months for feature parity, longer for accuracy match",
      requiredResources: "10-15 senior engineers with ML expertise, $5M+ engineering investment, 12+ months of data accumulation, domain experts from sales operations",
      barriers: [
        "Training data accumulation takes time regardless of resources — Gong has more data, but their data is structured for conversation analysis, not deal outcome prediction. Restructuring would take 6-12 months minimum.",
        "Domain expertise in sales operations is specialized — you can't just hire ML engineers; you need people who deeply understand enterprise sales processes, forecasting methodologies, and buyer behavior patterns. SignalFlow's CEO's 8 years at Salesforce is hard to replicate.",
        "Gong/Clari would need to restructure core product architecture — their products are built around different primary use cases (conversation intelligence / revenue forecasting). Adding prediction as a bolt-on is easier than prediction-first architecture.",
        "Mid-market focus requires different GTM motion — enterprise sales companies don't naturally sell to mid-market. The product, pricing, and go-to-market all need adjustment, which creates organizational friction.",
        "Existing customers may resist product pivots — Gong's customers pay for conversation intelligence. Bundling prediction features may not align with existing buyer expectations and could create confusion."
      ],
      verdict: "SignalFlow's core technology is absolutely buildable by a well-funded competitor with 12-18 months of focused effort. The key question is not 'can they build it?' but 'will they prioritize it?' Gong is focused on enterprise expansion and potential IPO. Clari is focused on revenue platform positioning. Neither has announced mid-market + prediction focus. SignalFlow's window is 12-18 months to establish market position, customer density, and brand recognition. If they reach €150K+ MRR and 75+ customers in that window, they become acquisition target rather than competitive afterthought. The race is on."
    },
    caseStudy: {
      company: "Clari",
      sector: "Revenue Operations / Sales Forecasting",
      problem: "Sales leaders couldn't forecast revenue accurately, leading to missed quarterly targets, board surprises, and loss of credibility. The root cause: CRM data was garbage-in-garbage-out, reps didn't update deals accurately, and managers made gut-feel adjustments that were often wrong. The result: average forecast accuracy of 40-50%, meaning companies frequently missed or overshot targets by 20%+ — devastating for public companies and board relationships.",
      fix: "Built a revenue platform that uses AI to analyze pipeline independently of rep self-reporting. Clari captures signals from email, calendar, and activity patterns to 'call the call' on deals — identifying which opportunities are real vs. sandbagged or overstated. The platform provides CROs with a single source of truth for revenue forecasting, replacing spreadsheet chaos with automated, data-driven predictions. Key insight: don't ask reps to change behavior, observe their actual behavior and infer deal health.",
      outcome: "Scaled to $100M+ ARR and $2.6B valuation by owning the forecasting workflow. Clari is now embedded in the quarterly close process at hundreds of enterprises. Key customers include Cisco, Zoom, and Dropbox. The product has expanded from forecasting into full 'revenue platform' positioning, competing with Salesforce Revenue Cloud. Clari proved that sales leaders will pay significantly for forecast accuracy — it's not a nice-to-have when your job depends on hitting the number.",
      timeframe: "9 years from founding (2013) to unicorn status (2022). Growth accelerated dramatically during 2020-2021 as remote work made pipeline visibility even more critical. Raised $500M+ in total funding with most recent round at $2.6B valuation."
    },
    leadInvestorRequirements: {
      investorParagraph: "The ideal Solution-focused investor for SignalFlow has deep pattern recognition in developer tools, infrastructure, and AI/ML companies. They should appreciate that technical moats take time to build and compound with usage. Critical: they need to understand the difference between 'buildable' and 'will be built' — many things are technically possible that never get prioritized by incumbents. The best investors have seen focused players beat well-resourced incumbents through superior product and execution velocity.",
      requirements: [
        "Technical depth to evaluate ML architecture, training data quality, and model validation methodology — ability to distinguish marketing claims from genuine technical innovation",
        "B2B SaaS scaling experience with companies that grew from €30K to €500K+ MRR — understanding the operational challenges of this transition",
        "Patience for mid-market sales cycles (30-60 days) and willingness to accept slower-than-consumer growth rates",
        "Network of senior engineering and ML talent for hiring support — the next 12 months require significant technical team expansion",
        "Experience with companies that faced well-funded competitive threats and won through focus and execution"
      ],
      dealbreakers: [
        "Expecting consumer-like viral growth coefficients — B2B sales tools don't spread virally, they sell through relationships and demonstrations",
        "Discomfort with continued AI/ML infrastructure investment — SignalFlow needs to keep improving prediction accuracy, which requires ongoing engineering investment",
        "Pushing for immediate enterprise pivot — the mid-market focus is strategic, and premature upmarket movement could dilute the positioning",
        "Requirement for extensive patent portfolio before investing — patents are important but Seed-stage companies rarely have comprehensive IP protection"
      ],
      wantToSee: [
        "Clear path to enterprise tier for customers that grow — €50K+ ACV enterprise offering roadmap for Year 2",
        "Evidence of technical hiring ability — can the founders recruit strong ML engineers despite FAANG competition?",
        "Product roadmap for next 12 months with clear milestones — what features unlock the next growth phase?",
        "Competitive win documentation with customer quotes — proof that the 'prediction vs. recording' positioning resonates in sales process"
      ]
    }
  },

  "Market": {
    sectionScore: {
      score: 75,
      label: "Strong",
      percentile: "Top 20%",
      vcBenchmark: 65,
      whatThisTellsVC: "Clear bottom-up TAM methodology shows analytical rigor. The €2.5B market is large enough for venture returns. Mid-market focus is a credible wedge strategy.",
      fundabilityImpact: "Market size supports the investment thesis. VCs can model a path to €100M+ outcome.",
      assessment: "above_bar"
    },
    vcInvestmentLogic: {
      decision: "INTERESTED",
      reasoning: "Bottom-up TAM is credible and shows founder understands unit economics. Category (revenue intelligence) is validated by Gong/Clari outcomes. Timing is favorable with AI adoption surge.",
      keyCondition: "Need to see that mid-market is a durable position, not just a stepping stone that incumbents will eventually own.",
      assessment: "likely_to_explore"
    },
    actionPlan90Day: {
      objective: "Validate mid-market as defensible segment",
      actions: [
        {
          action: "Publish mid-market sales tech adoption report with original research",
          timeline: "Week 1-6",
          priority: "critical",
          metric: "Report with 200+ company survey"
        },
        {
          action: "Secure 3 analyst briefings (Gartner, Forrester, G2) on mid-market positioning",
          timeline: "Week 2-8",
          priority: "important",
          metric: "3 analyst relationships established"
        },
        {
          action: "Create mid-market customer case study series",
          timeline: "Week 4-12",
          priority: "important",
          metric: "5 detailed case studies published"
        }
      ]
    },
    benchmarks: [
      {
        metric: "TAM Methodology",
        yourValue: "Bottom-up",
        benchmark: "Often top-down only",
        percentile: "Top 15%",
        insight: "Bottom-up sizing is more credible and shows customer intimacy."
      },
      {
        metric: "Market Growth Rate",
        yourValue: "25% YoY",
        benchmark: "15-20% for mature categories",
        percentile: "Top 25%",
        insight: "Growing faster than overall B2B SaaS supports timing thesis."
      }
    ],
    bottomsUpTAM: {
      // Correct field names matching TypeScript interface BottomsUpTAM
      targetSegments: [
        { 
          segment: "Mid-market B2B companies (100-500 employees) with 20+ person sales teams in tech-forward industries (SaaS, fintech, healthtech)", 
          count: 85000, 
          acv: 14000, 
          tam: 1190000000 
        },
        { 
          segment: "Upper mid-market (500-1000 employees) with complex sales motions and RevOps maturity", 
          count: 45000, 
          acv: 18000, 
          tam: 810000000 
        },
        { 
          segment: "SMB tier (50-100 employees) with aggressive growth targets adopting enterprise tools early", 
          count: 50000, 
          acv: 10000, 
          tam: 500000000 
        }
      ],
      totalTAM: 2500000000,
      sam: 630000000,
      som: 112000000,
      methodology: "Bottom-up sizing based on verifiable data sources: LinkedIn Sales Navigator count of B2B companies by employee size, filtered for industries with documented sales tech adoption (SaaS: 40%, fintech: 35%, healthtech: 25% penetration rates). ACV validated against SignalFlow's current pricing (€14K average) and comparable companies (Gong SMB tier: $12K, Clari mid-market: $18K). SAM filtered to US + Western Europe where sales tech adoption is highest. SOM represents reachable accounts through current channels (product-led + outbound) with realistic conversion assumptions (2% of SAM in Year 1).",
      assumptions: [
        "Mid-market defined as 100-1000 employees with B2B revenue models — excludes retail, hospitality, and industries without complex sales motions",
        "Minimum 20-person sales team threshold — below this, deal prediction tools have limited value and budget is typically absent",
        "Average contract value of €14K — based on SignalFlow's current pricing with seat-based model (€1K/seat × 14 average seats)",
        "Tech-forward industries only for SAM — SaaS, fintech, healthtech, and professional services where RevOps maturity enables adoption",
        "US + Western Europe geographic focus — sales tech adoption in APAC and emerging markets is 3-5 years behind, limiting near-term SAM",
        "25% annual growth in addressable market — driven by mid-market companies adopting enterprise-grade sales tools"
      ]
    },
    marketReadinessIndex: {
      // Correct field names matching TypeScript interface MarketReadinessIndex
      overallScore: 78,
      regulatoryPressure: { score: 40, evidence: "No direct regulatory driver for deal prediction tools. However, economic pressure to optimize sales efficiency is intensifying — boards and investors are scrutinizing sales productivity metrics more closely post-2022 market correction. Some indirect pressure from revenue recognition regulations (ASC 606) requiring more accurate forecasting." },
      urgency: { score: 85, evidence: "85% of sales organizations surveyed plan to increase AI tool spending in 2025 (Gartner Sales Tech Survey). Economic conditions are creating urgency: CFOs are demanding forecast accuracy, and 'no decision' deals tie up resources. Mid-market companies feel this pressure acutely as they compete against well-resourced enterprise players." },
      willingnessToPay: { score: 82, evidence: "Revenue intelligence is a proven budget category — Gong, Clari, and Chorus have normalized €10-50K/year spending for sales intelligence. Mid-market willingness is validated by SignalFlow's €14K ACV with 28 paying customers and minimal pricing objections in sales process. Budget typically comes from RevOps, Sales Enablement, or CRO discretionary spending." },
      switchingFriction: { score: 65, evidence: "Moderate switching friction created by CRM integration depth and historical data accumulation. Customers with 6+ months of usage report 'stickiness' from accumulated predictions and learned patterns. However, no lock-in comparable to core CRM systems — need to build deeper integration moats." }
    },
    vcMarketNarrative: {
      // Correct field names matching TypeScript interface VCMarketNarrative
      pitchToIC: "Revenue intelligence is a proven, multi-billion dollar category — Gong and Clari have built $10B+ in combined enterprise value, validating that sales organizations will pay for better visibility. But here's the gap: both are enterprise-focused with 6-figure ACVs and 6-month implementations. The mid-market — 180,000 companies with 20+ person sales teams — is dramatically underserved. They have the same problems (67% of deals lost to 'no decision') but can't afford enterprise solutions. SignalFlow is building the category-defining solution for this segment: prediction-first (vs. recording-first), 5-minute implementation (vs. weeks), and €14K ACV (vs. €100K+). The team is exceptional — CEO with 8 years at Salesforce, CTO from Datadog's ML team with Stanford PhD. Early metrics are strong: €32K MRR, 15% MoM growth, 4.9x LTV:CAC, NPS 74. This is a Seed investment in a proven category with underserved segment and exceptional team.",
      marketTiming: "Optimal timing driven by three converging forces: (1) AI capabilities now accessible to mid-market budgets — GPT-4 class models enable prediction features that previously required enterprise ML teams, (2) Post-pandemic permanence of remote/hybrid selling creates sustained demand for digital visibility tools, (3) Economic pressure making every deal count — CFOs are demanding forecast accuracy, making 'no decision' losses unacceptable. The 2023-2024 market correction has actually helped: mid-market companies are investing in efficiency tools while pulling back on growth experiments.",
      whyNow: "Category timing is favorable for multiple reasons: (1) Gong's success validated the market but their enterprise focus left mid-market whitespace, (2) AI infrastructure costs have dropped 90% since 2021, enabling prediction features at mid-market price points, (3) RevOps as a function has matured in mid-market companies — they now have budget owners who understand and buy these tools, (4) Remote selling normalization means more data is being generated digitally, improving prediction model accuracy, (5) The 'conversation intelligence' phase is maturing — 'deal prediction' is the next wave, and first-mover advantage is still available."
    },
    caseStudy: {
      company: "HubSpot",
      sector: "Marketing & Sales Software",
      problem: "SMB and mid-market lacked access to enterprise-grade marketing automation",
      fix: "Built freemium CRM and marketing platform specifically designed for smaller companies",
      outcome: "Scaled to $2B+ revenue and $25B market cap by owning the underserved segment",
      timeframe: "15 years from founding to market leadership"
    },
    leadInvestorRequirements: {
      investorParagraph: "Lead investor should have conviction in mid-market B2B SaaS as a durable category, not just a stepping stone to enterprise.",
      requirements: [
        "Understanding of mid-market sales cycles",
        "Belief in SMB/mid-market as defensible segment"
      ],
      dealbreakers: [
        "Expectation that mid-market must lead to enterprise",
        "Concern about Gong's eventual mid-market push"
      ],
      wantToSee: [
        "Customer concentration analysis",
        "Evidence of organic growth in target segment"
      ]
    }
  },

  "Competition": {
    sectionScore: {
      score: 58,
      label: "Developing",
      percentile: "Top 45%",
      vcBenchmark: 62,
      whatThisTellsVC: "Competitive landscape is well-mapped, but moat articulation is underdeveloped. Gong's mid-market expansion is a real risk. Need clearer defensibility story.",
      fundabilityImpact: "Competitive risk is the primary concern. Needs better articulation of sustainable advantage.",
      assessment: "at_bar"
    },
    vcInvestmentLogic: {
      decision: "CAUTIOUS",
      reasoning: "Gong has $70M+ ARR, $7B valuation, and announced mid-market push. SignalFlow's differentiation (prediction vs. recording) is good but may not hold if Gong adds features. Need to see execution velocity.",
      keyCondition: "Evidence that prediction focus creates sustainable moat, not just temporary feature advantage.",
      assessment: "has_reservations"
    },
    actionPlan90Day: {
      objective: "Strengthen competitive moat articulation",
      actions: [
        {
          action: "Win 5 competitive deals against Gong with documented reasons",
          timeline: "Week 1-12",
          priority: "critical",
          metric: "5 documented competitive wins"
        },
        {
          action: "Develop 'Why SignalFlow Wins' competitive battlecard with data",
          timeline: "Week 2-4",
          priority: "important",
          metric: "Battlecard with win rate data"
        },
        {
          action: "Publish comparison content showing prediction vs. recording difference",
          timeline: "Week 4-8",
          priority: "important",
          metric: "Comparison page live with 1000+ visits"
        }
      ]
    },
    benchmarks: [
      {
        metric: "Competitive Win Rate",
        yourValue: "45%",
        benchmark: "30-40%",
        percentile: "Top 35%",
        insight: "Winning almost half of competitive deals is encouraging but needs larger sample."
      }
    ],
    competitorChessboard: {
      marketDynamics: "Revenue intelligence is a validated category with clear leaders (Gong, Clari) but fragmented mid-market. Window for establishing mid-market position is 18-24 months before incumbents fully activate.",
      competitors: [
        {
          name: "Gong",
          currentPosition: "Enterprise leader, $70M+ ARR, dominant brand",
          threatLevel: "High",
          likelyMoves: [
            "Launch 'Gong Essentials' tier at $99/seat",
            "Acquire mid-market player for distribution",
            "Add prediction features to core platform"
          ]
        },
        {
          name: "Clari",
          currentPosition: "Revenue platform leader, forecasting focus",
          threatLevel: "Medium",
          likelyMoves: [
            "Expand into deal coaching",
            "Push downmarket with simplified product",
            "Partner with CRMs for distribution"
          ]
        },
        {
          name: "People.ai",
          currentPosition: "Activity capture, weaker retention",
          threatLevel: "Low",
          likelyMoves: [
            "Likely acquisition target",
            "May pivot to platform strategy"
          ]
        }
      ]
    },
    moatDurability: {
      currentMoatStrength: "Medium",
      estimatedDuration: "12-18 months",
      erosionFactors: [
        "Gong can build prediction features with existing data",
        "Data advantage replicable with capital and time",
        "Mid-market positioning is a segment, not a moat"
      ],
      reinforcementOpportunities: [
        "Accelerate customer acquisition to build data density",
        "File patents on prediction methodology",
        "Build integration depth that creates switching costs"
      ]
    },
    caseStudy: {
      company: "Zoom",
      sector: "Video Conferencing",
      problem: "Enterprise video conferencing was dominated by Cisco/Microsoft but they ignored SMB/ease-of-use",
      fix: "Built radically simple video conferencing that 'just worked' for any business size",
      outcome: "Grew to $4B+ revenue by owning simplicity while incumbents focused on enterprise features",
      timeframe: "9 years from founding to pandemic-driven explosion"
    },
    leadInvestorRequirements: {
      investorParagraph: "Need investor comfortable with competitive markets who has seen smaller players win against incumbents through focus and execution.",
      requirements: [
        "Experience investing in competitive categories",
        "Belief that focus beats features"
      ],
      dealbreakers: [
        "Expectation of patent moat",
        "Concern that Gong will inevitably win mid-market"
      ],
      wantToSee: [
        "Competitive win data",
        "Customer switching stories",
        "Clear go-to-market differentiation"
      ]
    }
  },

  "Team": {
    sectionScore: {
      score: 78,
      label: "Strong",
      percentile: "Top 15%",
      vcBenchmark: 68,
      whatThisTellsVC: "CEO has 8 years at Salesforce with direct domain expertise. CTO led ML at Datadog and has PhD from Stanford. This is an exceptional founder-market fit.",
      fundabilityImpact: "Team significantly de-risks execution. VCs can bet on founders with confidence.",
      assessment: "above_bar"
    },
    vcInvestmentLogic: {
      decision: "INTERESTED",
      reasoning: "CEO knows enterprise sales inside-out from Salesforce tenure. CTO has built production ML systems at scale. Advisor network includes Gong board member. This team can execute.",
      keyCondition: "Need to see evidence that they can recruit strong talent and scale beyond founder-led execution.",
      assessment: "likely_to_explore"
    },
    actionPlan90Day: {
      objective: "Demonstrate team scaling ability",
      actions: [
        {
          action: "Hire VP Marketing with demand gen track record",
          timeline: "Week 1-8",
          priority: "critical",
          metric: "VP Marketing hired and ramping"
        },
        {
          action: "Close 2 additional senior engineering hires",
          timeline: "Week 1-10",
          priority: "critical",
          metric: "2 senior engineers onboarded"
        },
        {
          action: "Launch company engineering blog to attract talent",
          timeline: "Week 4-8",
          priority: "important",
          metric: "Blog live with 3+ posts, 500+ visitors"
        },
        {
          action: "Establish advisor relationship with 2 additional industry experts",
          timeline: "Week 6-12",
          priority: "nice-to-have",
          metric: "2 new advisors committed"
        }
      ]
    },
    benchmarks: [
      {
        metric: "Founder Domain Experience",
        yourValue: "8 years at Salesforce",
        benchmark: "2-3 years typically",
        percentile: "Top 5%",
        insight: "Deep domain expertise dramatically de-risks market understanding."
      },
      {
        metric: "Technical Pedigree",
        yourValue: "Datadog ML Lead, Stanford PhD",
        benchmark: "Strong engineering background",
        percentile: "Top 10%",
        insight: "CTO credibility is exceptional for AI company."
      }
    ],
    credibilityGapAnalysis: {
      overallCredibility: 82,
      currentSkills: [
        "Enterprise sales strategy (CEO - Salesforce)",
        "Production ML systems (CTO - Datadog)",
        "Team building (CEO - managed 45 people)",
        "Domain expertise in sales operations"
      ],
      expectedSkills: [
        "Growth/demand generation leadership",
        "Enterprise sales execution",
        "Board/investor management",
        "International expansion"
      ],
      gaps: [
        {
          skill: "VP Marketing / Demand Gen",
          severity: "high",
          mitigation: "Actively recruiting, advisor covering interim"
        },
        {
          skill: "Enterprise AE experience",
          severity: "medium",
          mitigation: "Hiring planned for Q2"
        }
      ]
    },
    caseStudy: {
      company: "Datadog",
      sector: "DevOps / Monitoring",
      problem: "Infrastructure monitoring was fragmented across multiple tools",
      fix: "Built unified observability platform with exceptional UX and developer focus",
      outcome: "Grew to $2B+ ARR and $35B market cap with disciplined execution",
      timeframe: "10 years from founding to category leadership"
    },
    leadInvestorRequirements: {
      investorParagraph: "Ideal investor can help with GTM scaling and provides access to sales leadership network for customer intros and hiring.",
      requirements: [
        "B2B SaaS operational experience",
        "Network in sales/RevOps community"
      ],
      dealbreakers: [
        "Micromanagement style",
        "Pushing for premature enterprise pivot"
      ],
      wantToSee: [
        "References from Salesforce/Datadog colleagues",
        "Evidence of team culture and retention"
      ]
    }
  },

  "Business Model": {
    sectionScore: {
      score: 65,
      label: "Solid",
      percentile: "Top 30%",
      vcBenchmark: 62,
      whatThisTellsVC: "Unit economics are healthy (4.9x LTV:CAC, 82% gross margin). Pricing is clear. Model is proven SaaS with predictable revenue.",
      fundabilityImpact: "Business model risk is low. Focus is on scaling what works.",
      assessment: "at_bar"
    },
    vcInvestmentLogic: {
      decision: "INTERESTED",
      reasoning: "Unit economics are solid: 4.9x LTV:CAC exceeds 3x benchmark, 7-month payback is efficient, 82% gross margin is healthy for SaaS. Model is straightforward seat-based SaaS.",
      keyCondition: "Need to see these metrics hold as customer base diversifies beyond early adopters.",
      assessment: "likely_to_explore"
    },
    actionPlan90Day: {
      objective: "Validate unit economics at scale",
      actions: [
        {
          action: "Implement cohort-based CAC and LTV tracking",
          timeline: "Week 1-3",
          priority: "critical",
          metric: "Dashboard live with 6-month cohort data"
        },
        {
          action: "Launch annual contract push to improve cash efficiency",
          timeline: "Week 2-6",
          priority: "important",
          metric: "60% of new deals on annual contracts"
        },
        {
          action: "Test enterprise tier pricing with 3 pilot customers",
          timeline: "Week 4-10",
          priority: "important",
          metric: "3 enterprise pilots at €50K+ ACV"
        },
        {
          action: "Build expansion playbook for seat/team upsells",
          timeline: "Week 6-12",
          priority: "nice-to-have",
          metric: "108% NRR maintained or improved"
        }
      ]
    },
    benchmarks: [
      {
        metric: "LTV:CAC Ratio",
        yourValue: "4.9x",
        benchmark: "3x minimum",
        percentile: "Top 20%",
        insight: "Strong unit economics suggest scalable model."
      },
      {
        metric: "Gross Margin",
        yourValue: "82%",
        benchmark: "70-80%",
        percentile: "Top 25%",
        insight: "Healthy margin leaves room for investment in growth."
      },
      {
        metric: "Payback Period",
        yourValue: "7 months",
        benchmark: "12-18 months",
        percentile: "Top 15%",
        insight: "Fast payback enables aggressive customer acquisition."
      }
    ],
    modelStressTest: {
      overallResilience: "Medium-High",
      scenarios: [
        {
          scenario: "Churn doubles to 4.2%",
          impact: "LTV drops to €21K, LTV:CAC falls to 2.5x",
          survivalProbability: "85%",
          mitigations: ["Invest in customer success", "Build annual contract base"]
        },
        {
          scenario: "CAC increases 50% due to competition",
          impact: "Payback extends to 10.5 months, efficiency pressure",
          survivalProbability: "80%",
          mitigations: ["Invest in product-led growth", "Build referral channel"]
        },
        {
          scenario: "Price pressure forces 30% ACV reduction",
          impact: "Need 40% more customers for same ARR",
          survivalProbability: "70%",
          mitigations: ["Differentiate on value, not price", "Add premium tier"]
        }
      ]
    },
    caseStudy: {
      company: "Pipedrive",
      sector: "CRM / Sales Software",
      problem: "SMB sales teams needed simple, affordable CRM",
      fix: "Built intuitive CRM with aggressive pricing and self-serve motion",
      outcome: "Scaled to $100M+ ARR before Vista acquisition at $1.5B",
      timeframe: "10 years from founding to successful exit"
    },
    leadInvestorRequirements: {
      investorParagraph: "Need investor who understands SaaS unit economics and can help optimize growth efficiency.",
      requirements: [
        "SaaS metrics fluency",
        "Experience with mid-market pricing"
      ],
      dealbreakers: [
        "Pressure to go downmarket to SMB",
        "Expectation of freemium model"
      ],
      wantToSee: [
        "Cohort-level unit economics",
        "Customer concentration analysis"
      ]
    }
  },

  "Traction": {
    sectionScore: {
      score: 62,
      label: "Solid",
      percentile: "Top 35%",
      vcBenchmark: 58,
      whatThisTellsVC: "€32K MRR with 28 customers shows product-market fit. 15% MoM growth is healthy. 94% cohort retention and NPS 74 are strong engagement signals.",
      fundabilityImpact: "Traction reduces market risk. Ready for acceleration with capital.",
      assessment: "at_bar"
    },
    vcInvestmentLogic: {
      decision: "INTERESTED",
      reasoning: "€32K MRR growing 15% MoM is solid proof of demand. 28 customers with 94% retention suggests real product-market fit. NPS 74 indicates customers love the product.",
      keyCondition: "Need to see growth continue as sales motion moves beyond founder-led.",
      assessment: "likely_to_explore"
    },
    actionPlan90Day: {
      objective: "Scale traction beyond founder-led sales",
      actions: [
        {
          action: "Hire first 2 AEs and establish sales playbook",
          timeline: "Week 1-6",
          priority: "critical",
          metric: "2 AEs hired and ramped"
        },
        {
          action: "Achieve €50K MRR milestone",
          timeline: "Week 1-12",
          priority: "critical",
          metric: "€50K MRR by end of quarter"
        },
        {
          action: "Launch customer referral program",
          timeline: "Week 4-8",
          priority: "important",
          metric: "5 referral customers acquired"
        },
        {
          action: "Secure 2 case studies with named logos",
          timeline: "Week 6-12",
          priority: "important",
          metric: "2 named case studies published"
        }
      ]
    },
    benchmarks: [
      {
        metric: "MRR Growth Rate",
        yourValue: "15% MoM",
        benchmark: "10-15%",
        percentile: "Top 30%",
        insight: "Growth rate is solid but not exceptional. Acceleration expected with capital."
      },
      {
        metric: "Net Revenue Retention",
        yourValue: "108%",
        benchmark: "100-110%",
        percentile: "Top 35%",
        insight: "Positive NRR shows expansion revenue offsetting churn."
      },
      {
        metric: "NPS Score",
        yourValue: "74",
        benchmark: "30-50",
        percentile: "Top 10%",
        insight: "Exceptional customer satisfaction suggests word-of-mouth potential."
      }
    ],
    tractionDepthTest: {
      tractionType: "Revenue",
      sustainabilityScore: 75,
      redFlags: [
        "Small customer base (28) limits pattern confidence",
        "Founder-led sales may not scale"
      ],
      positiveSignals: [
        "8 consecutive months of 15%+ growth",
        "High retention (94% at 6 months)",
        "Strong NPS (74) indicates organic growth potential"
      ]
    },
    caseStudy: {
      company: "Notion",
      sector: "Productivity Software",
      problem: "Teams needed flexible workspace that combined docs, wikis, and databases",
      fix: "Built all-in-one workspace with viral collaboration features",
      outcome: "Grew to $10B+ valuation with strong product-led growth",
      timeframe: "5 years from relaunch to category leadership"
    },
    leadInvestorRequirements: {
      investorParagraph: "Need investor who can help scale go-to-market and has pattern recognition for B2B growth inflection points.",
      requirements: [
        "GTM scaling expertise",
        "Sales team building experience"
      ],
      dealbreakers: [
        "Expectation of hockey-stick growth immediately",
        "Pushing for premature international expansion"
      ],
      wantToSee: [
        "Sales pipeline and conversion metrics",
        "Customer acquisition channel mix"
      ]
    }
  },

  "Vision": {
    sectionScore: {
      score: 72,
      label: "Strong",
      percentile: "Top 25%",
      vcBenchmark: 65,
      whatThisTellsVC: "Clear path from €32K MRR to €150K MRR within 18 months. Realistic milestones with defined metrics. Exit scenarios are well-mapped.",
      fundabilityImpact: "Vision supports return expectations. Path to Series A is credible.",
      assessment: "above_bar"
    },
    vcInvestmentLogic: {
      decision: "INTERESTED",
      reasoning: "Clear 18-month plan to Series A milestones. €2M raise with specific use of funds. Exit scenarios through strategic acquisition or IPO path are realistic.",
      keyCondition: "Execution on hiring plan and €150K MRR target within stated timeline.",
      assessment: "likely_to_explore"
    },
    actionPlan90Day: {
      objective: "De-risk Series A path",
      actions: [
        {
          action: "Define Series A investor target list and begin relationship building",
          timeline: "Week 1-4",
          priority: "important",
          metric: "20 target investors identified, 5 intros made"
        },
        {
          action: "Create board deck template and monthly reporting cadence",
          timeline: "Week 2-4",
          priority: "important",
          metric: "Reporting framework established"
        },
        {
          action: "Map strategic acquirer landscape and begin ecosystem positioning",
          timeline: "Week 6-12",
          priority: "nice-to-have",
          metric: "10 strategic acquirers identified"
        }
      ]
    },
    benchmarks: [
      {
        metric: "Use of Funds Clarity",
        yourValue: "Detailed breakdown",
        benchmark: "Often vague",
        percentile: "Top 20%",
        insight: "Specific allocation shows operational maturity."
      },
      {
        metric: "Series A Milestone Definition",
        yourValue: "€150K MRR, 75 customers",
        benchmark: "Often undefined",
        percentile: "Top 25%",
        insight: "Clear milestones help with accountability and investor confidence."
      }
    ],
    vcMilestoneMap: {
      milestones: [
        {
          timeframe: "6 months",
          milestone: "€75K MRR, 45 customers, VP Marketing hired",
          status: "upcoming",
          fundingImplication: "On track for Series A preparation"
        },
        {
          timeframe: "12 months",
          milestone: "€120K MRR, 60 customers, enterprise tier launched",
          status: "upcoming",
          fundingImplication: "Series A ready, begin process"
        },
        {
          timeframe: "18 months",
          milestone: "€150K MRR, 75 customers, US presence established",
          status: "upcoming",
          fundingImplication: "Series A closed, scaling mode"
        }
      ],
      criticalPath: [
        "Hire VP Marketing by Month 2",
        "First AE quota attainment by Month 4",
        "Enterprise tier beta by Month 6",
        "US customer acquisition by Month 10"
      ]
    },
    exitNarrative: {
      potentialAcquirers: [
        "Salesforce (CRM integration, sales AI strategy)",
        "HubSpot (mid-market expansion)",
        "Microsoft (Dynamics integration)",
        "ZoomInfo (revenue intelligence platform)",
        "Private equity consolidation play"
      ],
      strategicValue: "AI-powered deal intelligence represents a strategic capability that every major CRM and sales platform will want to offer. Acquisition provides faster path than internal development.",
      comparableExits: [
        "Chorus.ai acquired by ZoomInfo for $575M",
        "InsideSales.com acquired by Aurea for ~$100M"
      ],
      pathToExit: "Most likely path: strategic acquisition at Series B stage (€500M-1B) or IPO preparation at Series C+ with €100M+ ARR"
    },
    scenarioPlanning: {
      bestCase: {
        probability: 25,
        outcome: "Category leader in mid-market deal intelligence. €200M+ ARR, IPO path or $2B+ strategic acquisition.",
        fundraisingImplication: "Series D+ or strategic exit"
      },
      baseCase: {
        probability: 50,
        outcome: "Strong mid-market player. €50M+ ARR, acquired by CRM platform for $500M-1B.",
        fundraisingImplication: "Series B/C with strategic exit"
      },
      downside: {
        probability: 25,
        outcome: "Competitive pressure limits growth. Acquired for team/technology at $50-100M.",
        fundraisingImplication: "Bridge or acquisition"
      }
    },
    caseStudy: {
      company: "Outreach",
      sector: "Sales Engagement",
      problem: "Sales reps needed systematic approach to multi-channel prospecting",
      fix: "Built sales engagement platform automating sequences across email, phone, and social",
      outcome: "Grew to $300M+ ARR and $4B+ valuation by owning sales execution workflow",
      timeframe: "8 years from founding to near-IPO status"
    },
    leadInvestorRequirements: {
      investorParagraph: "Need investor with long-term perspective who has helped B2B companies navigate from Seed to Series B and beyond.",
      requirements: [
        "Track record of multi-stage support",
        "Exit experience in B2B SaaS"
      ],
      dealbreakers: [
        "Short-term exit pressure",
        "Preference for consumer-style returns"
      ],
      wantToSee: [
        "Clear board composition plan",
        "Scenario planning documentation"
      ]
    }
  }
};

// Helper to get tools for a specific section
export const getSignalFlowToolsForSection = (sectionTitle: string) => {
  return DEMO_SECTION_TOOLS[sectionTitle];
};
