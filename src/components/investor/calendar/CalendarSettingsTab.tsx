import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import {
  useConnectGoogleCalendar,
} from "@/hooks/useCalendarBooking";
import { Loader2, Calendar, CheckCircle2, ExternalLink, Trash2, Copy, Check, Link2, Edit2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BookingPageCustomization from "./BookingPageCustomization";

interface LinkedCalendar {
  id: string;
  calendar_id: string;
  calendar_name: string;
  calendar_email: string | null;
  is_primary: boolean;
  include_in_availability: boolean;
  color: string;
  connected_at: string;
}

interface CalendarSettingsTabProps {
  userId: string;
}

const CalendarSettingsTab = ({ userId }: CalendarSettingsTabProps) => {
  const connectCalendar = useConnectGoogleCalendar();
  
  const [linkedCalendars, setLinkedCalendars] = useState<LinkedCalendar[]>([]);
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(true);
  const [profileSlug, setProfileSlug] = useState<string | null>(null);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [isSavingSlug, setIsSavingSlug] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchCalendars = async () => {
    setIsLoadingCalendars(true);
    const { data, error } = await (supabase
      .from("linked_calendars") as any)
      .select("*")
      .eq("investor_id", userId)
      .order("is_primary", { ascending: false });
    
    if (!error && data) {
      setLinkedCalendars(data);
    }
    setIsLoadingCalendars(false);
  };

  useEffect(() => {
    fetchCalendars();
  }, [userId]);

  useEffect(() => {
    const fetchSlug = async () => {
      const { data } = await supabase
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

  const handleRemoveCalendar = async (calendarId: string) => {
    if (!confirm("Remove this calendar? It will no longer sync events or block availability.")) return;
    
    const { error } = await (supabase
      .from("linked_calendars") as any)
      .delete()
      .eq("id", calendarId);
    
    if (error) {
      toast({ title: "Failed to remove calendar", variant: "destructive" });
    } else {
      toast({ title: "Calendar removed" });
      fetchCalendars();
    }
  };

  const handleToggleAvailability = async (calendarId: string, currentValue: boolean) => {
    const { error } = await (supabase
      .from("linked_calendars") as any)
      .update({ include_in_availability: !currentValue })
      .eq("id", calendarId);
    
    if (!error) {
      setLinkedCalendars(prev => 
        prev.map(c => c.id === calendarId ? { ...c, include_in_availability: !currentValue } : c)
      );
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
              Share this link with startups to let them book meetings.
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

      {/* Linked Calendars */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium">Linked Calendars</h3>
            <p className="text-sm text-muted-foreground">
              Connect calendars to sync events and manage availability
            </p>
          </div>
          <Button onClick={handleConnect} disabled={connectCalendar.isPending} size="sm" className="gap-2">
            {connectCalendar.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add Calendar
          </Button>
        </div>

        {isLoadingCalendars ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : linkedCalendars.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No calendars connected yet</p>
            <p className="text-sm">Add your Google Calendar to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {linkedCalendars.map((calendar) => (
              <div
                key={calendar.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: calendar.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{calendar.calendar_name}</span>
                      {calendar.is_primary && (
                        <Badge variant="outline" className="text-xs">Primary</Badge>
                      )}
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    {calendar.calendar_email && (
                      <p className="text-xs text-muted-foreground">{calendar.calendar_email}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Connected {format(new Date(calendar.connected_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={calendar.include_in_availability}
                      onCheckedChange={() => handleToggleAvailability(calendar.id, calendar.include_in_availability)}
                    />
                    <Label className="text-xs text-muted-foreground">Block availability</Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveCalendar(calendar.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Booking Page Customization */}
      <BookingPageCustomization userId={userId} />

      {/* Tips */}
      <Card className="p-6 bg-muted/50">
        <h3 className="font-medium mb-3">💡 Tips for Better Booking Experience</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Link multiple calendars to aggregate all your busy times</li>
          <li>• Toggle "Block availability" to include/exclude calendars from booking slots</li>
          <li>• Create specific event types for different meeting purposes</li>
          <li>• Set buffer times between meetings to avoid back-to-back scheduling</li>
          <li>• Customize your booking page with a cover image and bio to make it more personal</li>
        </ul>
      </Card>
    </div>
  );
};

export default CalendarSettingsTab;
