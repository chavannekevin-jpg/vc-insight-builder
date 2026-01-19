import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, addDays, startOfDay, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { 
  Calendar, 
  Clock, 
  Building2, 
  Loader2, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  Users,
  Globe,
  Sparkles,
  Linkedin,
  Twitter,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Video,
  Timer
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
  additional_organizations: { name: string; role: string }[] | null;
  profile_slug: string | null;
  city: string | null;
  investor_type: string | null;
  booking_page_theme: "dark" | "light" | null;
  booking_page_cover_url: string | null;
  booking_page_cover_position: string | null;
  booking_page_headline: string | null;
  booking_page_bio: string | null;
  profile_picture_url: string | null;
  social_linkedin: string | null;
  social_twitter: string | null;
  social_website: string | null;
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
  const [step, setStep] = useState<"select-event" | "calendar" | "form" | "confirmed">("select-event");
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", company: "", notes: "" });

  useEffect(() => {
    const fetchData = async () => {
      if (!investorId) return;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(investorId);
      
      let profile: InvestorProfile | null = null;
      
      if (isUUID) {
        const { data } = await supabase
          .from("investor_profiles")
          .select("id, full_name, organization_name, additional_organizations, profile_slug, city, investor_type, booking_page_theme, booking_page_cover_url, booking_page_cover_position, booking_page_headline, booking_page_bio, profile_picture_url, social_linkedin, social_twitter, social_website")
          .eq("id", investorId)
          .single();
        profile = data as InvestorProfile | null;
      } else {
        const { data } = await supabase
          .from("investor_profiles")
          .select("id, full_name, organization_name, additional_organizations, profile_slug, city, investor_type, booking_page_theme, booking_page_cover_url, booking_page_cover_position, booking_page_headline, booking_page_bio, profile_picture_url, social_linkedin, social_twitter, social_website")
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
          setStep("calendar");
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
    } else {
      setAvailableSlots([]);
    }
    setIsLoadingSlots(false);
  };

  const handleDateSelect = (date: Date) => {
    if (date < startOfDay(new Date())) return;
    setSelectedDate(date);
    setSelectedSlot(null);
    fetchSlots(date);
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

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDayOfWeek = getDay(monthStart);
  const today = startOfDay(new Date());

  // Theme configuration
  const isLightTheme = investorProfile?.booking_page_theme === "light";

  const lightTheme = {
    bg: "bg-gradient-to-br from-slate-50 via-white to-slate-100",
    card: "bg-white border-slate-200 shadow-sm",
    cardHover: "hover:border-violet-300 hover:shadow-md",
    text: "text-slate-900",
    textMuted: "text-slate-600",
    textSubtle: "text-slate-500",
    border: "border-slate-200",
    accent: "bg-violet-600",
    accentLight: "bg-violet-50",
    accentBorder: "border-violet-200",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    input: "bg-white border-slate-300 focus:border-violet-500",
    button: "bg-violet-600 hover:bg-violet-700 text-white",
    buttonOutline: "border-slate-300 hover:bg-slate-50 text-slate-700",
    calendarDay: "hover:bg-violet-50 text-slate-700",
    calendarDaySelected: "bg-violet-600 text-white hover:bg-violet-700",
    calendarDayToday: "ring-2 ring-violet-300",
  };

  const darkTheme = {
    bg: "bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950",
    card: "bg-zinc-900/80 border-zinc-800 backdrop-blur-sm",
    cardHover: "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
    text: "text-white",
    textMuted: "text-zinc-400",
    textSubtle: "text-zinc-500",
    border: "border-zinc-800",
    accent: "bg-primary",
    accentLight: "bg-primary/10",
    accentBorder: "border-primary/30",
    badge: "bg-zinc-800 text-zinc-300 border-zinc-700",
    input: "bg-zinc-900 border-zinc-700 focus:border-primary",
    button: "bg-primary hover:bg-primary/90",
    buttonOutline: "border-zinc-700 hover:bg-zinc-800",
    calendarDay: "hover:bg-zinc-800 text-zinc-300",
    calendarDaySelected: "bg-primary text-primary-foreground hover:bg-primary/90",
    calendarDayToday: "ring-2 ring-primary/50",
  };

  const theme = isLightTheme ? lightTheme : darkTheme;

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className={theme.textMuted}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!investorProfile) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
        <Card className={`p-8 text-center max-w-md ${theme.card}`}>
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h2 className={`text-xl font-semibold mb-2 ${theme.text}`}>Booking Page Not Found</h2>
          <p className={`mb-6 ${theme.textMuted}`}>This booking page doesn't exist or is no longer available.</p>
          <Button onClick={handleJoinNetwork} className="gap-2">
            Join the VC Network
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      </div>
    );
  }

  // Confirmed state
  if (step === "confirmed") {
    return (
      <div className={`min-h-screen p-4 ${theme.bg}`}>
        <div className="max-w-4xl mx-auto pt-12 grid lg:grid-cols-2 gap-8 items-start">
          <Card className={`p-8 text-center border-emerald-500/30 ${isLightTheme ? "bg-emerald-50" : "bg-emerald-500/10"}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isLightTheme ? "bg-emerald-100" : "bg-emerald-500/20"}`}>
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${theme.text}`}>You're Booked!</h2>
            <p className={`mb-6 ${theme.textMuted}`}>
              Your meeting with {investorProfile.full_name} is confirmed.
            </p>
            <div className={`p-4 rounded-xl text-left space-y-3 mb-4 ${isLightTheme ? "bg-white border border-slate-200" : "bg-zinc-800/50"}`}>
              <p className={`font-semibold ${theme.text}`}>{selectedEvent?.name}</p>
              <div className={`flex items-center gap-2 text-sm ${theme.textMuted}`}>
                <Calendar className="h-4 w-4" />
                {format(new Date(selectedSlot!.start), "EEEE, MMMM d, yyyy")}
              </div>
              <div className={`flex items-center gap-2 text-sm ${theme.textMuted}`}>
                <Clock className="h-4 w-4" />
                {format(new Date(selectedSlot!.start), "h:mm a")} - {format(new Date(selectedSlot!.end), "h:mm a")}
              </div>
            </div>
            <p className={`text-sm ${theme.textSubtle}`}>
              Confirmation sent to {formData.email}
            </p>
          </Card>

          <div className="space-y-4">
            <Card className={`p-6 ${theme.card} ${theme.accentBorder}`}>
              <Badge className={`mb-3 ${theme.badge}`}>
                <Users className="h-3 w-3 mr-1" />
                For Investors
              </Badge>
              <h3 className={`text-lg font-bold mb-2 ${theme.text}`}>VC Brain Network</h3>
              <p className={`text-sm mb-4 ${theme.textMuted}`}>
                Private, invite-only platform for VCs. Share dealflow with trusted peers, get AI-powered analysis.
              </p>
              <Button onClick={handleJoinNetwork} variant="outline" size="sm" className={`w-full gap-2 ${theme.buttonOutline}`}>
                Join Network
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>

            <Card className={`p-6 ${theme.card}`}>
              <Badge className={`mb-3 ${theme.badge}`}>
                <Sparkles className="h-3 w-3 mr-1" />
                For Startups
              </Badge>
              <h3 className={`text-lg font-bold mb-2 ${theme.text}`}>Get VC-Ready</h3>
              <p className={`text-sm mb-4 ${theme.textMuted}`}>
                UglyBaby analyzes your startup the way VCs do — full investment memo, scoring, and blind spot detection.
              </p>
              <Button onClick={() => navigate("/")} size="sm" className={`w-full gap-2 ${theme.button}`}>
                Analyze My Startup
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Profile Card Component
  const ProfileCard = () => (
    <Card className={`p-6 ${theme.card}`}>
      <div className="flex flex-col items-center text-center">
        {investorProfile.profile_picture_url ? (
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-4 ring-primary/20 ring-offset-2 ring-offset-background shadow-xl">
            <img
              src={investorProfile.profile_picture_url}
              alt={investorProfile.full_name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ring-4 ring-primary/20 ring-offset-2 ring-offset-background shadow-xl ${isLightTheme ? "bg-violet-100" : "bg-primary/10"}`}>
            <span className={`text-2xl font-bold ${isLightTheme ? "text-violet-600" : "text-primary"}`}>
              {investorProfile.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <h1 className={`text-lg font-bold mb-1 ${theme.text}`}>{investorProfile.full_name}</h1>
        
        {investorProfile.organization_name && (
          <div className={`flex items-center gap-1.5 text-sm mb-2 ${theme.textMuted}`}>
            <Building2 className="h-3.5 w-3.5" />
            {investorProfile.organization_name}
          </div>
        )}

        {/* Additional Organizations */}
        {investorProfile.additional_organizations && investorProfile.additional_organizations.length > 0 && (
          <div className="space-y-1 mb-3">
            {investorProfile.additional_organizations.map((org, idx) => (
              <div key={idx} className={`text-xs ${theme.textSubtle}`}>
                {org.role} @ {org.name}
              </div>
            ))}
          </div>
        )}

        {investorProfile.booking_page_bio && (
          <p className={`text-sm mb-4 leading-relaxed ${theme.textMuted}`}>
            {investorProfile.booking_page_bio}
          </p>
        )}

        <div className="flex flex-wrap gap-2 justify-center">
          {investorProfile.investor_type && (
            <Badge className={theme.badge}>
              {INVESTOR_TYPE_LABELS[investorProfile.investor_type] || investorProfile.investor_type}
            </Badge>
          )}
          {investorProfile.city && (
            <Badge variant="outline" className={`${theme.badge} gap-1`}>
              <MapPin className="h-3 w-3" />
              {investorProfile.city}
            </Badge>
          )}
        </div>

        {(investorProfile.social_linkedin || investorProfile.social_twitter || investorProfile.social_website) && (
          <div className={`flex items-center gap-2 mt-4 pt-4 border-t ${theme.border} justify-center`}>
            {investorProfile.social_linkedin && (
              <a
                href={investorProfile.social_linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-all ${isLightTheme ? "bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600" : "bg-zinc-800 hover:bg-blue-500/20 text-zinc-400 hover:text-blue-400"}`}
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {investorProfile.social_twitter && (
              <a
                href={investorProfile.social_twitter}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-all ${isLightTheme ? "bg-slate-100 hover:bg-slate-200 text-slate-600" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"}`}
              >
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {investorProfile.social_website && (
              <a
                href={investorProfile.social_website}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-all ${isLightTheme ? "bg-slate-100 hover:bg-violet-50 text-slate-600 hover:text-violet-600" : "bg-zinc-800 hover:bg-primary/20 text-zinc-400 hover:text-primary"}`}
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      {/* Cover Image */}
      {investorProfile.booking_page_cover_url && (
        <div className="w-full h-48 md:h-64 relative overflow-hidden">
          <img
            src={investorProfile.booking_page_cover_url}
            alt="Cover"
            className="w-full h-full object-cover"
            style={{ objectPosition: investorProfile.booking_page_cover_position || "50% 50%" }}
          />
          <div className={`absolute inset-0 ${isLightTheme ? "bg-gradient-to-b from-transparent via-transparent to-white/90" : "bg-gradient-to-b from-transparent via-zinc-950/20 to-zinc-950"}`} />
        </div>
      )}

      <div className={`max-w-6xl mx-auto p-4 lg:p-8 ${investorProfile.booking_page_cover_url ? "-mt-16 relative z-10" : "pt-8"}`}>
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Left Sidebar */}
          <div className="space-y-4">
            <ProfileCard />

            {/* CTAs */}
            <Card className={`p-4 ${theme.card} ${theme.accentBorder}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isLightTheme ? "bg-violet-100" : "bg-primary/20"}`}>
                  <Users className={`h-4 w-4 ${isLightTheme ? "text-violet-600" : "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${theme.text}`}>Are you an investor?</p>
                  <p className={`text-xs truncate ${theme.textSubtle}`}>Join the VC Brain Network</p>
                </div>
                <Button size="sm" variant="ghost" onClick={handleJoinNetwork}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            <Card className={`p-4 ${theme.card}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isLightTheme ? "bg-pink-100" : "bg-pink-500/20"}`}>
                  <Sparkles className={`h-4 w-4 ${isLightTheme ? "text-pink-600" : "text-pink-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${theme.text}`}>Are you a startup?</p>
                  <p className={`text-xs truncate ${theme.textSubtle}`}>Get VC-ready with AI analysis</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => navigate("/")}>
                  <ChevronRight className="h-4 w-4" />
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
                className={`mb-4 ${theme.textMuted}`}
                onClick={() => {
                  if (step === "calendar") { setStep("select-event"); setSelectedDate(null); setAvailableSlots([]); }
                  else if (step === "form") setStep("calendar");
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            )}

            {/* Select Event Type - Modern Cards */}
            {step === "select-event" && (
              <div className="space-y-5">
                <div>
                  <h2 className={`text-2xl font-bold mb-2 ${theme.text}`}>
                    {investorProfile.booking_page_headline || "Book a Meeting"}
                  </h2>
                  <p className={theme.textMuted}>Select a meeting type to get started</p>
                </div>
                
                {eventTypes.length === 0 ? (
                  <Card className={`p-12 text-center border-dashed ${theme.card}`}>
                    <Calendar className={`h-12 w-12 mx-auto mb-4 ${theme.textMuted}`} />
                    <p className={theme.textMuted}>No meeting types available yet</p>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {eventTypes.map((event) => (
                      <Card
                        key={event.id}
                        className={`relative overflow-hidden cursor-pointer transition-all group ${theme.card} ${theme.cardHover}`}
                        onClick={() => { setSelectedEvent(event); setStep("calendar"); }}
                      >
                        {/* Color accent bar */}
                        <div 
                          className="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5"
                          style={{ backgroundColor: event.color }}
                        />
                        
                        <div className="p-5 pt-6">
                          <div className="flex items-start justify-between mb-3">
                            <div 
                              className="p-2.5 rounded-xl"
                              style={{ backgroundColor: `${event.color}20` }}
                            >
                              <Video className="h-5 w-5" style={{ color: event.color }} />
                            </div>
                            <ChevronRight className={`h-5 w-5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 ${theme.textMuted}`} />
                          </div>
                          
                          <h3 className={`font-semibold text-lg mb-2 group-hover:text-primary transition-colors ${theme.text}`}>
                            {event.name}
                          </h3>
                          
                          <div className={`flex items-center gap-2 text-sm ${theme.textMuted}`}>
                            <Timer className="h-4 w-4" />
                            <span>{event.duration_minutes} min</span>
                          </div>
                          
                          {event.description && (
                            <p className={`text-sm mt-3 line-clamp-2 ${theme.textSubtle}`}>
                              {event.description}
                            </p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Calendar View - Calendly Style */}
            {step === "calendar" && selectedEvent && (
              <Card className={`overflow-hidden ${theme.card}`}>
                {/* Event header */}
                <div className={`p-4 border-b ${theme.border}`}>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-1 h-10 rounded-full"
                      style={{ backgroundColor: selectedEvent.color }}
                    />
                    <div>
                      <h3 className={`font-semibold ${theme.text}`}>{selectedEvent.name}</h3>
                      <div className={`flex items-center gap-2 text-sm ${theme.textMuted}`}>
                        <Clock className="h-3.5 w-3.5" />
                        {selectedEvent.duration_minutes} min
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row">
                  {/* Calendar - squeezes when date selected */}
                  <div className={`p-4 transition-all duration-300 ${selectedDate ? "md:w-1/2 md:border-r" : "w-full"} ${theme.border}`}>
                    {/* Month navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className={`p-2 rounded-lg transition-colors ${theme.calendarDay}`}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <h4 className={`font-semibold ${theme.text}`}>
                        {format(currentMonth, "MMMM yyyy")}
                      </h4>
                      <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className={`p-2 rounded-lg transition-colors ${theme.calendarDay}`}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day} className={`text-center text-xs font-medium py-2 ${theme.textSubtle}`}>
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Empty cells for days before month start */}
                      {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                      ))}
                      
                      {calendarDays.map(day => {
                        const isPast = day < today;
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, today);
                        
                        return (
                          <button
                            key={day.toISOString()}
                            onClick={() => !isPast && handleDateSelect(day)}
                            disabled={isPast}
                            className={`
                              aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all
                              ${isPast ? `opacity-30 cursor-not-allowed ${theme.textSubtle}` : ""}
                              ${isSelected ? theme.calendarDaySelected : !isPast ? theme.calendarDay : ""}
                              ${isToday && !isSelected ? theme.calendarDayToday : ""}
                            `}
                          >
                            {format(day, "d")}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time slots - appears when date selected */}
                  {selectedDate && (
                    <div className="md:w-1/2 p-4 animate-in slide-in-from-right-5 duration-300">
                      <h4 className={`font-semibold mb-3 ${theme.text}`}>
                        {format(selectedDate, "EEEE, MMMM d")}
                      </h4>
                      
                      {isLoadingSlots ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className={`text-center py-8 ${theme.textMuted}`}>
                          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No available times</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[280px] pr-3">
                          <div className="space-y-2">
                            {availableSlots.map((slot) => (
                              <Button
                                key={slot.start}
                                variant="outline"
                                className={`w-full justify-center font-medium ${theme.buttonOutline} ${isLightTheme ? "hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700" : "hover:border-primary/50 hover:bg-primary/10 hover:text-primary"}`}
                                onClick={() => handleSlotSelect(slot)}
                              >
                                {format(new Date(slot.start), "h:mm a")}
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Booking Form */}
            {step === "form" && selectedSlot && (
              <Card className={`p-6 ${theme.card}`}>
                <div className={`mb-6 p-4 rounded-xl ${isLightTheme ? "bg-violet-50 border border-violet-100" : "bg-primary/5 border border-primary/10"}`}>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-1.5 h-14 rounded-full" 
                      style={{ backgroundColor: selectedEvent?.color }} 
                    />
                    <div>
                      <p className={`font-semibold ${theme.text}`}>{selectedEvent?.name}</p>
                      <div className={`flex items-center gap-3 text-sm mt-1 ${theme.textMuted}`}>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(selectedSlot.start), "EEE, MMM d")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(selectedSlot.start), "h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className={`text-sm font-medium ${theme.text}`}>Your Name *</Label>
                      <Input 
                        required 
                        value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={theme.input}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className={`text-sm font-medium ${theme.text}`}>Email *</Label>
                      <Input 
                        type="email" 
                        required 
                        value={formData.email} 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={theme.input}
                        placeholder="john@startup.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className={`text-sm font-medium ${theme.text}`}>Company / Startup</Label>
                    <Input 
                      value={formData.company} 
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className={theme.input}
                      placeholder="Acme Inc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className={`text-sm font-medium ${theme.text}`}>What would you like to discuss?</Label>
                    <Textarea 
                      value={formData.notes} 
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className={theme.input}
                      placeholder="Tell us a bit about your startup and what you'd like to cover..."
                      rows={3}
                    />
                  </div>
                  
                  <Button type="submit" className={`w-full ${theme.button}`} size="lg" disabled={isSubmitting}>
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
