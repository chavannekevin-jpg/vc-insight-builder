import { useState } from "react";
import { Calculator, Plus, Trash2, DollarSign } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { BottomsUpTAM, TAMSegment, EditableTool } from "@/types/memo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MarketTAMCalculatorProps {
  data: EditableTool<BottomsUpTAM>;
  onUpdate?: (data: Partial<BottomsUpTAM>) => void;
}

export const MarketTAMCalculator = ({ data, onUpdate }: MarketTAMCalculatorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<BottomsUpTAM>(
    data.userOverrides ? { ...data.aiGenerated, ...data.userOverrides } : data.aiGenerated
  );

  const currentData = data.userOverrides ? { ...data.aiGenerated, ...data.userOverrides } : data.aiGenerated;

  const formatCurrency = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num}`;
  };

  const handleSegmentChange = (idx: number, field: keyof TAMSegment, value: string | number) => {
    const newSegments = [...editData.targetSegments];
    newSegments[idx] = { ...newSegments[idx], [field]: value };
    // Recalculate TAM for this segment
    newSegments[idx].tam = newSegments[idx].count * newSegments[idx].acv;
    
    const totalTAM = newSegments.reduce((sum, s) => sum + s.tam, 0);
    setEditData({ 
      ...editData, 
      targetSegments: newSegments,
      totalTAM 
    });
  };

  const addSegment = () => {
    setEditData({
      ...editData,
      targetSegments: [...editData.targetSegments, { segment: "", count: 0, acv: 0, tam: 0 }]
    });
  };

  const removeSegment = (idx: number) => {
    const newSegments = editData.targetSegments.filter((_, i) => i !== idx);
    const totalTAM = newSegments.reduce((sum, s) => sum + s.tam, 0);
    setEditData({ ...editData, targetSegments: newSegments, totalTAM });
  };

  const handleSave = () => {
    onUpdate?.(editData);
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
        setEditData(data.aiGenerated);
        onUpdate?.({});
      }}
      accentColor="emerald"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
          <p className="text-xs text-muted-foreground">TAM</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(currentData.totalTAM)}</p>
        </div>
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
          <p className="text-xs text-muted-foreground">SAM</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(currentData.sam)}</p>
        </div>
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-center">
          <p className="text-xs text-muted-foreground">SOM (Year 1)</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(currentData.som)}</p>
        </div>
      </div>

      {/* Segment Breakdown */}
      <div className="space-y-3 mb-4">
        <p className="text-sm font-medium text-foreground">Segment Breakdown</p>
        {(isEditing ? editData : currentData).targetSegments.map((segment, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border/50">
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Segment name"
                    value={segment.segment}
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
                      value={segment.count}
                      onChange={(e) => handleSegmentChange(idx, "count", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">ACV ($)</p>
                    <Input
                      type="number"
                      value={segment.acv}
                      onChange={(e) => handleSegmentChange(idx, "acv", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">TAM</p>
                    <div className="h-9 flex items-center px-3 bg-muted rounded-md">
                      <span className="text-sm font-medium">{formatCurrency(segment.tam)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{segment.segment}</p>
                  <p className="text-xs text-muted-foreground">
                    {segment.count.toLocaleString()} companies × {formatCurrency(segment.acv)} ACV
                  </p>
                </div>
                <p className="font-semibold text-foreground">{formatCurrency(segment.tam)}</p>
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
      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 mb-4">
        <p className="text-sm font-medium text-blue-600 mb-1">Methodology</p>
        <p className="text-sm text-muted-foreground">{currentData.methodology}</p>
      </div>

      {/* Assumptions */}
      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <p className="text-sm font-medium text-amber-600 mb-2">Key Assumptions</p>
        <ul className="space-y-1">
          {currentData.assumptions.map((assumption, idx) => (
            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-amber-500">•</span>
              {assumption}
            </li>
          ))}
        </ul>
      </div>
    </EditableToolCard>
  );
};
