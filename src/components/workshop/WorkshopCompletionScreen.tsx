import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkshopCompletion } from "@/hooks/useWorkshopData";
import { useMapWorkshopToProfile } from "@/hooks/useWorkshopData";
import { 
  CheckCircle2, 
  Edit, 
  Download, 
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const mapToProfile = useMapWorkshopToProfile();

  const handleSaveToProfile = async () => {
    await mapToProfile.mutateAsync(companyId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Your Mini-Memo is Ready!</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your investment memorandum has been compiled based on your workshop responses.
        </p>
      </div>

      {/* Memo Content */}
      <Card className="mb-6 border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Investment Mini-Memorandum
            </CardTitle>
            {completion.mapped_to_profile && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                Saved to Profile
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {completion.mini_memo_content}
            </div>
          </div>
        </CardContent>
      </Card>

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
        
        {!completion.mapped_to_profile && (
          <Button
            onClick={handleSaveToProfile}
            disabled={mapToProfile.isPending}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80"
          >
            {mapToProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save to My Profile
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
        <p className="text-sm text-muted-foreground">
          {completion.mapped_to_profile ? (
            <>
              ✨ Your workshop responses have been saved to your company profile.
              They'll be used to generate your full VC analysis.
            </>
          ) : (
            <>
              💡 Click "Save to My Profile" to automatically populate your company profile
              with your workshop responses.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
