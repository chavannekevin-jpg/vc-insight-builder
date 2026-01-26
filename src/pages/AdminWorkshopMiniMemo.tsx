import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useAllWorkshopTemplates, 
  useUpdateWorkshopTemplate,
  WorkshopTemplate 
} from "@/hooks/useWorkshopData";
import { 
  Save, 
  Eye, 
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function AdminWorkshopMiniMemo() {
  const navigate = useNavigate();
  const { data: templates, isLoading } = useAllWorkshopTemplates();
  const updateTemplate = useUpdateWorkshopTemplate();
  
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [editedTemplate, setEditedTemplate] = useState<Partial<WorkshopTemplate> | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const selectedTemplateData = templates?.find(t => t.section_key === selectedSection);

  const handleSelectSection = (sectionKey: string) => {
    const template = templates?.find(t => t.section_key === sectionKey);
    setSelectedSection(sectionKey);
    setEditedTemplate(template ? { ...template } : null);
    setPreviewMode(false);
  };

  const handleSave = async () => {
    if (!selectedTemplateData?.id || !editedTemplate) return;
    
    await updateTemplate.mutateAsync({
      id: selectedTemplateData.id,
      updates: {
        guidance_text: editedTemplate.guidance_text,
        prompt_question: editedTemplate.prompt_question,
        benchmark_example: editedTemplate.benchmark_example,
        benchmark_tips: editedTemplate.benchmark_tips,
      },
    });
  };

  const handleTipsChange = (value: string) => {
    // Parse comma-separated tips into array
    const tips = value.split("\n").filter(t => t.trim().length > 0);
    setEditedTemplate(prev => prev ? { ...prev, benchmark_tips: tips } : null);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/admin/workshop")}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Mini Memorandum Exercise</h1>
              <p className="text-muted-foreground text-sm">
                Configure benchmark examples and guidance for each section
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Section List */}
          <div className="col-span-12 md:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Sections</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 p-2">
                  {templates?.map((template) => (
                    <button
                      key={template.section_key}
                      onClick={() => handleSelectSection(template.section_key)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        "flex items-center justify-between",
                        selectedSection === template.section_key
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <span>{template.section_title}</span>
                      {template.benchmark_example ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground/50" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Editor */}
          <div className="col-span-12 md:col-span-9">
            {selectedSection && editedTemplate ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{editedTemplate.section_title}</CardTitle>
                      <CardDescription>
                        Section {editedTemplate.sort_order} of 8
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {previewMode ? "Edit" : "Preview"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={updateTemplate.isPending}
                      >
                        {updateTemplate.isPending ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-1" />
                        )}
                        Save
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="content" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="content" className="space-y-4">
                      <div className="space-y-2">
                        <Label>Guidance Text</Label>
                        <p className="text-xs text-muted-foreground">
                          Explain how investors think about this section
                        </p>
                        <Textarea
                          value={editedTemplate.guidance_text || ""}
                          onChange={(e) => setEditedTemplate(prev => 
                            prev ? { ...prev, guidance_text: e.target.value } : null
                          )}
                          placeholder="VCs evaluate this section by looking at..."
                          rows={4}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Prompt Question</Label>
                        <p className="text-xs text-muted-foreground">
                          The main question founders will answer
                        </p>
                        <Textarea
                          value={editedTemplate.prompt_question || ""}
                          onChange={(e) => setEditedTemplate(prev => 
                            prev ? { ...prev, prompt_question: e.target.value } : null
                          )}
                          placeholder="What problem does your startup solve?"
                          rows={2}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="benchmark" className="space-y-4">
                      <div className="space-y-2">
                        <Label>Benchmark Example</Label>
                        <p className="text-xs text-muted-foreground">
                          A well-written example response that founders can reference
                        </p>
                        <Textarea
                          value={editedTemplate.benchmark_example || ""}
                          onChange={(e) => setEditedTemplate(prev => 
                            prev ? { ...prev, benchmark_example: e.target.value } : null
                          )}
                          placeholder="Our target market is the $47B enterprise HR software sector..."
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Benchmark Tips</Label>
                        <p className="text-xs text-muted-foreground">
                          Key elements that make the example effective (one per line)
                        </p>
                        <Textarea
                          value={(editedTemplate.benchmark_tips || []).join("\n")}
                          onChange={(e) => handleTipsChange(e.target.value)}
                          placeholder="Specific TAM number&#10;Clear segmentation&#10;Bottom-up sizing"
                          rows={4}
                        />
                        {editedTemplate.benchmark_tips && editedTemplate.benchmark_tips.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {editedTemplate.benchmark_tips.map((tip, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                ✓ {tip}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  Select a section from the list to edit its content
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
