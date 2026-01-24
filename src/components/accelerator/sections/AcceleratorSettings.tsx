import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Save, Loader2, Trash2, UserPlus, ArrowRightLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AcceleratorClaimStartup } from "./AcceleratorClaimStartup";
import { AcceleratorSelectDialog } from "@/components/accelerator/AcceleratorSelectDialog";
import { useAuth } from "@/hooks/useAuth";

interface Accelerator {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  onboarding_completed: boolean | null;
  created_at: string | null;
}

interface AcceleratorSettingsProps {
  accelerator: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    website_url: string | null;
    focus_areas: string[] | null;
  };
  onUpdate: () => void;
}

export function AcceleratorSettings({ accelerator, onUpdate }: AcceleratorSettingsProps) {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: accelerator.name,
    description: accelerator.description || "",
    websiteUrl: accelerator.website_url || "",
  });
  
  // Ecosystem switcher state (admin only)
  const [showSwitcherDialog, setShowSwitcherDialog] = useState(false);
  const [allAccelerators, setAllAccelerators] = useState<Accelerator[]>([]);
  const [loadingAccelerators, setLoadingAccelerators] = useState(false);

  // Fetch all accelerators when admin opens the switcher
  const fetchAllAccelerators = async () => {
    if (!user) return;
    
    setLoadingAccelerators(true);
    try {
      // Admins can see all accelerators
      const { data, error } = await supabase
        .from("accelerators")
        .select("id, name, slug, logo_url, description, onboarding_completed, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllAccelerators(data || []);
    } catch (error) {
      console.error("Error fetching accelerators:", error);
      toast.error("Failed to load accelerators");
    } finally {
      setLoadingAccelerators(false);
    }
  };

  const handleOpenSwitcher = () => {
    fetchAllAccelerators();
    setShowSwitcherDialog(true);
  };

  const handleSelectAccelerator = (acc: Accelerator) => {
    setShowSwitcherDialog(false);
    if (acc.id !== accelerator.id) {
      navigate(`/accelerator/dashboard?id=${acc.id}`);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Accelerator name is required");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("accelerators")
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          website_url: formData.websiteUrl.trim() || null,
        })
        .eq("id", accelerator.id);

      if (error) throw error;

      toast.success("Settings saved successfully");
      onUpdate();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccelerator = async () => {
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-accelerator", {
        body: { acceleratorId: accelerator.id }
      });

      if (error) throw error;

      toast.success("Accelerator deleted successfully");
      
      // Redirect to auth page where they can select another accelerator or see options
      navigate("/accelerator/auth");
    } catch (error: any) {
      console.error("Delete accelerator error:", error);
      toast.error(error.message || "Failed to delete accelerator");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your accelerator profile</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Admin: Switch Ecosystem */}
        {isAdmin && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ArrowRightLeft className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Switch Ecosystem</h2>
                  <p className="text-sm text-muted-foreground">
                    Jump to another accelerator dashboard
                  </p>
                </div>
              </div>
              <Button onClick={handleOpenSwitcher} variant="outline" className="gap-2">
                View All
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/30">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{accelerator.name}</h2>
              <p className="text-sm text-muted-foreground">/{accelerator.slug}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Accelerator Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your accelerator name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your accelerator program..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                placeholder="https://your-accelerator.com"
              />
            </div>

            <Button onClick={handleSave} disabled={isLoading} className="mt-4">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Startup Management */}
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border/30">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Claim Startups</h2>
              <p className="text-sm text-muted-foreground">Add existing startups to your ecosystem using their claim code</p>
            </div>
          </div>
          
          <AcceleratorClaimStartup 
            acceleratorId={accelerator.id}
            acceleratorName={accelerator.name}
            onClaim={onUpdate}
          />
        </div>

        {/* Danger Zone */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
          <h3 className="font-semibold text-destructive mb-2">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting this accelerator will remove all cohorts, team members, and invites. 
            Startups in your portfolio will be unlinked but not deleted.
          </p>
          
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Accelerator
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{accelerator.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this accelerator, 
                  all its cohorts, team members, and invite links. Startups will be unlinked 
                  but their data will remain intact.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccelerator}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Accelerator"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Ecosystem Selection Dialog */}
      <AcceleratorSelectDialog
        open={showSwitcherDialog}
        onOpenChange={setShowSwitcherDialog}
        accelerators={allAccelerators}
        onSelect={handleSelectAccelerator}
        isLoading={loadingAccelerators}
      />
    </div>
  );
}
