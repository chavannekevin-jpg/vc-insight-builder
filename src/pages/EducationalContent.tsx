import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

const CONTENT: Record<string, { title: string; content: string }> = {
  "how-vcs-evaluate": {
    title: "How VCs Evaluate Startups",
    content: `
## The VC Evaluation Framework

After reviewing thousands of pitches over 10+ years, I can tell you that every VC uses a similar mental framework to evaluate startups. Understanding this framework is the first step to building a fundable company.

### The Core Questions

Every VC is trying to answer three fundamental questions:

1. **Can this be huge?** (Market opportunity)
2. **Can these people do it?** (Team & Execution)
3. **Why now?** (Timing & Competitive advantage)

Everything else is just detail. If you can't answer these three questions clearly and convincingly, you're not ready to raise.

### The Investment Thesis

VCs invest based on a thesis. They're not just buying lottery tickets—they're making calculated bets on market trends, technology shifts, and founder capabilities.

Your job is to:
- Understand their thesis
- Show how you fit into it
- Prove you're the best bet in that category

### Risk Assessment

VCs are professional risk assessors. They're looking at:
- **Market risk**: Is the market real and big enough?
- **Execution risk**: Can this team actually build and ship?
- **Timing risk**: Is the market ready for this solution?
- **Competitive risk**: What happens when incumbents wake up?

The best pitches don't hide these risks—they acknowledge them and show how they're mitigating them.

### Pattern Matching

VCs pattern match whether they admit it or not. They're comparing you to:
- Companies that succeeded in similar spaces
- Companies that failed for specific reasons
- Other startups in their portfolio

Understanding these patterns helps you position your startup more effectively.

---

**Ready to see YOUR memo?** Get a complete investment memo written about your startup from a VC's perspective.
    `
  },
  "four-pillars": {
    title: "The 4 Pillars: Market, Traction, Team, Defensibility",
    content: `
## The 4 Pillars of VC Evaluation

These four dimensions determine whether your startup gets funded. Period.

### 1. Market

**The most important pillar.** VCs want to invest in huge markets because:
- Even a small market share can be a big business
- Large markets attract talent and attention
- Exit opportunities are better

What VCs look for:
- Total Addressable Market (TAM) of $1B+
- Growing markets (10%+ annual growth)
- Clear path to capturing market share

Common mistakes:
- Bottom-up TAM that's too small
- Confusing market with revenue potential
- Ignoring market saturation

### 2. Traction

**Proof of concept beats everything.** Traction demonstrates:
- Product-market fit
- Execution capability
- Market demand

What counts as traction:
- Revenue growth (the gold standard)
- User growth with engagement
- Partnership wins
- Industry validation

What doesn't count:
- Press coverage
- Awards and recognition
- Being in an accelerator
- Letters of intent without contracts

### 3. Team

**VCs invest in people, not just ideas.** The team evaluation focuses on:
- Domain expertise
- Track record of execution
- Complementary skills
- Ability to attract talent

Red flags:
- All technical or all business co-founders
- No relevant experience
- Inability to articulate vision
- Weak hiring track record

### 4. Defensibility

**What stops someone else from copying you?** Your moat can be:
- Network effects
- High switching costs
- Proprietary technology
- Brand and community
- Regulatory barriers

Weak moats:
- "First mover advantage" (rarely holds)
- "We'll execute better" (not a moat)
- "It's a complex space" (not defensible)

---

**Remember**: You need to be strong in at least 3 out of 4 pillars to be fundable. Get your investment memo to see where your startup stands.
    `
  },
  "investment-committees": {
    title: "How Investment Committees Work",
    content: `
## Inside the Investment Committee

Understanding how VCs make decisions internally helps you understand what they need from you.

### The Partner Who Champions You

One partner becomes your "champion" inside the firm. Their job is to:
- Convince their partners to invest
- Defend you against skepticism
- Navigate internal politics

Your job is to give them ammunition:
- Clear, compelling narrative
- Strong data and traction
- Answers to obvious objections

### The IC Process

Typical flow:
1. **Initial screening** (90% rejected here)
2. **Partner meeting** (deeper dive)
3. **IC memo preparation** (your champion writes this)
4. **Investment Committee meeting** (all partners vote)
5. **Term sheet negotiation**

The IC memo is critical—it's what gets circulated before the meeting.

### What Partners Are Really Discussing

In the IC meeting, partners debate:
- Market size and timing
- Competitive landscape
- Team gaps and risks
- Valuation and ownership
- Portfolio fit and strategy

They're not just evaluating your startup—they're evaluating opportunity cost against other deals.

### How to Help Your Champion

Make it easy for your champion to sell you:
- Provide clear, honest metrics
- Have a compelling deck that tells itself
- Be available for partner calls
- Address concerns proactively
- Show momentum between meetings

### Red Flags That Kill Deals

Things that make partners say "no":
- Inconsistent stories from different founders
- Defensiveness about criticism
- Unclear use of funds
- Weak metrics or traction
- Market timing concerns
- Team gaps or conflicts

---

**The bottom line**: Your champion needs to convince their partners. Get your investment memo to see what arguments they'll use to sell (or reject) your startup.
    `
  },
  "vc-memos": {
    title: "What Memos Are and Why They Matter",
    content: `
## The VC Investment Memo

The memo is the most important document in venture capital. It's what actually gets you funded.

### What Is a VC Memo?

An investment memo is:
- An internal document written by your champion
- A comprehensive analysis of your startup
- The artifact that gets circulated to all partners
- The record that justifies the investment

It's NOT your pitch deck. It's a critical analysis written from the VC's perspective.

### What's In a Memo

Standard sections:
1. **Executive Summary** - The elevator pitch
2. **Problem/Opportunity** - Why this matters
3. **Solution** - What you're building
4. **Market Analysis** - Size, growth, dynamics
5. **Business Model** - How you make money
6. **Traction** - Proof it's working
7. **Team** - Why you can execute
8. **Competition** - Landscape and positioning
9. **Risks** - What could go wrong
10. **Investment Thesis** - Why invest now
11. **Terms** - Valuation and structure

### Why Memos Matter

The memo determines:
- Whether you get funding
- Your valuation
- Terms and conditions
- Future support from the firm

Partners read memos before meeting you. If the memo is weak, you're already fighting uphill.

### How This Platform Helps

This platform generates a memo that:
- Shows you how VCs see your startup
- Identifies gaps in your story
- Helps you strengthen weak areas
- Prepares you for tough questions

Most founders never see a memo about their startup. This changes that.

### Common Memo Red Flags

Things that hurt memos:
- Unclear problem definition
- Vague or unrealistic market sizing
- Weak traction metrics
- Team gaps or risks
- No clear competitive advantage
- Unrealistic financial projections

---

**Your mission**: Build a startup that writes a great memo. Get your investment memo to see what your memo looks like today.
    `
  },
  "why-vcs-reject": {
    title: "Why VCs Reject Founders",
    content: `
## Why VCs Say No (And What You Can Do About It)

After 10 years and thousands of rejections, here are the real patterns.

### The Top 10 Rejection Reasons

**1. Market Too Small**
- VCs need billion-dollar opportunities
- Bottom-up math doesn't work
- Fix: Find a bigger market or wedge

**2. No Traction**
- Ideas are cheap; proof is expensive
- Need demonstrated demand
- Fix: Build, launch, get users/revenue

**3. Team Gaps**
- Missing technical or business co-founder
- No domain expertise
- Fix: Hire or partner before raising

**4. Wrong Stage**
- Too early or too late for this investor
- Doesn't fit fund strategy
- Fix: Target stage-appropriate investors

**5. Competitive Concerns**
- Incumbents will crush you
- Already funded a competitor
- Fix: Prove differentiation or wedge

**6. Unclear Business Model**
- Don't understand how you make money
- Unit economics don't work
- Fix: Crystal clear revenue story

**7. Timing Is Off**
- Market not ready yet
- Or already saturated
- Fix: Prove why now is the time

**8. Can't Scale**
- Business requires linear growth
- Not defensible at scale
- Fix: Find leverage in the model

**9. Founder Concerns**
- Can't articulate vision
- Won't take feedback
- Lack of self-awareness
- Fix: Practice, listen, iterate

**10. Just Not a Fit**
- Doesn't match fund thesis
- Portfolio conflict
- Fix: Research investors better

### The Polite Rejection

When VCs say:
- "Too early for us" = We don't believe it yet
- "Not our thesis" = We don't invest in this
- "Let's stay in touch" = Show me more traction
- "Concerned about market" = Market too small
- "Great company, wrong time" = We're passing

Learn to read between the lines.

### What You Can Control

You can't control:
- VC fund strategy
- Market timing
- Competitive moves

You CAN control:
- Traction and metrics
- Team quality and gaps
- Story and positioning
- Preparation and research

Focus on what you control.

### The Pattern of Success

Successful fundraising looks like:
1. Build real traction first
2. Research investors carefully
3. Tell a clear, compelling story
4. Show self-awareness about risks
5. Demonstrate momentum

It's not about luck—it's about preparation.

---

**Ready to see where your startup stands?** Get your personalized investment memo to understand how VCs will evaluate your company.
    `
  }
};

