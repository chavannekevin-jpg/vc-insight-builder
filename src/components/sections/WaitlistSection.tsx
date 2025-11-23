import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Win98Card } from "../Win98Card";
import { Win98StartButton } from "../Win98StartButton";

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
    <section id="waitlist-form" className="py-16 px-4 bg-card/30">
      <div className="max-w-2xl mx-auto">
        <Win98Card title="Registration_Form.exe" accentColor="teal" className="border-2 border-primary">
          <div className="mb-8 text-center">
            <p className="font-sans text-sm">
              Register now to get early access and start building your investment memorandum
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full retro-input font-sans text-sm"
                placeholder="founder@startup.com"
              />
            </div>

            <div className="space-y-2">
              <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full retro-input font-sans text-sm"
                placeholder="Your Startup Inc."
              />
            </div>

            <div className="space-y-2">
              <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                Stage *
              </label>
              <select
                required
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full retro-input font-sans text-sm"
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
              <Win98StartButton
                type="submit"
                disabled={isSubmitting}
                variant="primary"
                size="large"
                className="w-full"
              >
                {isSubmitting ? "Processing..." : "[ REGISTER TO WAITLIST ]"}
              </Win98StartButton>
            </div>

            <div className="win98-inset p-3 bg-win98-yellow/20">
              <p className="font-sans text-xs text-center">
                🔒 Your information is secure and will only be used for waitlist purposes
              </p>
            </div>
          </form>
        </Win98Card>
      </div>
    </section>
  );
};
