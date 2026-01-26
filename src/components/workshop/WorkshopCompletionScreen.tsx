import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkshopCompletion, ValidationReport } from "@/hooks/useWorkshopData";
import { 
  CheckCircle2, 
  Edit, 
  Sparkles,
  ArrowRight,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MiniMemoRenderer } from "./MiniMemoRenderer";
import { WorkshopValidationReport } from "./WorkshopValidationReport";

interface WorkshopCompletionScreenProps {
  completion: WorkshopCompletion;
  companyId: string;
  onBackToEdit: () => void;
}

export function WorkshopCompletionScreen({
  completion,
  companyId,
  onBackToEdit,
}: WorkshopCompletionScreenProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("memo");
  
  const hasValidationReport = completion.validation_report && 
    typeof completion.validation_report === 'object' &&
    'grade' in completion.validation_report;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Your Mini-Memo is Ready!</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your investment memorandum has been AI-enhanced based on benchmark models and automatically saved to your profile.
        </p>
      </div>

      {/* Auto-mapped notification */}
      {completion.mapped_to_profile && (
        <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-sm">Automatically synced to your profile</p>
            <p className="text-sm text-muted-foreground">
              Your enhanced responses have been mapped to your company profile and will be used to generate your full VC analysis.
            </p>
          </div>
        </div>
      )}

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="memo" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Mini-Memo
          </TabsTrigger>
          <TabsTrigger 
            value="validation" 
            className="flex items-center gap-2"
            disabled={!hasValidationReport}
          >
            <ClipboardCheck className="w-4 h-4" />
            Validation Report
            {hasValidationReport && (
              <Badge variant="outline" className="ml-1 text-xs">
                {(completion.validation_report as ValidationReport).grade.overall}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="memo" className="mt-4">
          {/* Memo Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Investment Mini-Memorandum</h2>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              AI-Enhanced
            </Badge>
          </div>

          {/* Memo Content */}
          <MiniMemoRenderer content={completion.mini_memo_content || ""} />
        </TabsContent>

        <TabsContent value="validation" className="mt-4">
          {hasValidationReport ? (
            <WorkshopValidationReport 
              report={completion.validation_report as ValidationReport} 
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No validation report available yet.</p>
              <p className="text-sm mt-1">
                Complete the workshop to generate your validation report.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          onClick={onBackToEdit}
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Refine Responses
        </Button>
        
        <Button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80"
        >
          <FileText className="w-4 h-4" />
          View My Profile
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
        <p className="text-sm text-muted-foreground">
          ✨ Your workshop responses have been enhanced using AI and benchmark models, 
          then automatically saved to your company profile for your full VC analysis.
        </p>
      </div>
    </div>
  );
}
