import { useState } from "react";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { BottomsUpTAM, TAMSegment, EditableTool } from "@/types/memo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { safeText, safeArray, safeNumber, mergeToolData, isValidEditableTool } from "@/lib/toolDataUtils";
import { useAddEnrichment } from "@/hooks/useProfileEnrichments";

interface MarketTAMCalculatorProps {
  data: EditableTool<BottomsUpTAM>;
  onUpdate?: (data: Partial<BottomsUpTAM>) => void;
}

export const MarketTAMCalculator = ({ data, onUpdate }: MarketTAMCalculatorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<BottomsUpTAM | null>(null);
  const { addEnrichment } = useAddEnrichment();
  
  // Initialize editData when data changes
  const aiData = data?.aiGenerated;
  const hasValidData = isValidEditableTool<BottomsUpTAM>(data);
  
  // Set editData once we have valid data
  if (hasValidData && editData === null) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setEditData(mergeToolData(aiData, data.userOverrides));
  }

  // Early return if data is invalid
  if (!hasValidData || !aiData) {
    return (
      <div className="p-4 rounded-lg border border-border/50 bg-muted/20 text-center">
        <Calculator className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">TAM data not available</p>
      </div>
    );
  }

  const currentData = mergeToolData(aiData, data.userOverrides);
  const localEditData = editData || currentData;
  const targetSegments = safeArray<TAMSegment>(currentData?.targetSegments);
  const assumptions = safeArray<string>(currentData?.assumptions);

  const formatCurrency = (num: unknown) => {
    const n = safeNumber(num, 0);
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n}`;
  };

  const handleSegmentChange = (idx: number, field: keyof TAMSegment, value: string | number) => {
    if (!localEditData) return;
    const newSegments = [...safeArray<TAMSegment>(localEditData?.targetSegments)];
    newSegments[idx] = { ...newSegments[idx], [field]: value };
    newSegments[idx].tam = safeNumber(newSegments[idx].count) * safeNumber(newSegments[idx].acv);
    
    const totalTAM = newSegments.reduce((sum, s) => sum + safeNumber(s?.tam), 0);
    setEditData({ 
      ...localEditData, 
      targetSegments: newSegments,
      totalTAM 
    });
  };

  const addSegment = () => {
    if (!localEditData) return;
    setEditData({
      ...localEditData,
      targetSegments: [...safeArray<TAMSegment>(localEditData?.targetSegments), { segment: "", count: 0, acv: 0, tam: 0 }]
    });
  };

  const removeSegment = (idx: number) => {
    if (!localEditData) return;
    const newSegments = safeArray<TAMSegment>(localEditData?.targetSegments).filter((_, i) => i !== idx);
    const totalTAM = newSegments.reduce((sum, s) => sum + safeNumber(s?.tam), 0);
    setEditData({ ...localEditData, targetSegments: newSegments, totalTAM });
  };

  const handleSave = () => {
    if (localEditData) {
      onUpdate?.(localEditData);
      
      // Log enrichment for profile sync
      addEnrichment(
        'tam_calculator',
        'MarketTAMCalculator',
        {
          totalTAM: localEditData.totalTAM,
          sam: localEditData.sam,
          som: localEditData.som,
          segments: safeArray<TAMSegment>(localEditData.targetSegments).map(s => ({
            segment: s.segment,
            count: s.count,
            acv: s.acv,
            tam: s.tam
          })),
          methodology: localEditData.methodology
        },
        'target_customer'
      );
    }
    setIsEditing(false);
  };

  return (
    <EditableToolCard
      title="Bottom-Up TAM/SAM/SOM Calculator"
      icon={<Calculator className="w-5 h-5 text-emerald-500" />}
      dataSource={data.dataSource}
      inputGuidance={[
        "Break down your market into specific customer segments",
        "Use realistic ACV based on actual pricing or comparable companies",
        "VCs will validate these numbers - be defensible"
      ]}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(true)}
      onSave={handleSave}
      onReset={() => {
        if (aiData) setEditData(aiData);
        onUpdate?.({});
      }}
      accentColor="emerald"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
          <p className="text-xs text-muted-foreground">TAM</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(currentData?.totalTAM)}</p>
        </div>
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
          <p className="text-xs text-muted-foreground">SAM</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(currentData?.sam)}</p>
        </div>
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-center">
          <p className="text-xs text-muted-foreground">SOM (Year 1)</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(currentData?.som)}</p>
        </div>
      </div>

      {/* Segment Breakdown */}
      <div className="space-y-3 mb-4">
        <p className="text-sm font-medium text-foreground">Segment Breakdown</p>
        {(isEditing ? safeArray<TAMSegment>(localEditData?.targetSegments) : targetSegments).map((segment, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border/50">
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Segment name"
                    value={safeText(segment?.segment)}
                    onChange={(e) => handleSegmentChange(idx, "segment", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSegment(idx)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1"># of Companies</p>
                    <Input
                      type="number"
                      value={safeNumber(segment?.count)}
                      onChange={(e) => handleSegmentChange(idx, "count", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">ACV ($)</p>
                    <Input
                      type="number"
                      value={safeNumber(segment?.acv)}
                      onChange={(e) => handleSegmentChange(idx, "acv", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">TAM</p>
                    <div className="h-9 flex items-center px-3 bg-muted rounded-md">
                      <span className="text-sm font-medium">{formatCurrency(segment?.tam)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{safeText(segment?.segment)}</p>
                  <p className="text-xs text-muted-foreground">
                    {safeNumber(segment?.count).toLocaleString()} companies × {formatCurrency(segment?.acv)} ACV
                  </p>
                </div>
                <p className="font-semibold text-foreground">{formatCurrency(segment?.tam)}</p>
              </div>
            )}
          </div>
        ))}
        {isEditing && (
          <Button variant="outline" size="sm" onClick={addSegment} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Segment
          </Button>
        )}
      </div>

      {/* Methodology */}
      {safeText(currentData?.methodology) && (
        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 mb-4">
          <p className="text-sm font-medium text-blue-600 mb-1">Methodology</p>
          <p className="text-sm text-muted-foreground">{safeText(currentData?.methodology)}</p>
        </div>
      )}

      {/* Assumptions */}
      {assumptions.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <p className="text-sm font-medium text-amber-600 mb-2">Key Assumptions</p>
          <ul className="space-y-1">
            {assumptions.map((assumption, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-amber-500">•</span>
                {safeText(assumption)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </EditableToolCard>
  );
};
