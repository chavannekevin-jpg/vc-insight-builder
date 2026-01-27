import { useState } from "react";
import { MessageSquare, Briefcase } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { VCMarketNarrative, EditableTool } from "@/types/memo";
import { Textarea } from "@/components/ui/textarea";
import { safeText, mergeToolData, isValidEditableTool } from "@/lib/toolDataUtils";
import { useAddEnrichment } from "@/hooks/useProfileEnrichments";

interface MarketVCNarrativeCardProps {
  data: EditableTool<VCMarketNarrative>;
  onUpdate?: (data: Partial<VCMarketNarrative>) => void;
}

export const MarketVCNarrativeCard = ({ data, onUpdate }: MarketVCNarrativeCardProps) => {
  // Early return if data is invalid
  if (!isValidEditableTool<VCMarketNarrative>(data)) {
    return null;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(data.userOverrides || data.aiGenerated);
  const currentData = mergeToolData(data.aiGenerated, data.userOverrides);
  const { addEnrichment } = useAddEnrichment();

  const pitchToIC = safeText(currentData?.pitchToIC);
  const marketTiming = safeText(currentData?.marketTiming);
  const whyNow = safeText(currentData?.whyNow);

  const handleSave = () => {
    onUpdate?.(editData);
    setIsEditing(false);
    addEnrichment('vc_narrative', 'MarketVCNarrativeCard', {
      pitchToIC,
      marketTiming,
      whyNow
    }, 'target_customer');
  };

  return (
    <EditableToolCard
      title="VC Market Narrative"
      icon={<Briefcase className="w-5 h-5 text-primary" />}
      dataSource={data.dataSource}
      inputGuidance={[
        "Think about how a partner would pitch this to their IC",
        "Focus on market timing, size, and dynamics",
        "Highlight why this market is investable NOW"
      ]}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(true)}
      onSave={handleSave}
      accentColor="primary"
    >
      {/* Pitch to IC */}
      {pitchToIC && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
          <p className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            How a Partner Would Pitch This Market to IC
          </p>
          {isEditing ? (
            <Textarea
              value={safeText(editData?.pitchToIC) || pitchToIC}
              onChange={(e) => setEditData({ ...editData, pitchToIC: e.target.value })}
              className="min-h-[100px]"
            />
          ) : (
            <p className="text-foreground italic">"{pitchToIC}"</p>
          )}
        </div>
      )}

      {/* Market Timing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {marketTiming && (
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-sm font-medium text-emerald-600 mb-1">Market Timing</p>
            {isEditing ? (
              <Textarea
                value={safeText(editData?.marketTiming) || marketTiming}
                onChange={(e) => setEditData({ ...editData, marketTiming: e.target.value })}
                className="min-h-[80px]"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{marketTiming}</p>
            )}
          </div>
        )}

        {whyNow && (
          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <p className="text-sm font-medium text-blue-600 mb-1">Why Now?</p>
            {isEditing ? (
              <Textarea
                value={safeText(editData?.whyNow) || whyNow}
                onChange={(e) => setEditData({ ...editData, whyNow: e.target.value })}
                className="min-h-[80px]"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{whyNow}</p>
            )}
          </div>
        )}
      </div>
    </EditableToolCard>
  );
};
