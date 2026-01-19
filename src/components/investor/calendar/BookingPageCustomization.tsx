import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X, Sun, Moon, ImageIcon, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BookingPageCustomizationProps {
  userId: string;
}

interface CustomizationSettings {
  theme: "dark" | "light";
  coverUrl: string | null;
  headline: string | null;
  bio: string | null;
}

const BookingPageCustomization = ({ userId }: BookingPageCustomizationProps) => {
  const [settings, setSettings] = useState<CustomizationSettings>({
    theme: "dark",
    coverUrl: null,
    headline: null,
    bio: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("investor_profiles")
        .select("booking_page_theme, booking_page_cover_url, booking_page_headline, booking_page_bio")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setSettings({
          theme: (data.booking_page_theme as "dark" | "light") || "dark",
          coverUrl: data.booking_page_cover_url,
          headline: data.booking_page_headline,
          bio: data.booking_page_bio,
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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please upload an image file", variant: "destructive" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/cover-${Date.now()}.${fileExt}`;

      // Delete old cover if exists
      if (settings.coverUrl) {
        const oldPath = settings.coverUrl.split("/booking-covers/")[1];
        if (oldPath) {
          await supabase.storage.from("booking-covers").remove([oldPath]);
        }
      }

      // Upload new cover
      const { error: uploadError } = await supabase.storage
        .from("booking-covers")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("booking-covers")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Update profile with new cover URL
      const { error: updateError } = await supabase
        .from("investor_profiles")
        .update({ booking_page_cover_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      setSettings(prev => ({ ...prev, coverUrl: publicUrl }));
      toast({ title: "Cover image uploaded!" });
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
        .update({ booking_page_cover_url: null })
        .eq("id", userId);

      setSettings(prev => ({ ...prev, coverUrl: null }));
      toast({ title: "Cover image removed" });
    } catch (error: any) {
      toast({
        title: "Failed to remove cover",
        description: error.message,
        variant: "destructive",
      });
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
          <Label>Cover Image</Label>
          <div className="relative">
            {settings.coverUrl ? (
              <div className="relative group">
                <img
                  src={settings.coverUrl}
                  alt="Cover"
                  className="w-full h-40 object-cover rounded-lg border border-border"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
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
