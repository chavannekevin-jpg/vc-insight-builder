import { Users, AlertTriangle, CheckCircle, UserPlus, Briefcase, Database } from "lucide-react";
import { ExtractedTeamMember, getCriticalRoles } from "@/lib/memoDataExtractor";
import { safeLower } from "@/lib/stringUtils";
import { CredibilityGapAnalysis, EditableTool } from "@/types/memo";
import { safeArray, safeText, mergeToolData } from "@/lib/toolDataUtils";

interface MemoTeamGapCardProps {
  teamMembers: ExtractedTeamMember[];
  stage: string;
  companyName: string;
  // Optional: Use structured tool data as primary source
  credibilityToolData?: EditableTool<CredibilityGapAnalysis>;
  // Optional: Raw team_story from memo_responses for direct parsing
  teamStoryRaw?: string;
}

function getFounderMarketFitScore(teamMembers: ExtractedTeamMember[]): { score: number; label: string; color: string } {
  // Basic heuristic: more founders with clear roles = better
  const count = teamMembers.length;
  const hasRoles = teamMembers.filter(m => m.role).length;
  
  if (count >= 2 && hasRoles >= 2) {
    return { score: 80, label: "Strong", color: "text-green-500" };
  }
  if (count >= 1 && hasRoles >= 1) {
    return { score: 60, label: "Moderate", color: "text-yellow-500" };
  }
  return { score: 40, label: "Needs Strengthening", color: "text-red-400" };
}

function getRoleIcon(role: string): React.ReactNode {
  const roleLower = safeLower(role, "MemoTeamGapCard.role");
  if (roleLower.includes('ceo') || roleLower.includes('founder')) {
    return <Briefcase className="w-4 h-4" />;
  }
  if (roleLower.includes('cto') || roleLower.includes('tech') || roleLower.includes('engineer')) {
    return <span className="text-xs">💻</span>;
  }
  if (roleLower.includes('coo') || roleLower.includes('operations')) {
    return <span className="text-xs">⚙️</span>;
  }
  if (roleLower.includes('cfo') || roleLower.includes('finance')) {
    return <span className="text-xs">📊</span>;
  }
  if (roleLower.includes('sales') || roleLower.includes('growth')) {
    return <span className="text-xs">📈</span>;
  }
  return <Users className="w-4 h-4" />;
}

// Validate that text looks like a person's name (1-3 words, capitalized, no action words)
function isLikelyPersonName(text: string): boolean {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/);
  
  // Names are typically 1-3 words
  if (words.length < 1 || words.length > 4) return false;
  
  // Each word should be capitalized (allow for names like "van" in middle)
  const firstWordCapitalized = /^[A-Z][a-z]+$/.test(words[0]);
  if (!firstWordCapitalized) return false;
  
  // Exclude common non-name words that appear in skill descriptions
  const nonNameWords = [
    'launching', 'demonstrates', 'licensed', 'two-sided', 'onboarding', 
    'marketplace', 'therapists', 'capability', 'execution', 'strategy',
    'accelerate', 'defensibility', 'combination', 'global', 'therapy',
    'platforms', 'local', 'providers', 'cannot', 'scale', 'alongside',
    'market', 'business', 'growth', 'technical', 'product', 'sales',
    'long', 'next', 'phase', 'lack', 'team', 'the', 'and', 'for', 'with'
  ];
  
  const lowerText = trimmed.toLowerCase();
  if (nonNameWords.some(w => lowerText.includes(w))) return false;
  
  // Check that all words look like name parts (capitalized or lowercase connectors)
  return words.every((word, idx) => 
    /^[A-Z][a-z']+$/.test(word) || 
    (idx > 0 && /^(van|de|von|la|le|del|di)$/i.test(word))
  );
}

