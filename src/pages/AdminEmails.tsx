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
  ArrowLeft,
  Send,
  Users,
  Mail,
  Sparkles,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserWithCompany {
  id: string;
  email: string;
  companyName: string | null;
  createdAt: string;
  hasPaid: boolean;
}

const AdminEmails = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserWithCompany[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Email form state
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [recipientType, setRecipientType] = useState<"all" | "selected" | "single" | "not_paid">("single");
  const [singleRecipient, setSingleRecipient] = useState("");

  // Email templates
  const templates = [
    {
      name: "Welcome Email",
      subject: "Welcome to Ugly Baby! 🚀",
      content: `<h1>Welcome to Ugly Baby!</h1>
<p>Hi there,</p>
<p>Thank you for signing up! We're excited to help you prepare your startup for fundraising.</p>
<p>Here's what you can do:</p>
<ul>
  <li>Complete your company profile</li>
  <li>Answer the questionnaire</li>
  <li>Generate your VC-ready memo</li>
</ul>
<p>If you have any questions, just reply to this email.</p>
<p>Cheers,<br/>Kev</p>`,
    },
    {
      name: "Discount Announcement",
      subject: "Special Offer: Save on Your Memo! 💰",
      content: `<h1>Limited Time Offer!</h1>
<p>Hi there,</p>
<p>We're offering a special discount on memo generation.</p>
<p><strong>Use code: SPECIAL20</strong> to get 20% off!</p>
<p>This offer expires soon, so don't wait.</p>
<p>Cheers,<br/>Kev</p>`,
    },
    {
      name: "Memo Ready",
      subject: "Your Memo is Ready! 📋",
      content: `<h1>Your Memo is Ready!</h1>
<p>Hi there,</p>
<p>Great news! Your investment memo has been generated and is ready to view.</p>
<p><a href="https://vc-brain.com/sample-memo">View Your Memo →</a></p>
<p>If you have any questions or feedback, let us know!</p>
<p>Cheers,<br/>Kev</p>`,
    },
    {
      name: "Reminder",
      subject: "Don't Forget to Complete Your Profile 📝",
      content: `<h1>Almost There!</h1>
<p>Hi there,</p>
<p>We noticed you haven't completed your company profile yet.</p>
<p>Completing your profile helps us generate a better, more personalized memo for your startup.</p>
<p><a href="https://vc-brain.com/portal">Continue Your Profile →</a></p>
<p>Cheers,<br/>Kev</p>`,
    },
    {
      name: "Incomplete Memo Nudge",
      subject: "Quick check-in on your memo 👋",
      content: `<p>Hey there,</p>

<p>Thanks for joining the Ugly Baby platform, great to have you on-board.</p>

<p>I noticed you've already started preparing your investment memorandum, but didn't complete the process yet.</p>

<p>I wanted to quickly reach out in case something wasn't clear or if you paused intentionally.</p>

<p>I've attached a sample memo so you can see exactly what you'll receive once it's completed: a clear, investor-style analysis of your startup, highlighting key risks, blind spots, and concrete action items you can act on immediately.</p>

<p>👉 <a href="https://vc-brain.com/sample-memo" style="color: #8b5cf6; text-decoration: underline;">View Sample Memo</a></p>

<p>To make it easier to move forward, I'm keeping the <strong>50% launch discount active until Christmas</strong>.</p>

<p>If you have any questions, feedback, or blockers — I'm all ears and happy to help.</p>

<p>Cheers,<br/>Kev</p>`,
    },
    {
      name: "Happy New Year 2026",
      subject: "🎉 Happy New Year! 20% Off to Crush the VC Game in 2026",
      content: `<p>Hey there,</p>

<p>Happy New Year! 🥳</p>

<p>2026 is here — and with it, a fresh shot at raising the capital your startup deserves.</p>

<p>Whether you're preparing for your first pitch or refining your story for investors, I want to help you start the year strong.</p>

<p>So here's a little gift: <strong>20% off</strong> your personalized investment memo.</p>

<p>👉 <strong>Use code: HdncXwgd</strong> at checkout</p>

<p>This memo will give you:</p>
<ul>
  <li>A VC-style teardown of your startup's strengths and weaknesses</li>
  <li>Specific blind spots investors will probe</li>
  <li>Actionable items to fix before you pitch</li>
</ul>

<p>Think of it as your fundraising cheat sheet — built by someone who's reviewed thousands of pitches.</p>

<p><a href="https://uglybaby.app/hub" style="color: #8b5cf6; text-decoration: underline; font-weight: bold;">Get Your Memo Now →</a></p>

<p>Let's make 2026 the year you close that round.</p>

<p>Cheers to your success,<br/>Kev</p>

<p style="color: #888; font-size: 12px;">P.S. This code won't last forever — use it while it's hot 🔥</p>`,
    },
  ];

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
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, email, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch all purchases to know who paid
      const { data: purchases } = await supabase
        .from("memo_purchases")
        .select("user_id");

      const paidUserIds = new Set(purchases?.map((p) => p.user_id) || []);

      // Fetch companies for each user
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

  const loadTemplate = (template: typeof templates[0]) => {
    setEmailSubject(template.subject);
    setEmailContent(template.content);
    toast({
      title: "Template Loaded",
      description: `"${template.name}" template applied`,
    });
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
      // Send emails one by one (or batch them)
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

      // Reset form
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
                Send emails to your users
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Compose */}
          <div className="lg:col-span-2 space-y-6">
            <ModernCard>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Quick Templates
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {templates.map((template) => (
                  <Button
                    key={template.name}
                    variant="outline"
                    className="h-auto py-3 px-4 justify-start text-left"
                    onClick={() => loadTemplate(template)}
                  >
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {template.subject}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </ModernCard>

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
                Kev from Ugly Baby &lt;kev@updates.vc-brain.com&gt;
              </p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Custom domain configured
              </p>
            </ModernCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminEmails;
