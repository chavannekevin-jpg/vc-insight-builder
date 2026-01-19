import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Building2, Users, ArrowRight, Linkedin, Sparkles } from "lucide-react";

interface InvestorProfile {
  id: string;
  full_name: string;
  organization_name: string | null;
  city: string;
  investor_type: string;
  profile_slug: string | null;
}

interface Contact {
  id: string;
  name: string;
  organization_name: string | null;
  city: string | null;
  country: string | null;
  investment_focus: string[] | null;
  linkedin_url: string | null;
  entity_type: string;
}

const PublicNetworkPage = () => {
  const { slug, cityName } = useParams<{ slug: string; cityName?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [investor, setInvestor] = useState<InvestorProfile | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get specific contact IDs from query params (for selective sharing)
  const contactIdsParam = searchParams.get("contacts");
  const selectedContactIds = contactIdsParam ? contactIdsParam.split(",") : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      try {
        // First get the investor by slug
        const { data: investorData, error: investorError } = await supabase
          .from("investor_profiles")
          .select("id, full_name, organization_name, city, investor_type, profile_slug")
          .eq("profile_slug", slug)
          .single();

        if (investorError || !investorData) {
          setError("Network not found");
          setLoading(false);
          return;
        }

        setInvestor(investorData as InvestorProfile);

        // If specific contact IDs are provided, fetch those directly from global_contacts
        if (selectedContactIds && selectedContactIds.length > 0) {
          const { data: globalContactsData, error: globalError } = await supabase
            .from("global_contacts")
            .select("id, name, organization_name, city, country, investment_focus, linkedin_url, entity_type")
            .in("id", selectedContactIds);

          if (globalError) {
            console.error("Error fetching contacts:", globalError);
          }

          if (globalContactsData) {
            setContacts(globalContactsData as Contact[]);
          }
        } else {
          // Get all investor's contacts, optionally filtered by city
          const { data: contactsData, error: contactsError } = await supabase
            .from("investor_contacts")
            .select(`
              id,
              global_contact:global_contacts(
                id,
                name,
                organization_name,
                city,
                country,
                investment_focus,
                linkedin_url,
                entity_type
              )
            `)
            .eq("investor_id", investorData.id);

          if (contactsError) {
            console.error("Error fetching contacts:", contactsError);
          }

          // Flatten and filter contacts
          let flatContacts: Contact[] = [];
          if (contactsData) {
            flatContacts = contactsData
              .filter((c: any) => c.global_contact)
              .map((c: any) => ({
                id: c.global_contact.id,
                name: c.global_contact.name,
                organization_name: c.global_contact.organization_name,
                city: c.global_contact.city,
                country: c.global_contact.country,
                investment_focus: c.global_contact.investment_focus,
                linkedin_url: c.global_contact.linkedin_url,
                entity_type: c.global_contact.entity_type,
              }));
          }

          // Filter by city if specified
          if (cityName) {
            const normalizedCity = decodeURIComponent(cityName).toLowerCase();
            flatContacts = flatContacts.filter(
              (c) => c.city?.toLowerCase() === normalizedCity
            );
          }

          setContacts(flatContacts);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, cityName, selectedContactIds?.join(",")]);

  const handleJoinNetwork = () => {
    navigate("/investor/auth");
  };

  const displayCity = cityName ? decodeURIComponent(cityName) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !investor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Network Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This shared network link doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/investor")}>
            Join the VC Network
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {investor.full_name.charAt(0)}
              </span>
            </div>
            <span>Shared by {investor.full_name}</span>
            {investor.organization_name && (
              <>
                <span className="text-border">•</span>
                <span>{investor.organization_name}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {displayCity ? (
              <span className="flex items-center gap-3">
                <MapPin className="h-8 w-8 text-primary" />
                {displayCity.charAt(0).toUpperCase() + displayCity.slice(1)} Investors
              </span>
            ) : (
              "Curated VC Network"
            )}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            {selectedContactIds 
              ? `${contacts.length} hand-picked investor${contacts.length !== 1 ? "s" : ""}`
              : displayCity
                ? `${contacts.length} investor${contacts.length !== 1 ? "s" : ""} in ${displayCity}`
                : `${contacts.length} curated investor contacts`
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleJoinNetwork} size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Join the VC Network
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {contacts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No contacts to display in this view.
            </p>
            <Button variant="outline" onClick={handleJoinNetwork}>
              Join to start building your network
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {contacts.map((contact) => (
              <Card key={contact.id} className="p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-200 group">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                    <span className="text-lg font-semibold text-primary">
                      {contact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{contact.name}</h3>
                      {contact.linkedin_url && (
                        <a
                          href={contact.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    
                    {contact.organization_name && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="truncate">{contact.organization_name}</span>
                      </div>
                    )}
                    
                    {(contact.city || contact.country) && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>
                          {[contact.city, contact.country].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}

                    {contact.investment_focus && contact.investment_focus.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {contact.investment_focus.slice(0, 3).map((focus, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {focus}
                          </Badge>
                        ))}
                        {contact.investment_focus.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{contact.investment_focus.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Footer */}
        <Card className="mt-10 p-8 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20 text-center">
          <div className="max-w-md mx-auto">
            <Users className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">
              Not yet part of the network?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join the VC crowd and get access to thousands of verified investor contacts. Build your own network and share it with founders.
            </p>
            <Button onClick={handleJoinNetwork} size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Join the Network
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PublicNetworkPage;