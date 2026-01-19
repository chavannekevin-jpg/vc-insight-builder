import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, User, Building2, Gift } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InviteCodeGenerator from "@/components/investor/InviteCodeGenerator";

const INVESTOR_TYPES = [
  { value: "vc", label: "Venture Capital" },
  { value: "family_office", label: "Family Office" },
  { value: "business_angel", label: "Business Angel" },
  { value: "corporate_vc", label: "Corporate VC" },
  { value: "lp", label: "Limited Partner" },
  { value: "other", label: "Other" },
];

interface SettingsViewProps {
  userId: string;
  userProfile: any;
  onProfileUpdate: () => void;
}

const SettingsView = ({ userId, userProfile, onProfileUpdate }: SettingsViewProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [investorType, setInvestorType] = useState("");
  const [city, setCity] = useState("");
  const [ticketMin, setTicketMin] = useState("");
  const [ticketMax, setTicketMax] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || "");
      setOrganizationName(userProfile.organization_name || "");
      setInvestorType(userProfile.investor_type || "");
      setCity(userProfile.city || "");
      setTicketMin(userProfile.ticket_size_min ? String(userProfile.ticket_size_min / 1000) : "");
      setTicketMax(userProfile.ticket_size_max ? String(userProfile.ticket_size_max / 1000) : "");
    }
  }, [userProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await (supabase
        .from("investor_profiles") as any)
        .update({
          full_name: fullName,
          organization_name: organizationName || null,
          investor_type: investorType as any,
          city,
          ticket_size_min: ticketMin ? parseInt(ticketMin) * 1000 : null,
          ticket_size_max: ticketMax ? parseInt(ticketMax) * 1000 : null,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({ title: "Settings saved successfully!" });
      onProfileUpdate();
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground/80">
            Manage your profile and preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 shadow-sm hover:shadow-md transition-shadow duration-200">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList>
              <TabsTrigger value="personal" className="gap-2">
                <User className="w-4 h-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="fund" className="gap-2">
                <Building2 className="w-4 h-4" />
                Fund Profile
              </TabsTrigger>
              <TabsTrigger value="invite" className="gap-2">
                <Gift className="w-4 h-4" />
                Invite
              </TabsTrigger>
            </TabsList>

            {/* Personal Settings */}
            <TabsContent value="personal" className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="city">Location</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="investorType">Investor Type</Label>
                  <Select value={investorType} onValueChange={setInvestorType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {INVESTOR_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Fund Settings */}
            <TabsContent value="fund" className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="organizationName">Fund / Organization Name</Label>
                  <Input
                    id="organizationName"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Acme Ventures"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ticketMin">Min Ticket (K€)</Label>
                    <Input
                      id="ticketMin"
                      type="number"
                      value={ticketMin}
                      onChange={(e) => setTicketMin(e.target.value)}
                      placeholder="25"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ticketMax">Max Ticket (K€)</Label>
                    <Input
                      id="ticketMax"
                      type="number"
                      value={ticketMax}
                      onChange={(e) => setTicketMax(e.target.value)}
                      placeholder="500"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Fund Description</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell startups what you're looking for..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Invite Tab */}
            <TabsContent value="invite">
              <InviteCodeGenerator userId={userId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
