import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  ArrowLeft,
  Send,
  Users,
  Mail,
  Sparkles,
  Eye,
  Loader2,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  Zap,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserWithCompany {
  id: string;
  email: string;
  companyName: string | null;
  createdAt: string;
  hasPaid: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_type: string;
  automation_key: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminEmails = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserWithCompany[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  // Templates state
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editContent, setEditContent] = useState("");

  // Email form state
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [recipientType, setRecipientType] = useState<"all" | "selected" | "single" | "not_paid">("single");
  const [singleRecipient, setSingleRecipient] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/admin");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError || !roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions",
          variant: "destructive",
        });
        navigate("/admin");
        return;
      }

      setIsAdmin(true);
      fetchUsers();
      fetchTemplates();
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("template_type", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive",
      });
    } finally {
      setTemplatesLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, email, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const { data: purchases } = await supabase
        .from("memo_purchases")
        .select("user_id");

      const paidUserIds = new Set(purchases?.map((p) => p.user_id) || []);

      const usersWithCompanies = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: company } = await supabase
            .from("companies")
            .select("name")
            .eq("founder_id", profile.id)
            .maybeSingle();

          return {
            id: profile.id,
            email: profile.email,
            companyName: company?.name || null,
            createdAt: profile.created_at,
            hasPaid: paidUserIds.has(profile.id),
          };
        })
      );

      setUsers(usersWithCompanies);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const loadTemplate = (template: EmailTemplate) => {
    setEmailSubject(template.subject);
    setEmailContent(template.content);
    toast({
      title: "Template Loaded",
      description: `"${template.name}" template applied`,
    });
  };

  const openEditModal = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setEditName(template.name);
    setEditSubject(template.subject);
    setEditContent(template.content);
    setIsCreatingNew(false);
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setEditName("");
    setEditSubject("");
    setEditContent("");
    setIsCreatingNew(true);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTemplate(null);
    setEditName("");
    setEditSubject("");
    setEditContent("");
    setIsCreatingNew(false);
  };

  const saveTemplate = async () => {
    if (!editName.trim() || !editSubject.trim() || !editContent.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSavingTemplate(true);

    try {
      if (isCreatingNew) {
        const { error } = await supabase.from("email_templates").insert({
          name: editName.trim(),
          subject: editSubject.trim(),
          content: editContent.trim(),
          template_type: "manual",
        });

        if (error) throw error;

        toast({
          title: "Template Created",
          description: `"${editName}" has been created`,
        });
      } else if (editingTemplate) {
        const { error } = await supabase
          .from("email_templates")
          .update({
            name: editName.trim(),
            subject: editSubject.trim(),
            content: editContent.trim(),
          })
          .eq("id", editingTemplate.id);

        if (error) throw error;

        toast({
          title: "Template Updated",
          description: `"${editName}" has been saved`,
        });
      }

      closeEditModal();
      fetchTemplates();
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const confirmDeleteTemplate = (template: EmailTemplate) => {
    setTemplateToDelete(template);
    setIsDeleteDialogOpen(true);
  };

  const deleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", templateToDelete.id);

      if (error) throw error;

      toast({
        title: "Template Deleted",
        description: `"${templateToDelete.name}" has been deleted`,
      });

      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);
      fetchTemplates();
    } catch (error: any) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const getRecipients = (): string[] => {
    switch (recipientType) {
      case "all":
        return users.map((u) => u.email);
      case "selected":
        return users.filter((u) => selectedUsers.includes(u.id)).map((u) => u.email);
      case "single":
        return singleRecipient ? [singleRecipient] : [];
      case "not_paid":
        return users.filter((u) => !u.hasPaid).map((u) => u.email);
      default:
        return [];
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map((u) => u.id));
  };

  const deselectAllUsers = () => {
    setSelectedUsers([]);
  };

  const sendEmail = async () => {
    const recipients = getRecipients();

    if (recipients.length === 0) {
      toast({
        title: "No Recipients",
        description: "Please select at least one recipient",
        variant: "destructive",
      });
      return;
    }

    if (!emailSubject.trim() || !emailContent.trim()) {
      toast({
        title: "Missing Content",
        description: "Please provide both subject and email content",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const results = await Promise.allSettled(
        recipients.map(async (email) => {
          const { data, error } = await supabase.functions.invoke("send-email", {
            body: {
              to: email,
              subject: emailSubject,
              html: emailContent,
            },
          });

          if (error) throw error;
          return data;
        })
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        toast({
          title: "Partial Success",
          description: `Sent ${successful} emails, ${failed} failed`,
          variant: "default",
        });
      } else {
        toast({
          title: "Emails Sent!",
          description: `Successfully sent ${successful} email${successful > 1 ? "s" : ""}`,
        });
      }

      setEmailSubject("");
      setEmailContent("");
      setSelectedUsers([]);
      setSingleRecipient("");
    } catch (error: any) {
      console.error("Error sending emails:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send emails",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const recipients = getRecipients();
  const automatedTemplates = templates.filter(t => t.template_type === "automated");
  const manualTemplates = templates.filter(t => t.template_type === "manual");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/admin")} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Mail className="w-6 h-6" />
                Email Center
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage templates and send emails to users
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Templates & Compose */}
          <div className="lg:col-span-2 space-y-6">
            {/* Automated Templates Section */}
            <ModernCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Automated Templates
                </h2>
                <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                  Runs automatically
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                These templates are used for automated emails. Changes will apply to the next scheduled send.
              </p>
              {templatesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : automatedTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No automated templates</p>
              ) : (
                <div className="space-y-3">
                  {automatedTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-amber-50/50 border-amber-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium flex items-center gap-2">
                          {template.name}
                          <Badge variant="secondary" className="text-xs">
                            {template.automation_key}
                          </Badge>
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {template.subject}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(template)}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadTemplate(template)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ModernCard>

            {/* Manual Templates Section */}
            <ModernCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Campaign Templates
                </h2>
                <Button size="sm" onClick={openCreateModal}>
                  <Plus className="w-4 h-4 mr-1" />
                  New Template
                </Button>
              </div>
              {templatesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : manualTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No campaign templates yet</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {manualTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 border rounded-lg hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{template.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {template.subject}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => loadTemplate(template)}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Use
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(template)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => confirmDeleteTemplate(template)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ModernCard>

            {/* Compose Section */}
            <ModernCard>
              <Tabs defaultValue="compose">
                <TabsList className="mb-4">
                  <TabsTrigger value="compose">Compose</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="compose" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input
                      id="subject"
                      placeholder="Enter email subject..."
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Email Content (HTML)</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your email content here... (HTML supported)"
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      className="min-h-[300px] font-mono text-sm"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="preview">
                  <div className="border rounded-lg p-6 bg-white min-h-[400px]">
                    <div className="mb-4 pb-4 border-b">
                      <p className="text-sm text-gray-500">Subject:</p>
                      <p className="font-semibold text-gray-900">
                        {emailSubject || "No subject"}
                      </p>
                    </div>
                    <div
                      className="prose prose-sm max-w-none text-gray-900"
                      dangerouslySetInnerHTML={{
                        __html: emailContent || "<p>No content</p>",
                      }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </ModernCard>
          </div>

          {/* Right Column - Recipients */}
          <div className="space-y-6">
            <ModernCard>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Recipients
              </h2>

              <div className="space-y-4">
                <Select
                  value={recipientType}
                  onValueChange={(v) => setRecipientType(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Email</SelectItem>
                    <SelectItem value="selected">Selected Users</SelectItem>
                    <SelectItem value="not_paid">Not Paid Users ({users.filter(u => !u.hasPaid).length})</SelectItem>
                    <SelectItem value="all">All Users ({users.length})</SelectItem>
                  </SelectContent>
                </Select>

                {recipientType === "single" && (
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      value={singleRecipient}
                      onChange={(e) => setSingleRecipient(e.target.value)}
                    />
                  </div>
                )}

                {recipientType === "selected" && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllUsers}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={deselectAllUsers}
                      >
                        Deselect All
                      </Button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-lg p-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className={`p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedUsers.includes(user.id)
                              ? "bg-primary/10 border border-primary/30"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => toggleUserSelection(user.id)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">
                              {user.email}
                            </p>
                            <Badge 
                              variant="outline" 
                              className={`text-xs shrink-0 ${user.hasPaid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                            >
                              {user.hasPaid ? 'Paid' : 'Not Paid'}
                            </Badge>
                          </div>
                          {user.companyName && (
                            <p className="text-xs text-muted-foreground truncate">
                              {user.companyName}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">
                      Recipients:
                    </span>
                    <Badge variant="secondary">{recipients.length}</Badge>
                  </div>

                  <Button
                    className="w-full"
                    onClick={sendEmail}
                    disabled={sending || recipients.length === 0}
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Email{recipients.length > 1 ? "s" : ""}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </ModernCard>

            <ModernCard className="bg-muted/30">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Sender Info
              </h3>
              <p className="text-sm text-muted-foreground">
                Emails will be sent from:
              </p>
              <p className="text-sm font-mono mt-1">
                Kev from VC Brain &lt;kev@updates.vc-brain.com&gt;
              </p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Custom domain configured
              </p>
            </ModernCard>
          </div>
        </div>
      </main>

      {/* Edit Template Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreatingNew ? "Create New Template" : `Edit: ${editingTemplate?.name}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Template Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Welcome Email"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-subject">Subject Line</Label>
              <Input
                id="edit-subject"
                placeholder="e.g., Welcome to VC Brain! 🚀"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Email Content (HTML)</Label>
              <Tabs defaultValue="edit-compose" className="w-full">
                <TabsList className="mb-2">
                  <TabsTrigger value="edit-compose">Compose</TabsTrigger>
                  <TabsTrigger value="edit-preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit-compose">
                  <Textarea
                    id="edit-content"
                    placeholder="Write your email content here... (HTML supported)"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                </TabsContent>
                <TabsContent value="edit-preview">
                  <div className="border rounded-lg p-6 bg-white min-h-[300px]">
                    <div
                      className="prose prose-sm max-w-none text-gray-900"
                      dangerouslySetInnerHTML={{
                        __html: editContent || "<p>No content</p>",
                      }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={saveTemplate} disabled={isSavingTemplate}>
              {isSavingTemplate ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEmails;
