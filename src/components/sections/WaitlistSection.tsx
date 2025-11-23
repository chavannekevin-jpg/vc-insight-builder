import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const WaitlistSection = () => {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [stage, setStage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Welcome to the platform!",
        description: "You're now registered. Let's set up your company profile.",
      });
      
      // Store registration data and redirect to portal
      localStorage.setItem('founderEmail', email);
      localStorage.setItem('companyName', companyName);
      localStorage.setItem('companyStage', stage);
      
      navigate('/portal');
    }, 1000);
  };

  return (
    <section id="waitlist-form" className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="retro-card p-8 border-2 border-accent">
          <div className="mb-8 text-center">
            <h2 className="font-pixel text-lg mb-3">Join the Waitlist</h2>
            <p className="font-sans text-base text-muted-foreground">
              Register now to get early access and start building your investment memorandum
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-sans text-sm font-semibold block">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full retro-input px-4 py-3 font-sans text-base"
                placeholder="founder@startup.com"
              />
            </div>

            <div className="space-y-2">
              <label className="font-sans text-sm font-semibold block">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full retro-input px-4 py-3 font-sans text-base"
                placeholder="Your Startup Inc."
              />
            </div>

            <div className="space-y-2">
              <label className="font-sans text-sm font-semibold block">
                Stage *
              </label>
              <select
                required
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full retro-input px-4 py-3 font-sans text-base"
              >
                <option value="">Select stage...</option>
                <option value="idea">Idea Stage</option>
                <option value="mvp">MVP</option>
                <option value="pre-seed">Pre-Seed</option>
                <option value="seed">Seed</option>
                <option value="series-a">Series A</option>
                <option value="series-b+">Series B+</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 font-sans font-semibold text-base rounded-lg border-2 gradient-retro text-white hover:opacity-90 transition-all duration-200 shadow-[4px_4px_0_hsl(var(--retro-teal))] hover:shadow-[6px_6px_0_hsl(var(--retro-teal))] hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? "Processing..." : "Register to Waitlist →"}
              </button>
            </div>

            <div className="retro-card p-4 bg-muted">
              <p className="font-sans text-sm text-center text-muted-foreground">
                🔒 Your information is secure and will only be used for waitlist purposes
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
