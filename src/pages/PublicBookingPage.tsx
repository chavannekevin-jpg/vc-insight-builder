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

  // Light Theme - Clean, airy, professional with warm accents
  const lightTheme = {
    bg: "bg-gradient-to-br from-stone-50 via-white to-amber-50/30",
    card: "bg-white/80 backdrop-blur-sm border-stone-200/60 shadow-sm shadow-stone-200/50",
    cardHover: "hover:border-amber-300/60 hover:shadow-lg hover:shadow-amber-100/50",
    text: "text-stone-900",
    textMuted: "text-stone-600",
    textSubtle: "text-stone-400",
    border: "border-stone-200/60",
    accent: "bg-amber-500",
    accentLight: "bg-amber-50",
    accentBorder: "border-amber-200/60",
    badge: "bg-stone-100/80 text-stone-600 border-stone-200/60",
    input: "bg-white border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20",
    button: "bg-stone-900 hover:bg-stone-800 text-white",
    buttonOutline: "border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:border-amber-300 hover:text-amber-700",
    calendarDay: "hover:bg-amber-50 text-stone-700",
    calendarDaySelected: "bg-stone-900 text-white hover:bg-stone-800",
    calendarDayToday: "ring-2 ring-amber-400/50 ring-offset-1 ring-offset-white",
    slotButton: "border-stone-200 bg-white text-stone-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800",
    eventCard: "bg-white border-stone-200/80 hover:border-stone-300",
  };

  // Dark Theme - Bold, neon-accented, cyberpunk-inspired
  const darkTheme = {
    bg: "bg-gradient-to-br from-zinc-950 via-black to-zinc-950",
    card: "bg-zinc-900/60 backdrop-blur-xl border-zinc-800/80 shadow-xl shadow-black/20",
    cardHover: "hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10",
    text: "text-white",
    textMuted: "text-zinc-400",
    textSubtle: "text-zinc-500",
    border: "border-zinc-800/80",
    accent: "bg-primary",
    accentLight: "bg-primary/10",
    accentBorder: "border-primary/30",
    badge: "bg-zinc-800/80 text-zinc-300 border-zinc-700/80",
    input: "bg-zinc-900/80 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary focus:ring-primary/20",
    button: "bg-primary hover:bg-primary/90 text-primary-foreground",
    buttonOutline: "border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:border-primary/50 hover:text-primary",
    calendarDay: "hover:bg-zinc-800/80 text-zinc-300",
    calendarDaySelected: "bg-primary text-primary-foreground hover:bg-primary/90",
    calendarDayToday: "ring-2 ring-primary/50 ring-offset-1 ring-offset-zinc-900",
    slotButton: "border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
    eventCard: "bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700",
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
          <Card className={`p-8 text-center ${isLightTheme ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white" : "border-emerald-500/30 bg-emerald-500/10"}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isLightTheme ? "bg-emerald-100" : "bg-emerald-500/20"}`}>
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className={`text-2xl font-semibold mb-2 ${theme.text}`}>You're Booked!</h2>
            <p className={`mb-6 ${theme.textMuted}`}>
              Your meeting with {investorProfile.full_name} is confirmed.
            </p>
            <div className={`p-4 rounded-xl text-left space-y-3 mb-4 ${isLightTheme ? "bg-white border border-stone-200/80" : "bg-zinc-800/50"}`}>
              <p className={`font-medium ${theme.text}`}>{selectedEvent?.name}</p>
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
            <Card className={`p-6 overflow-hidden relative ${isLightTheme ? "bg-gradient-to-br from-slate-50 via-white to-blue-50/50 border-slate-200/80" : "bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-primary/5 border-primary/20"}`}>
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 ${isLightTheme ? "bg-blue-400" : "bg-primary"}`} />
              <div className="relative">
                <Badge className={`mb-3 ${isLightTheme ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-primary/20 text-primary border-primary/30"}`}>
                  <Users className="h-3 w-3 mr-1" />
                  For Investors
                </Badge>
                <h3 className={`text-xl font-bold mb-3 ${theme.text}`}>VC Brain Network</h3>
                <p className={`text-sm leading-relaxed mb-4 ${theme.textMuted}`}>
                  An exclusive, invite-only community where VCs privately share dealflow with trusted peers. 
                  Get AI-powered startup analysis, coordinate on due diligence, and never miss a warm intro opportunity.
                </p>
                <ul className={`text-xs space-y-1.5 mb-5 ${theme.textSubtle}`}>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${isLightTheme ? "text-blue-500" : "text-primary"}`} />
                    Private dealflow sharing with verified VCs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${isLightTheme ? "text-blue-500" : "text-primary"}`} />
                    AI memo generation for every deck you receive
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${isLightTheme ? "text-blue-500" : "text-primary"}`} />
                    Coordinate investments with co-investors
                  </li>
                </ul>
                <Button onClick={handleJoinNetwork} variant="outline" size="sm" className={`w-full gap-2 ${isLightTheme ? "border-slate-300 bg-white hover:bg-blue-50 text-slate-700 hover:border-blue-400 hover:text-blue-700" : "border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary"}`}>
                  Join the Network
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            <Card className={`p-6 overflow-hidden relative ${isLightTheme ? "bg-gradient-to-br from-stone-50 via-white to-rose-50/50 border-stone-200/80" : "bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-pink-500/5 border-pink-500/20"}`}>
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 ${isLightTheme ? "bg-rose-400" : "bg-pink-500"}`} />
              <div className="relative">
                <Badge className={`mb-3 ${isLightTheme ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-pink-500/20 text-pink-400 border-pink-500/30"}`}>
                  <Sparkles className="h-3 w-3 mr-1" />
                  For Startups
                </Badge>
                <h3 className={`text-xl font-bold mb-3 ${theme.text}`}>Get VC-Ready with UglyBaby</h3>
                <p className={`text-sm leading-relaxed mb-4 ${theme.textMuted}`}>
                  Stop guessing what VCs want. UglyBaby analyzes your startup exactly the way investors do—generating 
                  a full investment memo, risk scoring, and exposing blind spots before you ever pitch.
                </p>
                <ul className={`text-xs space-y-1.5 mb-5 ${theme.textSubtle}`}>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${isLightTheme ? "text-rose-500" : "text-pink-400"}`} />
                    Investor-grade memo in minutes, not weeks
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${isLightTheme ? "text-rose-500" : "text-pink-400"}`} />
                    VC-style scoring across 8 investment dimensions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${isLightTheme ? "text-rose-500" : "text-pink-400"}`} />
                    Blind spot detection before you walk into the room
                  </li>
                </ul>
                <Button onClick={() => navigate("/")} size="sm" className={`w-full gap-2 ${isLightTheme ? "bg-stone-900 hover:bg-stone-800 text-white" : "bg-gradient-to-r from-pink-500 to-primary hover:from-pink-600 hover:to-primary/90 text-white"}`}>
                  Analyze My Startup
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
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
          <div className={`w-20 h-20 rounded-full overflow-hidden mb-4 ring-4 ring-offset-2 shadow-xl ${isLightTheme ? "ring-amber-200/60 ring-offset-white" : "ring-primary/20 ring-offset-zinc-900"}`}>
            <img
              src={investorProfile.profile_picture_url}
              alt={investorProfile.full_name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ring-4 ring-offset-2 shadow-xl ${isLightTheme ? "bg-gradient-to-br from-amber-100 to-stone-100 ring-amber-200/60 ring-offset-white" : "bg-gradient-to-br from-primary/20 to-zinc-800 ring-primary/20 ring-offset-zinc-900"}`}>
            <span className={`text-2xl font-semibold ${isLightTheme ? "text-stone-700" : "text-primary"}`}>
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
                className={`p-2 rounded-lg transition-all ${isLightTheme ? "bg-stone-100 hover:bg-blue-50 text-stone-500 hover:text-blue-600" : "bg-zinc-800 hover:bg-blue-500/20 text-zinc-400 hover:text-blue-400"}`}
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {investorProfile.social_twitter && (
              <a
                href={investorProfile.social_twitter}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-all ${isLightTheme ? "bg-stone-100 hover:bg-stone-200 text-stone-500" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"}`}
              >
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {investorProfile.social_website && (
              <a
                href={investorProfile.social_website}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-all ${isLightTheme ? "bg-stone-100 hover:bg-amber-50 text-stone-500 hover:text-amber-600" : "bg-zinc-800 hover:bg-primary/20 text-zinc-400 hover:text-primary"}`}
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

            {/* CTA - Investors */}
            <Card className={`p-5 overflow-hidden relative ${isLightTheme ? "bg-gradient-to-br from-slate-50 via-white to-blue-50/50 border-slate-200/80" : "bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-primary/5 border-primary/20"}`}>
              <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-15 ${isLightTheme ? "bg-blue-400" : "bg-primary"}`} />
              <div className="relative">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${isLightTheme ? "bg-blue-100" : "bg-primary/20"}`}>
                    <Users className={`h-4 w-4 ${isLightTheme ? "text-blue-600" : "text-primary"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${theme.text}`}>Are you an investor?</p>
                    <p className={`text-xs mt-0.5 ${theme.textMuted}`}>Join VC Brain — the private network for VCs</p>
                  </div>
                </div>
                <p className={`text-xs leading-relaxed mb-3 ${theme.textSubtle}`}>
                  Share dealflow with trusted peers, get AI-powered memo analysis on every deck, and coordinate investments — all in a private, invite-only community.
                </p>
                <Button size="sm" variant="outline" onClick={handleJoinNetwork} className={`w-full gap-1.5 ${isLightTheme ? "border-slate-300 bg-white hover:bg-blue-50 text-slate-700 hover:border-blue-400 hover:text-blue-700" : "border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary"}`}>
                  Join the Network
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>

            {/* CTA - Startups */}
            <Card className={`p-5 overflow-hidden relative ${isLightTheme ? "bg-gradient-to-br from-stone-50 via-white to-rose-50/50 border-stone-200/80" : "bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-pink-500/5 border-pink-500/20"}`}>
              <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-15 ${isLightTheme ? "bg-rose-400" : "bg-pink-500"}`} />
              <div className="relative">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${isLightTheme ? "bg-rose-100" : "bg-pink-500/20"}`}>
                    <Sparkles className={`h-4 w-4 ${isLightTheme ? "text-rose-600" : "text-pink-400"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${theme.text}`}>Are you a startup?</p>
                    <p className={`text-xs mt-0.5 ${theme.textMuted}`}>Get VC-ready before your pitch</p>
                  </div>
                </div>
                <p className={`text-xs leading-relaxed mb-3 ${theme.textSubtle}`}>
                  UglyBaby analyzes your startup exactly like VCs do — investment memo, risk scoring, and blind spot detection. Stop guessing what investors want.
                </p>
                <Button size="sm" onClick={() => navigate("/")} className={`w-full gap-1.5 ${isLightTheme ? "bg-stone-900 hover:bg-stone-800 text-white" : "bg-gradient-to-r from-pink-500 to-primary hover:from-pink-600 hover:to-primary/90 text-white"}`}>
                  Analyze My Startup
                  <ChevronRight className="h-3.5 w-3.5" />
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

            {/* Select Event Type - Premium Minimal Cards */}
            {step === "select-event" && (
              <div className="space-y-6">
                <div>
                  <h2 className={`text-2xl font-semibold tracking-tight mb-1 ${theme.text}`}>
                    {investorProfile.booking_page_headline || "Book a Meeting"}
                  </h2>
                  <p className={`text-sm ${theme.textMuted}`}>Select a meeting type to get started</p>
                </div>
                
                {eventTypes.length === 0 ? (
                  <div className={`py-16 text-center rounded-2xl border-2 border-dashed ${theme.border}`}>
                    <Calendar className={`h-10 w-10 mx-auto mb-3 ${theme.textSubtle}`} />
                    <p className={`text-sm ${theme.textMuted}`}>No meeting types available yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {eventTypes.map((event) => (
                      <button
                        key={event.id}
                        className={`w-full text-left group transition-all duration-200 rounded-xl border p-4 ${theme.eventCard}`}
                        onClick={() => { setSelectedEvent(event); setStep("calendar"); }}
                      >
                        <div className="flex items-center gap-4">
                          {/* Color indicator */}
                          <div 
                            className="w-1 h-12 rounded-full flex-shrink-0 transition-all group-hover:h-14"
                            style={{ backgroundColor: event.color }}
                          />
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-medium ${theme.text} group-hover:${isLightTheme ? "text-amber-800" : "text-primary"} transition-colors`}>
                                {event.name}
                              </h3>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center gap-1.5 text-sm ${theme.textMuted}`}>
                                <Clock className="h-3.5 w-3.5" />
                                {event.duration_minutes} min
                              </span>
                              {event.description && (
                                <>
                                  <span className={theme.textSubtle}>·</span>
                                  <span className={`text-sm truncate ${theme.textSubtle}`}>
                                    {event.description}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className={`flex-shrink-0 p-2 rounded-full transition-all ${isLightTheme ? "bg-stone-100 group-hover:bg-amber-100" : "bg-zinc-800 group-hover:bg-primary/20"}`}>
                            <ArrowRight className={`h-4 w-4 transition-all group-hover:translate-x-0.5 ${isLightTheme ? "text-stone-400 group-hover:text-amber-600" : "text-zinc-500 group-hover:text-primary"}`} />
                          </div>
                        </div>
                      </button>
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
                              <button
                                key={slot.start}
                                className={`w-full py-2.5 px-4 rounded-lg border text-sm font-medium transition-all duration-150 ${theme.slotButton}`}
                                onClick={() => handleSlotSelect(slot)}
                              >
                                {format(new Date(slot.start), "h:mm a")}
                              </button>
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
                <div className={`mb-6 p-4 rounded-xl ${isLightTheme ? "bg-amber-50/50 border border-amber-100/60" : "bg-primary/5 border border-primary/10"}`}>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-1 h-12 rounded-full" 
                      style={{ backgroundColor: selectedEvent?.color }} 
                    />
                    <div>
                      <p className={`font-medium ${theme.text}`}>{selectedEvent?.name}</p>
                      <div className={`flex items-center gap-3 text-sm mt-1 ${theme.textMuted}`}>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(selectedSlot.start), "EEE, MMM d")}
                        </span>
                        <span className={isLightTheme ? "text-stone-300" : "text-zinc-600"}>·</span>
                        <span className="flex items-center gap-1.5">
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
