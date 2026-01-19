import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format, addDays, startOfDay } from "date-fns";
import { Calendar, Clock, User, Building2, Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EventType {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  color: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface InvestorProfile {
  id: string;
  full_name: string;
  organization_name: string | null;
  profile_slug: string | null;
}

const PublicBookingPage = () => {
  const { investorId, eventTypeId } = useParams();
  const [step, setStep] = useState<"select-event" | "select-date" | "select-time" | "form" | "confirmed">("select-event");
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", company: "", notes: "" });

  // Generate next 14 days
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i + 1));

  useEffect(() => {
    const fetchData = async () => {
      if (!investorId) return;
      
      // First try to find by UUID, then by slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(investorId);
      
      let profile: InvestorProfile | null = null;
      
      if (isUUID) {
        const { data } = await supabase
          .from("investor_profiles")
          .select("id, full_name, organization_name, profile_slug")
          .eq("id", investorId)
          .single();
        profile = data as InvestorProfile | null;
      } else {
        // Try to find by slug
        const { data } = await supabase
          .from("investor_profiles")
          .select("id, full_name, organization_name, profile_slug")
          .eq("profile_slug", investorId)
          .single();
        profile = data as InvestorProfile | null;
      }
      
      if (!profile) {
        setIsLoading(false);
        return;
      }
      
      setInvestorProfile(profile);

      // Fetch event types using the actual investor ID
      const { data: events } = await supabase
        .from("booking_event_types")
        .select("id, name, description, duration_minutes, color")
        .eq("investor_id", profile.id)
        .eq("is_active", true);
      setEventTypes(events || []);

      // If eventTypeId is provided, pre-select it
      if (eventTypeId && events) {
        const event = events.find(e => e.id === eventTypeId);
        if (event) {
          setSelectedEvent(event);
          setStep("select-date");
        }
      }
      
      setIsLoading(false);
    };
    fetchData();
  }, [investorId, eventTypeId]);

  const fetchSlots = async (date: Date) => {
    if (!selectedEvent || !investorProfile) return;
    setIsLoadingSlots(true);
    
    const startDate = startOfDay(date).toISOString();
    const endDate = addDays(startOfDay(date), 1).toISOString();

    const { data, error } = await supabase.functions.invoke("calculate-available-slots", {
      body: { investorId: investorProfile.id, eventTypeId: selectedEvent.id, startDate, endDate },
    });

    if (!error && data?.slots) {
      setAvailableSlots(data.slots);
    }
    setIsLoadingSlots(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    fetchSlots(date);
    setStep("select-time");
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedEvent || !investorProfile) return;

    setIsSubmitting(true);
    const { data, error } = await supabase.functions.invoke("create-booking", {
      body: {
        investorId: investorProfile.id,
        eventTypeId: selectedEvent.id,
        startTime: selectedSlot.start,
        bookerName: formData.name,
        bookerEmail: formData.email,
        bookerCompany: formData.company || null,
        notes: formData.notes || null,
      },
    });

    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      setStep("confirmed");
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!investorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Booking Page Not Found</h2>
          <p className="text-muted-foreground">This booking page doesn't exist or is no longer available.</p>
        </Card>
      </div>
    );
  }

  if (step === "confirmed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-8 text-center max-w-md">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground mb-4">
            Your meeting with {investorProfile.full_name} has been scheduled.
          </p>
          <div className="bg-muted p-4 rounded-lg text-left space-y-2">
            <p><strong>{selectedEvent?.name}</strong></p>
            <p className="text-sm">{format(new Date(selectedSlot!.start), "EEEE, MMMM d, yyyy")}</p>
            <p className="text-sm">{format(new Date(selectedSlot!.start), "h:mm a")} - {format(new Date(selectedSlot!.end), "h:mm a")}</p>
          </div>
          <p className="text-sm text-muted-foreground mt-4">A confirmation email has been sent to {formData.email}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Card className="p-6 mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{investorProfile.full_name}</h1>
            {investorProfile.organization_name && (
              <p className="text-muted-foreground">{investorProfile.organization_name}</p>
            )}
          </div>
        </Card>

        {/* Back Button */}
        {step !== "select-event" && (
          <Button variant="ghost" className="mb-4" onClick={() => {
            if (step === "select-date") setStep("select-event");
            else if (step === "select-time") setStep("select-date");
            else if (step === "form") setStep("select-time");
          }}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        )}

        {/* Select Event Type */}
        {step === "select-event" && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Select a Meeting Type</h2>
            {eventTypes.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No available meeting types</p>
              </Card>
            ) : (
              eventTypes.map((event) => (
                <Card
                  key={event.id}
                  className="p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => { setSelectedEvent(event); setStep("select-date"); }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-12 rounded-full" style={{ backgroundColor: event.color }} />
                    <div>
                      <h3 className="font-medium">{event.name}</h3>
                      <p className="text-sm text-muted-foreground">{event.duration_minutes} minutes</p>
                      {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Select Date */}
        {step === "select-date" && selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge style={{ backgroundColor: selectedEvent.color }}>{selectedEvent.name}</Badge>
              <span className="text-sm text-muted-foreground">{selectedEvent.duration_minutes} min</span>
            </div>
            <h2 className="text-lg font-medium">Select a Date</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableDates.map((date) => (
                <Card
                  key={date.toISOString()}
                  className="p-4 cursor-pointer hover:border-primary transition-colors text-center"
                  onClick={() => handleDateSelect(date)}
                >
                  <p className="font-medium">{format(date, "EEE")}</p>
                  <p className="text-2xl font-bold">{format(date, "d")}</p>
                  <p className="text-sm text-muted-foreground">{format(date, "MMM")}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Select Time */}
        {step === "select-time" && selectedDate && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">{format(selectedDate, "EEEE, MMMM d")}</h2>
            {isLoadingSlots ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : availableSlots.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No available times on this date</p>
              </Card>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <Button key={slot.start} variant="outline" onClick={() => handleSlotSelect(slot)}>
                    {format(new Date(slot.start), "h:mm a")}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Booking Form */}
        {step === "form" && selectedSlot && (
          <Card className="p-6">
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="font-medium">{selectedEvent?.name}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(selectedSlot.start), "EEEE, MMMM d")} at {format(new Date(selectedSlot.start), "h:mm a")}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Your Name *</Label><Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div><Label>Email *</Label><Input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
              <div><Label>Company</Label><Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Anything you'd like to discuss?" /></div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirm Booking
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PublicBookingPage;
