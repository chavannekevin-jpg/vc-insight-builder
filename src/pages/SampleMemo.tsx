import { Header } from "@/components/Header";
import { MemoSection } from "@/components/memo/MemoSection";
import { MemoParagraph } from "@/components/memo/MemoParagraph";
import { MemoKeyPoints } from "@/components/memo/MemoKeyPoints";
import { MemoHighlight } from "@/components/memo/MemoHighlight";
import { MemoVCReflection } from "@/components/memo/MemoVCReflection";
import { MemoVCQuestions } from "@/components/memo/MemoVCQuestions";
import { MemoBenchmarking } from "@/components/memo/MemoBenchmarking";
import { MemoAIConclusion } from "@/components/memo/MemoAIConclusion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SampleMemo = () => {
  const navigate = useNavigate();

  const sampleData = {
    companyName: "FlowMetrics",
    tagline: "Real-time operational intelligence for manufacturing",
    stage: "Pre-Seed",
    category: "Industrial IoT & Analytics"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header Section */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/hub")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>

          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-primary mb-2">SAMPLE INVESTMENT MEMORANDUM</div>
                <h1 className="text-4xl font-display font-bold text-foreground mb-2">
                  {sampleData.companyName}
                </h1>
                <p className="text-lg text-muted-foreground mb-4">{sampleData.tagline}</p>
                <div className="flex gap-4 text-sm">
                  <span className="px-3 py-1 bg-background/60 rounded-lg border border-border">
                    <strong>Stage:</strong> {sampleData.stage}
                  </span>
                  <span className="px-3 py-1 bg-background/60 rounded-lg border border-border">
                    <strong>Category:</strong> {sampleData.category}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8">
            <p className="text-sm text-foreground">
              <strong className="text-yellow-600">Note:</strong> This is a sample memorandum based on a fictional company to demonstrate the format, depth, and critical analysis you'll receive. Your actual memo will be personalized based on your responses.
            </p>
          </div>
        </div>

        {/* Executive Summary */}
        <MemoSection title="Executive Summary" index={0}>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <MemoHighlight metric="€800K" label="Seeking to Raise" />
            <MemoHighlight metric="€2.1M" label="Pre-Money Valuation" />
            <MemoHighlight metric="12 months" label="Runway Target" />
          </div>

          <MemoParagraph 
            text="FlowMetrics provides real-time operational intelligence for mid-sized manufacturing plants through plug-and-play IoT sensors and AI-powered analytics. The company addresses chronic inefficiencies in production monitoring, where 73% of manufacturers still rely on manual data collection and spreadsheet-based reporting."
            emphasis="high"
          />

          <MemoParagraph 
            text="The founding team combines deep domain expertise (former Operations Director at Siemens) with technical capability (ex-Google ML engineer). They've secured 3 pilot customers, generating €45K in early revenue, and have validated product-market fit with 8+ manufacturing plants expressing strong interest post-demo."
            emphasis="medium"
          />

          <MemoParagraph 
            text="The €800K raise will fund: (1) engineering team expansion to complete core platform features, (2) hiring a sales lead to formalize go-to-market, and (3) securing 10 paying customers to reach €250K ARR within 12 months. This round positions the company for a strong Series A trajectory."
            emphasis="normal"
          />

          <MemoKeyPoints points={[
            "Validated pain point: 73% of mid-market manufacturers lack real-time production visibility",
            "€45K early revenue from 3 pilots, 8+ qualified pipeline opportunities",
            "Technical moat: proprietary ML models for predictive maintenance achieve 94% accuracy",
            "Path to €250K ARR with clear use of funds and 12-month runway"
          ]} />
        </MemoSection>

        {/* Problem */}
        <MemoSection title="Problem" index={1}>
          <MemoParagraph 
            text="Mid-sized manufacturing plants (50-500 employees) operate with severe operational blind spots. Production managers rely on manual floor walks, paper logs, and end-of-shift reports to understand machine performance, downtime causes, and quality issues. This reactive approach costs companies 15-20% in lost productivity and creates preventable equipment failures."
            emphasis="high"
          />

          <MemoParagraph 
            text="Existing solutions fall into two categories: (1) expensive enterprise ERP/MES systems (€500K+ implementation) designed for Fortune 500 plants, or (2) basic sensor dashboards that require custom integration and don't provide actionable insights. Neither addresses the mid-market need for affordable, plug-and-play operational intelligence."
            emphasis="medium"
          />

          <MemoParagraph 
            text="The economic impact is measurable: unplanned downtime costs €260B globally in manufacturing. For a typical mid-sized plant, this translates to €800K-€1.2M annually in lost production, excess inventory, and quality issues. Current solutions require 6-18 month implementations and dedicated IT resources that mid-market companies lack."
            emphasis="normal"
          />

          <MemoKeyPoints points={[
            "73% of manufacturers lack real-time production visibility (McKinsey, 2024)",
            "Average unplanned downtime costs €800K-€1.2M per plant annually",
            "Enterprise solutions require €500K+ and 6-18 month implementations",
            "Mid-market segment is underserved: too small for SAP, too complex for spreadsheets"
          ]} />

          <MemoVCReflection text="From an investor perspective, this is a classic 'hair on fire' problem in a massive, underserved market. The €260B global cost of unplanned downtime creates clear economic urgency. What's particularly compelling is the wedge: mid-market manufacturers are sophisticated enough to understand they're bleeding money, but not large enough to justify enterprise solutions. The 73% statistic on manual data collection is striking—this level of operational blindness would be unacceptable in virtually any other industry. The challenge will be evangelizing a new category (operational intelligence as a service) rather than competing in an established one." />

          <MemoVCQuestions questions={[
            "What's preventing customers from building this internally with off-the-shelf IoT sensors and open-source analytics?",
            "How defensible is the solution if Siemens or Rockwell launch a simplified mid-market SKU at 50% lower price?",
            "What's the actual sales cycle you're seeing? 'Capital purchase' objections could extend runway requirements significantly.",
            "Are manufacturing customers willing to share operational data for cross-customer ML improvements, or will privacy concerns limit your network effects?",
            "What happens if a pilot customer experiences a major failure that your system didn't predict? How do liability and warranty expectations work?"
          ]} />

          <MemoBenchmarking text="Historical comparisons show mixed outcomes in manufacturing SaaS: Tulip (raised $175M, valued at $1B+) successfully targeted similar mid-market segment with no-code manufacturing apps, while players like Sight Machine struggled to escape enterprise sales complexity. The key differentiator appears to be deployment speed—Tulip's '2 days to first app' mirrors FlowMetrics' '2-3 day installation' approach. However, predictive maintenance specifically has seen commoditization: AWS, Azure, and GCP all offer pre-built ML models, which could pressure FlowMetrics' IP advantage over time." />

          <MemoAIConclusion text="The problem is validated and economically significant. FlowMetrics has identified a genuine gap in an enormous market. The critical question is execution: can they build a repeatable sales motion and establish technical moat before well-capitalized competitors notice the opportunity? At pre-seed, the focus should be on proving unit economics (CAC, LTV, sales cycle) with next 10 customers rather than platform expansion." />
        </MemoSection>

        {/* Solution */}
        <MemoSection title="Solution" index={2}>
          <MemoParagraph 
            text="FlowMetrics delivers real-time operational intelligence through hardware-agnostic IoT sensors paired with an AI-powered analytics platform. Installation takes 2-3 days without production disruption. The system immediately begins capturing machine performance, downtime events, quality metrics, and energy consumption—then applies ML models to predict failures 48-72 hours in advance."
            emphasis="high"
          />

          <MemoParagraph 
            text="The platform's core differentiation is actionable intelligence, not just data visualization. Rather than showing generic dashboards, FlowMetrics automatically identifies the top 3 issues impacting production and recommends specific interventions. For example: 'Machine 7 vibration patterns indicate bearing failure in 52 hours. Schedule maintenance during tonight's shift to prevent 12-hour outage.'"
            emphasis="medium"
          />

          <MemoParagraph 
            text="Pricing is transparent and accessible for mid-market: €2,500/month per production line, including hardware, software, and ongoing ML model improvements. No upfront integration fees. Customers typically see ROI within 4-6 months through reduced downtime and improved OEE (Overall Equipment Effectiveness)."
            emphasis="normal"
          />

          <MemoKeyPoints points={[
            "2-3 day installation with zero production disruption",
            "Predictive maintenance alerts 48-72 hours before failures (94% accuracy)",
            "€2,500/month per line—10x cheaper than enterprise alternatives",
            "Average ROI in 4-6 months through reduced downtime and improved OEE"
          ]} />

          <MemoVCReflection text="The solution architecture is smart: hardware-as-a-service eliminates upfront capex objections while maintaining control over sensor quality and future upgrades. The '94% accuracy' claim for predictive maintenance is impressive if validated—this would be best-in-class. The €2,500/month price point feels right for mid-market: low enough to avoid budget committee scrutiny, high enough to support quality delivery. The key risk is whether 'actionable intelligence' is genuinely differentiated or just better UX around commodity ML models. If competitors can replicate the ML with 6-12 months of effort, this becomes a services business rather than a platform play." />

          <MemoVCQuestions questions={[
            "Can you share validation data for the '94% prediction accuracy'? What's the methodology and sample size?",
            "What percentage of downtime events are actually predictable 48-72 hours in advance vs. sudden catastrophic failures?",
            "How much of the value prop is the ML predictions vs. just having real-time visibility that manual logs don't provide?",
            "What's included in the €2,500/month? How many sensors, what support SLA, who maintains hardware when it fails?",
            "If a customer churns after 12 months, what happens to the installed hardware? Does retrieval cost eat into unit economics?"
          ]} />

          <MemoAIConclusion text="The solution is well-designed for the target customer: plug-and-play, fast ROI, transparent pricing. The product-market fit hypothesis is strong. However, differentiation beyond 'easier to use' needs more evidence. Investors will want to see whether the ML predictions genuinely save money vs. customers just valuing the real-time dashboards." />
        </MemoSection>

        {/* Market Opportunity */}
        <MemoSection title="Market Opportunity" index={3}>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <MemoHighlight metric="€42B" label="TAM (Global)" />
            <MemoHighlight metric="€8.4B" label="SAM (Europe/US)" />
            <MemoHighlight metric="€680M" label="SOM (3-year target)" />
          </div>

          <MemoParagraph 
            text="The Total Addressable Market encompasses 280,000+ mid-sized manufacturing plants globally with 50-500 employees. At €2,500/month average contract value, this represents a €42B TAM. FlowMetrics is initially targeting European and North American markets (68,000 plants, €8.4B SAM)."
            emphasis="high"
          />

          <MemoParagraph 
            text="The Serviceable Obtainable Market focuses on discrete manufacturing verticals where production complexity justifies operational intelligence investment: automotive components, food & beverage, industrial equipment, and pharmaceuticals. These sectors have higher margins, regulatory requirements driving adoption, and existing maintenance budgets that can be reallocated. This represents 18,000 plants and a €680M SOM over 3 years."
            emphasis="medium"
          />

          <MemoParagraph 
            text="Market tailwinds include: (1) Labor shortages forcing automation adoption, (2) Rising energy costs increasing focus on efficiency, (3) Supply chain disruptions creating demand for production resilience, and (4) Industry 4.0 initiatives now reaching mid-market segment after Fortune 500 adoption."
            emphasis="normal"
          />

          <MemoKeyPoints points={[
            "280,000+ mid-sized plants globally, 68,000 in Europe/US target markets",
            "Discrete manufacturing verticals offer highest conversion (auto, F&B, pharma)",
            "€680M 3-year SOM assumes 2.5% market penetration",
            "Multiple tailwinds: labor shortages, energy costs, supply chain resilience"
          ]} />
        </MemoSection>

        {/* Traction */}
        <MemoSection title="Traction" index={4}>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <MemoHighlight metric="3" label="Pilot Customers" />
            <MemoHighlight metric="€45K" label="Revenue (12 months)" />
            <MemoHighlight metric="8+" label="Qualified Pipeline" />
          </div>

          <MemoParagraph 
            text="FlowMetrics has secured 3 pilot customers across different verticals: a precision components manufacturer (automotive), a specialty foods producer, and an industrial pumps manufacturer. Combined, these pilots generated €45K in revenue over 12 months. Customer feedback consistently highlights the speed of deployment and clarity of actionable insights as key differentiators."
            emphasis="high"
          />

          <MemoParagraph 
            text="Key traction metrics demonstrate product-market fit: (1) Average implementation time of 2.8 days vs. promised 3 days, (2) All 3 pilots renewed after initial 90-day period, expanding to additional production lines, (3) NPS score of 72 from plant managers, and (4) Documented ROI of 4.2 months average payback across pilots."
            emphasis="medium"
          />

          <MemoParagraph 
            text="Pipeline development is accelerating: 8 qualified opportunities (defined as completed technical demo + budget confirmed) representing €240K potential ARR. Additionally, 23 inbound demo requests from industry trade show presence and word-of-mouth referrals. The founding team is currently handling all sales personally, highlighting the need for dedicated go-to-market hiring."
            emphasis="normal"
          />

          <MemoKeyPoints points={[
            "3 paying pilots across 3 verticals, all renewed and expanding",
            "€45K revenue with 4.2-month average customer payback",
            "8 qualified pipeline opportunities (€240K potential ARR)",
            "NPS of 72 demonstrates strong product-market fit"
          ]} />

          <MemoVCReflection text="The traction story is credible for pre-seed. Three paying customers across different verticals reduces single-industry risk. The 100% renewal rate and expansion to additional production lines are exactly what you want to see at this stage—customers voting with their wallets after seeing the product work. The NPS of 72 is strong (anything above 50 is excellent for B2B SaaS). The €45K revenue over 12 months translates to roughly €15K per customer annually, which is below the stated €60K ACV—this suggests pilots were discounted or limited scope, which is normal. The qualified pipeline of €240K is substantial relative to the raise size." />

          <MemoVCQuestions questions={[
            "What was the actual pricing for pilot customers vs. the standard €2,500/month per line? Were these heavily discounted proofs-of-concept?",
            "Of the 8 qualified opportunities, how many are inbound vs. outbound? What's the common objection when deals don't close?",
            "Can you share one specific example of documented ROI? What was the baseline vs. post-FlowMetrics performance?",
            "The founders are handling all sales—what's the typical time investment per deal? Will this scale with one sales hire?",
            "What's the churn risk? If one pilot churns in the next 6 months, how does that impact the funding narrative?"
          ]} />

          <MemoBenchmarking text="Comparing to similar B2B SaaS at pre-seed: $50K ARR with 3 customers and strong expansion signals is solid. Companies like Segment and Twilio had comparable early traction. The 4.2-month payback is faster than typical industrial software (usually 12-18 months), suggesting genuine value delivery. However, the pipeline qualification definition ('completed demo + budget confirmed') may be optimistic—manufacturing purchases often involve longer technical validation than this suggests. The 23 inbound demo requests are encouraging but converting these to qualified pipeline typically takes 3-6 months in this segment." />

          <MemoAIConclusion text="Traction validates the core hypothesis: there are customers willing to pay for this solution, and it delivers measurable value. The renewal and expansion patterns are particularly strong signals. The key question is sales scalability: can this motion work beyond founder-led sales? The qualified pipeline suggests yes, but execution risk remains high until a sales hire proves the playbook is repeatable." />
        </MemoSection>

        {/* Business Model */}
        <MemoSection title="Business Model" index={5}>
          <MemoParagraph 
            text="FlowMetrics operates a SaaS subscription model at €2,500/month per production line, including hardware (IoT sensors), software platform, predictive ML models, and ongoing support. Hardware remains company property, reducing customer acquisition friction and allowing continuous improvement of sensor capabilities."
            emphasis="high"
          />

          <MemoParagraph 
            text="Revenue expansion follows a land-and-expand pattern: initial deployment typically covers 2-3 critical production lines, then expands to full plant coverage (average 8-12 lines) over 6-12 months. This drives ACV growth from €60K to €240K+ per customer. Gross margins are 78% at scale (hardware subsidized by long-term contracts)."
            emphasis="medium"
          />

          <MemoParagraph 
            text="Go-to-market strategy combines direct sales for initial customer acquisition with channel partnerships for geographic expansion. Industrial equipment distributors and maintenance service providers represent logical partners with existing manufacturing relationships. Pilot partnerships with 2 distributors are in discussion."
            emphasis="normal"
          />

          <MemoKeyPoints points={[
            "€2,500/month per line, all-inclusive (hardware, software, support)",
            "Land-and-expand: €60K initial ACV → €240K+ full plant coverage",
            "78% gross margins at scale through hardware subsidization model",
            "Hybrid direct sales + channel partnerships for geographic reach"
          ]} />
        </MemoSection>

        {/* Competition */}
        <MemoSection title="Competition" index={6}>
          <MemoParagraph 
            text="FlowMetrics competes against three categories: (1) Enterprise MES/ERP systems (SAP, Siemens, Rockwell), (2) Point solution IoT platforms (Samsara, MachineMetrics), and (3) Internal custom-built systems. Each has significant limitations for mid-market manufacturers."
            emphasis="high"
          />

          <MemoParagraph 
            text="Enterprise systems offer comprehensive functionality but are prohibitively expensive (€500K-€2M implementation) and require 12-18 month deployments with dedicated IT resources. Point solution IoT platforms provide basic monitoring but lack predictive intelligence and require significant customization. Internal systems are brittle, difficult to maintain, and don't benefit from cross-customer ML improvements."
            emphasis="medium"
          />

          <MemoParagraph 
            text="FlowMetrics' competitive moat derives from: (1) Proprietary ML models trained on cross-customer data (94% prediction accuracy), (2) Vertical-specific playbooks for common failure modes, (3) Hardware-agnostic sensors that avoid vendor lock-in, and (4) Sub-3-day deployment methodology. Network effects strengthen as more customers contribute anonymized operational data, improving ML models for all users."
            emphasis="normal"
          />

          <MemoKeyPoints points={[
            "Enterprise MES: too expensive (€500K+) and complex for mid-market",
            "Point IoT solutions: lack predictive intelligence and actionable insights",
            "Competitive moat: ML models, vertical playbooks, rapid deployment",
            "Network effects: each customer improves ML accuracy for entire platform"
          ]} />
        </MemoSection>

        {/* Team */}
        <MemoSection title="Team" index={7}>
          <MemoParagraph 
            text="Founder/CEO Sophie Laurent brings 12 years of manufacturing operations experience, including 5 years as Operations Director at Siemens' Munich plant (€180M annual output). She directly experienced the operational blind spots FlowMetrics solves and has deep relationships in the automotive supply chain. Sophie holds an MBA from INSEAD."
            emphasis="high"
          />

          <MemoParagraph 
            text="Co-founder/CTO Marcus Chen is a former Google ML engineer who specialized in time-series prediction for datacenter optimization. He holds a PhD in Computer Science from ETH Zurich and led the development of FlowMetrics' core predictive maintenance algorithms. Marcus previously built and sold an IoT analytics startup (€4M exit) to an industrial automation company."
            emphasis="medium"
          />

          <MemoParagraph 
            text="The team of 5 includes 2 ML engineers, 1 full-stack developer, and 1 customer success manager. Key gaps include: dedicated sales leader, hardware engineer for sensor development, and product manager to formalize roadmap. The €800K raise will fund these critical hires."
            emphasis="normal"
          />

          <MemoKeyPoints points={[
            "CEO: 12 years manufacturing ops, former Siemens Operations Director",
            "CTO: Ex-Google ML engineer, PhD ETH Zurich, prior €4M IoT exit",
            "Team of 5, hiring for sales lead, hardware engineer, product manager",
            "Complementary skill sets: domain expertise + ML capability + previous startup experience"
          ]} />
        </MemoSection>

        {/* Risks */}
        <MemoSection title="Risks & Mitigations" index={8}>
          <MemoParagraph 
            text="Sales cycle risk: Manufacturing capital purchases typically involve 6-9 month decision cycles with multiple stakeholders. Mitigation: Position as operational expense (monthly subscription) rather than capex, leverage pilot-to-full-deployment expansion model, and target plants with upcoming equipment refresh cycles."
            emphasis="high"
          />

          <MemoParagraph 
            text="Technical risk: ML prediction accuracy depends on sufficient training data across diverse equipment types and failure modes. Early coverage of rare failure scenarios may be limited. Mitigation: Partnerships with equipment OEMs to access historical maintenance records, focus on common failure modes first (bearings, motors, pumps), and transparent communication of prediction confidence levels."
            emphasis="medium"
          />

          <MemoParagraph 
            text="Competition risk: Established players (Siemens, Rockwell) could introduce simplified mid-market offerings, or point solution competitors could add predictive capabilities. Mitigation: Network effects moat from cross-customer ML training, vertical specialization in discrete manufacturing, and rapid deployment speed as competitive barrier."
            emphasis="normal"
          />

          <MemoKeyPoints points={[
            "Sales cycles: Long B2B process mitigated by OpEx positioning and pilots",
            "ML accuracy: Limited rare event coverage mitigated by OEM partnerships",
            "Competition: Enterprise downmarket risk mitigated by deployment speed",
            "Customer concentration: 3 pilots represent 100% of revenue (diversifying in pipeline)"
          ]} />
        </MemoSection>

        {/* Use of Funds */}
        <MemoSection title="Use of Funds" index={9}>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <MemoHighlight metric="€360K" label="Engineering (45%)" />
            <MemoHighlight metric="€240K" label="Sales & GTM (30%)" />
            <MemoHighlight metric="€200K" label="Operations (25%)" />
          </div>

          <MemoParagraph 
            text="Engineering (€360K, 45%): Hire 2 additional ML engineers to complete core platform features (automated anomaly detection, energy optimization module) and 1 hardware engineer to develop next-gen sensor capabilities. This investment shortens customer deployment time to <2 days and expands addressable equipment types."
            emphasis="high"
          />

          <MemoParagraph 
            text="Sales & Go-to-Market (€240K, 30%): Hire experienced sales lead with manufacturing SaaS background (€120K compensation + commission structure). Remaining budget for trade show presence, demo equipment, case study development, and channel partner enablement materials. Target: 10 new customers, €250K ARR in 12 months."
            emphasis="medium"
          />

          <MemoParagraph 
            text="Operations (€200K, 25%): Product manager to formalize roadmap and customer feedback loop (€100K), customer success manager expansion to handle 10+ accounts (€60K), and operational expenses including cloud infrastructure, insurance, and legal/accounting (€40K). Provides 12-month runway at projected burn rate of €67K/month."
            emphasis="normal"
          />

          <MemoKeyPoints points={[
            "12-month runway target with €67K monthly burn rate",
            "Clear hiring plan: 3 engineers, 1 sales lead, 1 product manager",
            "Path to €250K ARR milestone within funded period",
            "Balanced investment: product development + customer acquisition"
          ]} />
        </MemoSection>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-display font-bold mb-4">Ready to create your own Investment Memorandum?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Answer a few questions about your startup, and get a comprehensive memo just like this one—tailored to your business, written in the language VCs use to evaluate deals.
          </p>
          <Button size="lg" onClick={() => navigate("/intake")}>
            Start Your Memorandum
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SampleMemo;
