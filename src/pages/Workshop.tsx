import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FounderLayout } from "@/components/founder/FounderLayout";
import { WorkshopLayout } from "@/components/workshop/WorkshopLayout";
import { WorkshopProgress } from "@/components/workshop/WorkshopProgress";
import { WorkshopSection } from "@/components/workshop/WorkshopSection";
import { WorkshopCompletionScreen } from "@/components/workshop/WorkshopCompletionScreen";
import { WorkshopLockedState } from "@/components/workshop/WorkshopLockedState";
import { 
  useWorkshopTemplates, 
  useWorkshopResponses,
  useWorkshopCompletion,
  useSaveWorkshopResponse,
  useCompileWorkshopMemo,
} from "@/hooks/useWorkshopData";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { Loader2 } from "lucide-react";

export default function Workshop() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { company, isLoading: companyLoading } = useCompany(user?.id);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  
  const { data: templates, isLoading: templatesLoading } = useWorkshopTemplates();
  const { data: responses, isLoading: responsesLoading } = useWorkshopResponses(company?.id);
  const { data: completion } = useWorkshopCompletion(company?.id);
  const saveResponse = useSaveWorkshopResponse();
  const compileMemo = useCompileWorkshopMemo();

  // Check if company has accelerator access
  const hasAcceleratorAccess = !!(company as any)?.accelerator_invite_id;

  // Filter out investment_thesis - it's AI-generated, not user-written
  const userEditableTemplates = templates?.filter(t => t.section_key !== 'investment_thesis') || [];
  
  // Get current response for the active section
  const currentTemplate = userEditableTemplates?.[currentStep];
  const currentResponse = responses?.find(r => r.section_key === currentTemplate?.section_key);

  // Calculate progress - only count user-editable sections
  const userEditableSectionKeys = userEditableTemplates.map(t => t.section_key);
  const completedSections = responses?.filter(r => 
    r.completed_at !== null && userEditableSectionKeys.includes(r.section_key)
  ).length || 0;
  const totalSections = userEditableTemplates.length || 7;
  const allSectionsComplete = completedSections >= totalSections;

  // Check if already completed and has memo
  useEffect(() => {
    if (completion?.mini_memo_content) {
      setShowCompletion(true);
    }
  }, [completion]);

  // Handle auto-save on blur
  const handleSaveResponse = async (answer: string) => {
    if (!company?.id || !currentTemplate) return;
    
    await saveResponse.mutateAsync({
      companyId: company.id,
      sectionKey: currentTemplate.section_key,
      answer,
    });
  };

  // Handle navigation
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (userEditableTemplates && currentStep < userEditableTemplates.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (allSectionsComplete) {
      // Compile the memo - AI will generate investment thesis
      handleCompile();
    }
  };

  const handleCompile = async () => {
    if (!company?.id) return;
    await compileMemo.mutateAsync(company.id);
    setShowCompletion(true);
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setShowCompletion(false);
  };

  // Loading states
  if (authLoading || companyLoading) {
    return (
      <FounderLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </FounderLayout>
    );
  }

  // Access control - no accelerator invite
  if (!hasAcceleratorAccess) {
    return (
      <FounderLayout>
        <WorkshopLockedState />
      </FounderLayout>
    );
  }

  // Templates loading
  if (templatesLoading || responsesLoading) {
    return (
      <FounderLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </FounderLayout>
    );
  }

  // Show completion screen
  if (showCompletion && completion?.mini_memo_content) {
    return (
      <FounderLayout>
        <WorkshopCompletionScreen 
          completion={completion}
          companyId={company?.id || ""}
          onBackToEdit={() => setShowCompletion(false)}
        />
      </FounderLayout>
    );
  }

  return (
    <FounderLayout>
      <WorkshopLayout>
        <div className="space-y-6">
          {/* Progress */}
          <WorkshopProgress
            templates={userEditableTemplates}
            responses={responses || []}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
          
          {/* Current Section */}
          {currentTemplate && (
            <WorkshopSection
              template={currentTemplate}
              response={currentResponse}
              stepNumber={currentStep + 1}
              totalSteps={totalSections}
              onSave={handleSaveResponse}
              onPrevious={handlePrevious}
              onNext={handleNext}
              isFirst={currentStep === 0}
              isLast={currentStep === totalSections - 1}
              isSaving={saveResponse.isPending}
              allComplete={allSectionsComplete}
              isCompiling={compileMemo.isPending}
              regenerationCount={completion?.regeneration_count ?? 0}
            />
          )}
        </div>
      </WorkshopLayout>
    </FounderLayout>
  );
}
