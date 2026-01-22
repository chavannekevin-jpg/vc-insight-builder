import { useState } from 'react';
import { Check, X, Edit2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type ValidationAction = 'confirmed' | 'edited' | 'rejected' | 'pending';

export interface ExtractedFieldState {
  originalValue: string;
  currentValue: string;
  confidence: number;
  action: ValidationAction;
  sourceType: 'deck' | 'inferred' | 'external';
  sourceRef?: string;
}

interface ExtractedFieldValidatorProps {
  fieldKey: string;
  label: string;
  category: string;
  value: string;
  confidence: number;
  sourceType?: 'deck' | 'inferred' | 'external';
  sourceRef?: string;
  onValidate: (key: string, state: ExtractedFieldState) => void;
  className?: string;
}

const CONFIDENCE_THRESHOLD = 0.6;

export const ExtractedFieldValidator = ({
  fieldKey,
  label,
  category,
  value,
  confidence,
  sourceType = 'deck',
  sourceRef,
  onValidate,
  className
}: ExtractedFieldValidatorProps) => {
  const [action, setAction] = useState<ValidationAction>('pending');
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const [isExpanded, setIsExpanded] = useState(confidence < CONFIDENCE_THRESHOLD);

  const getConfidenceBadge = () => {
    if (confidence >= 0.8) {
      return (
        <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 text-xs">
          High confidence
        </Badge>
      );
    }
    if (confidence >= CONFIDENCE_THRESHOLD) {
      return (
        <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-xs">
          Medium
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground text-xs flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Low - needs review
      </Badge>
    );
  };

  const getSourceBadge = () => {
    switch (sourceType) {
      case 'deck':
        return <Badge variant="outline" className="text-xs">From Deck</Badge>;
      case 'inferred':
        return <Badge variant="outline" className="text-xs text-amber-600">Inferred</Badge>;
      case 'external':
        return <Badge variant="outline" className="text-xs text-blue-600">External</Badge>;
    }
  };

  const handleConfirm = () => {
    setAction('confirmed');
    setIsEditing(false);
    onValidate(fieldKey, {
      originalValue: value,
      currentValue: editedValue,
      confidence,
      action: 'confirmed',
      sourceType,
      sourceRef,
    });
  };

  const handleReject = () => {
    setAction('rejected');
    setIsEditing(false);
    onValidate(fieldKey, {
      originalValue: value,
      currentValue: '',
      confidence,
      action: 'rejected',
      sourceType,
      sourceRef,
    });
  };

  const handleSaveEdit = () => {
    setAction('edited');
    setIsEditing(false);
    onValidate(fieldKey, {
      originalValue: value,
      currentValue: editedValue,
      confidence: 1.0, // User-edited = full confidence
      action: 'edited',
      sourceType: 'deck', // Changed to founder_corrected on save
      sourceRef,
    });
  };

  const getActionBadge = () => {
    switch (action) {
      case 'confirmed':
        return (
          <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
            <Check className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case 'edited':
        return (
          <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">
            <Edit2 className="h-3 w-3 mr-1" />
            Edited
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-muted text-muted-foreground">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (!value?.trim()) {
    return null;
  }

  return (
    <div className={cn(
      'rounded-lg border transition-all',
      action === 'confirmed' && 'border-green-500/30 bg-green-500/5',
      action === 'edited' && 'border-blue-500/30 bg-blue-500/5',
      action === 'rejected' && 'border-muted bg-muted/30 opacity-60',
      action === 'pending' && confidence < CONFIDENCE_THRESHOLD && 'border-amber-500/30 bg-amber-500/5',
      action === 'pending' && confidence >= CONFIDENCE_THRESHOLD && 'border-border',
      className
    )}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{label}</span>
          <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted">{category}</span>
          {getConfidenceBadge()}
          {getSourceBadge()}
          {action !== 'pending' && getActionBadge()}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                rows={4}
                className="text-sm"
                placeholder="Edit the extracted content..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit}>
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setEditedValue(value);
                  setIsEditing(false);
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {action === 'edited' ? editedValue : value}
              </p>
              
              {action === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500/30 text-green-700 hover:bg-green-500/10"
                    onClick={handleConfirm}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={handleReject}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
              
              {action !== 'pending' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => {
                    setAction('pending');
                    setEditedValue(value);
                  }}
                >
                  Reset
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
