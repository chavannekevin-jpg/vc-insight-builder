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
    // IMPORTANT: preserve blank lines so paragraph breaks render correctly.
    if (currentSection) {
      currentSection.content += (currentSection.content ? '\n' : '') + line;
    }
  }

  // Don't forget the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return { executiveSummary, sections };
}

function cleanText(text: string): string {
  return text
    // Remove bold markers
    .replace(/\*\*(.+?)\*\*/g, '$1')
    // Remove italic markers
    .replace(/\*(.+?)\*/g, '$1')
    // Remove remaining # headers
    .replace(/^#+\s*/gm, '')
    .trim();
}

function renderFormattedContent(content: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  const lines = content.split('\n');
  
  let currentParagraph: string[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let elementIndex = 0;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = cleanText(currentParagraph.join(' '));
      if (text) {
        elements.push(
          <p key={`p-${elementIndex++}`} className="leading-relaxed text-muted-foreground">
            {text}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList) {
      const ListTag = currentList.type === 'ul' ? 'ul' : 'ol';
      const listClass = currentList.type === 'ul' 
        ? 'list-disc list-inside space-y-2 ml-3 py-2 px-3 bg-muted/30 rounded-lg' 
        : 'list-decimal list-inside space-y-2 ml-3 py-2 px-3 bg-muted/30 rounded-lg';
      
      elements.push(
        <ListTag key={`list-${elementIndex++}`} className={listClass}>
          {currentList.items.map((item, i) => (
            <li key={i} className="leading-relaxed text-muted-foreground">{cleanText(item)}</li>
          ))}
        </ListTag>
      );
      currentList = null;
    }
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Empty line - flush current paragraph
    if (!trimmedLine) {
      flushParagraph();
      flushList();
      continue;
    }

    // Check for bullet points (- or *)
    const bulletMatch = trimmedLine.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      flushParagraph();
      if (currentList?.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // Check for numbered list (1. 2. etc)
    const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)/);
    if (numberedMatch) {
      flushParagraph();
      if (currentList?.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(numberedMatch[1]);
      continue;
    }

    // Check for sub-heading pattern (text ending with colon, typically short)
    const subheadingMatch = trimmedLine.match(/^(.{5,50}):$/);
    if (subheadingMatch && !trimmedLine.includes(' - ')) {
      flushParagraph();
      flushList();
      elements.push(
        <p key={`sh-${elementIndex++}`} className="text-foreground mt-4 mb-1 first:mt-0 border-l-2 border-primary/30 pl-3">
          {cleanText(subheadingMatch[1])}:
        </p>
      );
      continue;
    }

    // Regular text - add to paragraph
    flushList();
    currentParagraph.push(trimmedLine);
  }

  // Flush remaining content
  flushParagraph();
  flushList();

  return elements;
}

export function MiniMemoRenderer({ content }: MiniMemoRendererProps) {
  const { executiveSummary, sections } = parseMarkdownContent(content);

  return (
    <div className="space-y-4">
      {/* Executive Summary */}
      {executiveSummary && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <p className="text-sm text-primary mb-1">Executive Summary</p>
            <p className="text-sm leading-relaxed">{cleanText(executiveSummary)}</p>
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
              <CardContent className="pt-2 pb-5">
                <div className="space-y-4 text-sm">
                  {renderFormattedContent(section.content)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
