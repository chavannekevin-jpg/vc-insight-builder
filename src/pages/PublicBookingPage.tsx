import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format, addDays, startOfDay } from "date-fns";
import { 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Mail, 
  Loader2, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  Users,
  Globe,
  Sparkles,
  Network,
  Zap
} from "lucide-react";
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
  city: string | null;
  investor_type: string | null;
}

const INVESTOR_TYPE_LABELS: Record<string, string> = {
  vc: "Venture Capital",
  family_office: "Family Office",
  business_angel: "Business Angel",
  corporate_vc: "Corporate VC",
  lp: "Limited Partner",
  other: "Investor",
};

const PublicBookingPage = () => {
  const { investorId, eventTypeId } = useParams();
  const navigate = useNavigate();
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
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(investorId);
      
      let profile: InvestorProfile | null = null;
      
      if (isUUID) {
        const { data } = await supabase
          .from("investor_profiles")
          .select("id, full_name, organization_name, profile_slug, city, investor_type")
          .eq("id", investorId)
          .single();
        profile = data as InvestorProfile | null;
      } else {
        const { data } = await supabase
          .from("investor_profiles")
          .select("id, full_name, organization_name, profile_slug, city, investor_type")
          .eq("profile_slug", investorId)
          .single();
        profile = data as InvestorProfile | null;
      }
      
      if (!profile) {
        setIsLoading(false);
        return;
      }
      
      setInvestorProfile(profile);

      const { data: events } = await supabase
        .from("booking_event_types")
        .select("id, name, description, duration_minutes, color")
        .eq("investor_id", profile.id)
        .eq("is_active", true);
      setEventTypes(events || []);

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

  const handleJoinNetwork = () => {
    navigate("/investor/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!investorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="p-8 text-center max-w-md border-primary/20">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Booking Page Not Found</h2>
          <p className="text-muted-foreground mb-6">This booking page doesn't exist or is no longer available.</p>
          <Button onClick={handleJoinNetwork} className="gap-2">
            Join the VC Network
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      </div>
    );
  }

  // Confirmed state - with network CTA
  if (step === "confirmed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="max-w-4xl mx-auto pt-12 grid lg:grid-cols-2 gap-8 items-center">
          {/* Success Card */}
          <Card className="p-8 text-center border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You're Booked!</h2>
            <p className="text-muted-foreground mb-6">
              Your meeting with {investorProfile.full_name} is confirmed.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg text-left space-y-2 mb-4">
              <p className="font-semibold">{selectedEvent?.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(new Date(selectedSlot!.start), "EEEE, MMMM d, yyyy")}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {format(new Date(selectedSlot!.start), "h:mm a")} - {format(new Date(selectedSlot!.end), "h:mm a")}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Confirmation sent to {formData.email}
            </p>
          </Card>

          {/* UglyBaby Intro Card */}
          <Card className="p-8 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                What is UglyBaby?
              </Badge>
              
              <h3 className="text-2xl font-bold mb-3">
                Get your startup VC-ready
              </h3>
              
              <p className="text-muted-foreground mb-6">
                UglyBaby helps founders understand how VCs actually think. Get a full analysis of your startup, identify blind spots, and build a pitch that resonates with investors.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <span>Full VC-style investment memo analysis</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Network className="h-4 w-4 text-primary" />
                  </div>
                  <span>Spot weaknesses before VCs do</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <span>Built by someone who's seen 1000+ pitches</span>
                </div>
              </div>

              <Button onClick={() => navigate("/")} size="lg" className="w-full gap-2">
                Explore UglyBaby
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Left Sidebar - Investor Profile & Network CTA */}
          <div className="space-y-6">
            {/* Investor Card */}
            <Card className="p-6 border-primary/10 bg-gradient-to-br from-card to-primary/5">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                  <span className="text-2xl font-bold text-primary">
                    {investorProfile.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <h1 className="text-xl font-bold mb-1">{investorProfile.full_name}</h1>
                
                {investorProfile.organization_name && (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                    <Building2 className="h-3 w-3" />
                    {investorProfile.organization_name}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 justify-center">
                  {investorProfile.investor_type && (
                    <Badge variant="secondary" className="text-xs">
                      {INVESTOR_TYPE_LABELS[investorProfile.investor_type] || investorProfile.investor_type}
                    </Badge>
                  )}
                  {investorProfile.city && (
                    <Badge variant="outline" className="text-xs">
                      📍 {investorProfile.city}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* UglyBaby Intro */}
            <Card className="p-5 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    UglyBaby
                  </span>
                </div>
                
                <h3 className="font-semibold mb-2">
                  Don't have an account yet?
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  UglyBaby helps startups get VC-ready with honest analysis and investment memos that actually help you raise.
                </p>

                <Button 
                  onClick={() => navigate("/")} 
                  variant="outline"
                  className="w-full gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Side - Booking Flow */}
          <div>
            {/* Back Button */}
            {step !== "select-event" && (
              <Button 
                variant="ghost" 
                className="mb-4" 
                onClick={() => {
                  if (step === "select-date") setStep("select-event");
                  else if (step === "select-time") setStep("select-date");
                  else if (step === "form") setStep("select-time");
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            )}

            {/* Select Event Type */}
            {step === "select-event" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Book a Meeting</h2>
                  <p className="text-muted-foreground">Select a meeting type to get started</p>
                </div>
                
                {eventTypes.length === 0 ? (
                  <Card className="p-8 text-center border-dashed">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No meeting types available yet</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {eventTypes.map((event) => (
                      <Card
                        key={event.id}
                        className="p-4 cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                        onClick={() => { setSelectedEvent(event); setStep("select-date"); }}
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-1.5 h-14 rounded-full transition-all group-hover:w-2" 
                            style={{ backgroundColor: event.color }} 
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {event.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {event.duration_minutes} minutes
                            </div>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            )}
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Select Date */}
            {step === "select-date" && selectedEvent && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedEvent.color }} />
                    <span className="font-medium">{selectedEvent.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {selectedEvent.duration_minutes} min
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">Select a Date</h2>
                  <p className="text-muted-foreground">Pick a day that works for you</p>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
                  {availableDates.map((date) => {
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    return (
                      <Card
                        key={date.toISOString()}
                        className={`p-3 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all text-center group ${
                          isWeekend ? "opacity-60" : ""
                        }`}
                        onClick={() => handleDateSelect(date)}
                      >
                        <p className="text-xs text-muted-foreground uppercase">
                          {format(date, "EEE")}
                        </p>
                        <p className="text-xl font-bold group-hover:text-primary transition-colors">
                          {format(date, "d")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(date, "MMM")}
                        </p>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Select Time */}
            {step === "select-time" && selectedDate && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {format(selectedDate, "EEEE, MMMM d")}
                  </h2>
                  <p className="text-muted-foreground">Select an available time slot</p>
                </div>
                
                {isLoadingSlots ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <Card className="p-8 text-center border-dashed">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No available times on this date</p>
                    <Button variant="link" onClick={() => setStep("select-date")}>
                      Choose another date
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {availableSlots.map((slot) => (
                      <Button 
                        key={slot.start} 
                        variant="outline" 
                        className="hover:border-primary/50 hover:bg-primary/5"
                        onClick={() => handleSlotSelect(slot)}
                      >
                        {format(new Date(slot.start), "h:mm a")}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Booking Form */}
            {step === "form" && selectedSlot && (
              <Card className="p-6 border-primary/10">
                <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-1 h-12 rounded-full" 
                      style={{ backgroundColor: selectedEvent?.color }} 
                    />
                    <div>
                      <p className="font-semibold">{selectedEvent?.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(selectedSlot.start), "EEEE, MMMM d")}
                        <span className="mx-1">•</span>
                        <Clock className="h-3 w-3" />
                        {format(new Date(selectedSlot.start), "h:mm a")}
                      </div>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Your Name *</Label>
                      <Input 
                        required 
                        value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Email *</Label>
                      <Input 
                        type="email" 
                        required 
                        value={formData.email} 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1"
                        placeholder="john@startup.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Company / Startup</Label>
                    <Input 
                      value={formData.company} 
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="mt-1"
                      placeholder="Acme Inc."
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm">What would you like to discuss?</Label>
                    <Textarea 
                      value={formData.notes} 
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="mt-1"
                      placeholder="Tell us a bit about your startup and what you'd like to cover..."
                      rows={3}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Confirm Booking
                  </Button>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBookingPage;