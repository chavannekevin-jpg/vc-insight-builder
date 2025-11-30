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
  const [isExpanded, setIsExpanded] = useState(false);

  const getRecommendedForStage = (userStage?: string): { label: string; path: string; badge?: string }[] => {
    const stageMap: Record<string, { label: string; path: string }[]> = {
      "Pre Seed": [
        { label: "Pre-Seed Stage Guide", path: "/vcbrain/pre-seed" },
        { label: "What Angels Really Want", path: "/vcbrain/what-angels-want" },
        { label: "Problem Slide Tips", path: "/vcbrain/problem-slide" }
      ],
      "Seed": [
        { label: "Seed Stage Guide", path: "/vcbrain/seed-stage" },
        { label: "Early Traction Metrics", path: "/vcbrain/early-traction" },
        { label: "Market Slide Essentials", path: "/vcbrain/market-slide" }
      ],
      "Series A": [
        { label: "Series A Preparation", path: "/vcbrain/seed-stage" },
        { label: "Traction Slide Guide", path: "/vcbrain/traction-slide" },
        { label: "Product Slide Tips", path: "/vcbrain/product-slide" }
      ]
    };

    return stageMap[userStage || "Pre Seed"] || stageMap["Pre Seed"];
  };

  const sections: LibrarySection[] = [
    {
      title: "Stage Guides",
      items: [
        { label: "Angel Stage", path: "/vcbrain/angel-stage" },
        { label: "Pre-Seed Stage", path: "/vcbrain/pre-seed" },
        { label: "Seed Stage", path: "/vcbrain/seed-stage" },
        { label: "Stage Comparison", path: "/vcbrain/stage-comparison" }
      ]
    },
    {
      title: "Pitch Deck Library",
      items: [
        { label: "Problem Slide", path: "/vcbrain/problem-slide" },
        { label: "Solution Slide", path: "/vcbrain/solution-slide" },
        { label: "Market Slide", path: "/vcbrain/market-slide" },
        { label: "Product Slide", path: "/vcbrain/product-slide" },
        { label: "Traction Slide", path: "/vcbrain/traction-slide" },
        { label: "Team Slide", path: "/vcbrain/team-slide" }
      ]
    },
    {
      title: "Tactical Guides",
      items: [
        { label: "Early Traction", path: "/vcbrain/early-traction" },
        { label: "What Angels Want", path: "/vcbrain/what-angels-want" },
        { label: "Pitch Checklist", path: "/vcbrain/pitch-checklist" }
      ]
    },
    {
      title: "Resources",
      items: [
        { label: "VC Glossary", path: "/vcbrain/glossary" },
        { label: "Red Flag Database", path: "/vcbrain/red-flags" },
        { label: "Why Startups Die", path: "/vcbrain/why-startups-die" },
        { label: "Fake TAMs Exposed", path: "/vcbrain/fake-tams" }
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
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {section.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all group"
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
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