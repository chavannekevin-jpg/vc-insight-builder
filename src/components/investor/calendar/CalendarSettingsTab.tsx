import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import {
  useGoogleCalendarStatus,
  useConnectGoogleCalendar,
  useDisconnectGoogleCalendar,
} from "@/hooks/useCalendarBooking";
import { Loader2, Calendar, CheckCircle2, ExternalLink, Unlink, Copy, Check, Link2, Edit2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CalendarSettingsTabProps {
  userId: string;
}

const CalendarSettingsTab = ({ userId }: CalendarSettingsTabProps) => {
  const { data: calendarStatus, isLoading } = useGoogleCalendarStatus(userId);
  const connectCalendar = useConnectGoogleCalendar();
  const disconnectCalendar = useDisconnectGoogleCalendar();
  
  const [profileSlug, setProfileSlug] = useState<string | null>(null);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [isSavingSlug, setIsSavingSlug] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSlug = async () => {
      const { data, error } = await supabase
        .from("investor_profiles")
        .select("profile_slug")
        .eq("id", userId)
        .single();
      
      if (data?.profile_slug) {
        setProfileSlug(data.profile_slug);
        setNewSlug(data.profile_slug);
      }
    };
    fetchSlug();
  }, [userId]);

  const handleConnect = () => {
    connectCalendar.mutate({
      investorId: userId,
      redirectUrl: window.location.pathname,
    });
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect Google Calendar? Your bookings will still work, but won't sync to your calendar.")) {
      disconnectCalendar.mutate(userId);
    }
  };

  const bookingLink = profileSlug 
    ? `${window.location.origin}/book/${profileSlug}`
    : `${window.location.origin}/book/${userId}`;

  const handleCopyBookingLink = async () => {
    await navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    toast({ title: "Booking link copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSlug = async () => {
    if (!newSlug.trim()) return;
    
    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(newSlug.toLowerCase())) {
      toast({
        title: "Invalid URL",
        description: "Only lowercase letters, numbers, and hyphens are allowed",
        variant: "destructive",
      });
      return;
    }

    setIsSavingSlug(true);
    try {
      const { error } = await supabase
        .from("investor_profiles")
        .update({ profile_slug: newSlug.toLowerCase() })
        .eq("id", userId);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "URL already taken",
            description: "Please choose a different URL",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setProfileSlug(newSlug.toLowerCase());
      setIsEditingSlug(false);
      toast({ title: "Booking URL updated!" });
    } catch (err: any) {
      toast({
        title: "Error updating URL",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSavingSlug(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl space-y-6">
      {/* Professional Booking Link */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Link2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium mb-1">Your Booking Link</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share this clean, professional link with startups to let them book meetings.
            </p>

            {isEditingSlug ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Custom URL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">{window.location.origin}/book/</span>
                    <Input
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="your-name"
                      className="flex-1 max-w-48"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Only lowercase letters, numbers, and hyphens
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveSlug} disabled={isSavingSlug}>
                    {isSavingSlug ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setIsEditingSlug(false);
                    setNewSlug(profileSlug || "");
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-4">
                  <code className="text-sm flex-1 truncate font-medium">
                    {bookingLink}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setIsEditingSlug(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyBookingLink} className="gap-2">
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(bookingLink, "_blank")}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Google Calendar Integration */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-muted">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">Google Calendar</h3>
              {calendarStatus?.connected && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {calendarStatus?.connected
                ? "Your calendar is synced. New bookings will appear on your Google Calendar and your busy times are blocked from booking."
                : "Connect your Google Calendar to sync bookings and block busy times automatically."}
            </p>

            {calendarStatus?.connected ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Connected on {format(new Date(calendarStatus.connectedAt!), "MMMM d, yyyy")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={disconnectCalendar.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  {disconnectCalendar.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Unlink className="h-4 w-4 mr-2" />
                  )}
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={handleConnect} disabled={connectCalendar.isPending}>
                {connectCalendar.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                Connect Google Calendar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-6 bg-muted/50">
        <h3 className="font-medium mb-3">💡 Tips for Better Booking Experience</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Customize your URL to something memorable like <code className="bg-muted px-1 rounded">/book/john-smith</code></li>
          <li>• Create specific event types for different meeting purposes (intro calls, deep dives, etc.)</li>
          <li>• Set buffer times between meetings to avoid back-to-back scheduling</li>
          <li>• Connect Google Calendar to automatically block times when you're busy</li>
        </ul>
      </Card>
    </div>
  );
};

export default CalendarSettingsTab;
