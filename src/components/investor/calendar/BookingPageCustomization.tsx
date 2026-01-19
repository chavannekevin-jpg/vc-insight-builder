import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X, Sun, Moon, ImageIcon, Sparkles, Move, Linkedin, Globe, Twitter, User, Building2, Camera, Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import QRCodeShareCard from "@/components/investor/QRCodeShareCard";

interface BookingPageCustomizationProps {
  userId: string;
}

interface Organization {
  name: string;
  role: string;
}

interface CustomizationSettings {
  theme: "dark" | "light";
  coverUrl: string | null;
  coverPosition: string;
  profilePictureUrl: string | null;
  headline: string | null;
  bio: string | null;
  fullName: string;
  organizationName: string | null;
  additionalOrganizations: Organization[];
  socialLinkedin: string | null;
  socialTwitter: string | null;
  socialWebsite: string | null;
  profileSlug: string | null;
}

const BookingPageCustomization = ({ userId }: BookingPageCustomizationProps) => {
  const [settings, setSettings] = useState<CustomizationSettings>({
    theme: "dark",
    coverUrl: null,
    coverPosition: "50% 50%",
    profilePictureUrl: null,
    headline: null,
    bio: null,
    fullName: "",
    organizationName: null,
    additionalOrganizations: [],
    socialLinkedin: null,
    socialTwitter: null,
    socialWebsite: null,
    profileSlug: null,
  });
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isRepositioning, setIsRepositioning] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("investor_profiles")
        .select("booking_page_theme, booking_page_cover_url, booking_page_cover_position, booking_page_headline, booking_page_bio, social_linkedin, social_twitter, social_website, full_name, organization_name, profile_picture_url, additional_organizations, profile_slug")
        .eq("id", userId)
        .single();

      if (!error && data) {
        const additionalOrgs = Array.isArray(data.additional_organizations) 
          ? (data.additional_organizations as unknown as Organization[])
          : [];
        
        setSettings({
          theme: (data.booking_page_theme as "dark" | "light") || "dark",
          coverUrl: data.booking_page_cover_url,
          coverPosition: data.booking_page_cover_position || "50% 50%",
          profilePictureUrl: data.profile_picture_url,
          headline: data.booking_page_headline,
          bio: data.booking_page_bio,
          fullName: data.full_name || "",
          organizationName: data.organization_name,
          additionalOrganizations: additionalOrgs,
          socialLinkedin: data.social_linkedin,
          socialTwitter: data.social_twitter,
          socialWebsite: data.social_website,
          profileSlug: data.profile_slug,
        });
      }
      setIsLoading(false);
    };
    
    const fetchInviteCode = async () => {
      const { data } = await supabase
        .from("investor_invites")
        .select("code")
        .eq("inviter_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (data) {
        setInviteCode(data.code);
      }
    };
    
    fetchSettings();
    fetchInviteCode();
  }, [userId]);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from("investor_profiles")
      .update({
        booking_page_theme: settings.theme,
        booking_page_headline: settings.headline,
        booking_page_bio: settings.bio,
        full_name: settings.fullName,
        organization_name: settings.organizationName || null,
        additional_organizations: JSON.parse(JSON.stringify(settings.additionalOrganizations)),
        social_linkedin: settings.socialLinkedin || null,
        social_twitter: settings.socialTwitter || null,
        social_website: settings.socialWebsite || null,
      })
      .eq("id", userId);

    if (error) {
      toast({ title: "Failed to save settings", variant: "destructive" });
    } else {
      toast({ title: "Booking page settings saved!" });
    }
    setIsSaving(false);
  };

  const addOrganization = () => {
    setSettings(prev => ({
      ...prev,
      additionalOrganizations: [...prev.additionalOrganizations, { name: "", role: "" }]
    }));
  };

  const removeOrganization = (index: number) => {
    setSettings(prev => ({
      ...prev,
      additionalOrganizations: prev.additionalOrganizations.filter((_, i) => i !== index)
    }));
  };

  const updateOrganization = (index: number, field: "name" | "role", value: string) => {
    setSettings(prev => ({
      ...prev,
      additionalOrganizations: prev.additionalOrganizations.map((org, i) => 
        i === index ? { ...org, [field]: value } : org
      )
    }));
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Please upload an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    setIsUploadingProfile(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/profile-${Date.now()}.${fileExt}`;

      if (settings.profilePictureUrl) {
        const oldPath = settings.profilePictureUrl.split("/booking-covers/")[1];
        if (oldPath) {
          await supabase.storage.from("booking-covers").remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("booking-covers")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("booking-covers")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("investor_profiles")
        .update({ profile_picture_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      setSettings(prev => ({ ...prev, profilePictureUrl: publicUrl }));
      toast({ title: "Profile picture uploaded!" });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploadingProfile(false);
      if (profileInputRef.current) profileInputRef.current.value = "";
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!settings.profilePictureUrl) return;

    try {
      const oldPath = settings.profilePictureUrl.split("/booking-covers/")[1];
      if (oldPath) {
        await supabase.storage.from("booking-covers").remove([oldPath]);
      }

      await supabase
        .from("investor_profiles")
        .update({ profile_picture_url: null })
        .eq("id", userId);

      setSettings(prev => ({ ...prev, profilePictureUrl: null }));
      toast({ title: "Profile picture removed" });
    } catch (error: any) {
      toast({
        title: "Failed to remove profile picture",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Please upload an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    setIsUploadingCover(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/cover-${Date.now()}.${fileExt}`;

      if (settings.coverUrl) {
        const oldPath = settings.coverUrl.split("/booking-covers/")[1];
        if (oldPath) {
          await supabase.storage.from("booking-covers").remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("booking-covers")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("booking-covers")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("investor_profiles")
        .update({ 
          booking_page_cover_url: publicUrl,
          booking_page_cover_position: "50% 50%"
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      setSettings(prev => ({ ...prev, coverUrl: publicUrl, coverPosition: "50% 50%" }));
      toast({ title: "Cover image uploaded! Drag to reposition." });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const handleRemoveCover = async () => {
    if (!settings.coverUrl) return;

    try {
      const oldPath = settings.coverUrl.split("/booking-covers/")[1];
      if (oldPath) {
        await supabase.storage.from("booking-covers").remove([oldPath]);
      }

      await supabase
        .from("investor_profiles")
        .update({ booking_page_cover_url: null, booking_page_cover_position: "50% 50%" })
        .eq("id", userId);

      setSettings(prev => ({ ...prev, coverUrl: null, coverPosition: "50% 50%" }));
      toast({ title: "Cover image removed" });
    } catch (error: any) {
      toast({
        title: "Failed to remove cover",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const parsePosition = (pos: string): { x: number; y: number } => {
    const parts = pos.split(" ");
    const x = parseFloat(parts[0]) || 50;
    const y = parseFloat(parts[1]) || 50;
    return { x, y };
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isRepositioning) return;
    e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const { x, y } = parsePosition(settings.coverPosition);
    
    dragStartRef.current = { x: clientX, y: clientY, posX: x, posY: y };
    setIsDragging(true);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !dragStartRef.current || !imageContainerRef.current) return;
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const containerRect = imageContainerRef.current.getBoundingClientRect();
    const deltaX = ((clientX - dragStartRef.current.x) / containerRect.width) * 100;
    const deltaY = ((clientY - dragStartRef.current.y) / containerRect.height) * 100;
    
    const newX = Math.max(0, Math.min(100, dragStartRef.current.posX - deltaX));
    const newY = Math.max(0, Math.min(100, dragStartRef.current.posY - deltaY));
    
    setSettings(prev => ({ ...prev, coverPosition: `${newX.toFixed(1)}% ${newY.toFixed(1)}%` }));
  };

  const handleDragEnd = async () => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStartRef.current = null;
    
    const { error } = await supabase
      .from("investor_profiles")
      .update({ booking_page_cover_position: settings.coverPosition })
      .eq("id", userId);
    
    if (error) {
      toast({ title: "Failed to save position", variant: "destructive" });
    }
  };

  const handleSavePosition = async () => {
    const { error } = await supabase
      .from("investor_profiles")
      .update({ booking_page_cover_position: settings.coverPosition })
      .eq("id", userId);
    
    if (error) {
      toast({ title: "Failed to save position", variant: "destructive" });
    } else {
      toast({ title: "Cover position saved!" });
      setIsRepositioning(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-xl bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold mb-1">Customize Your Booking Page</h3>
          <p className="text-sm text-muted-foreground">
            Personalize the public booking page that startups and other investors see
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            <User className="h-4 w-4" />
            Profile Information
          </div>
          
          <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                {settings.profilePictureUrl ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-primary/20 ring-offset-2 ring-offset-background shadow-lg">
                    <img
                      src={settings.profilePictureUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20 ring-offset-2 ring-offset-background shadow-lg">
                    <span className="text-3xl font-bold text-primary">
                      {settings.fullName?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
                
                <button
                  onClick={() => profileInputRef.current?.click()}
                  disabled={isUploadingProfile}
                  className="absolute -bottom-1 -right-1 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
                >
                  {isUploadingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>

                {settings.profilePictureUrl && (
                  <button
                    onClick={handleRemoveProfilePicture}
                    className="absolute -top-1 -right-1 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureUpload}
              />
              <span className="text-xs text-muted-foreground">Profile Photo</span>
            </div>

            {/* Name & Organization */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Display Name</Label>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  value={settings.fullName}
                  onChange={(e) => setSettings(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="organizationName">Primary Organization</Label>
                <Input
                  id="organizationName"
                  placeholder="e.g., Sequoia Capital"
                  value={settings.organizationName || ""}
                  onChange={(e) => setSettings(prev => ({ ...prev, organizationName: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Your main fund, firm, or affiliation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Organizations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <Building2 className="h-4 w-4" />
              Additional Affiliations
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOrganization}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {settings.additionalOrganizations.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
              No additional affiliations. Click "Add" to add companies you work with or represent.
            </div>
          ) : (
            <div className="space-y-3">
              {settings.additionalOrganizations.map((org, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                  <div className="p-1.5 text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div className="flex-1 grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Organization name"
                      value={org.name}
                      onChange={(e) => updateOrganization(index, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Your role (e.g., Advisor, Partner)"
                      value={org.role}
                      onChange={(e) => updateOrganization(index, "role", e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOrganization(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Theme Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            <Sun className="h-4 w-4" />
            Theme
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, theme: "dark" }))}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                settings.theme === "dark"
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-700">
                <Moon className="h-5 w-5 text-zinc-300" />
              </div>
              <div className="text-left">
                <div className="font-medium">Dark</div>
                <div className="text-xs text-muted-foreground">Elegant dark mode</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, theme: "light" }))}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                settings.theme === "light"
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                <Sun className="h-5 w-5 text-amber-500" />
              </div>
              <div className="text-left">
                <div className="font-medium">Light</div>
                <div className="text-xs text-muted-foreground">Clean & bright</div>
              </div>
            </button>
          </div>
        </div>

        {/* Cover Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <ImageIcon className="h-4 w-4" />
              Cover Image
            </div>
            {settings.coverUrl && !isRepositioning && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRepositioning(true)}
                className="gap-1 text-xs"
              >
                <Move className="h-3 w-3" />
                Reposition
              </Button>
            )}
          </div>
          <div className="relative">
            {settings.coverUrl ? (
              <div className="relative">
                <div
                  ref={imageContainerRef}
                  className={`relative overflow-hidden rounded-xl border ${
                    isRepositioning 
                      ? "border-primary ring-2 ring-primary/20 cursor-move" 
                      : "border-border"
                  }`}
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                >
                  <img
                    src={settings.coverUrl}
                    alt="Cover"
                    className="w-full h-40 object-cover select-none"
                    style={{ objectPosition: settings.coverPosition }}
                    draggable={false}
                  />
                  {isRepositioning && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none">
                      <div className="bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
                        <Move className="h-4 w-4" />
                        Drag to reposition
                      </div>
                    </div>
                  )}
                </div>
                
                {isRepositioning ? (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={handleSavePosition}
                      className="flex-1"
                    >
                      Save Position
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsRepositioning(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-background/60 opacity-0 hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={isUploadingCover}
                    >
                      {isUploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : "Replace"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveCover}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={isUploadingCover}
                className="w-full h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                {isUploadingCover ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload cover image</span>
                    <span className="text-xs text-muted-foreground">Recommended: 1200x400px, max 5MB</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            Page Content
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="headline">Custom Headline</Label>
            <Input
              id="headline"
              placeholder="e.g., Book a meeting with me"
              value={settings.headline || ""}
              onChange={(e) => setSettings(prev => ({ ...prev, headline: e.target.value }))}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Shown above your event types. Leave empty to use default.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Short Bio</Label>
            <Textarea
              id="bio"
              placeholder="e.g., I invest in early-stage B2B SaaS startups..."
              value={settings.bio || ""}
              onChange={(e) => setSettings(prev => ({ ...prev, bio: e.target.value }))}
              maxLength={300}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              A brief description shown on your booking page. Max 300 characters.
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            <Globe className="h-4 w-4" />
            Social Links
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10">
                <Linkedin className="h-4 w-4 text-blue-500" />
              </div>
              <Input
                placeholder="https://linkedin.com/in/yourprofile"
                value={settings.socialLinkedin || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, socialLinkedin: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-foreground/10">
                <Twitter className="h-4 w-4" />
              </div>
              <Input
                placeholder="https://twitter.com/yourhandle"
                value={settings.socialTwitter || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, socialTwitter: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <Input
                placeholder="https://yourwebsite.com"
                value={settings.socialWebsite || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, socialWebsite: e.target.value }))}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Add your social profiles to display on your booking page.
          </p>
        </div>

        {/* QR Code Section */}
        {settings.profileSlug && (
          <QRCodeShareCard 
            profileSlug={settings.profileSlug}
            fullName={settings.fullName}
            inviteCode={inviteCode || undefined}
          />
        )}

        {/* Save Button */}
        <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2" size="lg">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>
    </Card>
  );
};

export default BookingPageCustomization;
