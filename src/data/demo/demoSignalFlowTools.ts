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
      marketDynamics: "The revenue intelligence market is experiencing rapid consolidation as larger players acquire point solutions to build comprehensive platforms. Gong's $7.25B valuation and Clari's $2.6B raise have validated the category, creating both validation and competitive pressure. The market is evolving from 'conversation intelligence' (recording) toward 'revenue intelligence' (prediction and optimization). SignalFlow's mid-market focus is strategic — enterprise is crowded, but mid-market remains underserved by purpose-built tools. Key dynamic: incumbents are distracted by enterprise expansion and potential IPO preparation, creating a 12-18 month window for focused mid-market players.",
      competitors: [
        {
          name: "Gong",
          currentPosition: "Market leader in conversation intelligence with $7.25B valuation. 4,000+ customers, primarily enterprise. Recently announced mid-market push with simplified pricing. Massive data advantage from 5+ years of call recordings across thousands of companies. Brand recognition is exceptional — 'Gong' has become synonymous with conversation intelligence.",
          threatLevel: "High",
          likelyMoves: [
            "Aggressive mid-market expansion with simplified pricing tier ($500-800/seat vs. current $1,200+) — likely to launch within 6-9 months based on job postings and market signals",
            "Prediction features leveraging existing conversation data — already announced 'Gong Forecast' product that uses call patterns to predict deal outcomes",
            "Platform expansion through acquisitions of point solutions in adjacent categories (coaching, prospecting, forecasting)",
            "International expansion, particularly in EMEA where SignalFlow has early foothold",
            "Potential IPO preparation in 2024-2025 which may actually distract from competitive execution and create opportunity window"
          ]
        },
        {
          name: "Clari",
          currentPosition: "Revenue platform leader focused on forecasting accuracy. $2.6B valuation with strong enterprise traction. Positioning as 'revenue platform' rather than point solution. Key differentiator is forecast accuracy and pipeline management. Less focus on conversation intelligence, more on CRM data analysis and revenue operations workflow.",
          threatLevel: "Medium",
          likelyMoves: [
            "Expand into deal coaching and rep performance optimization — natural extension of forecasting capabilities",
            "Push downmarket with simplified, lower-ACV product targeting upper mid-market (500-2000 employees)",
            "Deepen CRM partnerships, particularly with Salesforce and HubSpot, for distribution and data access advantages",
            "Potential acquisition of conversation intelligence capabilities to compete more directly with Gong",
            "Continue platform positioning with RevOps workflow automation"
          ]
        },
        {
          name: "People.ai",
          currentPosition: "Activity capture and analytics platform. Weaker retention and slower growth compared to Gong/Clari. Struggled to differentiate in crowded market. Valuable activity data but unclear product positioning. Recent leadership changes suggest strategic uncertainty.",
          threatLevel: "Low",
          likelyMoves: [
            "Likely acquisition target for larger player (Salesforce, Microsoft, or private equity roll-up)",
            "May pivot to AI-first positioning to differentiate from Gong/Clari",
            "Could pursue partnership strategy rather than direct competition",
            "Possible downmarket pivot if enterprise growth continues to struggle"
          ]
        },
        {
          name: "Salesforce Einstein",
          currentPosition: "Built-in AI within world's largest CRM. Limited adoption despite massive distribution advantage. AI capabilities are improving but still perceived as lagging purpose-built tools. Advantages: zero incremental cost for existing customers, tight CRM integration.",
          threatLevel: "Medium",
          likelyMoves: [
            "Aggressive AI feature additions with each Salesforce release — prediction and coaching features likely to improve significantly",
            "Bundling AI features into existing licenses to undercut third-party tools on price",
            "Acquisitions of AI-native sales tools to accelerate capabilities",
            "Integration with Slack for workflow automation and AI-assisted coaching"
          ]
        },
        {
          name: "HubSpot Sales Hub",
          currentPosition: "Strong mid-market CRM with growing sales intelligence features. Natural competitor for SignalFlow's target segment. AI features are basic compared to purpose-built tools but improving rapidly. Advantage: existing customer relationships and trust.",
          threatLevel: "Medium",
          likelyMoves: [
            "Enhanced forecasting and prediction features within Sales Hub",
            "AI coaching tools leveraging conversation and email data",
            "Acquisitions of point solutions to accelerate AI capabilities",
            "Aggressive pricing for bundled AI features"
          ]
        }
      ]
    },
    moatDurability: {
      currentMoatStrength: "Medium",
      estimatedDuration: "12-18 months before significant competitive pressure",
      erosionFactors: [
        "Gong's mid-market push could compress differentiation window — they have announced simplified pricing and are hiring mid-market sales reps. Timeline: 6-12 months to serious competitive pressure",
        "Data advantage is replicable with capital and time — a well-funded competitor could accumulate training data in 18-24 months through aggressive customer acquisition and data partnerships",
        "Mid-market positioning is a segment focus, not a structural moat — incumbents can target this segment whenever they choose to prioritize it",
        "Integration advantages are temporary — as APIs become standardized, integration speed advantages diminish",
        "Prediction accuracy claims could be matched by competitors with similar data volume and ML talent"
      ],
      reinforcementOpportunities: [
        "Accelerate customer acquisition to build data density advantage — every customer adds to training data, creating compounding returns. Target: 75 customers by Month 12",
        "File provisional patents on core prediction methodology — establish IP protection before competitors file in adjacent areas. Timeline: 30 days for provisional, 12 months for full application",
        "Build integration depth and workflow embedding that creates switching costs — become embedded in customer sales processes, not just analytics layer",
        "Establish thought leadership through research publications and industry speaking — own the 'deal prediction' narrative before larger competitors claim it",
        "Create customer community and ecosystem effects — build network effects through customer data sharing and benchmarking programs",
        "Develop vertical-specific models that require specialized expertise — healthcare sales, financial services, etc. create domain-specific moats"
      ]
    },
    caseStudy: {
      company: "Zoom",
      sector: "Video Conferencing",
      problem: "Enterprise video conferencing was dominated by Cisco WebEx and Microsoft Skype for Business, but these tools were designed for IT procurement, not end-user experience. Small and mid-size businesses were largely ignored — forced to use consumer tools like Google Hangouts or expensive enterprise solutions. The core user experience problems were reliability (calls dropped, audio quality issues), complexity (joining required software downloads and plugins), and feature bloat (enterprise features added friction for simple use cases).",
      fix: "Built radically simple video conferencing that 'just worked' — no downloads required, reliable connections, and intuitive interface. Key insights: (1) optimize for the 80% use case (simple meetings) rather than enterprise edge cases, (2) freemium model enabled bottom-up adoption that bypassed IT procurement, (3) obsessive focus on reliability created word-of-mouth growth. Zoom didn't try to out-feature WebEx; they out-simplified it.",
      outcome: "Grew from $0 to $4B+ revenue, becoming the dominant video platform. When COVID-19 hit, Zoom's simplicity and reliability made it the default choice, growing from 10M to 300M daily meeting participants in 3 months. Market cap reached $150B+ at peak. Cisco and Microsoft were forced to completely redesign their products to compete, but Zoom had already established brand dominance. 'Zoom' became a verb.",
      timeframe: "9 years from founding (2011) to pandemic-driven explosion (2020). The first 7 years were steady growth in SMB and mid-market. The simplicity advantage became decisive when mass adoption was required in 2020. Key lesson: focus on underserved segment (SMB/mid-market) and nail the user experience before incumbents prioritize it."
    },
    leadInvestorRequirements: {
      investorParagraph: "The ideal lead investor for SignalFlow's competitive positioning has deep experience in competitive B2B SaaS markets where focused challengers beat well-resourced incumbents. They should have pattern recognition from companies like Zoom (vs. Cisco), Slack (vs. Microsoft), or Datadog (vs. New Relic) — situations where product focus and execution speed trumped incumbent distribution. Critical: they need to be genuinely comfortable with competitive dynamics rather than seeking 'blue ocean' opportunities. They should believe that SignalFlow's mid-market focus creates a defensible position, not just a temporary hiding place from enterprise competitors.",
      requirements: [
        "Demonstrated track record investing in competitive B2B markets where focused challengers won against well-funded incumbents — not just in retrospect, but active investments during competitive uncertainty",
        "Belief that focus beats features — conviction that a purpose-built mid-market solution can defend against feature-rich enterprise tools moving downmarket",
        "Ability to help with competitive positioning and messaging — experience shaping narrative in crowded markets",
        "Network of sales leaders and CROs for customer introductions and competitive intelligence gathering",
        "Patience for B2B sales cycles (30-60 days) and understanding that market position takes years to establish",
        "Willingness to invest in go-to-market at scale once product-market fit is validated"
      ],
      dealbreakers: [
        "Expectation of patent-based moat — SignalFlow's moat is execution and data, not defensible IP. Investors seeking patent protection as primary moat won't be aligned",
        "Conviction that Gong will inevitably dominate mid-market — if investor believes the outcome is predetermined, they won't be helpful during competitive battles",
        "Preference for 'blue ocean' markets — competitive markets require different investor temperament and support patterns",
        "Discomfort with long-term positioning investments — building brand and category authority requires sustained investment that may not show immediate ROI",
        "Expectation of immediate market leadership — building defensible position takes 3-5 years, not 12 months"
      ],
      wantToSee: [
        "Documented competitive wins with customer quotes explaining why they chose SignalFlow over Gong/Clari — specific proof that the differentiation resonates in sales process",
        "Customer switching stories from incumbent tools — evidence that customers see enough value to justify switching costs",
        "Clear go-to-market differentiation beyond product features — how does SignalFlow reach customers differently than Gong/Clari?",
        "Win/loss analysis documentation showing trends over time — improving win rates against specific competitors",
        "Customer testimonials specifically addressing competitive comparison — NPS and retention are good, but competitive positioning requires direct comparison feedback"
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
        "Enterprise sales strategy and execution — CEO spent 8 years at Salesforce, most recently as Senior Director of Sales Strategy. Led teams of 45+ across strategic initiatives. Deep understanding of how enterprise sales organizations think about tooling, forecasting, and pipeline management",
        "Production ML systems at scale — CTO led ML infrastructure team at Datadog, building real-time anomaly detection serving 20,000+ customers. Stanford PhD in machine learning with publications in top venues. Experience building systems that balance accuracy with latency requirements",
        "Team building and engineering culture — CEO built and retained teams through Salesforce's rapid growth period. CTO hired 25+ engineers at Datadog and maintained strong engineering culture. Both founders have high Glassdoor ratings from previous direct reports",
        "Domain expertise in sales operations and revenue operations — combined 15+ years working with sales leaders, understanding their workflows, pain points, and decision-making processes. This is extremely rare technical founding team",
        "Startup execution velocity — despite coming from large companies, both founders have demonstrated ability to operate at startup pace. Shipped MVP in 4 months, achieved paying customers in 6 months"
      ],
      expectedSkills: [
        "Growth marketing and demand generation leadership — currently relying on founder-led sales and word-of-mouth. Need dedicated growth leadership to scale customer acquisition beyond €50K MRR",
        "Enterprise sales execution at scale — while CEO understands enterprise sales strategy, executing enterprise deals requires specialized AE talent with track record of €50K+ ACV deals",
        "Board and investor management — neither founder has board experience. Will need to develop investor communication, board meeting execution, and governance practices",
        "International expansion — European market is different from US. Will need local knowledge for US expansion and eventual APAC entry",
        "Public company experience — for eventual IPO path, will need executives with public company finance and compliance experience"
      ],
      gaps: [
        {
          skill: "VP Marketing / Demand Gen",
          severity: "high",
          mitigation: "Active search with 3 finalist candidates. Current advisor (former Gong VP Marketing) covering critical decisions interim. Expect hire within 60 days. This is the most critical gap — without demand gen, growth will remain founder-constrained."
        },
        {
          skill: "Enterprise AE experience",
          severity: "medium",
          mitigation: "Hiring planned for Q2 after seed raise closes. Have identified strong candidates through CEO's Salesforce network. Initial focus on 2 AEs to test scalability of sales motion before larger investment."
        },
        {
          skill: "Customer Success leadership",
          severity: "medium",
          mitigation: "Currently handled by founders. Manageable at 28 customers but will break at 50+. Plan to hire CS lead by Month 6 post-raise."
        },
        {
          skill: "Financial planning and analysis",
          severity: "low",
          mitigation: "Using fractional CFO for now. Will hire full-time finance leader at Series A stage when complexity requires it."
        }
      ]
    },
    caseStudy: {
      company: "Datadog",
      sector: "DevOps / Observability",
      problem: "Infrastructure monitoring was fragmented across multiple point solutions — one tool for metrics, another for logs, another for APM, another for security. DevOps teams were drowning in tool sprawl, context switching, and alert fatigue. The bigger problem: these tools didn't talk to each other, making root cause analysis painfully slow. When systems failed, engineers spent hours correlating data across dashboards instead of fixing problems.",
      fix: "Built unified observability platform that combined metrics, traces, and logs in a single interface with consistent query language. Key insight: don't just aggregate data, correlate it automatically so engineers can click from alert → trace → log → root cause in seconds. Second insight: focus obsessively on developer experience — Datadog's UI became the industry benchmark for usability. Third insight: embrace cloud-native architecture before it was mainstream, betting correctly on AWS/Azure/GCP dominance.",
      outcome: "Grew to $2B+ ARR and $35B+ market cap, becoming the dominant player in cloud monitoring. Datadog's market cap exceeded the combined value of legacy competitors (New Relic, Splunk, AppDynamics). The company went public in 2019 and has consistently beaten expectations with 80%+ growth rates. Created a new category ('observability') and forced every competitor to rebuild their products around unified platform concepts.",
      timeframe: "10 years from founding (2010) to category leadership (2020). The first 5 years were steady product development and enterprise sales building. Growth accelerated dramatically 2017-2020 as cloud migration reached mainstream enterprise adoption. Key lesson: be early to a secular trend (cloud), focus on developer experience, and build platform before competitors realize they need to."
    },
    leadInvestorRequirements: {
      investorParagraph: "The ideal lead investor for SignalFlow's team thesis deeply understands founder-market fit and has pattern recognition for exceptional technical founding teams entering enterprise software. They should have experience with companies where domain expertise was the key differentiator — founders who understood their customers' problems viscerally because they lived them. Critical: they need to be able to help with GTM scaling, not just provide capital. The next 18 months require significant hiring support, customer introductions, and operational guidance as the company scales from founder-led sales to scalable go-to-market motion.",
      requirements: [
        "Deep B2B SaaS operational experience — not just board seats, but hands-on experience scaling GTM from €30K to €500K+ MRR. Ability to provide practical advice on sales team structure, compensation, and process",
        "Strong network in sales and RevOps leadership community — ability to make customer introductions to CROs, VPs of Sales, and Heads of RevOps at target companies",
        "Track record of helping technical founders become effective executives — coaching on board management, investor communication, and leadership development",
        "Patience with B2B sales cycles and understanding that enterprise-grade products require time to mature",
        "Willingness to engage deeply with portfolio companies — not just quarterly board meetings, but accessible for ad-hoc strategic discussions"
      ],
      dealbreakers: [
        "Micromanagement style or excessive board control — founders need autonomy to execute while learning from investor experience",
        "Pushing for premature enterprise pivot — the mid-market focus is strategic, not a limitation. Investors who don't believe in segment ownership won't be aligned",
        "Lack of time availability — SignalFlow needs engaged investors, not prestigious but absent board members",
        "Expectation of immediate hyper-growth — B2B SaaS at this stage grows 15-25% MoM, not 50%+. Investors expecting consumer-style growth curves will be disappointed",
        "Preference for founder replacement — SignalFlow's founders are exceptional and should be supported, not replaced with 'professional management'"
      ],
      wantToSee: [
        "References from Salesforce and Datadog colleagues validating founders' claims about experience and reputation — actual conversations with former colleagues and direct reports",
        "Evidence of team culture and retention — employee satisfaction, tenure, and exit interview feedback from previous roles",
        "Demonstration of hiring ability — can founders attract and close strong candidates despite startup compensation constraints?",
        "Founders' self-awareness about gaps and willingness to hire for weaknesses — humility about what they don't know",
        "Board member references from previous investments — how do founders and investors interact during challenging periods?"
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
          scenario: "Monthly churn doubles from 2.1% to 4.2%",
          impact: "LTV drops from €41K to €21K, bringing LTV:CAC ratio from 4.9x down to 2.5x — below the 3x minimum that most VCs require for investment. This would fundamentally change the unit economics story and require either significant CAC reduction or pricing increases to restore investment thesis viability.",
          survivalProbability: "85%",
          mitigations: [
            "Invest heavily in customer success before churn becomes visible — hire CS lead, implement QBRs, build health scoring dashboard",
            "Push aggressively for annual contracts (currently 40% of customers) to reduce churn exposure and improve cash position",
            "Identify churn leading indicators early — usage decline, support ticket patterns, champion turnover — and intervene proactively",
            "Build switching costs through deeper integration and workflow embedding"
          ]
        },
        {
          scenario: "CAC increases 50% due to competitive pressure",
          impact: "Payback period extends from 7 months to 10.5 months, still acceptable but approaching concerning territory. If combined with growth plateau, would create efficiency concerns. Marketing spend ROI would decline, requiring either more capital or slower growth to maintain unit economics.",
          survivalProbability: "80%",
          mitigations: [
            "Invest in product-led growth motion to reduce sales-assisted CAC dependency — self-serve trial, in-product virality, usage-based expansion",
            "Build customer referral program to create lower-CAC channel — target 20%+ of new customers from referrals by Month 12",
            "Focus on content marketing and thought leadership to reduce paid acquisition dependency",
            "Improve win rates through better sales enablement and competitive positioning"
          ]
        },
        {
          scenario: "Competitive pressure forces 30% ACV reduction",
          impact: "Need 40% more customers to achieve same ARR targets. Sales team productivity pressure intensifies. Gross margin compression if infrastructure costs don't scale proportionally. Would require either faster customer acquisition or longer runway to reach Series A milestones.",
          survivalProbability: "70%",
          mitigations: [
            "Differentiate on value, not price — avoid race to bottom by emphasizing prediction accuracy and ROI demonstration",
            "Add premium enterprise tier for larger deployments at €50K+ ACV to offset mid-market price pressure",
            "Pursue product-led growth to reach customers who self-select on price earlier in funnel",
            "Build vertical-specific value propositions that justify premium pricing in specific industries"
          ]
        },
        {
          scenario: "Key customers (top 3) churn simultaneously",
          impact: "Revenue concentration risk: top 3 customers represent 22% of MRR. Simultaneous loss would drop MRR from €32K to €25K, creating significant optics problem for fundraising. Would also lose reference customers for sales process.",
          survivalProbability: "90%",
          mitigations: [
            "Diversify customer base aggressively — no single customer should exceed 10% of MRR by Month 12",
            "Build executive relationships at key accounts beyond primary buyer — multi-threading reduces single-point-of-failure risk",
            "Lock in annual contracts with top customers, ideally with price protection for early adopter loyalty",
            "Monitor champion turnover at key accounts and proactively engage new stakeholders"
          ]
        },
        {
          scenario: "Gong launches directly competitive mid-market product",
          impact: "Sales cycles would extend as prospects demand competitive bake-offs. Win rates could decline 20-30% initially. Would need to accelerate differentiation and potentially adjust pricing strategy. Marketing spend would need to increase to maintain share of voice.",
          survivalProbability: "75%",
          mitigations: [
            "Accelerate patent filings to create IP defensibility narrative",
            "Build customer community that creates switching costs and network effects",
            "Double down on mid-market specialization — features, pricing, support model specifically designed for 100-500 employee companies",
            "Establish thought leadership in 'deal prediction' category before Gong claims narrative"
          ]
        }
      ]
    },
    caseStudy: {
      company: "Pipedrive",
      sector: "CRM / Sales Software",
      problem: "SMB and mid-market sales teams were forced to choose between expensive, complex enterprise CRMs (Salesforce) or basic, unprofessional tools (spreadsheets, simple contact databases). Salesforce was overkill for small teams — too many features, too much configuration, too expensive for companies with 5-50 sales reps. The core problem: CRMs were designed for sales managers to track reps, not for reps to actually close deals. Adoption was low because the tools created work without providing value.",
      fix: "Built CRM around the sales rep workflow, not the manager reporting needs. Key insight: if reps love using the tool, managers get the data they need automatically. Pipedrive's pipeline visualization made deal management intuitive and visual. Aggressive pricing ($15-25/user/month) undercut Salesforce by 80%+. Self-serve motion enabled bottom-up adoption without enterprise sales process. Focus on 'pipeline management' rather than 'CRM' — solving a specific problem rather than being a platform.",
      outcome: "Scaled to $100M+ ARR serving 100,000+ companies globally. Acquired by Vista Equity Partners for $1.5B in 2020. Pipedrive proved that focused, well-designed vertical solutions can build massive businesses even with Salesforce as the incumbent. The company maintained profitability throughout growth, demonstrating that capital efficiency is possible in competitive markets.",
      timeframe: "10 years from founding (2010) to Vista acquisition (2020). Growth was steady rather than explosive — the company raised only $90M before exit, demonstrating capital-efficient scaling. Key lesson: focus on underserved segment (SMB/mid-market), price aggressively, and optimize for self-serve adoption."
    },
    leadInvestorRequirements: {
      investorParagraph: "The ideal lead investor for SignalFlow's business model thesis is a true SaaS operator who can help optimize unit economics and growth efficiency as the company scales. They should have deep pattern recognition for how B2B SaaS companies navigate the transition from founder-led sales to scalable go-to-market motion. Critical: they need to understand that the current unit economics are based on founder-led sales and early adopters, and will naturally compress as the customer base diversifies. They should be able to help identify leading indicators of unit economics degradation and intervene before problems become visible in the numbers.",
      requirements: [
        "Deep SaaS metrics fluency — not just understanding of LTV:CAC, but experience diagnosing unit economics problems and implementing fixes across multiple companies",
        "Experience with mid-market SaaS pricing — understanding of how to balance self-serve and sales-assisted motions, when to push for annual contracts, how to structure enterprise tiers",
        "Operational experience with sales team scaling — hiring, compensation design, quota setting, territory planning for companies growing from €30K to €500K+ MRR",
        "Network of revenue operations leaders who can advise on pricing, packaging, and sales process optimization",
        "Patience for B2B SaaS sales cycles and understanding that unit economics are investments, not instant returns"
      ],
      dealbreakers: [
        "Pressure to move downmarket to SMB with self-serve-only model — the mid-market focus is strategic, and premature SMB pivot would dilute the positioning and unit economics",
        "Expectation of freemium model adoption — freemium is expensive and doesn't work well in B2B sales tools where value requires CRM integration",
        "Insistence on consumer-style growth metrics (DAU, MAU, viral coefficients) — B2B SaaS grows through relationships and value demonstration, not viral loops",
        "Lack of appreciation for sales-assisted motion — some investors are biased toward product-led growth; SignalFlow needs both motions to work together",
        "Short-term CAC payback expectations — 7-month payback is excellent, but investors expecting 3-month payback won't be aligned with B2B SaaS dynamics"
      ],
      wantToSee: [
        "Cohort-level unit economics breaking down CAC, LTV, and retention by customer acquisition month — evidence that early cohorts aren't artificially better than later ones",
        "Customer concentration analysis showing no single customer >10% of MRR — reduces key customer risk and improves acquisition attractiveness",
        "Channel mix analysis showing CAC by acquisition source — understanding which channels are efficient and scalable",
        "Pipeline coverage and win rate data demonstrating sales process health — not just closed deals, but leading indicators of future performance",
        "Pricing experimentation history and willingness to iterate — evidence that founders are data-driven about pricing decisions"
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
        "Small customer base (28 customers) limits pattern confidence — with only 28 data points, statistical significance for retention and growth claims is limited. A few customer losses could dramatically change metrics. VCs will want to see at least 50-75 customers before high confidence in unit economics",
        "Founder-led sales may not scale — CEO is currently closing most deals personally. The sales playbook hasn't been validated with non-founder sellers. This is the classic 'founder product' vs. 'product-market fit' question: can hired salespeople replicate founder success?",
        "Customer concentration risk — top 3 customers represent 22% of MRR. Simultaneous loss (leadership change, budget cuts, competitive switch) would create significant revenue decline",
        "Limited industry diversity — 60% of customers are in SaaS/tech, which may indicate product-market fit is narrower than TAM suggests. Need to validate appeal in other verticals",
        "Growth rate declining slightly — 15% MoM average, but last 2 months were 14% and 13%. Could be noise, could be early signal of growth plateau as easy customers are acquired"
      ],
      positiveSignals: [
        "8 consecutive months of 15%+ MoM growth — this consistency is more important than any single month's result. It suggests systematic demand, not just one-time wins or lucky deals. Very few Seed-stage companies maintain this consistency",
        "High retention at 6-month mark (94%) — customers who hit 6 months are likely to stay. This is the critical retention cliff for B2B SaaS. The 6% churn is mostly from early customers who weren't ideal fit",
        "Strong NPS (74) indicates organic growth potential — this NPS is exceptional for B2B SaaS (industry average is 30-40). High NPS typically correlates with word-of-mouth referrals and expansion",
        "85% weekly active usage — customers are actually using the product regularly, not just paying for it. Usage depth reduces churn risk and indicates genuine value delivery",
        "108% net revenue retention — expansion revenue from existing customers is offsetting gross churn. This is the sign of a healthy product with upsell potential",
        "Customer acquisition cost is declining — CAC has decreased 12% over last 6 months as word-of-mouth and inbound increase. This is the early signal of product-led growth working",
        "Sales cycle shortened from 45 days to 32 days — as market awareness grows and pitch improves, deals close faster. This efficiency improvement suggests scalable sales motion"
      ]
    },
    caseStudy: {
      company: "Notion",
      sector: "Productivity Software / Collaborative Workspace",
      problem: "Teams were drowning in tool fragmentation — one app for docs (Google Docs), another for wikis (Confluence), another for project management (Asana/Monday), another for databases (Airtable), another for notes (Evernote). Context switching was constant, information was scattered, and onboarding new team members was painful. The deeper problem: rigid, single-purpose tools couldn't adapt to how teams actually wanted to work. Every team has unique workflows, but existing tools forced standardization.",
      fix: "Built infinitely flexible workspace that combined docs, wikis, databases, and project management in a single, beautiful interface. Key insight: don't build features, build blocks that teams can assemble into any workflow they need. Second insight: invest heavily in design and user experience — make the tool feel premium and delightful to use. Third insight: embrace bottom-up adoption through individual users and small teams, then expand organically to company-wide deployment. Fourth insight: community-driven templates created network effects without direct virality.",
      outcome: "Grew to $10B+ valuation with 30M+ users across 500,000+ teams. Notion became the productivity tool of choice for startups, tech companies, and increasingly enterprises. The company achieved profitability while growing, demonstrating efficient business model. Created a new category ('connected workspace') and forced Google, Microsoft, and Atlassian to respond with competitive products. 'Notion' became shorthand for modern team productivity.",
      timeframe: "5 years from product relaunch (2018) to category leadership (2023). The original Notion launched in 2016 but was rebuilt from scratch due to technical debt. The relaunch in 2018 with new architecture enabled rapid feature development and scaling. Key lesson: product-led growth works in B2B when the product is truly delightful and solves individual user needs first."
    },
    leadInvestorRequirements: {
      investorParagraph: "The ideal lead investor for SignalFlow's traction thesis has deep experience scaling B2B SaaS go-to-market from founder-led sales to repeatable sales motion. They should understand the classic 'founder product' challenge — the transition from founders closing deals to hired salespeople replicating that success. Critical: they need to help with GTM strategy, not just provide capital. The next 12-18 months require building a sales team, establishing sales process, and proving that non-founders can sell the product effectively. This is the most common failure mode for Seed-stage B2B companies, and the right investor can significantly de-risk this transition.",
      requirements: [
        "Deep GTM scaling expertise — hands-on experience helping companies transition from €30K to €200K+ MRR with repeatable sales motion",
        "Sales team building experience — hiring AEs, setting quotas, designing compensation, building enablement programs",
        "Pattern recognition for B2B growth inflection points — understanding when to invest in marketing, when to expand product, when to add sales capacity",
        "Network of sales leaders and operators for hiring support — the hardest hires at this stage are first AEs and VP Sales",
        "Patience with B2B sales cycles — understanding that 30-60 day sales cycles mean growth is predictable but not instant"
      ],
      dealbreakers: [
        "Expectation of hockey-stick growth immediately post-funding — B2B SaaS at this stage grows 15-25% MoM with capital, not 50%+. Investors expecting consumer-style growth curves will be frustrated",
        "Pushing for premature international expansion — US/Europe focus is appropriate at this stage. International expansion before €100K MRR is a distraction",
        "Preference for product-led growth only — SignalFlow needs both PLG and sales-assisted motion to work. Pure PLG bias would limit addressable market",
        "Lack of operational support availability — SignalFlow needs engaged investors who can help with hiring, customer intros, and strategic decisions, not just board oversight",
        "Impatience with the 'messy middle' — the transition from founder-led to scalable sales is ugly and unpredictable. Investors need stomach for variance"
      ],
      wantToSee: [
        "Detailed sales pipeline and conversion metrics — not just closed deals, but stage-by-stage conversion rates showing funnel health",
        "Customer acquisition channel mix with CAC by source — understanding which channels are working and which are experiments",
        "Win/loss analysis documentation — systematic understanding of why deals close and why they don't",
        "Sales process documentation — even if it's founder-led, is the process understood and documented for replication?",
        "Customer reference calls demonstrating sales process — ability to get customers on calls with investors shows relationship depth"
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
          timeframe: "6 months post-funding",
          milestone: "€75K MRR, 45 customers, VP Marketing hired, first 2 AEs ramped and hitting quota",
          status: "upcoming",
          fundingImplication: "On track for Series A preparation — demonstrating that growth accelerates with capital and that sales motion is replicable beyond founders. Key proof point: at least one AE closing deals independently validates scalable sales."
        },
        {
          timeframe: "12 months post-funding",
          milestone: "€120K MRR, 60 customers, enterprise tier launched with 5+ customers at €50K+ ACV, 115%+ NRR demonstrated",
          status: "upcoming",
          fundingImplication: "Series A ready — at this milestone, SignalFlow has demonstrated product-market fit, repeatable sales motion, and upmarket expansion potential. Begin Series A process with €4-8M target. Key proof: unit economics hold at scale and enterprise tier validates premium positioning."
        },
        {
          timeframe: "18 months post-funding",
          milestone: "€150K MRR, 75 customers, US presence established with first US customers, sales team of 5+ hitting quota consistently",
          status: "upcoming",
          fundingImplication: "Series A closed, scaling mode activated — with Series A complete, SignalFlow has 24+ months runway and proven GTM motion. Focus shifts from proving to scaling. Key proof: US expansion works, indicating total addressable market is truly global."
        },
        {
          timeframe: "24 months post-funding",
          milestone: "€250K MRR, 100+ customers, US represents 30%+ of new ARR, enterprise tier represents 25%+ of revenue",
          status: "upcoming",
          fundingImplication: "Series B preparation — at this stage, SignalFlow is established mid-market player with clear path to €1M+ MRR. Series B ($15-25M) enables acceleration of enterprise expansion and potential acquisitions. Key proof: sustainable growth with improving unit economics."
        }
      ],
      criticalPath: [
        "Month 2: Hire VP Marketing — this is the gating factor for demand generation. Without VP Marketing, growth remains founder-constrained. Have 3 finalist candidates identified; target offer accepted by Day 60 post-funding.",
        "Month 4: First AE achieves quota attainment — proof that sales playbook is replicable. If first AE fails, need to iterate on hiring profile, training, or product before adding more capacity.",
        "Month 6: Enterprise tier beta launch with 3 pilot customers — validates upmarket expansion and premium pricing. Enterprise tier (€50K+ ACV) dramatically changes unit economics and competitive positioning.",
        "Month 8: VP Marketing driving 50%+ of pipeline — transition from founder-led demand gen to marketing-led. This is the key proof that growth can scale beyond founder hustle.",
        "Month 10: First US customer acquisition — validates international expansion hypothesis. US is 60%+ of TAM; inability to sell in US would fundamentally limit company potential.",
        "Month 12: Series A process begins — by this point, all key milestones should be hit or clearly on track. Series A process takes 2-3 months; starting early ensures capital before runway becomes constraint.",
        "Month 14: Second AE cohort hired (2 additional) — with proven sales playbook and Series A funding, expand sales team. Target 4 quota-carrying reps by Month 18.",
        "Month 18: Series A closed, €5M+ raised at 3-4x step-up from Seed valuation — successful Series A validates Seed investment thesis and positions company for acceleration phase."
      ]
    },
    exitNarrative: {
      potentialAcquirers: [
        "Salesforce — CRM market leader with strategic need for AI-powered sales intelligence. Acquisition would accelerate Salesforce's competitive response to Gong and provide immediate distribution to 150,000+ customers. Precedent: Salesforce acquired Slack for $27.7B, demonstrating willingness to pay for strategic capabilities. SignalFlow could be $500M-1B acquisition at Series B/C stage.",
        "HubSpot — Mid-market CRM leader seeking to differentiate from Salesforce through superior AI capabilities. SignalFlow's mid-market focus aligns perfectly with HubSpot's customer base. HubSpot has been acquisitive (The Hustle, Clearbit) and has $1B+ cash for M&A. Acquisition range: $200-500M at Series A/B stage.",
        "Microsoft — Dynamics 365 needs differentiation vs. Salesforce. Microsoft has massive AI investment (OpenAI partnership) seeking application use cases. Teams/Outlook integration creates natural distribution channel. Acquisition could be strategic premium. Range: $300M-1B depending on stage.",
        "ZoomInfo — Revenue intelligence platform seeking to expand capabilities. Already acquired Chorus.ai for $575M, demonstrating appetite for sales tech M&A. SignalFlow's prediction capabilities would complement ZoomInfo's data assets. Range: $200-400M.",
        "Private equity consolidation — Vista, Thoma Bravo, and other PE firms are rolling up sales tech companies. SignalFlow could be acquired as platform or bolt-on. PE typically pays 8-12x ARR for growing SaaS with strong retention. Range: dependent on ARR at acquisition."
      ],
      strategicValue: "AI-powered deal intelligence represents a strategic capability that every major CRM and sales platform will need to offer to remain competitive. Gong's success ($7.25B valuation) has validated the category and created urgency for platforms lacking native conversation/deal intelligence. For acquirers, building this capability internally would take 2-3 years and significant investment; acquisition provides faster path with proven team and technology. SignalFlow's mid-market focus is particularly attractive to HubSpot and Microsoft, who are underrepresented in this segment. The data asset (2M+ deal outcomes) is increasingly valuable as AI training data becomes strategic advantage.",
      comparableExits: [
        {
          company: "Chorus.ai",
          acquirer: "ZoomInfo",
          value: "$575M",
          multiple: "Estimated 25-30x ARR — premium paid for strategic fit and conversation data assets"
        },
        {
          company: "InsideSales.com",
          acquirer: "Aurea Software",
          value: "~$100M (down from $1.5B peak valuation)",
          multiple: "Approximately 2-3x ARR — example of value destruction when growth stalls and competition intensifies. Cautionary tale for SignalFlow."
        },
        {
          company: "Clearbit",
          acquirer: "HubSpot",
          value: "$150M (reported)",
          multiple: "Estimated 5-8x ARR — data company acquired for strategic integration, not standalone growth potential"
        },
        {
          company: "Outreach (potential)",
          acquirer: "N/A — still independent, preparing for IPO",
          value: "$4B+ (last private valuation)",
          multiple: "Approximately 12-15x ARR — demonstrates public market potential for category leaders in sales tech"
        }
      ],
      pathToExit: "Most likely paths: (1) Strategic acquisition at Series B stage ($500M-1B valuation) if SignalFlow achieves €3-5M ARR and demonstrates clear competitive differentiation. Likely acquirers: HubSpot, Salesforce, or Microsoft. (2) Strategic acquisition at Series C+ stage ($1-2B+) if SignalFlow achieves €10M+ ARR and category leadership in mid-market. At this scale, becomes attractive to private equity as platform investment. (3) IPO path if SignalFlow achieves €50M+ ARR with sustainable growth — would require continued independence through multiple funding rounds and 7-10 year timeline. IPO is less likely than strategic acquisition given competitive dynamics and capital requirements."
    },
    scenarioPlanning: {
      bestCase: {
        probability: 25,
        description: "SignalFlow becomes the category leader in mid-market deal intelligence, successfully defending against Gong's mid-market push through superior product focus and execution. Achieves €200M+ ARR with 70%+ market share in target segment. Platform expansion into coaching, prospecting, and forecasting creates full revenue intelligence suite.",
        outcome: "€200M+ ARR, IPO at $3B+ valuation or strategic acquisition at $2B+",
        fundraisingImplication: "Series D+ with tier-1 investors, or strategic exit to Salesforce/Microsoft at significant premium. Founders achieve significant liquidity."
      },
      baseCase: {
        probability: 50,
        description: "SignalFlow establishes strong mid-market position but faces increasing competitive pressure from Gong and Clari. Achieves €50M+ ARR with loyal customer base and strong retention. Growth moderates as market matures. Acquired by CRM platform seeking AI capabilities.",
        outcome: "€50M+ ARR, acquired by CRM platform for $500M-1B",
        fundraisingImplication: "Series B/C with solid returns for early investors (5-10x for Seed). Founders achieve meaningful outcome but not generational wealth. Acquisition provides good outcome for team and investors."
      },
      downside: {
        probability: 25,
        description: "Competitive pressure from Gong's mid-market push limits SignalFlow's growth. Gong's distribution and brand advantage prove insurmountable despite product differentiation. SignalFlow achieves €10-20M ARR but growth stalls and investor interest wanes.",
        outcome: "€10-20M ARR, acquired for team and technology at $50-150M",
        fundraisingImplication: "Bridge round or forced sale. Returns for Seed investors are 1-3x — acceptable but not venture-scale. Team acqui-hired by larger player. Cautionary outcome that validates the risk of competing in well-funded market."
      }
    },
    caseStudy: {
      company: "Outreach",
      sector: "Sales Engagement",
      problem: "Sales reps were drowning in manual, fragmented prospecting work — writing individual emails, making phone calls without templates, tracking activities in spreadsheets. The core problem: sales reps spent more time on administrative tasks than actually selling. Sequences were managed manually, follow-ups were forgotten, and there was no systematic way to understand what outreach strategies worked. Sales managers had no visibility into rep activity or ability to coach on execution.",
      fix: "Built sales engagement platform that automated multi-channel prospecting sequences (email, phone, social) while maintaining personalization. Key innovations: (1) Sequence automation that felt personal, not robotic — templates with variables, intelligent scheduling, and A/B testing. (2) Activity capture that didn't require rep data entry — automatic logging of emails, calls, and meetings. (3) Analytics showing which sequences, templates, and tactics actually drove results. (4) Coaching layer allowing managers to review rep activity and provide feedback. The platform made sales reps 3x more productive while giving managers unprecedented visibility.",
      outcome: "Grew to $300M+ ARR and $4.4B valuation, becoming the dominant player in sales engagement. Outreach created an entirely new category and forced Salesforce, Microsoft, and others to respond with competitive offerings. The company was preparing for IPO (later postponed due to market conditions) and had achieved profitability. Expanded from prospecting into full revenue lifecycle with acquisitions and product expansion.",
      timeframe: "8 years from founding (2014) to near-IPO status (2022). Growth accelerated dramatically 2019-2021 as remote selling required systematic outreach tools. The company raised $500M+ and maintained high growth rates while building toward profitability. Key lesson: own a workflow (sales prospecting), then expand to adjacent workflows (engagement, analytics, coaching, forecasting)."
    },
    leadInvestorRequirements: {
      investorParagraph: "The ideal lead investor for SignalFlow's vision thesis has deep experience with long-term company building and has helped B2B companies navigate from Seed through Series B and beyond. They should understand that the path from €32K MRR to €150K MRR is fundamentally different from the path to €1M+ MRR, and be prepared to support through multiple phase transitions. Critical: they should have relationships with Series A and B investors who could lead follow-on rounds, de-risking the fundraising path. They should believe in the mid-market opportunity specifically, not just as a stepping stone to enterprise.",
      requirements: [
        "Track record of multi-stage support — investors who have supported companies from Seed through Series B or beyond, not just early-stage specialists",
        "Exit experience in B2B SaaS — understanding of strategic vs. financial buyers, M&A processes, and valuation drivers for sales tech companies",
        "Relationships with follow-on investors — ability to make warm introductions to Series A investors, reducing fundraising friction",
        "Board governance experience — helping founders develop board management skills, investor communication, and governance practices",
        "Long-term perspective — willingness to hold investment for 7-10 years if company pursues IPO path"
      ],
      dealbreakers: [
        "Short-term exit pressure — investors who need quick returns (3-5 year fund cycles) may push for premature exit that limits company potential",
        "Preference for consumer-style returns — B2B SaaS typically generates 5-20x returns, not 100x. Investors expecting consumer-style outcomes will be disappointed with realistic B2B trajectories",
        "Lack of follow-on investment capability — Seed investors who can't participate in Series A create signaling risk for future fundraising",
        "Board seat demands at Seed stage — Seed investment typically doesn't warrant board seat; investors demanding governance control at this stage are misaligned",
        "Pressure for immediate enterprise pivot — the mid-market focus is strategic and should be maintained through Series A at minimum"
      ],
      wantToSee: [
        "Clear board composition plan for Series A and beyond — understanding of governance trajectory and board evolution",
        "Scenario planning documentation demonstrating strategic thinking — founders who have thought through multiple outcomes and have contingency plans",
        "Use of funds breakdown with specific hiring plan — detailed allocation of €2M raise with monthly cash forecast",
        "Series A investor target list with relationship status — evidence that founders are already building Series A investor relationships",
        "Exit analysis showing comparable companies and valuation drivers — founders who understand what creates value for acquirers and public markets"
      ]
    }
  }
};

// Helper to get tools for a specific section
export const getSignalFlowToolsForSection = (sectionTitle: string) => {
  return DEMO_SECTION_TOOLS[sectionTitle];
};
