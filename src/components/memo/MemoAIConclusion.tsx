import { Sparkles, TrendingUp, AlertTriangle, Target, CheckCircle2 } from "lucide-react";
import { renderMarkdownText } from "@/lib/markdownParser";

interface MemoAIConclusionProps {
  text: string;
}

// Parse the conclusion text to extract structured sections
const parseConclusion = (text: string) => {
  const sections = {
    thesis: "",
    merits: [] as string[],
    considerations: [] as string[],
    recommendation: ""
  };

  // Try to extract structured content from markdown
  const lines = text.split('\n');
  let currentSection = 'thesis';
  let buffer: string[] = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('merit') || lowerLine.includes('strength') || lowerLine.includes('positive')) {
      if (buffer.length > 0 && currentSection === 'thesis') {
        sections.thesis = buffer.join('\n').trim();
      }
      currentSection = 'merits';
      buffer = [];
    } else if (lowerLine.includes('consideration') || lowerLine.includes('concern') || lowerLine.includes('risk') || lowerLine.includes('challenge')) {
      if (currentSection === 'merits' && buffer.length > 0) {
        sections.merits = buffer.filter(l => l.trim().startsWith('-') || l.trim().startsWith('•') || l.trim().startsWith('*'))
          .map(l => l.replace(/^[-•*]\s*/, '').trim());
      }
      currentSection = 'considerations';
      buffer = [];
    } else if (lowerLine.includes('recommendation') || lowerLine.includes('verdict') || lowerLine.includes('conclusion')) {
      if (currentSection === 'considerations' && buffer.length > 0) {
        sections.considerations = buffer.filter(l => l.trim().startsWith('-') || l.trim().startsWith('•') || l.trim().startsWith('*'))
          .map(l => l.replace(/^[-•*]\s*/, '').trim());
      }
      currentSection = 'recommendation';
      buffer = [];
    } else {
      buffer.push(line);
    }
  }

  // Handle remaining buffer
  if (buffer.length > 0) {
    if (currentSection === 'thesis') {
      sections.thesis = buffer.join('\n').trim();
    } else if (currentSection === 'recommendation') {
      sections.recommendation = buffer.join('\n').trim();
    } else if (currentSection === 'merits') {
      sections.merits = buffer.filter(l => l.trim().startsWith('-') || l.trim().startsWith('•') || l.trim().startsWith('*'))
        .map(l => l.replace(/^[-•*]\s*/, '').trim());
    } else if (currentSection === 'considerations') {
      sections.considerations = buffer.filter(l => l.trim().startsWith('-') || l.trim().startsWith('•') || l.trim().startsWith('*'))
        .map(l => l.replace(/^[-•*]\s*/, '').trim());
    }
  }

  // If parsing didn't yield structured content, use the full text as thesis
  if (!sections.thesis && !sections.merits.length && !sections.considerations.length && !sections.recommendation) {
    sections.thesis = text;
  }

  return sections;
};

export const MemoAIConclusion = ({ text }: MemoAIConclusionProps) => {
  const parsed = parseConclusion(text);
  const hasStructuredContent = parsed.merits.length > 0 || parsed.considerations.length > 0 || parsed.recommendation;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background mt-8 shadow-xl">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/15 opacity-50" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Header */}
      <div className="relative border-b border-primary/20 bg-primary/5 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 shadow-lg">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-foreground">Investment Synopsis</h3>
            <p className="text-sm text-muted-foreground">AI-powered analysis summary</p>
          </div>
        </div>
      </div>
      
      <div className="relative p-6 md:p-8 space-y-8">
        {/* Thesis Overview */}
        {parsed.thesis && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground uppercase tracking-wide text-sm">Thesis Overview</h4>
            </div>
            <div className="pl-10 text-foreground leading-relaxed prose prose-sm max-w-none">
              {renderMarkdownText(parsed.thesis)}
            </div>
          </div>
        )}

        {/* Key Investment Merits */}
        {parsed.merits.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <h4 className="font-semibold text-foreground uppercase tracking-wide text-sm">Key Investment Merits</h4>
            </div>
            <div className="pl-10 space-y-2">
              {parsed.merits.map((merit, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-green-600">{index + 1}</span>
                  </div>
                  <p className="text-foreground text-sm leading-relaxed">{merit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Considerations */}
        {parsed.considerations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <h4 className="font-semibold text-foreground uppercase tracking-wide text-sm">Critical Considerations</h4>
            </div>
            <div className="pl-10 space-y-2">
              {parsed.considerations.map((consideration, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-600">!</span>
                  </div>
                  <p className="text-foreground text-sm leading-relaxed">{consideration}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VC Recommendation */}
        {parsed.recommendation && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground uppercase tracking-wide text-sm">VC Recommendation</h4>
            </div>
            <div className="pl-10 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-foreground font-medium leading-relaxed">
                {renderMarkdownText(parsed.recommendation)}
              </p>
            </div>
          </div>
        )}

        {/* Fallback for unstructured content */}
        {!hasStructuredContent && parsed.thesis && (
          <div className="pt-4 border-t border-primary/10">
            <p className="text-muted-foreground text-sm italic text-center">
              Full structured analysis available in premium version
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
