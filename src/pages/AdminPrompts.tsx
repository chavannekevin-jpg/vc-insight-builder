import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, RotateCcw, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Prompt {
  id: string;
  section_name: string;
  section_id: string | null;
  prompt: string;
  updated_at: string;
}

interface Section {
  id: string;
  name: string;
  display_title: string;
}

const SECTIONS = [
  "Problem",
  "Solution",
  "Market",
  "Competition",
  "Team",
  "Business Model",
  "Traction",
  "Investment Thesis",
];

const AdminPrompts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<Record<string, Prompt>>({});
  const [sections, setSections] = useState<Section[]>([]);
  const [editedPrompts, setEditedPrompts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState<string | null>(null);
  const [optimizedPrompt, setOptimizedPrompt] = useState<string>("");
  const [showOptimizedDialog, setShowOptimizedDialog] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>("");

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      await fetchPrompts();
    } catch (error) {
      console.error("Error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrompts = async () => {
    const [promptsResult, sectionsResult] = await Promise.all([
      supabase.from("memo_prompts").select("*").order("section_name"),
      supabase.from("questionnaire_sections").select("id, name, display_title").order("sort_order")
    ]);

    if (promptsResult.error) {
      toast({
        title: "Error",
        description: "Failed to load prompts",
        variant: "destructive",
      });
    } else {
      const promptsMap: Record<string, Prompt> = {};
      const editedMap: Record<string, string> = {};
      
      promptsResult.data?.forEach((prompt) => {
        promptsMap[prompt.section_name] = prompt;
        editedMap[prompt.section_name] = prompt.prompt;
      });

      setPrompts(promptsMap);
      setEditedPrompts(editedMap);
    }

    if (sectionsResult.data) {
      setSections(sectionsResult.data);
    }
  };

  const handleSave = async (sectionName: string) => {
    setSaving(sectionName);
    try {
      const { error } = await supabase
        .from("memo_prompts")
        .update({ prompt: editedPrompts[sectionName] })
        .eq("section_name", sectionName);

      if (error) throw error;

      await fetchPrompts();
      toast({
        title: "Prompt Saved",
        description: `${sectionName} prompt has been updated`,
      });
    } catch (error: any) {
      console.error("Error saving prompt:", error);
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleReset = (sectionName: string) => {
    setEditedPrompts({
      ...editedPrompts,
      [sectionName]: prompts[sectionName]?.prompt || "",
    });
  };

  const hasChanges = (sectionName: string) => {
    return editedPrompts[sectionName] !== prompts[sectionName]?.prompt;
  };

  const handleOptimize = async (sectionName: string) => {
    setOptimizing(sectionName);
    setCurrentSection(sectionName);
    
    try {
      const { data, error } = await supabase.functions.invoke("optimize-prompt", {
        body: { 
          prompt: editedPrompts[sectionName],
          sectionName 
        }
      });

      if (error) throw error;

      if (data.optimizedPrompt) {
        setOptimizedPrompt(data.optimizedPrompt);
        setShowOptimizedDialog(true);
      }
    } catch (error: any) {
      console.error("Error optimizing prompt:", error);
      toast({
        title: "Optimization Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setOptimizing(null);
    }
  };

  const handleAcceptOptimized = () => {
    setEditedPrompts({
      ...editedPrompts,
      [currentSection]: optimizedPrompt,
    });
    setShowOptimizedDialog(false);
    toast({
      title: "Prompt Updated",
      description: "You can now review and save the optimized prompt",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            onClick={() => navigate("/admin")}
            variant="ghost"
            size="sm"
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-primary">Memo Prompts Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customize AI prompts for each memo section
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {Object.entries(prompts).map(([sectionName, prompt]) => {
          const linkedSection = sections.find(s => s.id === prompt.section_id);
          
          return (
            <ModernCard key={sectionName}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{sectionName}</h2>
                    {linkedSection && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Linked to: {linkedSection.display_title}
                      </p>
                    )}
                    {prompt.updated_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last updated: {new Date(prompt.updated_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleOptimize(sectionName)}
                      variant="secondary"
                      size="sm"
                      disabled={optimizing === sectionName || !editedPrompts[sectionName]}
                      className="gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {optimizing === sectionName ? "Optimizing..." : "Optimize with AI"}
                    </Button>
                    {hasChanges(sectionName) && (
                      <Button
                        onClick={() => handleReset(sectionName)}
                        variant="outline"
                        size="sm"
                        disabled={saving === sectionName}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    )}
                    <Button
                      onClick={() => handleSave(sectionName)}
                      size="sm"
                      disabled={!hasChanges(sectionName) || saving === sectionName}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving === sectionName ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>

                <Textarea
                  value={editedPrompts[sectionName] || ""}
                  onChange={(e) =>
                    setEditedPrompts({
                      ...editedPrompts,
                      [sectionName]: e.target.value,
                    })
                  }
                  className="min-h-[250px] font-mono text-sm"
                  placeholder={`Enter prompt for ${sectionName} section...`}
                />
              </div>
            </ModernCard>
          );
        })}
      </main>

      {/* Optimized Prompt Dialog */}
      <AlertDialog open={showOptimizedDialog} onOpenChange={setShowOptimizedDialog}>
        <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Optimized Prompt for {currentSection}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Review the AI-optimized version of your prompt below. You can accept it or continue with your original.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Original Prompt:</h4>
              <div className="p-4 bg-muted rounded-lg max-h-40 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap font-mono">
                  {editedPrompts[currentSection]}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-primary">Optimized Prompt:</h4>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg max-h-60 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap font-mono">
                  {optimizedPrompt}
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Keep Original</AlertDialogCancel>
            <AlertDialogAction onClick={handleAcceptOptimized}>
              Accept Optimized
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPrompts;
