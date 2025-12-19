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

// Extract team members from credibilityGapAnalysis tool data
function extractTeamFromToolData(toolData?: EditableTool<CredibilityGapAnalysis>): ExtractedTeamMember[] {
  if (!toolData?.aiGenerated) return [];
  
  const merged = mergeToolData(toolData.aiGenerated, toolData.userOverrides);
  const currentSkills = safeArray<string>(merged.currentSkills);
  
  // Try to extract team members from currentSkills which often contains "Name - Role" format
  const members: ExtractedTeamMember[] = [];
  
  for (const skill of currentSkills) {
    // Parse "Name - Role" or "Name (Role)" or just role descriptions
    const dashMatch = skill.match(/^([A-Z][a-zA-Z']+(?:\s+[A-Z]?[a-zA-Z']+){0,3})\s*[—–\-:]\s*(.+)$/i);
    if (dashMatch) {
      members.push({ name: dashMatch[1].trim(), role: dashMatch[2].trim() });
      continue;
    }
    
    const parenMatch = skill.match(/^([A-Z][a-zA-Z']+(?:\s+[A-Z]?[a-zA-Z']+){0,3})\s*\((.+)\)$/i);
    if (parenMatch) {
      members.push({ name: parenMatch[1].trim(), role: parenMatch[2].trim() });
    }
  }
  
  return members;
}

export function MemoTeamGapCard({ teamMembers, stage, companyName, credibilityToolData }: MemoTeamGapCardProps) {
  // Priority 1: Use structured tool data if available (most reliable)
  // Priority 2: Fall back to extracted team members from narrative text
  const toolTeamMembers = extractTeamFromToolData(credibilityToolData);
  const effectiveTeamMembers = toolTeamMembers.length > 0 ? toolTeamMembers : teamMembers;
  const dataSource = toolTeamMembers.length > 0 ? 'structured' : 'extracted';
  
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
            {dataSource === 'structured' && (
              <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                <Database className="w-3 h-3" /> from tool data
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
