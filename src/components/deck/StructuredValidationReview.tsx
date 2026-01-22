import { useState, useMemo } from 'react';
import { CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ExtractedFieldValidator, type ExtractedFieldState, type ValidationAction } from './ExtractedFieldValidator';
import { cn } from '@/lib/utils';

interface ExtractedSection {
  content: string | null;
  confidence: number;
}

interface ExtractedData {
  companyInfo: {
    name: string | null;
    description: string | null;
    stage: string | null;
    category: string | null;
  };
  extractedSections: Record<string, ExtractedSection>;
  summary: string;
}

interface StructuredValidationReviewProps {
  extractedData: ExtractedData;
  onComplete: (validatedData: Record<string, ExtractedFieldState>) => void;
  onBack: () => void;
}

const SECTION_LABELS: Record<string, { label: string; section: string }> = {
  problem_core: { label: "The Problem You're Solving", section: "Problem" },
  solution_core: { label: "Your Solution", section: "Solution" },
  target_customer: { label: "Who Pays You?", section: "Market" },
  competitive_moat: { label: "Your Edge & Competition", section: "Competition" },
  business_model: { label: "How You Make Money", section: "Business Model" },
  traction_proof: { label: "Proof of Progress", section: "Traction" },
  team_story: { label: "Your Team's Unfair Advantage", section: "Team" },
  vision_ask: { label: "Where You're Going", section: "Vision" },
};

const COMPANY_FIELDS = [
  { key: 'company_name', label: 'Company Name', category: 'Basics' },
  { key: 'company_stage', label: 'Funding Stage', category: 'Basics' },
  { key: 'company_category', label: 'Industry/Sector', category: 'Basics' },
  { key: 'company_description', label: 'One-liner Description', category: 'Basics' },
];

export const StructuredValidationReview = ({
  extractedData,
  onComplete,
  onBack
}: StructuredValidationReviewProps) => {
  const [validatedFields, setValidatedFields] = useState<Record<string, ExtractedFieldState>>({});

  // Build all fields from extracted data
  const allFields = useMemo(() => {
    const fields: Array<{
      key: string;
      label: string;
      category: string;
      value: string;
      confidence: number;
    }> = [];

    // Company info fields
    if (extractedData.companyInfo.name) {
      fields.push({
        key: 'company_name',
        label: 'Company Name',
        category: 'Company Info',
        value: extractedData.companyInfo.name,
        confidence: 0.9, // High confidence for name
      });
    }
    if (extractedData.companyInfo.stage) {
      fields.push({
        key: 'company_stage',
        label: 'Funding Stage',
        category: 'Company Info',
        value: extractedData.companyInfo.stage,
        confidence: 0.7,
      });
    }
    if (extractedData.companyInfo.category) {
      fields.push({
        key: 'company_category',
        label: 'Industry/Sector',
        category: 'Company Info',
        value: extractedData.companyInfo.category,
        confidence: 0.7,
      });
    }
    if (extractedData.companyInfo.description) {
      fields.push({
        key: 'company_description',
        label: 'Description',
        category: 'Company Info',
        value: extractedData.companyInfo.description,
        confidence: 0.8,
      });
    }

    // Questionnaire sections
    Object.entries(extractedData.extractedSections).forEach(([key, section]) => {
      if (section.content?.trim()) {
        const labelInfo = SECTION_LABELS[key] || { label: key, section: 'Other' };
        fields.push({
          key,
          label: labelInfo.label,
          category: labelInfo.section,
          value: section.content,
          confidence: section.confidence,
        });
      }
    });

    return fields;
  }, [extractedData]);

  // Calculate validation progress
  const progress = useMemo(() => {
    const total = allFields.length;
    const validated = Object.keys(validatedFields).length;
    const confirmed = Object.values(validatedFields).filter(f => f.action === 'confirmed').length;
    const edited = Object.values(validatedFields).filter(f => f.action === 'edited').length;
    const rejected = Object.values(validatedFields).filter(f => f.action === 'rejected').length;
    const pending = total - validated;

    return {
      total,
      validated,
      confirmed,
      edited,
      rejected,
      pending,
      percentage: total > 0 ? Math.round((validated / total) * 100) : 0,
    };
  }, [allFields, validatedFields]);

  // Fields that need attention (low confidence and not yet validated)
  const needsAttention = useMemo(() => {
    return allFields.filter(f => 
      f.confidence < 0.6 && !validatedFields[f.key]
    ).length;
  }, [allFields, validatedFields]);

  const handleFieldValidate = (key: string, state: ExtractedFieldState) => {
    setValidatedFields(prev => ({
      ...prev,
      [key]: state,
    }));
  };

  const handleComplete = () => {
    // Auto-confirm any remaining pending high-confidence fields
    const finalValidated = { ...validatedFields };
    
    allFields.forEach(field => {
      if (!finalValidated[field.key]) {
        // Auto-confirm high confidence fields that weren't explicitly reviewed
        if (field.confidence >= 0.6) {
          finalValidated[field.key] = {
            originalValue: field.value,
            currentValue: field.value,
            confidence: field.confidence,
            action: 'confirmed',
            sourceType: 'deck',
          };
        }
      }
    });

    onComplete(finalValidated);
  };

  // Group fields by category
  const groupedFields = useMemo(() => {
    const groups: Record<string, typeof allFields> = {};
    allFields.forEach(field => {
      if (!groups[field.category]) {
        groups[field.category] = [];
      }
      groups[field.category].push(field);
    });
    return groups;
  }, [allFields]);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="p-4 rounded-lg border bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Validation Progress</h3>
          <span className="text-sm text-muted-foreground">
            {progress.validated} of {progress.total} fields reviewed
          </span>
        </div>
        <Progress value={progress.percentage} className="h-2 mb-3" />
        
        <div className="flex flex-wrap gap-2">
          {progress.confirmed > 0 && (
            <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
              {progress.confirmed} confirmed
            </Badge>
          )}
          {progress.edited > 0 && (
            <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">
              {progress.edited} edited
            </Badge>
          )}
          {progress.rejected > 0 && (
            <Badge variant="secondary">
              {progress.rejected} rejected
            </Badge>
          )}
          {needsAttention > 0 && (
            <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {needsAttention} need review
            </Badge>
          )}
        </div>
      </div>

      {/* Summary */}
      {extractedData.summary && (
        <div className="p-4 rounded-lg border bg-primary/5">
          <h4 className="font-medium text-sm mb-2">AI Summary</h4>
          <p className="text-sm text-muted-foreground">{extractedData.summary}</p>
        </div>
      )}

      {/* Grouped Fields */}
      <div className="space-y-6">
        {Object.entries(groupedFields).map(([category, fields]) => (
          <div key={category} className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {category}
            </h4>
            {fields.map(field => (
              <ExtractedFieldValidator
                key={field.key}
                fieldKey={field.key}
                label={field.label}
                category={category}
                value={field.value}
                confidence={field.confidence}
                sourceType="deck"
                onValidate={handleFieldValidate}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          Upload Different Deck
        </Button>
        
        <div className="flex items-center gap-3">
          {needsAttention > 0 && (
            <span className="text-sm text-amber-600">
              {needsAttention} low-confidence fields need review
            </span>
          )}
          <Button onClick={handleComplete}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Confirm & Import
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
