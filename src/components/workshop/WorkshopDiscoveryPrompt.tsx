import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircleQuestion, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscoveryPrompt {
  question: string;
  trigger: string;
}

interface WorkshopDiscoveryPromptProps {
  text: string;
  sectionKey: string;
  onAddToResponse: (addition: string) => void;
}

// Default discovery prompts for each section (Mom Test style)
const DEFAULT_PROMPTS: Record<string, DiscoveryPrompt[]> = {
  problem: [
    { question: "How many potential customers have you spoken to about this problem?", trigger: "interview" },
    { question: "What workarounds are they currently using?", trigger: "workaround" },
    { question: "How did you discover this problem exists?", trigger: "discover" },
    { question: "What happens if they don't solve this problem?", trigger: "consequence" },
  ],
  solution: [
    { question: "Have customers tried your prototype? What was their reaction?", trigger: "prototype" },
    { question: "Why is now the right time for this solution?", trigger: "timing" },
    { question: "What's the 'aha moment' when customers first see your solution?", trigger: "aha" },
  ],
  market: [
    { question: "Who are your first 10 customers? Can you name them?", trigger: "first" },
    { question: "Why this segment first vs. a larger market?", trigger: "segment" },
    { question: "What recent change makes this market accessible now?", trigger: "change" },
  ],
  business_model: [
    { question: "How did you arrive at this pricing?", trigger: "pricing" },
    { question: "What are customers currently paying for alternatives?", trigger: "alternatives" },
  ],
  gtm: [
    { question: "How will you find your first 10 paying customers?", trigger: "acquire" },
    { question: "What's your unfair distribution advantage?", trigger: "advantage" },
  ],
  team: [
    { question: "What's your unfair insight about this problem?", trigger: "insight" },
    { question: "Have you worked in this industry before?", trigger: "experience" },
    { question: "What skill gaps do you need to fill?", trigger: "gaps" },
  ],
  funding_strategy: [
    { question: "What specific milestones will this funding help you reach?", trigger: "milestone" },
    { question: "What metrics will you need for your next round?", trigger: "metrics" },
  ],
};

export function WorkshopDiscoveryPrompt({ 
  text, 
  sectionKey, 
  onAddToResponse 
}: WorkshopDiscoveryPromptProps) {
  const [activePromptIndex, setActivePromptIndex] = useState<number | null>(null);
  const [promptAnswer, setPromptAnswer] = useState("");

  const prompts = DEFAULT_PROMPTS[sectionKey] || [];
  const textLower = text.toLowerCase();

  // Find prompts that haven't been addressed (trigger word not in text)
  const unansweredPrompts = prompts.filter(
    (prompt) => !textLower.includes(prompt.trigger.toLowerCase())
  );

  if (unansweredPrompts.length === 0 || !text.trim()) {
    return null;
  }

  const handleAddAnswer = () => {
    if (promptAnswer.trim() && activePromptIndex !== null) {
      const prompt = unansweredPrompts[activePromptIndex];
      const formattedAddition = `\n\n**${prompt.question}**\n${promptAnswer.trim()}`;
      onAddToResponse(formattedAddition);
      setPromptAnswer("");
      setActivePromptIndex(null);
    }
  };

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <MessageCircleQuestion className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Deepen Your Discovery</span>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Answer these questions to strengthen your validation evidence:
      </p>

      <div className="space-y-2">
        {unansweredPrompts.slice(0, 3).map((prompt, index) => (
          <div key={index} className="space-y-2">
            {activePromptIndex === index ? (
              <div className="space-y-2 p-3 rounded-md bg-background border border-border">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-foreground">{prompt.question}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setActivePromptIndex(null);
                      setPromptAnswer("");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Textarea
                  value={promptAnswer}
                  onChange={(e) => setPromptAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  rows={3}
                  className="text-sm"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActivePromptIndex(null);
                      setPromptAnswer("");
                    }}
                  >
                    Skip
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddAnswer}
                    disabled={!promptAnswer.trim()}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add to Response
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setActivePromptIndex(index)}
                className={cn(
                  "w-full text-left p-2 rounded-md text-sm transition-colors",
                  "hover:bg-background border border-transparent hover:border-border",
                  "text-muted-foreground hover:text-foreground"
                )}
              >
                💬 {prompt.question}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
