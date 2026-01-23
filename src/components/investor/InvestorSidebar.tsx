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
  Building2,
  Shield,
  QrCode,
  Download,
  Share2,
  Calendar,
  Network,
  X,
  Maximize2,
  Compass,
  BookUser,
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
import { QRCodeSVG } from "qrcode.react";



const mainMenuItems = [
  { title: "Network Map", url: "/investor/dashboard", icon: Map, section: "map", tourId: "tour-network-map" },
  { title: "My Contacts", url: "/investor/dashboard?view=directory", icon: BookUser, section: "directory" },
  { title: "CRM Pipeline", url: "/investor/dashboard?view=crm", icon: Users, section: "crm", tourId: "tour-crm" },
  { title: "Fund Directory", url: "/investor/dashboard?view=funds", icon: Building2, section: "funds" },
  { title: "Dealflow", url: "/investor/dashboard?view=dealflow", icon: Briefcase, section: "dealflow", tourId: "tour-dealflow" },
  { title: "Scout Deals", url: "/investor/dashboard?view=scout", icon: Compass, section: "scout", tourId: "tour-scout" },
  { title: "Upload Deck", url: "/investor/dashboard?view=upload", icon: FileUp, section: "upload", tourId: "tour-upload" },
];

const toolsMenuItems = [
  { title: "Business CRM", url: "/investor/dashboard?view=businesscrm", icon: Briefcase, section: "businesscrm" },
  { title: "Portfolio", url: "/investor/dashboard?view=portfolio", icon: BarChart3, section: "portfolio" },
  { title: "Calendar", url: "/investor/dashboard?view=calendar", icon: CalendarDays, section: "calendar", tourId: "tour-calendar" },
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
  const { state, setOpen } = useSidebar();
  const collapsed = state === "collapsed";

  // Hover handlers for auto-expand
  const handleMouseEnter = () => {
    if (collapsed) {
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [copied, setCopied] = useState<"link" | "message" | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrMode, setQrMode] = useState<"booking" | "network">("booking");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!userProfile?.id) return;
      
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userProfile.id)
        .eq("role", "admin")
        .maybeSingle();
      
      setIsAdmin(!!data);
    };
    
    checkAdminRole();
  }, [userProfile?.id]);

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

  const copyToClipboard = (text: string, type: "link" | "message" | "qr") => {
    navigator.clipboard.writeText(text);
    setCopied(type as any);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(null), 2000);
  };

  // QR Code URLs
  const bookingUrl = userProfile?.profile_slug 
    ? `${window.location.origin}/book/${userProfile.profile_slug}`
    : "";
  const networkUrl = inviteCode 
    ? `${window.location.origin}/investor/auth?code=${inviteCode}`
    : "";

  const handleOpenQrModal = () => {
    setQrModalOpen(true);
    fetchOrCreateInviteCode();
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("sidebar-qr-code");
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx?.scale(2, 2);
      ctx?.drawImage(img, 0, 0);
      
      const a = document.createElement("a");
      a.download = `${qrMode === "booking" ? "booking" : "network"}-qr.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShare = async () => {
    const url = qrMode === "booking" ? bookingUrl : networkUrl;
    const title = qrMode === "booking" ? "Book a meeting with me" : "Join my investor network";
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        copyToClipboard(url, "qr");
      }
    } else {
      copyToClipboard(url, "qr");
    }
  };

  return (
    <>
      <Sidebar 
        collapsible="icon" 
        className="border-r border-border/30 bg-gradient-to-b from-card/80 to-card/50 backdrop-blur-xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SidebarContent className="flex flex-col h-full">
          {/* User Profile Section */}
          <div className={`p-4 border-b border-border/30 ${collapsed ? "px-2" : ""}`}>
            <div className={`flex items-center gap-3 ${!collapsed ? "p-3 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-border/30 hover:border-primary/20 transition-all duration-300" : ""}`}>
              <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-semibold flex-shrink-0 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300">
                  {userProfile?.full_name ? getInitials(userProfile.full_name) : "IN"}
                </div>
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate text-foreground">{userProfile?.full_name || "Investor"}</p>
                  <p className="text-xs text-muted-foreground/80 truncate">
                    {userProfile?.organization_name || "—"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Menu */}
          <SidebarGroup className="mt-2">
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium px-4">Main</SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu>
                {mainMenuItems.map((item) => (
                  <SidebarMenuItem key={item.section} data-tour-step={item.tourId}>
                    <SidebarMenuButton
                      onClick={() => handleNavClick(item.section)}
                      isActive={activeSection === item.section}
                      tooltip={item.title}
                      className={`group relative rounded-lg transition-all duration-200 ${
                        activeSection === item.section 
                          ? "bg-primary/10 text-primary shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-primary before:rounded-r-full before:shadow-[0_0_8px_rgba(var(--primary),0.5)]" 
                          : "hover:bg-muted/50 hover:translate-x-0.5"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 transition-transform duration-200 ${activeSection === item.section ? "scale-110" : "group-hover:scale-105"}`} />
                      <span className="font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Tools Menu */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium px-4">Tools</SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu>
                {toolsMenuItems.map((item) => (
                  <SidebarMenuItem key={item.section} data-tour-step={item.tourId}>
                    <SidebarMenuButton
                      onClick={() => handleNavClick(item.section)}
                      isActive={activeSection === item.section}
                      tooltip={item.title}
                      className={`group relative rounded-lg transition-all duration-200 ${
                        activeSection === item.section 
                          ? "bg-primary/10 text-primary shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-primary before:rounded-r-full before:shadow-[0_0_8px_rgba(var(--primary),0.5)]" 
                          : "hover:bg-muted/50 hover:translate-x-0.5"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 transition-transform duration-200 ${activeSection === item.section ? "scale-110" : "group-hover:scale-105"}`} />
                      <span className="font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Invite & Settings & Sign Out */}
          <SidebarGroup className="border-t border-border/30 pt-2">
            <SidebarGroupContent className="px-2">
              <SidebarMenu>
                {/* QR Code - Conference Mode */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleOpenQrModal}
                    tooltip="QR Code"
                    className="group relative rounded-lg transition-all duration-200 hover:bg-primary/10 text-primary hover:translate-x-0.5"
                  >
                    <QrCode className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                    <span className="font-medium">My QR Code</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Invite Friends */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleOpenInviteModal}
                    tooltip="Invite Investors"
                    className="group relative rounded-lg transition-all duration-200 hover:bg-muted/50 hover:translate-x-0.5"
                  >
                    <Gift className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
                    <span className="font-medium">Invite Friends</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Admin Access - Only for admin users */}
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => navigate("/admin")} 
                      tooltip="Admin Panel"
                      className="group rounded-lg transition-all duration-200 hover:bg-amber-500/10 text-amber-600 hover:translate-x-0.5"
                    >
                      <Shield className="w-4 h-4 transition-transform duration-200 group-hover:scale-105" />
                      <span className="font-medium">Admin Panel</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                
                {settingsMenuItems.map((item) => (
                  <SidebarMenuItem key={item.section}>
                    <SidebarMenuButton
                      onClick={() => handleNavClick(item.section)}
                      isActive={activeSection === item.section}
                      tooltip={item.title}
                      className={`group relative rounded-lg transition-all duration-200 ${
                        activeSection === item.section 
                          ? "bg-primary/10 text-primary shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-primary before:rounded-r-full" 
                          : "hover:bg-muted/50 hover:translate-x-0.5"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 transition-transform duration-200 ${activeSection === item.section ? "scale-110" : "group-hover:scale-105"}`} />
                      <span className="font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={handleSignOut} 
                    tooltip="Sign Out"
                    className="group rounded-lg transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:translate-x-0.5"
                  >
                    <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:scale-105" />
                    <span className="font-medium">Sign Out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="max-w-md border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/20">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight">Invite Fellow Investors</span>
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
                <div className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl text-center shadow-inner">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">Your Invite Code</p>
                  <code className="text-3xl font-mono font-bold tracking-[0.2em] text-primary drop-shadow-sm">
                    {inviteCode}
                  </code>
                </div>

                {/* Invite Link */}
                <div>
                  <label className="text-sm font-semibold mb-2 block text-foreground">Invite Link</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={inviteLink}
                      className="flex-1 px-3 py-2.5 text-sm bg-muted/50 rounded-lg border border-border/50 truncate focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(inviteLink, "link")}
                      className="h-10 w-10 p-0 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                    >
                      {copied === "link" ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Pre-made Message */}
                <div>
                  <label className="text-sm font-semibold mb-2 block text-foreground">Ready-to-send Message</label>
                  <div className="relative">
                    <textarea
                      readOnly
                      value={inviteMessage}
                      rows={6}
                      className="w-full px-3 py-2.5 text-sm bg-muted/50 rounded-lg border border-border/50 resize-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                      onClick={() => copyToClipboard(inviteMessage, "message")}
                    >
                      {copied === "message" ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground/70 text-center py-2 px-4 rounded-lg bg-muted/30 border border-border/30">
                  Your invite code can be used up to 5 times
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal - Conference Mode */}
      <Dialog open={qrModalOpen} onOpenChange={(open) => { setQrModalOpen(open); if (!open) setIsFullscreen(false); }}>
        <DialogContent className={`border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ${isFullscreen ? "max-w-none w-screen h-screen m-0 rounded-none" : "max-w-sm"}`}>
          {isFullscreen ? (
            // Fullscreen mode - Just the QR code
            <div className="flex flex-col items-center justify-center h-full gap-6 relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 h-12 w-12 rounded-full bg-muted/50 hover:bg-muted"
              >
                <X className="h-6 w-6" />
              </Button>
              
              <div className="bg-white p-8 rounded-3xl shadow-2xl">
                <QRCodeSVG
                  id="sidebar-qr-code"
                  value={qrMode === "booking" ? bookingUrl : networkUrl}
                  size={280}
                  level="H"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              
              <div className="text-center">
                <p className="text-xl font-semibold text-foreground">
                  {qrMode === "booking" ? "Book a Meeting" : "Join My Network"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Scan to {qrMode === "booking" ? "schedule time with me" : "request an invite"}
                </p>
              </div>

              {/* Mode toggle in fullscreen */}
              <div className="flex gap-2 bg-muted/30 p-1 rounded-xl">
                <Button
                  variant={qrMode === "booking" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setQrMode("booking")}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Booking
                </Button>
                <Button
                  variant={qrMode === "network" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setQrMode("network")}
                  className="gap-2"
                >
                  <Network className="h-4 w-4" />
                  Network
                </Button>
              </div>
            </div>
          ) : (
            // Normal modal mode
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/20">
                    <QrCode className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">Conference Mode</span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Mode Toggle */}
                <div className="flex gap-2 p-1 bg-muted/30 rounded-xl">
                  <Button
                    variant={qrMode === "booking" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setQrMode("booking")}
                    className="flex-1 gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Booking Page
                  </Button>
                  <Button
                    variant={qrMode === "network" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setQrMode("network")}
                    className="flex-1 gap-2"
                  >
                    <Network className="h-4 w-4" />
                    Network Invite
                  </Button>
                </div>

                {/* QR Code Display */}
                <div className="flex flex-col items-center">
                  <div 
                    className="bg-white p-4 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => setIsFullscreen(true)}
                  >
                    <QRCodeSVG
                      id="sidebar-qr-code"
                      value={qrMode === "booking" ? bookingUrl : networkUrl}
                      size={180}
                      level="H"
                      includeMargin
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    {qrMode === "booking" 
                      ? "Let people book meetings with you" 
                      : "Invite investors to your network"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(true)}
                    className="flex-1 gap-2"
                  >
                    <Maximize2 className="h-4 w-4" />
                    Fullscreen
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadQR}
                    className="flex-1 gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex-1 gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground/70 text-center py-2 px-4 rounded-lg bg-muted/30 border border-border/30">
                  Tap the QR code to go fullscreen for easy scanning
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvestorSidebar;
