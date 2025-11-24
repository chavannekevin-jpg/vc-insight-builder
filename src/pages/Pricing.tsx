import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Check, Zap, Clock, Users } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();

  const pricingPlans = [
    {
      name: "Early Access",
      subtitle: "Early Access - 50% Off",
      price: "€29.99",
      originalPrice: "€59.99",
      discount: "50% OFF",
      description: "Discounted price for early joiners",
      icon: Clock,
      features: [
        "Get your memo when platform launches",
        "Save €30 with early access pricing",
        "Company profile shared to our VC network (optional)"
      ],
      cta: "Join Early Access",
      popular: true,
      color: "primary"
    },
    {
      name: "Skip The Line",
      subtitle: "Express Service",
      price: "€159.99",
      description: "Get your memo within one week",
      icon: Zap,
      features: [
        "Receive your memo within one week",
        "Jump ahead of the waitlist",
        "Company profile shared to our VC network (optional)"
      ],
      cta: "Skip the Line",
      popular: false,
      color: "accent"
    }
  ];

  const premiumPlan = {
    icon: Users,
    name: "VIP Fast Track",
    subtitle: "Ultra Premium Package",
    price: "€399",
    description: "Express delivery + investor network exposure",
    features: [
      "Express memo delivered within one week",
      "Memo pushed to our network of 100+ global investors",
      "Direct introductions to VCs/investors if they show interest",
      "Priority support throughout the process",
      "Results-based introductions (we facilitate connections, not guarantees)"
    ],
    cta: "Get VIP Access",
    badge: "Most Exclusive"
  };

  const faqs = [
    {
      question: "What's included in the memorandum?",
      answer: "A comprehensive VC-grade investment memorandum covering your business model, market analysis, traction, team, financials, and strategic insights. Plus diagnostic feedback to improve your model."
    },
    {
      question: "How long does it take to generate?",
      answer: "Early Access users receive their memo when the platform launches. Skip the Line users get their memo within one week of submitting their questionnaire."
    },
    {
      question: "Can I update my memorandum later?",
      answer: "Yes! You can request updates as your startup evolves. Early Access users get lifetime updates included."
    },
    {
      question: "What format is the memorandum delivered in?",
      answer: "Your memorandum is delivered as a professionally formatted PDF document, ready to share with investors."
    },
    {
      question: "Is there a refund policy?",
      answer: "Yes, we offer a 14-day money-back guarantee if you're not satisfied with your memorandum."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-5xl md:text-6xl font-serif mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Select the option that fits your timeline. Both plans give you the same 
            high-quality, VC-calibrated investment memorandum.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {pricingPlans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <ModernCard 
                  key={index}
                  className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-xl' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="gradient-primary text-white border-0 px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-serif">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        {plan.originalPrice && (
                          <span className="text-lg text-muted-foreground line-through">
                            {plan.originalPrice}
                          </span>
                        )}
                      </div>
                      {plan.discount && (
                        <Badge variant="secondary" className="mb-2">
                          {plan.discount}
                        </Badge>
                      )}
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    <ul className="space-y-3 py-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      onClick={() => navigate(`/auth?plan=${encodeURIComponent(plan.name)}&price=${encodeURIComponent(plan.price)}`)}
                      className={plan.popular ? "w-full gradient-primary" : "w-full"}
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </ModernCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Premium background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border-2 border-accent/40 backdrop-blur-xl mb-6">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold text-accent">ULTRA PREMIUM</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
              VIP Fast Track
            </h2>
            <p className="text-xl text-foreground/80 font-medium">
              Maximum exposure, maximum impact
            </p>
          </div>

          <ModernCard className="relative overflow-hidden border-2 border-accent/40 shadow-[0_0_50px_rgba(236,72,153,0.3)]">
            {/* Premium glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-primary/5 to-secondary/5 -z-10" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -z-10" />
            
            <div className="relative space-y-8 p-8">
              {/* Badge */}
              <div className="flex justify-between items-start">
                <Badge className="bg-accent/20 text-accent border-2 border-accent/40 px-4 py-1.5 text-xs font-bold">
                  {premiumPlan.badge}
                </Badge>
                <div className="text-right">
                  <div className="text-5xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                    {premiumPlan.price}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">One-time payment</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-2xl font-bold mb-2">{premiumPlan.name}</h3>
                <p className="text-base text-foreground/70">{premiumPlan.description}</p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {premiumPlan.features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 hover:bg-accent/10 hover:border-accent/30 transition-all duration-300"
                  >
                    <div className="p-1 rounded-full bg-accent/20 mt-0.5">
                      <Check className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-sm text-foreground/90 leading-relaxed font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <p className="text-xs text-muted-foreground italic text-center">
                  * We facilitate high-quality introductions based on investor interest. Results depend on your startup's fit with investor criteria.
                </p>
              </div>

              {/* CTA */}
              <Button 
                size="lg"
                onClick={() => navigate('/')}
                className="w-full gradient-accent hover-neon-pulse text-lg py-6 font-bold shadow-glow"
              >
                {premiumPlan.cta} →
              </Button>
            </div>
          </ModernCard>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <ModernCard key={index} hover>
                <div className="space-y-2">
                  <h3 className="font-semibold">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <ModernCard className="shadow-xl">
            <div className="space-y-6 py-8">
              <h2 className="text-3xl font-serif">Ready to Transform Your Fundraising?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that fits your timeline and get your investment memorandum.
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/')}
                className="gradient-primary px-8 shadow-glow hover:shadow-glow-strong"
              >
                View All Plans
              </Button>
              <p className="text-xs text-muted-foreground">
                14-day money-back guarantee • Secure payment processing
              </p>
            </div>
          </ModernCard>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
