import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function VCGlossary() {
  const navigate = useNavigate();

  const terms = [
    {
      term: "TAM / SAM / SOM",
      definition: "Total Addressable Market / Serviceable Addressable Market / Serviceable Obtainable Market. Most founders inflate TAM. Focus on SOM—what you can realistically capture."
    },
    {
      term: "PMF (Product-Market Fit)",
      definition: "When your product solves a real problem so well that users can't imagine going back. If you have to ask if you have PMF, you don't."
    },
    {
      term: "CAC (Customer Acquisition Cost)",
      definition: "Total sales & marketing spend divided by new customers acquired. If this is higher than LTV, you're burning money."
    },
    {
      term: "LTV (Lifetime Value)",
      definition: "Total revenue a customer generates before churning. Should be 3x+ your CAC to have a viable business."
    },
    {
      term: "MRR / ARR",
      definition: "Monthly Recurring Revenue / Annual Recurring Revenue. The lifeblood of SaaS. VCs care about growth rate, not just absolute numbers."
    },
    {
      term: "Churn",
      definition: "% of customers who stop using your product. Above 5% monthly churn and you have a leaky bucket. Fix it before scaling."
    },
    {
      term: "Burn Rate",
      definition: "How fast you're spending money per month. If you have 6 months of runway, you're already dead—you just don't know it yet."
    },
    {
      term: "Runway",
      definition: "Months until you run out of money. Always keep 18+ months. Fundraising takes 6 months when you think it'll take 2."
    },
    {
      term: "Dilution",
      definition: "% of company you give up in a funding round. Raising at a low valuation means massive dilution. Fight for every point."
    },
    {
      term: "Valuation",
      definition: "What investors think your company is worth. Pre-money = before investment. Post-money = after. Know the difference."
    },
    {
      term: "Term Sheet",
      definition: "Non-binding agreement outlining investment terms. Read every line. VCs bury poison pills in the fine print."
    },
    {
      term: "Liquidation Preference",
      definition: "Who gets paid first when company sells. 1x is standard. Anything above that screws founders if exit is mediocre."
    },
    {
      term: "Pro Rata Rights",
      definition: "Investor's right to maintain ownership % in future rounds. Sounds fair, but creates downstream complexity."
    },
    {
      term: "Convertible Note / SAFE",
      definition: "Debt that converts to equity later. Fast and cheap, but can blow up your cap table if you're not careful."
    },
    {
      term: "Cap Table",
      definition: "Who owns what % of your company. Keep it clean. Messy cap tables kill deals."
    },
    {
      term: "409A Valuation",
      definition: "IRS-approved company valuation for stock options. Required for US companies. Not negotiable."
    },
    {
      term: "Vesting",
      definition: "Earning equity over time (usually 4 years with 1-year cliff). Protects against co-founders who quit early."
    },
    {
      term: "Cliff",
      definition: "Period before any equity vests (usually 1 year). If you quit before the cliff, you get zero equity."
    },
    {
      term: "Down Round",
      definition: "Raising at a lower valuation than your last round. Death spiral. Avoid at all costs."
    },
    {
      term: "Pivot",
      definition: "Changing your business model/product after realizing current approach doesn't work. Not failure—it's learning."
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          VC Glossary: Translate the Bullshit
        </h1>
        <p className="text-xl text-muted-foreground">
          VCs speak a different language. Learn it so they can't confuse you.
        </p>
      </div>

      <div className="grid gap-4">
        {terms.map((item, index) => (
          <div key={index} className="p-6 bg-card/50 border border-border/50 rounded-xl hover:border-primary/30 transition-colors">
            <h3 className="text-lg font-bold text-primary mb-2">{item.term}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.definition}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4 mt-12">
        <h3 className="text-2xl font-bold text-foreground">
          Master the Language of VCs
        </h3>
        <p className="text-muted-foreground">
          The Investment Memorandum breaks down every term, every metric, and every framework 
          VCs use to evaluate startups—so you can speak their language fluently.
        </p>
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Get the Full Framework
        </Button>
      </div>
    </div>
  );
}
