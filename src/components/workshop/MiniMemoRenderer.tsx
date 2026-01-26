import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Rocket,
  Award,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniMemoRendererProps {
  content: string;
}

// Map section titles to icons
const sectionIcons: Record<string, React.ElementType> = {
  "The Problem": AlertTriangle,
  "Problem": AlertTriangle,
  "The Solution": Lightbulb,
  "Solution": Lightbulb,
  "Market Opportunity": Target,
  "Market": Target,
  "Business Model": DollarSign,
  "Go-to-Market Strategy": Rocket,
  "Go-to-Market": Rocket,
  "GTM": Rocket,
  "The Team": Users,
  "Team": Users,
  "Funding Strategy": TrendingUp,
  "Investment Thesis": Award,
  "Executive Summary": FileText,
};

function getSectionIcon(title: string): React.ElementType {
  // Try exact match first
  if (sectionIcons[title]) return sectionIcons[title];
  
  // Try partial match
  for (const [key, icon] of Object.entries(sectionIcons)) {
    if (title.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  
  return FileText;
}

function parseMarkdownContent(content: string): { executiveSummary: string | null; sections: { title: string; content: string }[] } {
  const lines = content.split('\n');
  const sections: { title: string; content: string }[] = [];
  let executiveSummary: string | null = null;
  let currentSection: { title: string; content: string } | null = null;

  for (const line of lines) {
    // Check for executive summary (bold text at start)
    const execMatch = line.match(/^\*\*Executive Summary:\*\*\s*(.+)/i);
    if (execMatch) {
      executiveSummary = execMatch[1].trim();
      continue;
    }

    // Check for section headers (## format)
    const headerMatch = line.match(/^##\s+(.+)/);
    if (headerMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: headerMatch[1].trim(),
        content: '',
      };
      continue;
    }

    // Skip the main title and horizontal rules
    if (line.match(/^#\s+/) || line.match(/^---+$/)) {
      continue;
    }

    // Add content to current section
    if (currentSection && line.trim()) {
      currentSection.content += (currentSection.content ? '\n' : '') + line;
    }
  }

  // Don't forget the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return { executiveSummary, sections };
}

function cleanContent(content: string): string {
  return content
    // Remove bold markers
    .replace(/\*\*(.+?)\*\*/g, '$1')
    // Remove italic markers
    .replace(/\*(.+?)\*/g, '$1')
    // Remove remaining # headers
    .replace(/^#+\s*/gm, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function MiniMemoRenderer({ content }: MiniMemoRendererProps) {
  const { executiveSummary, sections } = parseMarkdownContent(content);

  return (
    <div className="space-y-4">
      {/* Executive Summary */}
      {executiveSummary && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-primary mb-1">Executive Summary</p>
            <p className="text-sm leading-relaxed">{cleanContent(executiveSummary)}</p>
          </CardContent>
        </Card>
      )}

      {/* Section Cards */}
      <div className="grid gap-4">
        {sections.map((section, index) => {
          const Icon = getSectionIcon(section.title);
          const isInvestmentThesis = section.title.toLowerCase().includes('investment thesis');
          
          return (
            <Card 
              key={index}
              className={cn(
                "transition-all",
                isInvestmentThesis 
                  ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30" 
                  : "bg-card/50 border-border/50"
              )}
            >
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    isInvestmentThesis 
                      ? "bg-primary/20 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={isInvestmentThesis ? "text-primary" : ""}>
                    {section.title}
                  </span>
                  {isInvestmentThesis && (
                    <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      AI Generated
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {cleanContent(section.content)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
