import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import InvestorSidebar from "@/components/investor/InvestorSidebar";
import AddContactModal from "@/components/investor/AddContactModal";
import ContactProfileModal from "@/components/investor/ContactProfileModal";
import { useInvestorContacts } from "@/hooks/useInvestorContacts";

// Views
import NetworkMapView from "@/components/investor/views/NetworkMapView";
import CRMView from "@/components/investor/views/CRMView";
import DealflowView from "@/components/investor/views/DealflowView";
import UploadDeckView from "@/components/investor/views/UploadDeckView";
import SettingsView from "@/components/investor/views/SettingsView";
import PlaceholderView from "@/components/investor/views/PlaceholderView";
import { BarChart3, CalendarDays, Target } from "lucide-react";

export interface InvestorContact {
  id: string;
  global_contact_id: string | null;
  local_name: string | null;
  local_organization: string | null;
  local_notes: string | null;
  relationship_status: string;
  last_contact_date: string | null;
  global_contact?: {
    id: string;
    name: string;
    organization_name: string | null;
    entity_type: string;
    fund_size: number | null;
    investment_focus: string[];
    stages: string[];
    ticket_size_min: number | null;
    ticket_size_max: number | null;
    city: string | null;
    city_lat: number | null;
    city_lng: number | null;
    country: string | null;
    linkedin_url: string | null;
  };
}

const InvestorDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeSection, setActiveSection] = useState("map");
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<InvestorContact | null>(null);

  const { contacts, isLoading, refetch, cityGroups } = useInvestorContacts(userId);

  const fetchProfile = async (uid: string) => {
    const { data: profile } = await supabase
      .from("investor_profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();
    
    setUserProfile(profile);
    return profile;
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/investor/auth");
        return;
      }
      setUserId(session.user.id);

      const profile = await fetchProfile(session.user.id);

      if (!profile?.onboarding_completed) {
        navigate("/investor/onboarding");
        return;
      }
    };

    checkAuth();
  }, [navigate]);

  const handleContactAdded = () => {
    refetch();
    setIsAddContactOpen(false);
    toast({ title: "Contact added successfully!" });
  };

  const handleProfileUpdate = () => {
    if (userId) {
      fetchProfile(userId);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "map":
        return (
          <NetworkMapView
            contacts={contacts}
            cityGroups={cityGroups}
            isLoading={isLoading}
            onContactClick={setSelectedContact}
            onAddContact={() => setIsAddContactOpen(true)}
          />
        );
      case "crm":
        return (
          <CRMView
            contacts={contacts}
            isLoading={isLoading}
            onContactClick={setSelectedContact}
            onAddContact={() => setIsAddContactOpen(true)}
          />
        );
      case "dealflow":
        return <DealflowView onUploadDeck={() => setActiveSection("upload")} />;
      case "upload":
        return <UploadDeckView />;
      case "settings":
        return userId ? (
          <SettingsView
            userId={userId}
            userProfile={userProfile}
            onProfileUpdate={handleProfileUpdate}
          />
        ) : null;
      case "portfolio":
        return (
          <PlaceholderView
            title="Portfolio"
            description="Track your investments and portfolio companies. Coming soon!"
            icon={BarChart3}
          />
        );
      case "calendar":
        return (
          <PlaceholderView
            title="Calendar"
            description="Schedule meetings and track your investor calendar. Coming soon!"
            icon={CalendarDays}
          />
        );
      case "thesis":
        return (
          <PlaceholderView
            title="Investment Thesis"
            description="Define and share your investment thesis. Coming soon!"
            icon={Target}
          />
        );
      default:
        return null;
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <InvestorSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          userProfile={userProfile}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar with Sidebar Trigger */}
          <header className="h-12 border-b border-border/50 flex items-center px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <SidebarTrigger className="mr-4" />
            <span className="text-sm font-medium text-muted-foreground">
              Investor Dashboard
            </span>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            {renderContent()}
          </main>
        </div>

        {/* Modals */}
        <AddContactModal
          isOpen={isAddContactOpen}
          onClose={() => setIsAddContactOpen(false)}
          onSuccess={handleContactAdded}
          userId={userId}
        />

        {selectedContact && (
          <ContactProfileModal
            contact={selectedContact}
            onClose={() => setSelectedContact(null)}
            onUpdate={refetch}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default InvestorDashboard;
