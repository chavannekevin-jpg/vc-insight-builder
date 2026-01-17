import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Map,
  Users,
  Briefcase,
  FileUp,
  Settings,
  BarChart3,
  CalendarDays,
  Target,
  LogOut,
  Gift,
  Copy,
  Check,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";


const mainMenuItems = [
  { title: "Network Map", url: "/investor/dashboard", icon: Map, section: "map" },
  { title: "CRM", url: "/investor/dashboard?view=crm", icon: Users, section: "crm" },
  { title: "Dealflow", url: "/investor/dashboard?view=dealflow", icon: Briefcase, section: "dealflow" },
  { title: "Upload Deck", url: "/investor/dashboard?view=upload", icon: FileUp, section: "upload" },
];

const toolsMenuItems = [
  { title: "Portfolio", url: "/investor/dashboard?view=portfolio", icon: BarChart3, section: "portfolio" },
  { title: "Calendar", url: "/investor/dashboard?view=calendar", icon: CalendarDays, section: "calendar" },
  { title: "Thesis", url: "/investor/dashboard?view=thesis", icon: Target, section: "thesis" },
];

const settingsMenuItems = [
  { title: "Settings", url: "/investor/dashboard?view=settings", icon: Settings, section: "settings" },
];

interface InvestorSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userProfile: any;
}

const InvestorSidebar = ({ activeSection, onSectionChange, userProfile }: InvestorSidebarProps) => {
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [copied, setCopied] = useState<"link" | "message" | null>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/investor");
  };

  const handleNavClick = (section: string) => {
    onSectionChange(section);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const fetchOrCreateInviteCode = async () => {
    if (!userProfile?.id) return;
    
    setIsLoadingCode(true);
    try {
      // Check for existing active invite code
      const { data: existingCodes } = await (supabase
        .from("investor_invites") as any)
        .select("*")
        .eq("inviter_id", userProfile.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);

      if (existingCodes && existingCodes.length > 0) {
        const code = existingCodes[0];
        const hasUses = !code.max_uses || code.uses < code.max_uses;
        const notExpired = !code.expires_at || new Date(code.expires_at) > new Date();
        
        if (hasUses && notExpired) {
          setInviteCode(code.code);
          return;
        }
      }

      // Generate new code
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const { data: newCode, error } = await (supabase
        .from("investor_invites") as any)
        .insert({
          code,
          inviter_id: userProfile.id,
          max_uses: 5,
        })
        .select()
        .single();

      if (error) throw error;
      setInviteCode(newCode.code);
    } catch (err) {
      console.error("Error fetching invite code:", err);
    } finally {
      setIsLoadingCode(false);
    }
  };

  const handleOpenInviteModal = () => {
    setInviteModalOpen(true);
    fetchOrCreateInviteCode();
  };

  const inviteLink = inviteCode 
    ? `${window.location.origin}/investor/auth?code=${inviteCode}` 
    : "";

  const inviteMessage = userProfile?.full_name && inviteCode
    ? `Hey! I'm using an exclusive investor network to map my investment connections. I'd love for you to join.

Here's your personal invite link:
${inviteLink}

See you on the inside!
${userProfile.full_name}`
    : "";

  const copyToClipboard = (text: string, type: "link" | "message") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast({ title: type === "link" ? "Link copied!" : "Message copied!" });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-border/50">
        <SidebarContent className="flex flex-col h-full">
          {/* User Profile Section */}
          <div className={`p-4 border-b border-border/50 ${collapsed ? "px-2" : ""}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                {userProfile?.full_name ? getInitials(userProfile.full_name) : "IN"}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{userProfile?.full_name || "Investor"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {userProfile?.organization_name || "—"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Menu */}
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainMenuItems.map((item) => (
                  <SidebarMenuItem key={item.section}>
                    <SidebarMenuButton
                      onClick={() => handleNavClick(item.section)}
                      isActive={activeSection === item.section}
                      tooltip={item.title}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Tools Menu */}
          <SidebarGroup>
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {toolsMenuItems.map((item) => (
                  <SidebarMenuItem key={item.section}>
                    <SidebarMenuButton
                      onClick={() => handleNavClick(item.section)}
                      isActive={activeSection === item.section}
                      tooltip={item.title}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Invite & Settings & Sign Out */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Invite Friends */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleOpenInviteModal}
                    tooltip="Invite Investors"
                    className="text-primary hover:text-primary"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Invite Friends</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {settingsMenuItems.map((item) => (
                  <SidebarMenuItem key={item.section}>
                    <SidebarMenuButton
                      onClick={() => handleNavClick(item.section)}
                      isActive={activeSection === item.section}
                      tooltip={item.title}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Invite Fellow Investors
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {isLoadingCode ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <>
                {/* Invite Code Display */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-2">Your Invite Code</p>
                  <code className="text-2xl font-mono font-bold tracking-wider text-primary">
                    {inviteCode}
                  </code>
                </div>

                {/* Invite Link */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Invite Link</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={inviteLink}
                      className="flex-1 px-3 py-2 text-sm bg-muted rounded-md border border-border truncate"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(inviteLink, "link")}
                    >
                      {copied === "link" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Pre-made Message */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Ready-to-send Message</label>
                  <div className="relative">
                    <textarea
                      readOnly
                      value={inviteMessage}
                      rows={6}
                      className="w-full px-3 py-2 text-sm bg-muted rounded-md border border-border resize-none"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(inviteMessage, "message")}
                    >
                      {copied === "message" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Your invite code can be used up to 5 times
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvestorSidebar;