// Extract team members from credibilityGapAnalysis tool data
// Handles both "Name — Role" and inverted "Skill description (Name)" formats
function extractTeamFromToolData(toolData?: EditableTool<CredibilityGapAnalysis>): ExtractedTeamMember[] {
  if (!toolData?.aiGenerated) return [];
  
  const merged = mergeToolData(toolData.aiGenerated, toolData.userOverrides);
  const currentSkills = safeArray<string>(merged.currentSkills);
  
  const members: ExtractedTeamMember[] = [];
  const seenNames = new Set<string>();
  
  for (const skill of currentSkills) {
    // Pattern 1: "Name — Role" or "Name - Role" format
    const dashMatch = skill.match(/^([A-Z][a-zA-Z']+(?:\s+[A-Z]?[a-zA-Z']+){0,3})\s*[—–\-:]\s*(.+)$/i);
    if (dashMatch) {
      const name = dashMatch[1].trim();
      if (isLikelyPersonName(name) && !seenNames.has(name.toLowerCase())) {
        seenNames.add(name.toLowerCase());
        members.push({ name, role: dashMatch[2].trim() });
      }
      continue;
    }
    
    // Pattern 2: "Name (Role)" format - name at start, role in parentheses
    const parenMatch = skill.match(/^([A-Z][a-zA-Z']+(?:\s+[A-Z]?[a-zA-Z']+){0,3})\s*\(([^)]+)\)$/i);
    if (parenMatch) {
      const name = parenMatch[1].trim();
      if (isLikelyPersonName(name) && !seenNames.has(name.toLowerCase())) {
        seenNames.add(name.toLowerCase());
        members.push({ name, role: parenMatch[2].trim() });
      }
      continue;
    }
    
    // Pattern 3: Inverted "Skill description (Name)" format - ONLY at END of string
    // Must be a valid person name (1-3 capitalized words at the very end)
    const invertedMatch = skill.match(/\(([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\)\s*$/);
    if (invertedMatch) {
      const potentialName = invertedMatch[1].trim();
      if (isLikelyPersonName(potentialName) && !seenNames.has(potentialName.toLowerCase())) {
        seenNames.add(potentialName.toLowerCase());
        // Infer role from skill description
        const skillLower = skill.toLowerCase();
        let role = 'Founder';
        if (skillLower.includes('architecture') || skillLower.includes('sdk') || skillLower.includes('technical') || skillLower.includes('engineering') || skillLower.includes('development')) {
          role = 'Technical Lead / CTO';
        } else if (skillLower.includes('financial') || skillLower.includes('funding') || skillLower.includes('business')) {
          role = 'Business Lead';
        } else if (skillLower.includes('sales') || skillLower.includes('growth') || skillLower.includes('market')) {
          role = 'Growth Lead';
        } else if (skillLower.includes('product') || skillLower.includes('design')) {
          role = 'Product Lead';
        }
        members.push({ name: potentialName, role });
      }
    }
  }
  
  return members;
}

// Parse team members directly from team_story memo response
// Handles multiple formats: structured "Name — Role (Equity%)" and narrative text
function parseTeamStoryRaw(teamStory?: string): ExtractedTeamMember[] {
  if (!teamStory) return [];
  
  const members: ExtractedTeamMember[] = [];
  const seenNames = new Set<string>();
  
  // First try structured parsing (line by line)
  const lines = teamStory.split(/[\n,;]+/);
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Pattern: "Name — Role (Equity%)" or "Name - Role (Equity)"
    const fullMatch = trimmed.match(/^([A-Z][a-zA-Z']+(?:\s+[A-Z]?[a-zA-Z']+){0,3})\s*[—–\-:]\s*([^(]+)(?:\(([^)]+)\))?/i);
    if (fullMatch) {
      const name = fullMatch[1].trim();
      if (isLikelyPersonName(name) && !seenNames.has(name.toLowerCase())) {
        seenNames.add(name.toLowerCase());
        members.push({
          name,
          role: fullMatch[2].trim(),
          equity: fullMatch[3]?.trim()
        });
      }
    }
  }
  
  // If no structured data found, try narrative extraction
  if (members.length === 0) {
    // Pattern: "led by Name" or "founded by Name"
    const ledByMatch = teamStory.match(/(?:led|founded|created|started)\s+by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i);
    if (ledByMatch) {
      const name = ledByMatch[1].trim();
      if (isLikelyPersonName(name) && !seenNames.has(name.toLowerCase())) {
        seenNames.add(name.toLowerCase());
        members.push({ name, role: 'Founder & CEO' });
      }
    }
    
    // Pattern: "Name, a/the [role]" or "Name is the [role]"
    const namedRoleMatches = teamStory.matchAll(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}),?\s+(?:a|the|is\s+the)\s+(founder|ceo|cto|coo|cfo|co-founder|chief[^,\.]+)/gi);
    for (const match of namedRoleMatches) {
      const name = match[1].trim();
      if (isLikelyPersonName(name) && !seenNames.has(name.toLowerCase())) {
        seenNames.add(name.toLowerCase());
        members.push({ name, role: match[2].trim() });
      }
    }
    
    // Pattern: "Name (equity%)" - simple name with equity
    const equityMatches = teamStory.matchAll(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\s*\((\d+%?[^)]*)\)/g);
    for (const match of equityMatches) {
      const name = match[1].trim();
      const inParens = match[2].trim();
      // Check if the parenthetical looks like equity (contains % or "equity")
      if ((inParens.includes('%') || inParens.toLowerCase().includes('equity')) && 
          isLikelyPersonName(name) && !seenNames.has(name.toLowerCase())) {
        seenNames.add(name.toLowerCase());
        members.push({ name, role: 'Founder', equity: inParens });
      }
    }
  }
  
  return members;
}

