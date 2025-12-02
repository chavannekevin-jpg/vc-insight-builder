import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Check, X, BookOpen, Sparkles, Users } from "lucide-react";
import { usePricingSettings } from "@/hooks/usePricingSettings";

const Pricing = () => {
  const navigate = useNavigate();
  const { data: pricingSettings, isLoading } = usePricingSettings();

  const memoPricing = pricingSettings?.memo_pricing;
  const networkPricing = pricingSettings?.network_pricing;

  const memoFinalPrice = memoPricing?.early_access_enabled 
    ? memoPricing.base_price * (1 - memoPricing.early_access_discount / 100)
    : memoPricing?.base_price ?? 59.99;

  const pricingPlans = [
    {
      name: "Freemium",
      subtitle: "Everything You Need to Start",
      price: "€0",
      description: "Full access to VC knowledge and frameworks",
      icon: BookOpen,
      features: [
        { text: "Full access to VC Hub", included: true },
        { text: "Complete educational content library", included: true },
        { text: "Pitch deck frameworks and templates", included: true },
        { text: "Track your fundraising progress", included: true },
        { text: "Personalized investment memorandum", included: false },
        { text: "Supporting materials and insights", included: false },
        { text: "Network exposure to 400+ investors", included: false }
      ],
      cta: "Start Free",
      popular: false,
      color: "secondary"
    },
    {
      name: "Investment Memo Builder",
      subtitle: "Your Fundraising Weapon",
      price: `€${memoFinalPrice.toFixed(2)}`,
      originalPrice: memoPricing?.early_access_enabled ? `€${memoPricing.base_price.toFixed(2)}` : null,
      description: "Professional memo that VCs actually read",
      icon: Sparkles,
      features: [
        { text: "Everything in Freemium", included: true, bold: true },
        { text: "One personalized investment memorandum", included: true },
        { text: "Tailored to your business model", included: true },
        { text: "All supporting materials and insights", included: true },
        { text: "Actionable feedback on your pitch", included: true },
        { text: "Unlimited memo updates", included: false },
        { text: "Network exposure to 400+ investors", included: false }
      ],
      cta: "Build My Memo",
      popular: true,
      color: "primary",
      waitlistBadge: memoPricing?.early_access_enabled
    },
    {
      name: "Network Access",
      subtitle: "Get In Front of Capital",
      price: `€${(networkPricing?.base_price ?? 159.99).toFixed(2)}`,
      description: "Your memo delivered to real investors",
      icon: Users,
      features: [
        { text: "Everything in Memo Builder", included: true, bold: true },
        { text: "Unlimited memo updates", included: true },
        { text: "Profile shared with 400+ investors", included: true },
        { text: "Direct introductions when there's interest", included: true },
        { text: "Priority memo delivery (7 days)", included: true },
        { text: "Priority support throughout", included: true },
        { text: "Results-based investor matching", included: true }
      ],
      cta: "Get Network Access",
      popular: false,
      color: "accent"
    }
  ];

  const faqs = [
    {
      question: "Why is the Freemium tier actually free?",
      answer: "Because most founders fail due to lack of knowledge, not lack of capital. We want you to have the frameworks and education you need. We only charge when you're ready to fundraise seriously."
    },
    {
      question: `What makes the investment memo worth €${memoFinalPrice.toFixed(2)}?`,
      answer: "It's a personalized memorandum that translates your startup into VC language. Most founders pitch poorly because they don't speak investor. This memo does it for you—and it's cheaper than a single coffee meeting that goes nowhere."
    },
    {
      question: "How does Network Access actually work?",
      answer: "Your company profile and memo get pushed to our network of 400+ active investors. When someone shows interest, we facilitate the introduction. We don't guarantee funding—nobody can—but we guarantee exposure to real decision-makers."
    },
    {
      question: "Can I upgrade from one plan to another?",
      answer: "Absolutely. Start with Freemium, upgrade to Memo Builder when you're ready, and add Network Access when you need exposure. Pay only for what you need, when you need it."
    },
    {
      question: "Is there a refund policy?",
      answer: "Yes. 14-day money-back guarantee if you're not satisfied with your memo. But you'll be satisfied—this isn't our first rodeo."
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            No BS Pricing
          </Badge>
          <h1 className="text-5xl md:text-6xl font-serif mb-6">
            Pay Only for What You Need
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start free. Upgrade when you're ready to fundraise. Add network access when you need it.
            <br />
            <span className="font-semibold text-foreground">Simple. Transparent. No hidden costs.</span>
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <ModernCard 
                  key={index}
                  className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-xl scale-105 md:scale-105' : ''}`}
                >
                   {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="gradient-primary text-white border-0 px-4 py-1">
                        {plan.waitlistBadge ? `${memoPricing?.early_access_discount}% OFF - Early Access` : "Most Popular"}
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${plan.popular ? 'gradient-primary' : 'gradient-accent'} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-serif">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2 mb-2">
                        {plan.originalPrice && (
                          <span className="text-2xl font-bold line-through text-muted-foreground/50">{plan.originalPrice}</span>
                        )}
                        <span className="text-4xl font-bold">{plan.price}</span>
                        {plan.name === "Freemium" && (
                          <span className="text-sm text-muted-foreground">/forever</span>
                        )}
                        {plan.name !== "Freemium" && (
                          <span className="text-sm text-muted-foreground">/one-time</span>
                        )}
                      </div>
                      {plan.waitlistBadge && (
                        <Badge variant="secondary" className="mb-2">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Limited Time: {memoPricing?.early_access_discount}% Off
                        </Badge>
                      )}
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    <ul className="space-y-3 py-6 min-h-[320px]">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground/30 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`${feature.included ? 'text-foreground' : 'text-muted-foreground/50 line-through'} ${feature.bold ? 'font-semibold' : ''}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      onClick={() => navigate(plan.name === "Freemium" ? '/auth' : `/auth?plan=${encodeURIComponent(plan.name)}&price=${encodeURIComponent(plan.price)}`)}
                      className={plan.popular ? "w-full gradient-primary hover-neon-pulse" : "w-full hover-neon-pulse"}
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
              <h2 className="text-3xl font-serif">Stop Wasting Time on Bad Pitches</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Start with free access to everything you need. Pay only when you're ready to raise.
                <br />
                <span className="font-semibold text-foreground">No BS. No surprises.</span>
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="gradient-primary px-8 shadow-glow hover:shadow-glow-strong"
              >
                Start Free Now
              </Button>
              <p className="text-xs text-muted-foreground">
                14-day money-back guarantee on paid plans • Free tier is free forever
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
