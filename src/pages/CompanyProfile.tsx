import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FounderLayout } from "@/components/founder/FounderLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Edit, Sparkles, Loader2, Check, X, Zap, Rocket, Upload, RefreshCw, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QuickFillWizard } from "@/components/QuickFillWizard";
import { DeckImportWizard } from "@/components/DeckImportWizard";
import { UnitEconomicsEditor } from "@/components/UnitEconomicsEditor";
import { DataSourceBadge } from "@/components/company/DataSourceBadge";
import { FinancialMetricsDashboard } from "@/components/company/FinancialMetricsDashboard";
import { CompletionProgress } from "@/components/company/CompletionProgress";
import { ProfileExplainer, useProfileExplainer } from "@/components/explainers/ProfileExplainer";

interface Company {
  id: string;
  name: string;
  description: string;
  category: string;
  stage: string;
  biggest_challenge: string;
}

interface MemoResponse {
  question_key: string;
  answer: string | null;
  source?: string | null;
}

interface MemoSection {
  title: string;
  narrative?: {
    paragraphs?: Array<{ text: string }>;
    keyPoints?: string[];
  };
  overview?: string;
  tools?: {
    unitEconomics?: {
      aiGenerated?: {
        metrics?: {
          arr?: number;
          mrr?: number;
          ltv?: number;
          cac?: number;
          grossMargin?: number;
          churnRate?: number;
          paybackPeriod?: number;
        };
        pricing?: {
          model?: string;
          price?: number;
          interval?: string;
        };
      };
    };
  };
}

interface StructuredContent {
  sections?: MemoSection[];
}

const QUESTION_LABELS: Record<string, { section: string; title: string }> = {
  problem_core: { section: "Problem", title: "Core Problem" },
  solution_core: { section: "Solution", title: "Core Solution" },
  target_customer: { section: "Market", title: "Target Customer" },
  competitive_moat: { section: "Competition", title: "Competitive Edge" },
  team_story: { section: "Team", title: "Team Story" },
  business_model: { section: "Business Model", title: "Business Model" },
  unit_economics: { section: "Business Model", title: "Unit Economics" },
  traction_proof: { section: "Traction", title: "Traction Proof" },
  vision_ask: { section: "Vision", title: "Vision & Ask" },
};

const MEMO_SECTION_TO_QUESTION_KEY: Record<string, string> = {
  "Problem": "problem_core",
  "Solution": "solution_core",
  "Market": "target_customer",
  "Competition": "competitive_moat",
  "Team": "team_story",
  "Business Model": "business_model",
  "Traction": "traction_proof",
  "Vision": "vision_ask",
};

const extractMemoSectionContent = (section: MemoSection): string => {
  if (section.overview) return section.overview;
  if (section.narrative?.paragraphs) {
    return section.narrative.paragraphs.map(p => p.text).filter(Boolean).join("\n\n");
  }
  return "";
};

// Parse currency amounts from text (supports €, $, and various formats)
const parseCurrencyAmount = (text: string): number | null => {
  // Match patterns like: €126K, $1.2M, €18,000, $500k, 126K EUR, etc.
  const match = text.match(/[€$]?\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?(?:\s*(?:EUR|USD|€|\$))?/);
  if (!match) return null;
  
  let value = parseFloat(match[1].replace(/,/g, ''));
  if (isNaN(value)) return null;
  
  const multiplier = match[2]?.toUpperCase();
  if (multiplier === 'K') value *= 1000;
  if (multiplier === 'M') value *= 1000000;
  
  return value;
};