export function MemoTeamGapCard({ teamMembers, stage, companyName, credibilityToolData, teamStoryRaw }: MemoTeamGapCardProps) {
  // Priority 1: Direct team_story from memo_responses (most reliable - founder input)
  // Priority 2: Structured tool data from credibilityGapAnalysis
  // Priority 3: Fall back to extracted team members from narrative text
  const teamStoryMembers = parseTeamStoryRaw(teamStoryRaw);
  const toolTeamMembers = extractTeamFromToolData(credibilityToolData);
  
  let effectiveTeamMembers: ExtractedTeamMember[];
  let dataSource: 'founder_input' | 'structured' | 'extracted';
  
  if (teamStoryMembers.length > 0) {
    effectiveTeamMembers = teamStoryMembers;
    dataSource = 'founder_input';
  } else if (toolTeamMembers.length > 0) {
    effectiveTeamMembers = toolTeamMembers;
    dataSource = 'structured';
  } else {
    effectiveTeamMembers = teamMembers;
    dataSource = 'extracted';
  }
  
  const existingRoles = effectiveTeamMembers.map(m => m.role);
  const { critical, suggested } = getCriticalRoles(stage, existingRoles);
  const founderFit = getFounderMarketFitScore(effectiveTeamMembers);
  
  const hasTeamData = effectiveTeamMembers.length > 0;
  
  return (
    <div className="my-10 bg-gradient-to-br from-card via-card to-purple-500/5 border border-border/50 rounded-2xl p-6 md:p-8 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Users className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Team Composition & Gaps</h3>
          <p className="text-sm text-muted-foreground">Critical hiring analysis for {stage} stage</p>
        </div>
      </div>

      {/* Founder-Market Fit Score */}
      <div className="bg-background/50 border border-border/30 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">Founder-Market Fit</span>
          <span className={`text-lg font-bold ${founderFit.color}`}>{founderFit.label}</span>
        </div>
        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              founderFit.score >= 70 ? 'bg-green-500' : founderFit.score >= 50 ? 'bg-yellow-500' : 'bg-red-400'
            }`}
            style={{ width: `${founderFit.score}%` }}
          />
        </div>
      </div>

      {/* Current Team */}
      {hasTeamData && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Current Team ({effectiveTeamMembers.length} {effectiveTeamMembers.length === 1 ? 'founder' : 'founders'})
            {dataSource !== 'extracted' && (
              <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                <Database className="w-3 h-3" /> 
                {dataSource === 'founder_input' ? 'from your input' : 'from tool data'}
              </span>
            )}
          </h4>
          <div className="space-y-2">
            {effectiveTeamMembers.map((member, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 bg-background/50 border border-border/30 rounded-lg px-4 py-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {getRoleIcon(member.role)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
                {member.equity && (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                    {member.equity}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Critical Gaps */}
      {critical.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Critical Gaps for {stage}
          </h4>
          <div className="space-y-2">
            {critical.map((role, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-4 py-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{role}</p>
                  <p className="text-xs text-muted-foreground">
                    {idx === 0 ? 'High priority hire' : 'Important for scaling'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Next Hires */}
      {suggested.length > 0 && (
        <div className="border-t border-border/30 pt-5">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            Suggested Next Hires
          </h4>
          <div className="grid gap-2">
            {suggested.map((role, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                  {idx + 1}
                </span>
                <span>{role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VC Context */}
      <div className="mt-5 pt-5 border-t border-border/30">
        <p className="text-xs text-muted-foreground italic">
          <span className="font-semibold text-foreground">VC Perspective:</span> Team composition is often the deciding factor at early stages. VCs back people first, then ideas. Gaps in key roles can be addressed post-funding if founders acknowledge them.
        </p>
      </div>
    </div>
  );
}
