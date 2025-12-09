import { Users, Briefcase } from "lucide-react";
import { renderMarkdownText } from "@/lib/markdownParser";

export interface TeamMember {
  name: string;
  role: string;
  equity?: string;
  description: string;
}

interface MemoTeamListProps {
  members: TeamMember[];
  showEquity?: boolean;
}

// Helper to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Generate a consistent color based on name
const getAvatarColor = (name: string): string => {
  const colors = [
    'from-primary to-primary/70',
    'from-secondary to-secondary/70',
    'from-accent to-accent/70',
    'from-success to-success/70',
    'from-warning to-warning/70',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const MemoTeamList = ({ members, showEquity = true }: MemoTeamListProps) => {
  if (!members || members.length === 0) return null;

  // Calculate total equity for visualization
  const totalEquity = members.reduce((sum, m) => {
    const equity = parseFloat(m.equity?.replace('%', '') || '0');
    return sum + equity;
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <h4 className="text-lg font-semibold text-foreground">Founding Team</h4>
      </div>

      {/* Equity distribution bar (if showing equity) */}
      {showEquity && totalEquity > 0 && (
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Equity Distribution</span>
            <span>{totalEquity}% allocated</span>
          </div>
          <div className="h-3 bg-muted/50 rounded-full overflow-hidden flex">
            {members.map((member, index) => {
              const equity = parseFloat(member.equity?.replace('%', '') || '0');
              const width = (equity / Math.max(totalEquity, 100)) * 100;
              return (
                <div
                  key={index}
                  className={`h-full bg-gradient-to-r ${getAvatarColor(member.name)} transition-all duration-500`}
                  style={{ width: `${width}%` }}
                  title={`${member.name}: ${member.equity}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Team members list */}
      <div className="space-y-4">
        {members.map((member, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-xl bg-background/60 border border-border/30 hover:border-primary/30 transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(member.name)} flex items-center justify-center shadow-md`}>
              <span className="text-sm font-bold text-white">{getInitials(member.name)}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Name, Role, Equity line */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-bold text-foreground">{member.name}</span>
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                  {member.role}
                </span>
                {showEquity && member.equity && (
                  <span className="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-xs font-semibold border border-secondary/20">
                    {member.equity}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {renderMarkdownText(member.description)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Team composition insight */}
      {members.length >= 2 && (
        <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
          <div className="flex items-start gap-3">
            <Briefcase className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{members.length} co-founders</strong> with 
                {showEquity && totalEquity > 0 && ` ${totalEquity}% founder equity allocated.`}
                {' '}VCs look for complementary skills and balanced equity splits that align incentives.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};