export default function EducationalContent() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const content = slug ? CONTENT[slug] : null;

  if (!content) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p>Content not found</p>
          <Button onClick={() => navigate("/hub")}>Back to Hub</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/hub")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Hub
        </Button>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold">
            {content.title}
          </h1>
        </div>

        <ModernCard className="p-8">
          <div className="prose prose-lg max-w-none prose-headings:font-serif prose-h2:text-3xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-8 prose-h3:text-xl prose-h3:font-bold prose-h3:mb-3 prose-h3:mt-6 prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-ul:text-muted-foreground prose-li:my-2">
            {content.content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h2 key={i}>{line.replace('## ', '')}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={i}>{line.replace('### ', '')}</h3>;
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i}><strong>{line.replace(/\*\*/g, '')}</strong></p>;
              }
              if (line.startsWith('- ')) {
                return <li key={i}>{line.replace('- ', '')}</li>;
              }
              if (line.startsWith('---')) {
                return <hr key={i} className="my-8" />;
              }
              if (line.trim() === '') {
                return <br key={i} />;
              }
              return <p key={i}>{line}</p>;
            })}
          </div>
        </ModernCard>

        {/* Upgrade CTA */}
        <ModernCard className="p-8 text-center space-y-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30">
          <FileText className="w-12 h-12 text-primary mx-auto" />
          <h3 className="text-2xl font-bold">Apply This to Your Startup</h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Now that you understand how VCs think, see how they evaluate YOUR startup. 
            Get a complete investment memo written from a VC's perspective about your company.
          </p>
          <Button 
            size="lg"
            className="gradient-primary font-bold"
            onClick={() => navigate("/pricing")}
          >
            Get My Investment Memo →
          </Button>
        </ModernCard>
      </div>
    </div>
  );
}
