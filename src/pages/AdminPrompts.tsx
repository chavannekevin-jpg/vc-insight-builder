import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Prompt {
  id: string;
  section_name: string;
  prompt: string;
  updated_at: string;
}

const SECTIONS = [
  "Problem",
  "Solution",
  "Market",
  "Competition",
  "Team",
  "USP",
  "Business Model",
  "Traction",
];

const AdminPrompts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<Record<string, Prompt>>({});
  const [editedPrompts, setEditedPrompts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

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
    try {
      const { data, error } = await supabase
        .from("memo_prompts")
        .select("*")
        .order("section_name");

      if (error) throw error;

      const promptsMap: Record<string, Prompt> = {};
      const editedMap: Record<string, string> = {};
      
      data?.forEach((prompt) => {
        promptsMap[prompt.section_name] = prompt;
        editedMap[prompt.section_name] = prompt.prompt;
      });

      setPrompts(promptsMap);
      setEditedPrompts(editedMap);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      toast({
        title: "Error",
        description: "Failed to load prompts",
        variant: "destructive",
      });
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
        {SECTIONS.map((sectionName) => (
          <ModernCard key={sectionName}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{sectionName}</h2>
                  {prompts[sectionName]?.updated_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last updated: {new Date(prompts[sectionName].updated_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
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
        ))}
      </main>
    </div>
  );
};

export default AdminPrompts;
