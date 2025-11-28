import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { resolveIcon, getAvailableIcons } from "@/lib/iconResolver";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface Section {
  id: string;
  name: string;
  display_title: string;
  icon: string;
  color: string;
}

interface Question {
  id: string;
  section_id: string;
  question_key: string;
  title: string;
  tldr: string | null;
  question: string;
  placeholder: string | null;
  icon: string;
  sort_order: number;
  is_required: boolean;
  is_active: boolean;
}

const AdminQuestions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    section_id: "",
    question_key: "",
    title: "",
    tldr: "",
    question: "",
    placeholder: "",
    icon: "Circle",
    is_required: true,
    is_active: true,
  });

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (!roles?.some(r => r.role === "admin")) {
      navigate("/");
      return;
    }

    await fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    
    const { data: sectionsData } = await supabase
      .from("questionnaire_sections")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    const { data: questionsData } = await supabase
      .from("questionnaire_questions")
      .select("*")
      .order("sort_order");

    if (sectionsData) setSections(sectionsData);
    if (questionsData) setQuestions(questionsData);
    if (sectionsData && sectionsData.length > 0) {
      setSelectedSectionId(sectionsData[0].id);
    }
    
    setLoading(false);
  };

  const handleOpenDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        section_id: question.section_id,
        question_key: question.question_key,
        title: question.title,
        tldr: question.tldr || "",
        question: question.question,
        placeholder: question.placeholder || "",
        icon: question.icon,
        is_required: question.is_required,
        is_active: question.is_active,
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        section_id: selectedSectionId,
        question_key: "",
        title: "",
        tldr: "",
        question: "",
        placeholder: "",
        icon: "Circle",
        is_required: true,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.question_key || !formData.title || !formData.question) {
      toast.error("Question key, title, and question text are required");
      return;
    }

    try {
      if (editingQuestion) {
        const { error } = await supabase
          .from("questionnaire_questions")
          .update(formData)
          .eq("id", editingQuestion.id);

        if (error) throw error;
        toast.success("Question updated successfully");
      } else {
        const sectionQuestions = questions.filter(q => q.section_id === formData.section_id);
        const maxSortOrder = Math.max(...sectionQuestions.map(q => q.sort_order), 0);
        
        const { error } = await supabase
          .from("questionnaire_questions")
          .insert({ ...formData, sort_order: maxSortOrder + 1 });

        if (error) throw error;
        toast.success("Question created successfully");
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    const { error } = await supabase
      .from("questionnaire_questions")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete question");
      console.error(error);
    } else {
      toast.success("Question deleted");
      fetchData();
    }
  };

  const filteredQuestions = questions.filter(q => q.section_id === selectedSectionId);
  const currentSection = sections.find(s => s.id === selectedSectionId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
            <h1 className="text-3xl font-bold">Manage Questions</h1>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        <div className="mb-6">
          <Label>Filter by Section</Label>
          <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => {
                const Icon = resolveIcon(section.icon);
                return (
                  <SelectItem key={section.id} value={section.id}>
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${section.color}`} />
                      {section.display_title}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No questions in this section yet. Click "Add Question" to create one.
              </CardContent>
            </Card>
          ) : (
            filteredQuestions.map((question) => {
              const Icon = resolveIcon(question.icon);
              return (
                <Card key={question.id} className={!question.is_active ? "opacity-50" : ""}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <Icon className={`w-6 h-6 mt-1 ${currentSection?.color}`} />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{question.title}</h3>
                          {question.tldr && (
                            <p className="text-sm text-muted-foreground mb-2">{question.tldr}</p>
                          )}
                          <p className="text-sm mb-2">{question.question}</p>
                          <p className="text-xs text-muted-foreground">Key: {question.question_key}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {question.is_required && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(question)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(question.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingQuestion ? "Edit Question" : "Add Question"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="section">Section</Label>
                <Select 
                  value={formData.section_id} 
                  onValueChange={(value) => setFormData({ ...formData, section_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.display_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="question_key">Question Key (Unique ID)</Label>
                <Input
                  id="question_key"
                  value={formData.question_key}
                  onChange={(e) => setFormData({ ...formData, question_key: e.target.value })}
                  placeholder="e.g., problem_description"
                  disabled={!!editingQuestion}
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., What Makes People Suffer?"
                />
              </div>
              <div>
                <Label htmlFor="tldr">TLDR (Short Summary)</Label>
                <Input
                  id="tldr"
                  value={formData.tldr}
                  onChange={(e) => setFormData({ ...formData, tldr: e.target.value })}
                  placeholder="e.g., The pain point your startup addresses"
                />
              </div>
              <div>
                <Label htmlFor="question">Question Text</Label>
                <Textarea
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Full question text that guides the user..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="placeholder">Placeholder</Label>
                <Textarea
                  id="placeholder"
                  value={formData.placeholder}
                  onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                  placeholder="e.g., Small businesses lose 30% of revenue..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {getAvailableIcons().slice(0, 50).map((iconName) => {
                      const IconComponent = resolveIcon(iconName);
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            {iconName}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_required}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
                  />
                  <Label>Required</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminQuestions;
