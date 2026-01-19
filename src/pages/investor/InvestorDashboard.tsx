import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import InvestorSidebar from "@/components/investor/InvestorSidebar";
import AddContactModal from "@/components/investor/AddContactModal";
import ContactProfileModal from "@/components/investor/ContactProfileModal";
import BulkImportModal from "@/components/investor/BulkImportModal";
import { useInvestorContacts } from "@/hooks/useInvestorContacts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Views
import NetworkMapView from "@/components/investor/views/NetworkMapView";
import CRMView from "@/components/investor/views/CRMView";
import ContactDirectoryView from "@/components/investor/views/ContactDirectoryView";
import DealflowView from "@/components/investor/views/DealflowView";
import UploadDeckView from "@/components/investor/views/UploadDeckView";
import SettingsView from "@/components/investor/views/SettingsView";
import PlaceholderView from "@/components/investor/views/PlaceholderView";
import FundDirectoryView from "@/components/investor/views/FundDirectoryView";
import BusinessCRMView from "@/components/investor/views/BusinessCRMView";
import CalendarView from "@/components/investor/calendar/CalendarView";
import { BarChart3, CalendarDays, Target } from "lucide-react";

export interface InvestorContact {
  id: string;
  global_contact_id: string | null;
  local_name: string | null;
  local_organization: string | null;
  local_notes: string | null;
  relationship_status: string | null;
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
    linked_investor_id: string | null;
  };
}

const InvestorDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeSection, setActiveSection] = useState("map");
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<InvestorContact | null>(null);
  
  // Add to CRM modal state
  const [addToCRMContact, setAddToCRMContact] = useState<InvestorContact | null>(null);
  const [addToCRMStatus, setAddToCRMStatus] = useState<string>("prospect");
  const [isAddingToCRM, setIsAddingToCRM] = useState(false);

  const { contacts, isLoading, refetch, cityGroups } = useInvestorContacts(userId);

  // Helper to invalidate all network-related queries
  const invalidateNetworkQueries = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["global-investor-profiles"] });
    queryClient.invalidateQueries({ queryKey: ["global-all-contacts"] });
  };
  const fetchProfile = async (uid: string) => {
    const { data: profile } = await (supabase
      .from("investor_profiles") as any)
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
    invalidateNetworkQueries();
    setIsAddContactOpen(false);
    toast({ title: "Contact added successfully!" });
  };

  const handleBulkImportSuccess = () => {
    invalidateNetworkQueries();
    setIsBulkImportOpen(false);
    toast({ title: "Contacts imported successfully!" });
  };

  const handleProfileUpdate = () => {
    if (userId) {
      fetchProfile(userId);
    }
  };

  // Handle adding contact to CRM
  const handleAddToCRM = async () => {
    if (!addToCRMContact) return;
    
    setIsAddingToCRM(true);
    try {
      const { error } = await (supabase
        .from("investor_contacts") as any)
        .update({ relationship_status: addToCRMStatus })
        .eq("id", addToCRMContact.id);

      if (error) throw error;

      toast({ title: "Contact added to CRM pipeline!" });
      setAddToCRMContact(null);
      invalidateNetworkQueries();
    } catch (error: any) {
      console.error("Error adding to CRM:", error);
      toast({
        title: "Error adding to CRM",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAddingToCRM(false);
    }
  };

  // Filter contacts for CRM (only those with relationship_status set)
  const crmContacts = contacts.filter(c => c.relationship_status !== null);

  const renderContent = () => {
    switch (activeSection) {
      case "map":
        return userId ? (
          <NetworkMapView
            contacts={contacts}
            cityGroups={cityGroups}
            isLoading={isLoading}
            onContactClick={setSelectedContact}
            onAddContact={() => setIsAddContactOpen(true)}
            userId={userId}
            onNetworkUpdate={invalidateNetworkQueries}
            userProfile={userProfile}
          />
        ) : null;
      case "directory":
        return userId ? (
          <ContactDirectoryView
            contacts={contacts}
            isLoading={isLoading}
            onContactClick={setSelectedContact}
            onBulkImport={() => setIsBulkImportOpen(true)}
            onAddContact={() => setIsAddContactOpen(true)}
            onAddToCRM={(contact) => {
              setAddToCRMContact(contact);
              setAddToCRMStatus("prospect");
            }}
            onRefresh={refetch}
            userProfile={userProfile}
          />
        ) : null;
      case "crm":
        return userId ? (
          <CRMView
            contacts={crmContacts}
            isLoading={isLoading}
            onContactClick={setSelectedContact}
            onBulkImport={() => setIsBulkImportOpen(true)}
            onAddContact={() => setActiveSection("directory")}
          />
        ) : null;
      case "funds":
        return <FundDirectoryView />;
      case "dealflow":
        return <DealflowView onUploadDeck={() => setActiveSection("upload")} userId={userId} />;
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
      case "businesscrm":
        return <BusinessCRMView userId={userId} />;
      case "portfolio":
        return (
          <PlaceholderView
            title="Portfolio"
            description="Track your investments and portfolio companies. Coming soon!"
            icon={BarChart3}
          />
        );
      case "calendar":
        return <CalendarView userId={userId} />;
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
          onBulkImport={() => {
            setIsAddContactOpen(false);
            setIsBulkImportOpen(true);
          }}
          userId={userId}
        />

        <BulkImportModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
          onSuccess={handleBulkImportSuccess}
          userId={userId}
        />

        {selectedContact && (
          <ContactProfileModal
            contact={selectedContact}
            onClose={() => setSelectedContact(null)}
            onUpdate={refetch}
            userProfile={userProfile}
          />
        )}

        {/* Add to CRM Modal */}
        <Dialog open={!!addToCRMContact} onOpenChange={(open) => !open && setAddToCRMContact(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Add to CRM Pipeline</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Start tracking <span className="font-medium text-foreground">{addToCRMContact?.local_name || addToCRMContact?.global_contact?.name}</span> in your CRM pipeline.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Status</label>
                <Select value={addToCRMStatus} onValueChange={setAddToCRMStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="connected">Connected</SelectItem>
                    <SelectItem value="invested">Invested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddToCRMContact(null)}>
                Cancel
              </Button>
              <Button onClick={handleAddToCRM} disabled={isAddingToCRM}>
                {isAddingToCRM ? "Adding..." : "Add to CRM"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default InvestorDashboard;
