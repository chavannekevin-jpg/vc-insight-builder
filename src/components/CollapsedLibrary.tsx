import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface LibrarySection {
  title: string;
  items: {
    label: string;
    path: string;
    badge?: string;
  }[];
}

interface CollapsedLibraryProps {
  stage?: string;
}

export const CollapsedLibrary = ({ stage }: CollapsedLibraryProps) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default

  const getRecommendedForStage = (userStage?: string): { label: string; path: string; badge?: string }[] => {
    const stageMap: Record<string, { label: string; path: string }[]> = {
      "Pre Seed": [
        { label: "Pre-Seed Stage Guide", path: "/vcbrain/pre-seed" },
        { label: "What Angels Really Want", path: "/vcbrain/guides/angels" },
        { label: "Problem Slide Tips", path: "/vcbrain/deck/problem" }
      ],
      "Seed": [
        { label: "Seed Stage Guide", path: "/vcbrain/seed" },
        { label: "Early Traction Metrics", path: "/vcbrain/guides/traction" },
        { label: "Market Slide Essentials", path: "/vcbrain/deck/market" }
      ],
      "Series A": [
        { label: "Series A Preparation", path: "/vcbrain/seed" },
        { label: "Traction Slide Guide", path: "/vcbrain/deck/traction" },
        { label: "Product Slide Tips", path: "/vcbrain/deck/product" }
      ]
    };

    return stageMap[userStage || "Pre Seed"] || stageMap["Pre Seed"];
  };

  const sections: LibrarySection[] = [
    {
      title: "Stage Guides",
      items: [
        { label: "Angel Stage", path: "/vcbrain/angel" },
        { label: "Pre-Seed Stage", path: "/vcbrain/pre-seed" },
        { label: "Seed Stage", path: "/vcbrain/seed" },
        { label: "Stage Comparison", path: "/vcbrain/stages" }
      ]
    },
    {
      title: "Pitch Deck Library",
      items: [
        { label: "Problem Slide", path: "/vcbrain/deck/problem" },
        { label: "Solution Slide", path: "/vcbrain/deck/solution" },
        { label: "Market Slide", path: "/vcbrain/deck/market" },
        { label: "Product Slide", path: "/vcbrain/deck/product" },
        { label: "Traction Slide", path: "/vcbrain/deck/traction" },
        { label: "Team Slide", path: "/vcbrain/deck/team" }
      ]
    },
    {
      title: "Tactical Guides",
      items: [
        { label: "Early Traction", path: "/vcbrain/guides/traction" },
        { label: "What Angels Want", path: "/vcbrain/guides/angels" },
        { label: "Pitch Checklist", path: "/vcbrain/tools/checklist" }
      ]
    },
    {
      title: "Resources",
      items: [
        { label: "VC Glossary", path: "/vcbrain/tools/glossary" },
        { label: "Red Flag Database", path: "/vcbrain/tools/red-flags" },
        { label: "Why Startups Die", path: "/vcbrain/guides/death" },
        { label: "Fake TAMs Exposed", path: "/vcbrain/guides/tam" }
      ]
    }
  ];

  const recommendedItems = getRecommendedForStage(stage);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-display font-semibold">Knowledge Library</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          {isExpanded ? (
            <>
              Collapse <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Explore All <ChevronDown className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {!isExpanded ? (
        <div className="bg-card border border-border/50 rounded-2xl p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Recommended for {stage || "Pre-Seed"} founders:
          </p>
          <div className="space-y-2">
            {recommendedItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <span className="text-sm font-medium">{item.label}</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                {section.title}
              </h4>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-card border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all group text-left"
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};