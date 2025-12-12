import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Copy, Mail, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EmailTemplate {
  subject: string;
  body: string;
  style: string;
}

export default function InvestorEmailGenerator() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hasMemo, setHasMemo] = useState(false);
  const [hasPremium, setHasPremium] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [emails, setEmails] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    checkForMemo();
  }, []);

  const checkForMemo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to use this tool");
        navigate("/auth");
        return;
      }

      // Check if user has a company with a memo AND premium access
      const { data: companies } = await supabase
        .from("companies")
        .select("id, has_premium")
        .eq("founder_id", user.id)
        .limit(1);

      if (!companies || companies.length === 0) {
        setHasMemo(false);
        setLoading(false);
        return;
      }

      const company = companies[0];

      // Check for premium access
      if (!company.has_premium) {
        setHasMemo(false);
        setHasPremium(false);
        setLoading(false);
        return;
      }

      const { data: memos } = await supabase
        .from("memos")
        .select("id, structured_content")
        .eq("company_id", company.id)
        .not("structured_content", "is", null)
        .limit(1);

      if (memos && memos.length > 0) {
        setHasMemo(true);
        setHasPremium(true);
        setCompanyId(company.id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error checking for memo:", error);
      toast.error("Failed to check memo status");
      setLoading(false);
    }
  };

  const generateEmails = async () => {
    if (!companyId) return;

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-investor-emails", {
        body: { companyId }
      });

      if (error) throw error;

      if (data?.emails) {
        setEmails(data.emails);
        toast.success("Email templates crafted successfully!");
      }
    } catch (error: any) {
      console.error("Error generating emails:", error);
      toast.error(error.message || "Failed to generate email templates");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  // Show upgrade CTA if no memo or no premium
  if (!hasMemo || !hasPremium) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <Button
            onClick={() => navigate("/hub")}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>

          <Card className="p-8 text-center">
            <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-display font-bold mb-2">
              {!hasMemo ? "No Memo Found" : "Premium Feature"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {!hasMemo 
                ? "You need to generate an investment memo before using this tool."
                : "The Outreach Lab is available for premium memo holders. Unlock your full memo to access personalized investor email templates."
              }
            </p>
            <Button onClick={() => navigate(!hasMemo ? "/portal" : "/pricing")}>
              {!hasMemo ? "Create Your Memo" : "Upgrade to Premium"}
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Button
          onClick={() => navigate("/hub")}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Hub
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-3">
            Outreach Lab
          </h1>
          <p className="text-lg text-muted-foreground">
            Craft high-converting cold email templates for investor outreach using your memo
          </p>
        </div>

        {emails.length === 0 ? (
          <Card className="p-8 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-display font-bold mb-2">
              Build Your Email Arsenal
            </h2>
            <p className="text-muted-foreground mb-6">
              We'll analyze your investment memo and craft 5 personalized email templates
              optimized for investor outreach.
            </p>
            <Button
              onClick={generateEmails}
              disabled={generating}
              size="lg"
              className="bg-gradient-to-r from-neon-pink to-neon-purple hover:opacity-90"
            >
              {generating ? "Crafting Templates..." : "Craft Email Templates"}
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {emails.length} email templates ready
              </p>
              <Button
                onClick={generateEmails}
                disabled={generating}
                variant="outline"
              >
                Rebuild Templates
              </Button>
            </div>

            {emails.map((email, index) => (
              <Card key={index} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-display font-bold mb-1">
                      Template {index + 1}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      Style: {email.style}
                    </p>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(`Subject: ${email.subject}\n\n${email.body}`)}
                    variant="ghost"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Subject Line
                    </p>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="font-medium">{email.subject}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Email Body
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
                      {email.body}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
