import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X, Sun, Moon, ImageIcon, Sparkles, Move, Linkedin, Globe, Twitter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BookingPageCustomizationProps {
  userId: string;
}

interface CustomizationSettings {
  theme: "dark" | "light";
  coverUrl: string | null;
  coverPosition: string;
  headline: string | null;
  bio: string | null;
  socialLinkedin: string | null;
  socialTwitter: string | null;
  socialWebsite: string | null;
}

const BookingPageCustomization = ({ userId }: BookingPageCustomizationProps) => {
  const [settings, setSettings] = useState<CustomizationSettings>({
    theme: "dark",
    coverUrl: null,
    coverPosition: "50% 50%",
    headline: null,
    bio: null,
    socialLinkedin: null,
    socialTwitter: null,
    socialWebsite: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isRepositioning, setIsRepositioning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("investor_profiles")
        .select("booking_page_theme, booking_page_cover_url, booking_page_cover_position, booking_page_headline, booking_page_bio, social_linkedin, social_twitter, social_website")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setSettings({
          theme: (data.booking_page_theme as "dark" | "light") || "dark",
          coverUrl: data.booking_page_cover_url,
          coverPosition: data.booking_page_cover_position || "50% 50%",
          headline: data.booking_page_headline,
          bio: data.booking_page_bio,
          socialLinkedin: data.social_linkedin,
          socialTwitter: data.social_twitter,
          socialWebsite: data.social_website,
        });
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, [userId]);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from("investor_profiles")
      .update({
        booking_page_theme: settings.theme,
        booking_page_headline: settings.headline,
        booking_page_bio: settings.bio,
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

    setIsUploading(true);

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
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
    
    // Invert the delta because we're moving the object-position (not the viewport)
    const newX = Math.max(0, Math.min(100, dragStartRef.current.posX - deltaX));
    const newY = Math.max(0, Math.min(100, dragStartRef.current.posY - deltaY));
    
    setSettings(prev => ({ ...prev, coverPosition: `${newX.toFixed(1)}% ${newY.toFixed(1)}%` }));
  };

  const handleDragEnd = async () => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStartRef.current = null;
    
    // Save position to database
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
        <div className="p-3 rounded-lg bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-medium mb-1">Customize Your Booking Page</h3>
          <p className="text-sm text-muted-foreground">
            Personalize the public booking page that startups and other investors see
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-3">
          <Label>Theme</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, theme: "dark" }))}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                settings.theme === "dark"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="p-2 rounded-md bg-background border border-border">
                <Moon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <div className="font-medium">Dark</div>
                <div className="text-xs text-muted-foreground">Dark background theme</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, theme: "light" }))}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                settings.theme === "light"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="p-2 rounded-md bg-card border border-border">
                <Sun className="h-5 w-5 text-accent" />
              </div>
              <div className="text-left">
                <div className="font-medium">Light</div>
                <div className="text-xs text-muted-foreground">Light background theme</div>
              </div>
            </button>
          </div>
        </div>

        {/* Cover Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Cover Image</Label>
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
                  className={`relative overflow-hidden rounded-lg border ${
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
                  <div className="absolute inset-0 bg-background/60 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Replace"}
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
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full h-40 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                {isUploading ? (
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
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </div>
        </div>

        {/* Custom Headline */}
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

        {/* Bio */}
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

        {/* Social Links */}
        <div className="space-y-4">
          <Label>Social Links</Label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-muted">
                <Linkedin className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                placeholder="https://linkedin.com/in/yourprofile"
                value={settings.socialLinkedin || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, socialLinkedin: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-muted">
                <Twitter className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                placeholder="https://twitter.com/yourhandle"
                value={settings.socialTwitter || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, socialTwitter: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-muted">
                <Globe className="h-4 w-4 text-muted-foreground" />
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

        {/* Save Button */}
        <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>
    </Card>
  );
};

export default BookingPageCustomization;
