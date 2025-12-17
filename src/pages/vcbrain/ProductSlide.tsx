import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";

export default function ProductSlide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/deck/product");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Product Slide: Show, Don't Tell. And Make It Look Real.
        </h1>
        <p className="text-xl text-muted-foreground">
          If your product slide is just wireframes and "coming soon" features, you're dead in the water.
        </p>
      </div>

      <Callout type="danger">
        <strong>Reality Check:</strong> The product slide is where VCs separate builders from talkers. 
        Mockups signal you haven't actually built anything. Screenshots with real data signal you ship.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What VCs Actually Look For</h2>
        <p>
          This isn't about explaining every feature. It's about proving your product is real, 
          that people use it, and that it's not held together with duct tape. Here's what matters:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>Real product screenshots:</strong> Not Figma designs. Not concept art. Actual product with real user data.</li>
          <li><strong>Key workflows shown:</strong> Illustrate the 2-3 core actions users take to get value.</li>
          <li><strong>Proof of polish:</strong> If your product looks like a student project, investors assume it is one.</li>
          <li><strong>Mobile + web (if relevant):</strong> Show you've thought through multi-platform strategy.</li>
        </ul>
      </div>

      <ComparisonTable
        good={[
          "Here's our dashboard with 10,000 active companies using it daily",
          "This workflow reduced user onboarding from 30 minutes to 2 minutes",
          "Mobile app with 4.8-star rating and 50K downloads",
        ]}
        bad={[
          "Here's our roadmap for the next 12 months",
          "We're planning to build these features soon",
          "Our MVP will launch in Q3",
          "These wireframes show our vision",
          "We'll add AI capabilities next quarter",
        ]}
      />

      <ConversionBanner message="Not sure how to showcase your product without overwhelming investors? The VC Analysis breaks down exactly what to show and what to skip." />

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Product Slide Killers</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">1. Showing Prototypes, Not Product</h3>
            <p>
              If your screenshots are clearly mockups, you're telling investors you haven't shipped. 
              That's a massive red flag at any stage past ideation.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">2. Too Much, Too Fast</h3>
            <p>
              7 screenshots crammed on one slide. Investors can't process it. Show 1-2 key screens 
              that communicate the core value. Save the full tour for the demo.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">3. Ugly Product = No Confidence</h3>
            <p>
              Design matters. Not because VCs care about gradients, but because bad design signals you 
              don't care about user experience. And if you don't care, users won't either.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">4. No Context</h3>
            <p>
              Random screenshots without explanation. Investors don't know your product. Walk them through 
              the key workflow in 30 seconds or less.
            </p>
          </div>
        </div>
      </div>

      <Checklist
        items={[
          "I'm showing real product screenshots, not mockups",
          "My screenshots include real user data (anonymized if needed)",
          "I focus on 1-2 core workflows, not every feature",
          "My product looks polished and professional",
          "I explain what users are seeing and why it matters",
          "I highlight the key differentiation visually",
        ]}
      />

      <Callout type="warning">
        <strong>What Happens If You Screw This Up:</strong> Investors will assume your product is vaporware 
        or that you're a designer pretending to be a builder. Either way, you're not getting funded.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What Great Founders Do</h2>
        <p>They make the product feel inevitable and real:</p>
        <ul className="space-y-2 my-4">
          <li>Show 1-2 polished, high-res screenshots with real data</li>
          <li>Annotate key features with quick callouts</li>
          <li>Include a user testimonial about the product experience</li>
          <li>If possible, embed a 10-second product video or GIF showing real usage</li>
        </ul>
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">
          Master Every Slide in Your Pitch
        </h3>
        <p className="text-muted-foreground">
          The Investment Memorandum Template deconstructs every slide—what investors look for, 
          what kills your credibility, and exactly how to position your product.
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