// Extract unit economics from Business Model and Traction sections using pattern matching
const extractUnitEconomicsFromMemo = (sections: MemoSection[]): Record<string, any> | null => {
  const businessModelSection = sections.find(s => s.title === "Business Model");
  const tractionSection = sections.find(s => s.title === "Traction & Proof Points");
  
  const businessModelText = businessModelSection ? extractMemoSectionContent(businessModelSection) : "";
  const tractionText = tractionSection ? extractMemoSectionContent(tractionSection) : "";
  const combinedText = `${businessModelText}\n${tractionText}`;
  
  if (!combinedText.trim()) return null;
  
  const extracted: Record<string, any> = {};
  
  // Extract ARR (Annual Recurring Revenue) - handles "€18K ARR", "ARR: €18K", "€126K CARR"
  const arrPatterns = [
    /[€$]\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?\s*ARR(?!\s*\()/i,  // €18K ARR (not CARR)
    /ARR[:\s]+[€$]?\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?/i,        // ARR: €18K
  ];
  for (const pattern of arrPatterns) {
    const match = combinedText.match(pattern);
    if (match && !extracted.arr) {
      let arr = parseFloat(match[1].replace(/,/g, ''));
      if (match[2]?.toUpperCase() === 'K') arr *= 1000;
      if (match[2]?.toUpperCase() === 'M') arr *= 1000000;
      extracted.arr = arr;
      break;
    }
  }
  
  // Extract CARR (Committed ARR)
  const carrPatterns = [
    /[€$]\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?\s*CARR/i,           // €126K CARR
    /CARR[:\s]+[€$]?\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?/i,       // CARR: €126K
    /committed\s*ARR[:\s]+[€$]?\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?/i,
  ];
  for (const pattern of carrPatterns) {
    const match = combinedText.match(pattern);
    if (match && !extracted.carr) {
      let carr = parseFloat(match[1].replace(/,/g, ''));
      if (match[2]?.toUpperCase() === 'K') carr *= 1000;
      if (match[2]?.toUpperCase() === 'M') carr *= 1000000;
      extracted.carr = carr;
      break;
    }
  }
  
  // Extract MRR (Monthly Recurring Revenue)
  const mrrPatterns = [
    /[€$]\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?\s*MRR/i,
    /MRR[:\s]+[€$]?\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?/i,
  ];
  for (const pattern of mrrPatterns) {
    const match = combinedText.match(pattern);
    if (match && !extracted.mrr) {
      let mrr = parseFloat(match[1].replace(/,/g, ''));
      if (match[2]?.toUpperCase() === 'K') mrr *= 1000;
      if (match[2]?.toUpperCase() === 'M') mrr *= 1000000;
      extracted.mrr = mrr;
      break;
    }
  }
  
  // Extract customer count
  const customerMatch = combinedText.match(/(\d+)\s*(?:paying\s+)?customers?/i) ||
                        combinedText.match(/customers?[:\s]*(\d+)/i);
  if (customerMatch) {
    extracted.customers = parseInt(customerMatch[1]);
  }
  
  // Extract ACV (Average Contract Value)
  const acvPatterns = [
    /[€$]\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?\s*ACV/i,
    /ACV[:\s]+[€$]?\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?/i,
    /average\s*contract\s*value[:\s]+[€$]?\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?/i,
  ];
  for (const pattern of acvPatterns) {
    const match = combinedText.match(pattern);
    if (match && !extracted.acv) {
      let acv = parseFloat(match[1].replace(/,/g, ''));
      if (match[2]?.toUpperCase() === 'K') acv *= 1000;
      if (match[2]?.toUpperCase() === 'M') acv *= 1000000;
      extracted.acv = acv;
      break;
    }
  }
  
  // Extract LTV (Lifetime Value)
  const ltvMatch = combinedText.match(/(?:LTV|lifetime value|CLV)[:\s]+[€$]?\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?/i);
  if (ltvMatch) {
    let ltv = parseFloat(ltvMatch[1].replace(/,/g, ''));
    if (ltvMatch[2]?.toUpperCase() === 'K') ltv *= 1000;
    if (ltvMatch[2]?.toUpperCase() === 'M') ltv *= 1000000;
    extracted.ltv = ltv;
  }
  
  // Extract CAC (Customer Acquisition Cost)
  const cacMatch = combinedText.match(/(?:CAC|customer acquisition cost)[:\s]+[€$]?\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?/i);
  if (cacMatch) {
    let cac = parseFloat(cacMatch[1].replace(/,/g, ''));
    if (cacMatch[2]?.toUpperCase() === 'K') cac *= 1000;
    if (cacMatch[2]?.toUpperCase() === 'M') cac *= 1000000;
    extracted.cac = cac;
  }
  
  // Extract pricing tiers - handle "SME package at €16K setup plus €18K ARR"
  const smeMatch = combinedText.match(/SME[^€$]*[€$]\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?\s*(?:setup|fee)/i) ||
                   combinedText.match(/SME[^€$]*[€$]\s*[\d,]+[KkMm]?\s*(?:setup|fee)[^€$]*[€$]\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?\s*ARR/i);
  if (smeMatch) {
    let value = parseFloat(smeMatch[1].replace(/,/g, ''));
    if (smeMatch[2]?.toUpperCase() === 'K') value *= 1000;
    if (smeMatch[2]?.toUpperCase() === 'M') value *= 1000000;
    extracted.pricingSME = value;
  }
  
  const enterpriseMatch = combinedText.match(/Enterprise[^€$]*[€$]\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?\s*(?:setup|fee)/i) ||
                          combinedText.match(/Enterprise[^€$]*[€$]\s*[\d,]+[KkMm]?\s*(?:setup|fee)[^€$]*[€$]\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?\s*ARR/i);
  if (enterpriseMatch) {
    let value = parseFloat(enterpriseMatch[1].replace(/,/g, ''));
    if (enterpriseMatch[2]?.toUpperCase() === 'K') value *= 1000;
    if (enterpriseMatch[2]?.toUpperCase() === 'M') value *= 1000000;
    extracted.pricingEnterprise = value;
  }
  
  // Extract setup fee - "€16K setup"
  const setupMatch = combinedText.match(/[€$]\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?\s*(?:setup|onboarding)/i);
  if (setupMatch && !extracted.setupFee) {
    let value = parseFloat(setupMatch[1].replace(/,/g, ''));
    if (setupMatch[2]?.toUpperCase() === 'K') value *= 1000;
    if (setupMatch[2]?.toUpperCase() === 'M') value *= 1000000;
    extracted.setupFee = value;
  }
  
  // Extract growth rate
  const growthMatch = combinedText.match(/(\d+(?:\.\d+)?)\s*%\s*(?:growth|MoM|month[- ]over[- ]month)/i);
  if (growthMatch) {
    extracted.growthRate = parseFloat(growthMatch[1]);
  }
  
  // Extract revenue if not ARR/MRR
  const revenueMatch = combinedText.match(/(?:revenue|sales)[:\s]*[€$]?\s*([\d,]+(?:\.\d+)?)\s*([KkMm])?/i);
  if (revenueMatch && !extracted.arr && !extracted.mrr) {
    let revenue = parseFloat(revenueMatch[1].replace(/,/g, ''));
    if (revenueMatch[2]?.toUpperCase() === 'K') revenue *= 1000;
    if (revenueMatch[2]?.toUpperCase() === 'M') revenue *= 1000000;
    extracted.revenue = revenue;
  }
  
  return Object.keys(extracted).length > 0 ? extracted : null;
};

export default function CompanyProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [responses, setResponses] = useState<MemoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [enhancing, setEnhancing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [hasMemo, setHasMemo] = useState(false);
  const [memoStructuredContent, setMemoStructuredContent] = useState<StructuredContent | null>(null);
  const [editingCompanyName, setEditingCompanyName] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedCompanyName, setEditedCompanyName] = useState("");
  const [editedSectionContent, setEditedSectionContent] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deckWizardOpen, setDeckWizardOpen] = useState(false);
  
  // Profile explainer modal
  const { showExplainer, isChecked: explainerChecked, completeExplainer } = useProfileExplainer();

  // Sync memo content to responses - with forceSync option
  const syncMemoToResponses = async (
    companyId: string, 
    structuredContent: StructuredContent, 
    currentResponses: MemoResponse[],
    forceSync: boolean = false
  ) => {
    if (!structuredContent?.sections) return currentResponses;
    
    setSyncing(true);
    const newResponses: MemoResponse[] = [];
    
    try {
      // Sync section content
      for (const section of structuredContent.sections) {
        const questionKey = MEMO_SECTION_TO_QUESTION_KEY[section.title];
        if (!questionKey) continue;
        
        const content = extractMemoSectionContent(section);
        if (!content) continue;
        
        // Skip if not forcing and user has content
        const existingResponse = currentResponses.find(r => r.question_key === questionKey);
        if (!forceSync && existingResponse?.answer?.trim()) continue;
        
        const { error } = await supabase
          .from("memo_responses")
          .upsert({
            company_id: companyId,
            question_key: questionKey,
            answer: content,
            source: "memo_sync"
          }, { onConflict: "company_id,question_key" });
        
        if (!error) {
          newResponses.push({ question_key: questionKey, answer: content, source: "memo_sync" });
        }
      }
      
      // Extract and save unit economics
      const unitEconomics = extractUnitEconomicsFromMemo(structuredContent.sections);
      if (unitEconomics) {
        const existingUE = currentResponses.find(r => r.question_key === "unit_economics_json");
        if (forceSync || !existingUE?.answer?.trim()) {
          const ueJson = JSON.stringify(unitEconomics);
          const { error } = await supabase
            .from("memo_responses")
            .upsert({
              company_id: companyId,
              question_key: "unit_economics_json",
              answer: ueJson,
              source: "memo_sync"
            }, { onConflict: "company_id,question_key" });
          
          if (!error) {
            newResponses.push({ question_key: "unit_economics_json", answer: ueJson, source: "memo_sync" });
          }
        }
      }
      
      if (newResponses.length > 0) {
        toast({
          title: forceSync ? "Synced from memo" : "Auto-synced from memo",
          description: `${newResponses.length} sections imported from your generated memo.`,
        });
      } else if (forceSync) {
        toast({
          title: "Already up to date",
          description: "All sections match your memo content.",
        });
      }
      
      // Merge with existing responses
      const merged = [...currentResponses];
      newResponses.forEach(nr => {
        const idx = merged.findIndex(r => r.question_key === nr.question_key);
        if (idx >= 0) {
          merged[idx] = nr;
        } else {
          merged.push(nr);
        }
      });
      
      return merged;
    } catch (error) {
      console.error("Memo sync error:", error);
      toast({
        title: "Sync failed",
        description: "Could not sync from memo. Please try again.",
        variant: "destructive"
      });
      return currentResponses;
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const loadCompanyData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: companies } = await supabase
        .from("companies")
        .select("*")
        .eq("founder_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!companies || companies.length === 0) {
        navigate("/intake");
        return;
      }

      setCompany(companies[0]);

      const { data: memoResponses } = await supabase
        .from("memo_responses")
        .select("question_key, answer, source")
        .eq("company_id", companies[0].id);

      let currentResponses: MemoResponse[] = (memoResponses || []) as MemoResponse[];
      
      const { data: memo } = await supabase
        .from("memos")
        .select("structured_content")
        .eq("company_id", companies[0].id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (memo?.structured_content) {
        setHasMemo(true);
        const structuredContent = memo.structured_content as StructuredContent;
        setMemoStructuredContent(structuredContent);
        
        // Auto-sync empty sections from memo (forceSync = false)
        const hasEmptySections = ["problem_core", "solution_core", "target_customer", "competitive_moat", "team_story", "business_model", "traction_proof", "vision_ask"]
          .some(key => !currentResponses.find(r => r.question_key === key)?.answer?.trim());
        
        if (hasEmptySections) {
          currentResponses = await syncMemoToResponses(companies[0].id, structuredContent, currentResponses, false);
        }
      }
      
      setResponses(currentResponses);
      setEditedCompanyName(companies[0].name);
      setLoading(false);
    };

    loadCompanyData();
  }, [navigate]);

  const handleSaveCompanyName = async () => {
    if (!company || !editedCompanyName.trim()) return;

    try {
      const { error } = await supabase
        .from("companies")
        .update({ name: editedCompanyName })
        .eq("id", company.id);

      if (error) throw error;

      setCompany({ ...company, name: editedCompanyName });
      setEditingCompanyName(false);
      toast({ title: "Company name updated" });
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveSection = async (sectionName: string, questionKey: string) => {
    if (!company || !editedSectionContent.trim()) return;

    try {
      const existingResponse = responses.find((r) => r.question_key === questionKey);

      if (existingResponse) {
        const { error } = await supabase
          .from("memo_responses")
          .update({ answer: editedSectionContent, source: "manual" })
          .eq("company_id", company.id)
          .eq("question_key", questionKey);

        if (error) throw error;
        setResponses(responses.map((r) =>
          r.question_key === questionKey ? { ...r, answer: editedSectionContent, source: "manual" } : r
        ));
      } else {
        const { error } = await supabase
          .from("memo_responses")
          .insert({
            company_id: company.id,
            question_key: questionKey,
            answer: editedSectionContent,
            source: "manual"
          });

        if (error) throw error;
        setResponses([...responses, { question_key: questionKey, answer: editedSectionContent, source: "manual" }]);
      }

      setEditingSection(null);
      toast({ title: "Section updated" });
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  };

  const handleEnhanceContent = async () => {
    if (!company) return;
    
    setEnhancing(true);
    try {
      const sectionData: Record<string, Record<string, string>> = {};
      
      ["Problem", "Solution", "Market", "Competition", "Team", "Business Model", "Traction"].forEach((sectionName) => {
        const sectionResponses = responses.filter((r) => QUESTION_LABELS[r.question_key]?.section === sectionName);
        if (sectionResponses.length > 0) {
          sectionData[sectionName] = {};
          sectionResponses.forEach((response) => {
            if (response.answer) sectionData[sectionName][response.question_key] = response.answer;
          });
        }
      });

      const { data, error } = await supabase.functions.invoke("enhance-memo", {
        body: { company, sections: sectionData },
      });

      if (error) throw error;

      const enhancedData = data as { enhanced: Record<string, string> };
      const updatedResponses = [...responses];
      
      for (const [sectionName, enhancedText] of Object.entries(enhancedData.enhanced)) {
        const sectionResponses = responses.filter((r) => QUESTION_LABELS[r.question_key]?.section === sectionName);
        if (sectionResponses.length > 0) {
          const firstResponse = sectionResponses[0];
          
          await supabase
            .from("memo_responses")
            .update({ answer: enhancedText, source: "enhanced" })
            .eq("company_id", company.id)
            .eq("question_key", firstResponse.question_key);

          const index = updatedResponses.findIndex((r) => r.question_key === firstResponse.question_key);
          if (index !== -1) {
            updatedResponses[index] = { ...updatedResponses[index], answer: enhancedText, source: "enhanced" };
          }
        }
      }
      
      setResponses(updatedResponses);
      toast({ title: "Content Enhanced! ✨" });
    } catch (error: any) {
      toast({ title: "Enhancement Failed", description: error.message, variant: "destructive" });
    } finally {
      setEnhancing(false);
    }
  };

  const handleWizardComplete = (newResponses: MemoResponse[]) => {
    setResponses(prev => {
      const updated = [...prev];
      newResponses.forEach(nr => {
        const idx = updated.findIndex(r => r.question_key === nr.question_key);
        if (idx >= 0) updated[idx] = nr;
        else updated.push(nr);
      });
      return updated;
    });
    toast({ title: "Profile updated!" });
  };

  const handleDeckImportComplete = async (data: any) => {
    if (!company) return;

    try {
      if (data.companyInfo?.category) {
        await supabase.from("companies").update({ category: data.companyInfo.category }).eq("id", company.id);
        setCompany({ ...company, category: data.companyInfo.category });
      }

      const sectionKeyMappings: Record<string, string> = {
        problem_statement: "problem_core",
        solution_description: "solution_core",
        target_market: "target_customer",
        business_model: "business_model",
        competitive_landscape: "competitive_moat",
        team_background: "team_story",
        traction_metrics: "traction_proof",
        funding_ask: "vision_ask",
      };

      // IMPORTANT (Methodology v2): Do NOT write deck-extracted content into memo_responses.
      // memo_responses is reserved for founder/manual evidence. We store deck extraction
      // as non-founder context in memo_tool_data for later use as hypotheses only.

      const newResponses: MemoResponse[] = [];
      const extractedSectionsForTool: Record<string, { question_key: string; content: string; confidence: number }> = {};

      for (const [extractedKey, section] of Object.entries(data.extractedSections || {})) {
        const typedSection = section as { content: string | null; confidence: number };
        if (typedSection.content && typedSection.confidence > 0.3) {
          const questionKey = sectionKeyMappings[extractedKey] || extractedKey;
          extractedSectionsForTool[extractedKey] = {
            question_key: questionKey,
            content: typedSection.content,
            confidence: typedSection.confidence,
          };

          // Update local UI state (marked as deck_import) so the user can see/edit,
          // but we do NOT persist it as founder evidence.
          newResponses.push({ question_key: questionKey, answer: typedSection.content, source: "deck_import" });
        }
      }

      if (Object.keys(extractedSectionsForTool).length > 0) {
        const { error: toolError } = await supabase
          .from("memo_tool_data")
          .upsert(
            {
              company_id: company.id,
              section_name: "Intake",
              tool_name: "deck_extraction",
              ai_generated_data: {
                companyInfo: data.companyInfo ?? null,
                extractedSections: extractedSectionsForTool,
                summary: data.summary ?? null,
                methodology: {
                  provenance: "non_founder_context",
                  notes:
                    "Deck import output is stored as non-founder context. It must not be treated as founder-asserted evidence in scoring or narratives.",
                },
              },
              data_source: "deck_import",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "company_id,section_name,tool_name" },
          );

        if (toolError) {
          console.warn("Failed to save deck extraction as tool data:", toolError);
        }
      }

      setResponses(prev => {
        const updated = [...prev];
        newResponses.forEach(nr => {
          const idx = updated.findIndex(r => r.question_key === nr.question_key);
          if (idx >= 0) updated[idx] = nr;
          else updated.push(nr);
        });
        return updated;
      });

      toast({
        title: "Deck imported!",
        description: `${newResponses.length} sections pre-filled (saved as non-founder context).`,
      });
    } catch (error: any) {
      toast({ title: "Import failed", description: error.message, variant: "destructive" });
    }
  };

  // Force sync handler for button click
  const handleForceSyncFromMemo = async () => {
    if (!company || !memoStructuredContent) return;
    const updated = await syncMemoToResponses(company.id, memoStructuredContent, responses, true);
    setResponses(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const isProfileEmpty = responses.length === 0 || !responses.some(r => r.answer?.trim());

  return (
    <FounderLayout>
      <div className="bg-gradient-to-b from-transparent to-muted/10">

      {company && (
        <QuickFillWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          companyId={company.id}
          companyName={company.name}
          companyDescription={company.description || ""}
          companyStage={company.stage}
          existingResponses={responses}
          onComplete={handleWizardComplete}
        />
      )}

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-display font-bold">Company Profile</h1>
          <p className="text-sm text-muted-foreground">
            Complete profile inputs for <span className="font-medium text-foreground">{company?.name}</span>
          </p>
        </div>

        {/* Hero Banner for Empty Profiles */}
        {isProfileEmpty && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-card/30 backdrop-blur-xl">
            <CardContent className="p-8 text-center space-y-4">
              <Rocket className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-2xl font-serif font-bold">New here? Let's get you funded!</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Complete your profile in under 5 minutes with our guided wizard.
              </p>
              <Button onClick={() => setWizardOpen(true)} size="lg" className="gap-2">
                <Zap className="w-5 h-5" />
                Quick Fill Your Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Data Flow Notice */}
        <Card className="border-primary/20 bg-card/60 backdrop-blur-2xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">This is your central data hub</p>
                <p className="text-xs text-muted-foreground">
                  Changes you make here will be used when regenerating your memo. Data flows from your deck imports, calculators, and AI enhancements all feed into this profile.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons Row */}
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" onClick={() => navigate("/hub")} className="gap-2 rounded-xl">
            ← Back to Hub
          </Button>
          <Button variant="outline" onClick={() => setDeckWizardOpen(true)} className="gap-2 rounded-xl">
            <Upload className="w-4 h-4" /> Import Deck
          </Button>
          <Button variant="outline" onClick={() => setWizardOpen(true)} className="gap-2 rounded-xl">
            <Zap className="w-4 h-4" /> Quick Fill
          </Button>
          {hasMemo && memoStructuredContent && (
            <Button variant="outline" onClick={handleForceSyncFromMemo} disabled={syncing} className="gap-2 rounded-xl">
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {syncing ? "Syncing..." : "Sync from Memo"}
            </Button>
          )}
          <Button onClick={handleEnhanceContent} disabled={enhancing || responses.length === 0} className="gap-2 rounded-xl">
            {enhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {enhancing ? "Enhancing..." : "AI Enhance All"}
          </Button>
        </div>

        {/* Completion Progress */}
        <Card className="bg-card/60 backdrop-blur-xl border-border/40">
          <CardHeader className="pb-3">
            <CompletionProgress responses={responses} questionLabels={QUESTION_LABELS} />
          </CardHeader>
        </Card>

        {/* Financial Metrics Dashboard */}
        <FinancialMetricsDashboard responses={responses} />

        {/* Company Overview */}
        <Card className="bg-card/60 backdrop-blur-xl border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Company Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-b border-border/30 pb-4">
              {editingCompanyName ? (
                <div className="flex items-center gap-3">
                  <Input
                    value={editedCompanyName}
                    onChange={(e) => setEditedCompanyName(e.target.value)}
                    className="text-xl font-semibold h-auto py-2 bg-card/60 backdrop-blur-sm"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveCompanyName} className="gap-2 rounded-xl">
                    <Check className="w-4 h-4" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setEditedCompanyName(company?.name || ""); setEditingCompanyName(false); }} className="rounded-xl">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{company?.name}</h2>
                  <Button size="sm" variant="ghost" onClick={() => setEditingCompanyName(true)} className="gap-2 rounded-xl">
                    <Edit className="w-4 h-4" /> Edit
                  </Button>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                {company?.category && <Badge variant="secondary" className="text-xs bg-muted/40 backdrop-blur-sm">{company.category}</Badge>}
                <Badge variant="secondary" className="text-xs bg-muted/40 backdrop-blur-sm">{company?.stage}</Badge>
              </div>
            </div>

            {company?.description && (
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-foreground">Overview</span>
                <p className="text-sm text-muted-foreground">{company.description}</p>
              </div>
            )}

            {company?.biggest_challenge && (
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-foreground">Key Challenge</span>
                <p className="text-sm text-muted-foreground">{company.biggest_challenge}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unit Economics Editor */}
        {company && (
          <UnitEconomicsEditor
            companyId={company.id}
            existingMetrics={responses.find(r => r.question_key === "unit_economics_json")?.answer}
            onSave={(metrics) => {
              setResponses(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(r => r.question_key === "unit_economics");
                if (idx >= 0) updated[idx] = { question_key: "unit_economics", answer: metrics };
                else updated.push({ question_key: "unit_economics", answer: metrics });
                return updated;
              });
            }}
          />
        )}

        {/* Memo Sections */}
        {["Problem", "Solution", "Market", "Competition", "Team", "Business Model", "Traction", "Vision"].map((sectionName) => {
          const primaryQuestionKey = Object.entries(QUESTION_LABELS).find(([_, label]) => label.section === sectionName)?.[0] || "";
          const sectionResponses = responses.filter((r) => QUESTION_LABELS[r.question_key]?.section === sectionName);
          const displayContent = sectionResponses[0]?.answer || "";
          const displaySource = sectionResponses[0]?.source;
          const hasContent = sectionResponses.length > 0 && displayContent;
          const charCount = displayContent.length;

          return (
            <Card key={sectionName} className="bg-card/60 backdrop-blur-xl border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  {sectionName}
                  <DataSourceBadge source={displaySource} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {hasContent && (
                      <span className="text-xs text-muted-foreground">{charCount} chars</span>
                    )}
                  </div>
                  {editingSection === sectionName ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveSection(sectionName, primaryQuestionKey)} className="gap-2 rounded-xl">
                        <Check className="w-4 h-4" /> Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingSection(null)} className="rounded-xl">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => { setEditingSection(sectionName); setEditedSectionContent(displayContent); }} className="gap-2 rounded-xl">
                      <Edit className="w-4 h-4" /> {hasContent ? "Edit" : "Add Content"}
                    </Button>
                  )}
                </div>

                {editingSection === sectionName ? (
                  <Textarea
                    value={editedSectionContent}
                    onChange={(e) => setEditedSectionContent(e.target.value)}
                    className="min-h-[200px] text-sm leading-relaxed bg-muted/30 backdrop-blur-sm rounded-xl"
                    placeholder={`Add ${sectionName.toLowerCase()} content here...`}
                    autoFocus
                  />
                ) : hasContent ? (
                  <div className="text-sm text-muted-foreground bg-muted/30 backdrop-blur-sm rounded-xl p-3 whitespace-pre-wrap">
                    {displayContent}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <div className="text-center space-y-3">
                      <FileText className="w-10 h-10 mx-auto opacity-50" />
                      <p className="text-xs">No content yet for this section.</p>
                      <Button variant="outline" size="sm" onClick={() => { setEditingSection(sectionName); setEditedSectionContent(""); }} className="gap-2 rounded-xl">
                        <Edit className="w-4 h-4" /> Add Content
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {responses.length === 0 && (
          <Card className="bg-card/60 backdrop-blur-xl border-border/40">
            <CardContent className="p-12 text-center space-y-4">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-bold">No Content Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto text-sm">Complete the questionnaire to generate your investment memo.</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setDeckWizardOpen(true)} className="gap-2 rounded-xl">
                  <Upload className="w-4 h-4" /> Import from Deck
                </Button>
                <Button onClick={() => navigate("/portal")} className="rounded-xl">Start Questionnaire</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {company && (
        <DeckImportWizard
          open={deckWizardOpen}
          onOpenChange={setDeckWizardOpen}
          companyId={company.id}
          companyName={company.name}
          companyDescription={company.description || ""}
          onImportComplete={handleDeckImportComplete}
        />
      )}

      {/* Profile Explainer Modal */}
      {explainerChecked && (
        <ProfileExplainer 
          open={showExplainer} 
          onComplete={completeExplainer} 
        />
      )}
      </div>
    </FounderLayout>
  );
}
