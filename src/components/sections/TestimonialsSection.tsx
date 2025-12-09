import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Steve Jobs",
    title: "Founder, Some Fruit Company",
    quote: "This memo told me the Newton would flop. I should have listened to AI. Though to be fair, I also ignored everyone.",
    initials: "SJ",
  },
  {
    name: "Elon Musk",
    title: "Chief Tweeter",
    quote: "Skipped the memo, bought Twitter instead. The AI said 'consider the unit economics.' Hindsight is 20/20.",
    initials: "EM",
  },
  {
    name: "Elizabeth Holmes",
    title: "Theranos Visionary",
    quote: "It detected my 'vibes over substance' approach in 0.3 seconds. Very unfair. Very thorough.",
    initials: "EH",
  },
  {
    name: "Adam Neumann",
    title: "Professional Enlightener",
    quote: "The memo said my valuation was 'disconnected from reality.' I prefer 'ahead of its time.'",
    initials: "AN",
  },
  {
    name: "Sam Bankman-Fried",
    title: "Former Billionaire",
    quote: "Risk management? The AI kept flagging 'governance concerns.' I assumed it meant my hair.",
    initials: "SBF",
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-muted/20 via-background to-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
            Totally Real Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            What <span className="text-primary">Famous Founders</span> Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Industry legends share their definitely-not-made-up experiences with our platform.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20 group-hover:text-primary/40 transition-colors" />
              
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 via-primary/20 to-secondary/30 border-2 border-primary/40 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
                    <span className="text-lg font-bold text-primary group-hover:scale-110 transition-transform">
                      {testimonial.initials}
                    </span>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>

              {/* Quote */}
              <p className="text-foreground/90 leading-relaxed italic">
                "{testimonial.quote}"
              </p>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-12">
          * These testimonials are satirical and for entertainment purposes only. No famous founders were harmed in the making of this website.
        </p>
      </div>
    </section>
  );
};
