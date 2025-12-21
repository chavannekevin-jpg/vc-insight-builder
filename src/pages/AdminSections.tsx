import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
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
  sort_order: number;
  is_active: boolean;
}

const TAILWIND_COLORS = [
  "text-red-500",
  "text-yellow-500",
  "text-blue-500",
  "text-purple-500",
  "text-green-500",
  "text-pink-500",
  "text-emerald-500",
  "text-orange-500",
  "text-cyan-500",
  "text-indigo-500",
];

const AdminSections = () => {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    display_title: "",
    icon: "Circle",
    color: "text-gray-500",
    is_active: true,
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("questionnaire_sections")
      .select("*")
      .order("sort_order");

    if (error) {
      toast.error("Failed to load sections");
      console.error(error);
    } else {
      setSections(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (section?: Section) => {
    if (section) {
      setEditingSection(section);
      setFormData({
        name: section.name,
        display_title: section.display_title,
        icon: section.icon,
        color: section.color,
        is_active: section.is_active,
      });
    } else {
      setEditingSection(null);
      setFormData({
        name: "",
        display_title: "",
        icon: "Circle",
        color: "text-gray-500",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.display_title) {
      toast.error("Name and display title are required");
      return;
    }

    try {
      if (editingSection) {
        const { error } = await supabase
          .from("questionnaire_sections")
          .update(formData)
          .eq("id", editingSection.id);

        if (error) throw error;
        toast.success("Section updated successfully");
      } else {
        const maxSortOrder = Math.max(...sections.map(s => s.sort_order), 0);
        const { error } = await supabase
          .from("questionnaire_sections")
          .insert({ ...formData, sort_order: maxSortOrder + 1 });

        if (error) throw error;
        toast.success("Section created successfully");
      }

      setIsDialogOpen(false);
      fetchSections();
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section? This will also delete all associated questions.")) {
      return;
    }

    const { error } = await supabase
      .from("questionnaire_sections")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete section");
      console.error(error);
    } else {
      toast.success("Section deleted");
      fetchSections();
    }
  };

  const handleToggleActive = async (section: Section) => {
    const { error } = await supabase
      .from("questionnaire_sections")
      .update({ is_active: !section.is_active })
      .eq("id", section.id);

    if (error) {
      toast.error("Failed to update section");
      console.error(error);
    } else {
      toast.success(`Section ${!section.is_active ? "activated" : "deactivated"}`);
      fetchSections();
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Manage Sections">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manage Sections">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <p className="text-muted-foreground">Configure questionnaire sections</p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>

        <div className="space-y-4">
          {sections.map((section) => {
            const Icon = resolveIcon(section.icon);
            return (
              <Card key={section.id} className={!section.is_active ? "opacity-50" : ""}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                    <Icon className={`w-6 h-6 ${section.color}`} />
                    <div>
                      <h3 className="font-semibold">{section.display_title}</h3>
                      <p className="text-sm text-muted-foreground">{section.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={section.is_active}
                      onCheckedChange={() => handleToggleActive(section)}
                    />
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(section)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(section.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSection ? "Edit Section" : "Add Section"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Name (Internal)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Problem"
                />
              </div>
              <div>
                <Label htmlFor="display_title">Display Title</Label>
                <Input
                  id="display_title"
                  value={formData.display_title}
                  onChange={(e) => setFormData({ ...formData, display_title: e.target.value })}
                  placeholder="e.g., What Makes People Suffer?"
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
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
              <div>
                <Label htmlFor="color">Color</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAILWIND_COLORS.map((color) => (
                      <SelectItem key={color} value={color}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${color.replace('text-', 'bg-')}`} />
                          {color}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
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
    </AdminLayout>
  );
};

export default AdminSections;
