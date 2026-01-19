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

  // Confirmed state - Compact layout with animations
  if (step === "confirmed") {
    return (
      <div className={`min-h-screen p-4 ${theme.bg}`}>
        <div className="max-w-5xl mx-auto pt-8 grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          <Card className={`p-6 text-center animate-fade-in ${isLightTheme ? "border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-white" : "border-emerald-500/20 bg-emerald-500/5"}`}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in ${isLightTheme ? "bg-emerald-100" : "bg-emerald-500/20"}`}>
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <h2 className={`text-xl font-semibold mb-1 ${theme.text}`}>You're Booked!</h2>
            <p className={`text-sm mb-4 ${theme.textMuted}`}>
              Meeting with {investorProfile.full_name} confirmed.
            </p>
            <div className={`p-3 rounded-lg text-left space-y-2 mb-3 ${isLightTheme ? "bg-white border border-stone-200/80" : "bg-zinc-800/50 border border-zinc-700/50"}`}>
              <p className={`font-medium text-sm ${theme.text}`}>{selectedEvent?.name}</p>
              <div className={`flex items-center gap-4 text-xs ${theme.textMuted}`}>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(selectedSlot!.start), "EEE, MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {format(new Date(selectedSlot!.start), "h:mm a")}
                </span>
              </div>
            </div>
            <p className={`text-xs ${theme.textSubtle}`}>
              Confirmation sent to {formData.email}
            </p>
          </Card>

          <div className="space-y-3">
            <Card className={`p-4 overflow-hidden relative transition-all duration-300 hover:shadow-lg animate-fade-in ${isLightTheme ? "bg-white border-stone-200/80 shadow-sm hover:shadow-stone-200/50" : "bg-zinc-900/80 border-zinc-800 hover:shadow-zinc-900/50"}`} style={{ animationDelay: '100ms' }}>
              <div className="relative">
                <div className="flex items-start gap-2.5 mb-2">
                  <div className={`p-1.5 rounded-md flex-shrink-0 ${isLightTheme ? "bg-stone-100" : "bg-zinc-800"}`}>
                    <Users className={`h-3.5 w-3.5 ${isLightTheme ? "text-stone-600" : "text-zinc-400"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${theme.text}`}>Are you an investor?</p>
                    <p className={`text-xs ${theme.textSubtle}`}>Invite-only VC network</p>
                  </div>
                </div>
                <p className={`text-xs leading-relaxed mb-2.5 ${theme.textSubtle}`}>
                  Private dealflow sharing, warm intros, and curated memos with trusted peers.
                </p>
                <Button size="sm" variant="outline" onClick={handleJoinNetwork} className={`w-full gap-1.5 h-8 text-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${isLightTheme ? "border-stone-300 bg-white hover:bg-stone-50 text-stone-700" : "border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300"}`}>
                  Request an Invite
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </Card>

            <Card className={`p-4 overflow-hidden relative transition-all duration-300 hover:shadow-lg animate-fade-in ${isLightTheme ? "bg-white border-stone-200/80 shadow-sm hover:shadow-stone-200/50" : "bg-zinc-900/80 border-zinc-800 hover:shadow-zinc-900/50"}`} style={{ animationDelay: '200ms' }}>
              <div className="relative">
                <div className="flex items-start gap-2.5 mb-2">
                  <div className={`p-1.5 rounded-md flex-shrink-0 ${isLightTheme ? "bg-stone-100" : "bg-zinc-800"}`}>
                    <Sparkles className={`h-3.5 w-3.5 ${isLightTheme ? "text-stone-600" : "text-zinc-400"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${theme.text}`}>Are you a startup?</p>
                    <p className={`text-xs ${theme.textSubtle}`}>Get VC-ready before you pitch</p>
                  </div>
                </div>
                <p className={`text-xs leading-relaxed mb-2.5 ${theme.textSubtle}`}>
                  Investment memo, risk scoring, and blind spot detection — the way VCs evaluate you.
                </p>
                <Button size="sm" onClick={() => navigate("/")} className={`w-full gap-1.5 h-8 text-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${isLightTheme ? "bg-stone-900 hover:bg-stone-800 text-white" : "bg-white hover:bg-zinc-100 text-zinc-900"}`}>
                  Analyze My Startup
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Profile Card Component - Compact
  const ProfileCard = () => (
    <Card className={`p-4 transition-all duration-300 hover:shadow-lg ${theme.card} ${isLightTheme ? "hover:shadow-stone-200/50" : "hover:shadow-zinc-900/50"}`}>
      <div className="flex flex-col items-center text-center">
        {investorProfile.profile_picture_url ? (
          <div className={`w-14 h-14 rounded-full overflow-hidden mb-3 ring-2 ring-offset-2 shadow-lg transition-transform duration-300 hover:scale-105 ${isLightTheme ? "ring-stone-200/60 ring-offset-white" : "ring-zinc-700/60 ring-offset-zinc-900"}`}>
            <img
              src={investorProfile.profile_picture_url}
              alt={investorProfile.full_name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ring-2 ring-offset-2 shadow-lg transition-transform duration-300 hover:scale-105 ${isLightTheme ? "bg-gradient-to-br from-stone-100 to-stone-50 ring-stone-200/60 ring-offset-white" : "bg-gradient-to-br from-zinc-700 to-zinc-800 ring-zinc-700/60 ring-offset-zinc-900"}`}>
            <span className={`text-lg font-semibold ${isLightTheme ? "text-stone-600" : "text-zinc-300"}`}>
              {investorProfile.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <h1 className={`text-base font-semibold mb-0.5 ${theme.text}`}>{investorProfile.full_name}</h1>
        
        {investorProfile.organization_name && (
          <div className={`flex items-center gap-1 text-xs mb-1.5 ${theme.textMuted}`}>
            <Building2 className="h-3 w-3" />
            {investorProfile.organization_name}
          </div>
        )}

        {/* Additional Organizations */}
        {investorProfile.additional_organizations && investorProfile.additional_organizations.length > 0 && (
          <div className="space-y-0.5 mb-2">
            {investorProfile.additional_organizations.slice(0, 2).map((org, idx) => (
              <div key={idx} className={`text-[10px] ${theme.textSubtle}`}>
                {org.role} @ {org.name}
              </div>
            ))}
          </div>
        )}

        {investorProfile.booking_page_bio && (
          <p className={`text-xs mb-3 leading-relaxed line-clamp-3 ${theme.textMuted}`}>
            {investorProfile.booking_page_bio}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 justify-center">
          {investorProfile.investor_type && (
            <Badge className={`text-[10px] px-2 py-0.5 ${theme.badge}`}>
              {INVESTOR_TYPE_LABELS[investorProfile.investor_type] || investorProfile.investor_type}
            </Badge>
          )}
          {investorProfile.city && (
            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${theme.badge} gap-1`}>
              <MapPin className="h-2.5 w-2.5" />
              {investorProfile.city}
            </Badge>
          )}
        </div>

        {(investorProfile.social_linkedin || investorProfile.social_twitter || investorProfile.social_website) && (
          <div className={`flex items-center gap-1.5 mt-3 pt-3 border-t ${theme.border} justify-center`}>
            {investorProfile.social_linkedin && (
              <a
                href={investorProfile.social_linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-1.5 rounded-md transition-all duration-200 hover:scale-110 active:scale-95 ${isLightTheme ? "bg-stone-100 hover:bg-blue-50 text-stone-500 hover:text-blue-600" : "bg-zinc-800 hover:bg-blue-500/20 text-zinc-400 hover:text-blue-400"}`}
              >
                <Linkedin className="h-3.5 w-3.5" />
              </a>
            )}
            {investorProfile.social_twitter && (
              <a
                href={investorProfile.social_twitter}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-1.5 rounded-md transition-all duration-200 hover:scale-110 active:scale-95 ${isLightTheme ? "bg-stone-100 hover:bg-stone-200 text-stone-500" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"}`}
              >
                <Twitter className="h-3.5 w-3.5" />
              </a>
            )}
            {investorProfile.social_website && (
              <a
                href={investorProfile.social_website}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-1.5 rounded-md transition-all duration-200 hover:scale-110 active:scale-95 ${isLightTheme ? "bg-stone-100 hover:bg-stone-200 text-stone-500" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"}`}
              >
                <Globe className="h-3.5 w-3.5" />
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
        <div className="w-full h-32 md:h-40 relative overflow-hidden">
          <img
            src={investorProfile.booking_page_cover_url}
            alt="Cover"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            style={{ objectPosition: investorProfile.booking_page_cover_position || "50% 50%" }}
          />
          <div className={`absolute inset-0 ${isLightTheme ? "bg-gradient-to-b from-transparent via-transparent to-white/90" : "bg-gradient-to-b from-transparent via-zinc-950/20 to-zinc-950"}`} />
        </div>
      )}

      <div className={`max-w-6xl mx-auto p-4 lg:p-6 ${investorProfile.booking_page_cover_url ? "-mt-12 relative z-10" : "pt-6"}`}>
        <div className="grid lg:grid-cols-[280px_1fr] gap-5">
          {/* Left Sidebar - Compact */}
          <div className="space-y-3">
            <ProfileCard />

            {/* CTA - Investors */}
            <Card className={`p-4 overflow-hidden relative transition-all duration-300 hover:shadow-lg ${isLightTheme ? "bg-white border-stone-200/80 shadow-sm hover:shadow-stone-200/50" : "bg-zinc-900/80 border-zinc-800 hover:shadow-zinc-900/50"}`}>
              <div className="relative">
                <div className="flex items-start gap-2.5 mb-2">
                  <div className={`p-1.5 rounded-md flex-shrink-0 ${isLightTheme ? "bg-stone-100" : "bg-zinc-800"}`}>
                    <Users className={`h-3.5 w-3.5 ${isLightTheme ? "text-stone-600" : "text-zinc-400"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${theme.text}`}>Are you an investor?</p>
                    <p className={`text-xs ${theme.textSubtle}`}>Invite-only VC network</p>
                  </div>
                </div>
                <p className={`text-xs leading-relaxed mb-2.5 ${theme.textSubtle}`}>
                  Private dealflow sharing, warm intros, and curated memos with trusted peers.
                </p>
                <Button size="sm" variant="outline" onClick={handleJoinNetwork} className={`w-full gap-1.5 h-8 text-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${isLightTheme ? "border-stone-300 bg-white hover:bg-stone-50 text-stone-700" : "border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300"}`}>
                  Request an Invite
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </Card>

            {/* CTA - Startups */}
            <Card className={`p-4 overflow-hidden relative transition-all duration-300 hover:shadow-lg ${isLightTheme ? "bg-white border-stone-200/80 shadow-sm hover:shadow-stone-200/50" : "bg-zinc-900/80 border-zinc-800 hover:shadow-zinc-900/50"}`}>
              <div className="relative">
                <div className="flex items-start gap-2.5 mb-2">
                  <div className={`p-1.5 rounded-md flex-shrink-0 ${isLightTheme ? "bg-stone-100" : "bg-zinc-800"}`}>
                    <Sparkles className={`h-3.5 w-3.5 ${isLightTheme ? "text-stone-600" : "text-zinc-400"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${theme.text}`}>Are you a startup?</p>
                    <p className={`text-xs ${theme.textSubtle}`}>Get VC-ready before you pitch</p>
                  </div>
                </div>
                <p className={`text-xs leading-relaxed mb-2.5 ${theme.textSubtle}`}>
                  Investment memo, risk scoring, and blind spot detection — the way VCs evaluate you.
                </p>
                <Button size="sm" onClick={() => navigate("/")} className={`w-full gap-1.5 h-8 text-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${isLightTheme ? "bg-stone-900 hover:bg-stone-800 text-white" : "bg-white hover:bg-zinc-100 text-zinc-900"}`}>
                  Analyze My Startup
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Side - Booking Flow */}
          <div className="animate-fade-in">
            {/* Back Button */}
            {step !== "select-event" && (
              <Button 
                variant="ghost" 
                className={`mb-3 transition-all duration-200 hover:translate-x-[-2px] ${theme.textMuted}`}
                onClick={() => {
                  if (step === "calendar") { setStep("select-event"); setSelectedDate(null); setAvailableSlots([]); }
                  else if (step === "form") setStep("calendar");
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            )}

            {/* Select Event Type - Premium Cards */}
            {step === "select-event" && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h2 className={`text-xl font-semibold tracking-tight mb-0.5 ${theme.text}`}>
                    {investorProfile.booking_page_headline || "Book a Meeting"}
                  </h2>
                  <p className={`text-sm ${theme.textMuted}`}>Select a meeting type</p>
                </div>
                
                {eventTypes.length === 0 ? (
                  <div className={`py-12 text-center rounded-xl border-2 border-dashed ${theme.border}`}>
                    <Calendar className={`h-8 w-8 mx-auto mb-2 ${theme.textSubtle}`} />
                    <p className={`text-sm ${theme.textMuted}`}>No meeting types available</p>
                  </div>
                ) : (
                  <div className="grid gap-2.5">
                    {eventTypes.map((event, index) => (
                      <button
                        key={event.id}
                        className={`w-full text-left group transition-all duration-300 rounded-xl border p-3.5 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] ${theme.eventCard} ${isLightTheme ? "hover:shadow-stone-200/60" : "hover:shadow-zinc-900/60"}`}
                        onClick={() => { setSelectedEvent(event); setStep("calendar"); }}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          {/* Icon with color */}
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                            style={{ backgroundColor: `${event.color}15` }}
                          >
                            <Video className="h-4 w-4" style={{ color: event.color }} />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-medium text-sm ${theme.text}`}>
                              {event.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`inline-flex items-center gap-1 text-xs ${theme.textMuted}`}>
                                <Timer className="h-3 w-3" />
                                {event.duration_minutes} min
                              </span>
                              {event.description && (
                                <>
                                  <span className={theme.textSubtle}>·</span>
                                  <span className={`text-xs truncate ${theme.textSubtle}`}>
                                    {event.description}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className={`flex-shrink-0 transition-all duration-300 group-hover:translate-x-1 ${theme.textSubtle}`}>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Calendar View - Compact & Elegant */}
            {step === "calendar" && selectedEvent && (
              <Card className={`overflow-hidden animate-fade-in ${theme.card}`}>
                {/* Event header - Compact */}
                <div className={`px-4 py-3 border-b ${theme.border}`}>
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${selectedEvent.color}15` }}
                    >
                      <Video className="h-3.5 w-3.5" style={{ color: selectedEvent.color }} />
                    </div>
                    <div>
                      <h3 className={`font-medium text-sm ${theme.text}`}>{selectedEvent.name}</h3>
                      <div className={`flex items-center gap-1.5 text-xs ${theme.textMuted}`}>
                        <Timer className="h-3 w-3" />
                        {selectedEvent.duration_minutes} min
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row">
                  {/* Calendar - Compact grid */}
                  <div className={`p-3 transition-all duration-500 ease-out md:w-[55%] ${selectedDate ? "md:border-r" : ""} ${theme.border}`}>
                    {/* Month navigation */}
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className={`p-1.5 rounded-md transition-all duration-200 hover:scale-110 active:scale-95 ${theme.calendarDay}`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <h4 className={`font-medium text-sm ${theme.text}`}>
                        {format(currentMonth, "MMMM yyyy")}
                      </h4>
                      <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className={`p-1.5 rounded-md transition-all duration-200 hover:scale-110 active:scale-95 ${theme.calendarDay}`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Day headers - Compact */}
                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                        <div key={`${day}-${i}`} className={`text-center text-[10px] font-medium py-1 ${theme.textSubtle}`}>
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar grid - Compact cells */}
                    <div className="grid grid-cols-7 gap-0.5">
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
                              aspect-square rounded-md flex items-center justify-center text-xs font-medium 
                              transition-all duration-200 hover:scale-105 active:scale-95
                              ${isPast ? `opacity-30 cursor-not-allowed ${theme.textSubtle}` : ""}
                              ${isSelected ? `${theme.calendarDaySelected} scale-105` : !isPast ? theme.calendarDay : ""}
                              ${isToday && !isSelected ? theme.calendarDayToday : ""}
                            `}
                          >
                            {format(day, "d")}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time slots - Compact */}
                  {selectedDate && (
                    <div className="md:w-[45%] p-3 animate-fade-in">
                      <h4 className={`font-medium text-sm mb-2 ${theme.text}`}>
                        {format(selectedDate, "EEE, MMM d")}
                      </h4>
                      
                      {isLoadingSlots ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className={`text-center py-6 ${theme.textMuted}`}>
                          <Clock className="h-6 w-6 mx-auto mb-1.5 opacity-50" />
                          <p className="text-xs">No available times</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[220px] pr-2">
                          <div className="grid grid-cols-2 gap-1.5">
                            {availableSlots.map((slot, index) => (
                              <button
                                key={slot.start}
                                className={`py-2 px-3 rounded-md border text-xs font-medium transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${theme.slotButton}`}
                                onClick={() => handleSlotSelect(slot)}
                                style={{ animationDelay: `${index * 30}ms` }}
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

            {/* Booking Form - Compact with animations */}
            {step === "form" && selectedSlot && (
              <Card className={`p-5 animate-fade-in ${theme.card}`}>
                <div className={`mb-4 p-3 rounded-lg ${isLightTheme ? "bg-stone-50 border border-stone-100" : "bg-zinc-800/50 border border-zinc-700/50"}`}>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center" 
                      style={{ backgroundColor: `${selectedEvent?.color}15` }}
                    >
                      <Video className="h-3.5 w-3.5" style={{ color: selectedEvent?.color }} />
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${theme.text}`}>{selectedEvent?.name}</p>
                      <div className={`flex items-center gap-2 text-xs mt-0.5 ${theme.textMuted}`}>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(selectedSlot.start), "EEE, MMM d")}
                        </span>
                        <span className={isLightTheme ? "text-stone-300" : "text-zinc-600"}>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(selectedSlot.start), "h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className={`text-xs font-medium ${theme.text}`}>Your Name *</Label>
                      <Input 
                        required 
                        value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`h-9 text-sm transition-all duration-200 focus:scale-[1.01] ${theme.input}`}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={`text-xs font-medium ${theme.text}`}>Email *</Label>
                      <Input 
                        type="email" 
                        required 
                        value={formData.email} 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`h-9 text-sm transition-all duration-200 focus:scale-[1.01] ${theme.input}`}
                        placeholder="john@startup.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className={`text-xs font-medium ${theme.text}`}>Company / Startup</Label>
                    <Input 
                      value={formData.company} 
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className={`h-9 text-sm transition-all duration-200 focus:scale-[1.01] ${theme.input}`}
                      placeholder="Acme Inc."
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className={`text-xs font-medium ${theme.text}`}>What would you like to discuss?</Label>
                    <Textarea 
                      value={formData.notes} 
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className={`text-sm transition-all duration-200 focus:scale-[1.005] ${theme.input}`}
                      placeholder="Brief context about your startup..."
                      rows={2}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className={`w-full h-10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${theme.button}`} 
                    disabled={isSubmitting}
                  >
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
