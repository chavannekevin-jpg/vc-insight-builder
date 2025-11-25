import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyReadinessScore } from "@/components/CompanyReadinessScore";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const SECTIONS = [
  { key: "problem_description", title: "Problem", description: "What problem are you solving?" },
  { key: "solution_description", title: "Solution", description: "How does your product solve this problem?" },
  { key: "market_target_customer", title: "Market", description: "Who is your target market and how big is it?" },
  { key: "competition_mission", title: "Competition", description: "Who are your competitors and how are you different?" },
  { key: "team_founders", title: "Team", description: "Who's on your founding team and what's their expertise?" },
  { key: "usp_differentiators", title: "Unique Selling Proposition", description: "What makes you truly unique?" },
  { key: "business_model_type", title: "Business Model", description: "How do you make money?" },
  { key: "traction_revenue", title: "Traction", description: "What progress have you made?" }
];

const responseSchema = z.object({
  answer: z.string().trim().max(2000, "Response must be less than 2000 characters")
});

interface SectionData {
  [key: string]: string;
}

export default function CompanyProfileEdit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [sectionData, setSectionData] = useState<SectionData>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadCompanyProfile();
  }, []);

  const loadCompanyProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/hub");
        return;
      }

      // Load company details
      const { data: companies, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("founder_id", session.user.id)
        .limit(1);

      if (companyError || !companies || companies.length === 0) {
        toast({
          title: "Error",
          description: "Could not load company profile",
          variant: "destructive"
        });
        navigate("/intake");
        return;
      }

      const company = companies[0];
      setCompanyId(company.id);
      setCompanyName(company.name);

      // Load all memo responses for this company
      const { data: responses, error: responsesError } = await supabase
        .from("memo_responses")
        .select("question_key, answer")
        .eq("company_id", company.id);

      if (responsesError) {
        console.error("Error loading responses:", responsesError);
      }

      // Group responses by section - use the main question key for each section
      const grouped: SectionData = {};
      const sectionPrefixes: Record<string, string> = {
        "problem": "problem_description",
        "solution": "solution_description",
        "market": "market_target_customer",
        "competition": "competition_mission",
        "team": "team_founders",
        "usp": "usp_differentiators",
        "business": "business_model_type",
        "traction": "traction_revenue"
      };
      
      responses?.forEach((response) => {
        // Check if this response matches one of our main section keys
        if (Object.values(sectionPrefixes).includes(response.question_key)) {
          grouped[response.question_key] = response.answer || "";
        }
      });

      setSectionData(grouped);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load company profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (sectionKey: string, value: string) => {
    setSectionData((prev) => ({
      ...prev,
      [sectionKey]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate all inputs
      for (const [key, value] of Object.entries(sectionData)) {
        if (value.trim()) {
          try {
            responseSchema.parse({ answer: value });
          } catch (validationError) {
            const section = SECTIONS.find(s => s.key === key);
            toast({
              title: "Validation Error",
              description: `${section?.title}: ${(validationError as z.ZodError).errors[0].message}`,
              variant: "destructive"
            });
            setSaving(false);
            return;
          }
        }
      }

      // Save each section as a memo response using the actual question keys
      for (const section of SECTIONS) {
        const answer = sectionData[section.key]?.trim();

        if (answer) {
          // Check if response exists
          const { data: existing } = await supabase
            .from("memo_responses")
            .select("id")
            .eq("company_id", companyId)
            .eq("question_key", section.key)
            .maybeSingle();

          if (existing) {
            // Update existing
            await supabase
              .from("memo_responses")
              .update({ answer, updated_at: new Date().toISOString() })
              .eq("id", existing.id);
          } else {
            // Insert new
            await supabase
              .from("memo_responses")
              .insert({
                company_id: companyId,
                question_key: section.key,
                answer
              });
          }
        }
      }

      toast({
        title: "Success",
        description: "Company profile updated successfully"
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Error",
        description: "Failed to save company profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getReadinessSections = () => {
    return SECTIONS.map(section => ({
      name: section.title,
      completed: !!sectionData[section.key]?.trim()
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/hub")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{companyName}</h1>
            <p className="text-muted-foreground">
              Complete your company profile to streamline memo generation
            </p>
          </div>

          {/* Readiness Score */}
          <Card>
            <CardContent className="pt-6">
              <CompanyReadinessScore 
                sections={getReadinessSections()} 
                variant="full"
              />
            </CardContent>
          </Card>

          {/* Section Forms */}
          <div className="space-y-4">
            {SECTIONS.map((section) => (
              <Card key={section.key}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {section.title}
                    {sectionData[section.key]?.trim() && (
                      <span className="text-xs text-green-500 font-normal">✓ Completed</span>
                    )}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor={section.key}>Your Response</Label>
                    <Textarea
                      id={section.key}
                      value={sectionData[section.key] || ""}
                      onChange={(e) => handleSectionChange(section.key, e.target.value)}
                      placeholder={`Describe your ${section.title.toLowerCase()}...`}
                      className="min-h-[120px]"
                      maxLength={2000}
                    />
                    <p className="text-xs text-muted-foreground">
                      {sectionData[section.key]?.length || 0} / 2000 characters
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Save Button */}
          <div className="sticky bottom-6 flex justify-end gap-4">
            <Button
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              size="lg"
              className="gradient-primary shadow-glow"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
