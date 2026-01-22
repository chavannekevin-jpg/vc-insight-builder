// Full section tools for SignalFlow demo
// Comprehensive analysis data for all 8 sections

export const DEMO_SECTION_TOOLS: Record<string, any> = {
  "Problem": {
    sectionScore: {
      score: 72,
      label: "Strong",
      percentile: "Top 25%",
      vcBenchmark: "Above average for Seed stage",
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
      grade: "B+",
      verifiedPainPoints: [
        "67% of deals lost to 'no decision' (validated across 85 interviews)",
        "40% of rep time spent on deals that won't close (CRM data from 12 companies)",
        "$2.1M average revenue leakage per 50-person team (calculated from pilot data)"
      ],
      unverifiedClaims: [
        "Claim that current tools 'catch problems too late' - would benefit from timing data",
        "Pattern detection at 45 days before loss - needs larger sample validation"
      ],
      whatVCsConsiderVerified: [
        "Third-party validation (analyst reports, industry surveys)",
        "Customer interviews (especially with specific quotes)",
        "Quantified impact with clear methodology"
      ],
      evidenceYoureMissing: [
        "External validation from industry analysts",
        "Competitive loss data from target customers (why they didn't choose alternatives)"
      ]
    },
    founderBlindSpot: {
      exaggerations: [
        "The 89% prediction accuracy claim needs context - what's the baseline? Random guess? Current manager intuition?"
      ],
      misdiagnoses: [
        "Framing this as a 'prediction problem' when some VCs may see it as a 'sales execution problem' that doesn't need AI"
      ],
      assumptions: [
        "Assumes mid-market has same problem as enterprise - may need more segmented evidence",
        "Assumes sales leaders will trust AI recommendations - adoption risk"
      ],
      commonMistakes: [
        "Over-indexing on the technical solution vs. the business outcome",
        "Not addressing the 'do nothing' competitor clearly enough"
      ]
    },
    caseStudy: {
      company: "Gong",
      sector: "Sales Tech / Revenue Intelligence",
      problem: "Enterprise sales teams lacked visibility into what was actually happening on calls and why deals were won or lost",
      fix: "Built AI-powered conversation intelligence that records, transcribes, and analyzes sales calls to surface winning patterns",
      outcome: "Grew to $200M+ ARR and $7.25B valuation by owning 'reality capture' in enterprise sales",
      timeframe: "5 years from founding to category leadership"
    },
    leadInvestorRequirements: {
      investorParagraph: "A strong lead investor for SignalFlow needs to believe that AI-native sales intelligence represents a generational shift from legacy tools. They should have pattern recognition in B2B SaaS and comfort with competitive markets where execution determines winners.",
      requirements: [
        "Track record investing in competitive B2B SaaS markets",
        "Ability to help with enterprise sales motion",
        "Network in sales/RevOps leadership community"
      ],
      dealbreakers: [
        "Concern that Gong will inevitably dominate mid-market",
        "Belief that AI in sales is overhyped",
        "Requirement for €100K+ MRR before investing"
      ],
      wantToSee: [
        "Evidence of product-led growth potential",
        "Clear differentiation from conversation intelligence tools",
        "Founder domain expertise in sales operations"
      ]
    }
  },

  "Solution": {
    sectionScore: {
      score: 68,
      label: "Solid",
      percentile: "Top 35%",
      vcBenchmark: "At benchmark for Seed stage with live product",
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
        "2M+ deal outcomes in training dataset",
        "12 integration connectors built",
        "Proprietary 'why' layer vs. commodity transcription"
      ],
      expectedProofs: [
        "Patent filings or trade secret documentation",
        "Independent validation of accuracy claims",
        "Published research or technical blog posts"
      ],
      gaps: [
        "No patents filed yet",
        "Accuracy claims not independently validated",
        "Data moat could be replicated with sufficient capital"
      ],
      vcEvaluation: "Solid technical foundation but moat is more about execution speed than defensible IP. Recommend accelerating patent strategy."
    },
    commoditizationTeardown: {
      overallRisk: "Medium",
      features: [
        {
          name: "CRM Integration",
          riskLevel: "High",
          timeToClone: "2-3 months",
          defensibility: "Commodity - all competitors have this"
        },
        {
          name: "Deal Scoring",
          riskLevel: "Medium",
          timeToClone: "6-9 months",
          defensibility: "Moderate - requires training data and iteration"
        },
        {
          name: "Predictive 'Why' Analysis",
          riskLevel: "Low",
          timeToClone: "12-18 months",
          defensibility: "Strong - requires deep ML expertise and proprietary data"
        }
      ]
    },
    competitorBuildAnalysis: {
      couldBeBuilt: true,
      estimatedTime: "12-18 months",
      requiredResources: "10-15 engineers, $5M+ investment",
      barriers: [
        "Training data accumulation takes time regardless of resources",
        "Domain expertise in sales ops is specialized",
        "Gong/Clari would need to restructure core product architecture"
      ],
      verdict: "Buildable by well-funded competitor, but execution window is 12-18 months. Key is to establish market position and customer density before competitive response."
    },
    caseStudy: {
      company: "Clari",
      sector: "Revenue Operations",
      problem: "Sales leaders couldn't forecast revenue accurately, leading to missed targets and board surprises",
      fix: "Built revenue platform that uses AI to analyze pipeline and predict quarterly outcomes",
      outcome: "Scaled to $40M+ ARR and $2.6B valuation by owning forecasting workflow",
      timeframe: "7 years from founding to unicorn status"
    },
    leadInvestorRequirements: {
      investorParagraph: "Ideal investor has deep pattern recognition in developer tools and infrastructure, appreciating the technical moat being built. Should have helped B2B companies navigate competitive markets.",
      requirements: [
        "Technical depth to evaluate ML architecture",
        "B2B SaaS scaling experience",
        "Patience for mid-market sales cycles"
      ],
      dealbreakers: [
        "Expecting consumer-like viral growth",
        "Discomfort with AI/ML investment required"
      ],
      wantToSee: [
        "Clear path to enterprise tier",
        "Evidence of technical hiring ability",
        "Product roadmap for next 12 months"
      ]
    }
  },

  "Market": {
    sectionScore: {
      score: 75,
      label: "Strong",
      percentile: "Top 20%",
      vcBenchmark: "Above average market articulation",
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
      tamValue: 2500000000,
      samValue: 630000000,
      somValue: 112000000,
      methodology: "180K mid-market B2B companies with 20+ person sales teams × €14K ACV = €2.5B. Filtered to tech-forward industries in US + Western Europe for SAM. SOM based on reachable accounts through current channels.",
      assumptions: [
        "Mid-market defined as 100-1000 employees",
        "Only companies with 20+ person sales teams",
        "Average contract value of €14K",
        "Tech-forward industries only for SAM"
      ],
      vcFeedback: "Reasonable methodology. The €2.5B TAM supports a €100M+ outcome. SAM/SOM filters are realistic."
    },
    marketReadinessIndex: {
      overallScore: 78,
      factors: {
        regulatoryPressure: { score: 40, evidence: "No regulatory driver, but economic pressure to optimize sales efficiency" },
        marketUrgency: { score: 85, evidence: "85% of sales orgs increasing AI spend in 2025" },
        willingnessToPay: { score: 82, evidence: "Revenue intelligence already a proven budget category" },
        switchingFriction: { score: 65, evidence: "CRM integration creates moderate switching costs" }
      }
    },
    vcMarketNarrative: {
      howPartnerWouldPitch: "Revenue intelligence is a proven category — Gong and Clari built $10B+ in combined value. But they're enterprise-focused. The mid-market is underserved and adopting fast. SignalFlow is building the Gong for mid-market with better technology.",
      marketTiming: "Favorable. AI adoption surge meets mid-market RevOps maturation.",
      whyNow: "Three converging trends: (1) AI tools becoming accessible to mid-market budgets, (2) Post-pandemic shift to remote selling requires digital visibility, (3) Economic pressure making every deal count."
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
      vcBenchmark: "Below average competitive positioning",
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
      vcBenchmark: "Well above average for Seed stage",
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
      vcBenchmark: "At benchmark for Seed SaaS",
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
      vcBenchmark: "At benchmark for Seed stage",
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
      vcBenchmark: "Above average vision articulation",
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
export const getSignalFlowToolsForSection = (sectionTitle: string): EnhancedSectionTools | undefined => {
  return DEMO_SECTION_TOOLS[sectionTitle];
};
