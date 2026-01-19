import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Building2, Linkedin, ArrowRight, Users, Briefcase, DollarSign } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  organization_name: string | null;
  city: string | null;
  country: string | null;
  investment_focus: string[] | null;
  linkedin_url: string | null;
  entity_type: string;
  ticket_size_min: number | null;
  ticket_size_max: number | null;
  stages: string[] | null;
}

interface InvestorProfile {
  full_name: string;
  organization_name: string | null;
  profile_slug: string | null;
}

const formatTicketSize = (amount: number | null) => {
  if (!amount) return null;
  if (amount >= 1000000) return `€${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `€${(amount / 1000).toFixed(0)}K`;
  return `€${amount}`;
};

const PublicContactCard = () => {
  const { slug, contactId } = useParams<{ slug: string; contactId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<Contact | null>(null);
  const [sharedBy, setSharedBy] = useState<InvestorProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug || !contactId) return;

      try {
        // Get the investor who shared this
        const { data: investorData, error: investorError } = await supabase
          .from("investor_profiles")
          .select("full_name, organization_name, profile_slug")
          .eq("profile_slug", slug)
          .single();

        if (investorError || !investorData) {
          setError("Contact not found");
          setLoading(false);
          return;
        }

        setSharedBy(investorData as InvestorProfile);

        // Get the contact from global_contacts
        const { data: contactData, error: contactError } = await supabase
          .from("global_contacts")
          .select("id, name, organization_name, city, country, investment_focus, linkedin_url, entity_type, ticket_size_min, ticket_size_max, stages")
          .eq("id", contactId)
          .single();

        if (contactError || !contactData) {
          setError("Contact not found");
          setLoading(false);
          return;
        }

        setContact(contactData as Contact);
      } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, contactId]);

  const handleJoinNetwork = () => {
    navigate("/investor/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !contact || !sharedBy) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Contact Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This shared contact doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/investor")}>
            Join the VC Network
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Users className="h-4 w-4" />
            <span>Shared by {sharedBy.full_name}</span>
            {sharedBy.organization_name && (
              <>
                <span>•</span>
                <span>{sharedBy.organization_name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contact Card */}
      <div className="max-w-lg mx-auto px-4 -mt-4">
        <Card className="p-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-primary">
                {contact.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold truncate">{contact.name}</h1>
                {contact.linkedin_url && (
                  <a
                    href={contact.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
              </div>
              
              {contact.organization_name && (
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Building2 className="h-4 w-4" />
                  <span>{contact.organization_name}</span>
                </div>
              )}
              
              {(contact.city || contact.country) && (
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {[contact.city, contact.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Size */}
          {(contact.ticket_size_min || contact.ticket_size_max) && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <DollarSign className="h-4 w-4" />
                Ticket Range
              </div>
              <p className="text-lg font-semibold">
                {formatTicketSize(contact.ticket_size_min)} – {formatTicketSize(contact.ticket_size_max)}
              </p>
            </div>
          )}

          {/* Investment Stages */}
          {contact.stages && contact.stages.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Briefcase className="h-4 w-4" />
                Investment Stages
              </div>
              <div className="flex flex-wrap gap-2">
                {contact.stages.map((stage, i) => (
                  <Badge key={i} variant="outline">
                    {stage}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Investment Focus */}
          {contact.investment_focus && contact.investment_focus.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Investment Focus</div>
              <div className="flex flex-wrap gap-2">
                {contact.investment_focus.map((focus, i) => (
                  <Badge key={i} variant="secondary">
                    {focus}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Entity Type */}
          <div className="mt-4">
            <Badge variant="outline" className="capitalize">
              {contact.entity_type === "fund" ? "Fund" : "Investor"}
            </Badge>
          </div>
        </Card>

        {/* CTA */}
        <Card className="mt-6 p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">
              Want to connect with more VCs?
            </h3>
            <p className="text-muted-foreground mb-4">
              Join the VC network to access thousands of investor contacts and build your own network.
            </p>
            <Button onClick={handleJoinNetwork} size="lg" className="gap-2">
              Join the VC Network
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PublicContactCard;