import { useState } from "react";
import { Win98Window } from "../Win98Window";
import { useToast } from "@/hooks/use-toast";

export const WaitlistSection = () => {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [stage, setStage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Registration Successful!",
        description: "You've been added to the waitlist. Check your email for confirmation.",
      });
      setEmail("");
      setCompanyName("");
      setStage("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section id="waitlist-form" className="py-16 px-4 bg-background/50">
      <div className="max-w-2xl mx-auto">
        <Win98Window title="Waitlist_Registration.exe" className="ring-4 ring-accent">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-retro text-xl block">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full win98-border-inset bg-input px-4 py-2 font-retro text-xl focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="founder@startup.com"
              />
            </div>

            <div className="space-y-2">
              <label className="font-retro text-xl block">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full win98-border-inset bg-input px-4 py-2 font-retro text-xl focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your Startup Inc."
              />
            </div>

            <div className="space-y-2">
              <label className="font-retro text-xl block">
                Stage *
              </label>
              <select
                required
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full win98-border-inset bg-input px-4 py-2 font-retro text-xl focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-full win98-border px-6 py-4 font-retro text-2xl bg-primary text-primary-foreground hover:bg-primary/90 active:win98-border-inset transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "PROCESSING..." : "[ REGISTER TO WAITLIST ]"}
              </button>
            </div>

            <div className="win98-border-inset bg-input p-4">
              <p className="font-retro text-lg text-center">
                🔒 Your information is secure and will only be used for waitlist purposes
              </p>
            </div>
          </form>
        </Win98Window>
      </div>
    </section>
  );
};
