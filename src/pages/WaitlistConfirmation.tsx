import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Mail, Calendar, Tag, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";

export default function WaitlistConfirmation() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");
  const [signupDate, setSignupDate] = useState<string>("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error loading profile:", profileError);
      }

      const { data: signup, error: signupError } = await supabase
        .from("waitlist_signups")
        .select("signed_up_at")
        .eq("user_id", user.id)
        .order("signed_up_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (signupError) {
        console.error("Error loading signup:", signupError);
      }

      if (profile) setUserEmail(profile.email);
      if (signup) {
        const date = new Date(signup.signed_up_at);
        setSignupDate(date.toLocaleDateString("en-US", { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }));
      }
    };

    fetchUserInfo();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-2">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold">🎉 Early Bird Confirmed!</h1>
            <p className="text-muted-foreground text-lg">
              Your reservation is secured. You can now complete the questionnaire.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Confirmation Details</CardTitle>
              <CardDescription>
                Your memo will be generated when we officially launch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{userEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Reserved On</p>
                    <p className="font-medium">{signupDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Tag className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Price Locked In</p>
                    <p className="font-medium">€29.99 (50% off €59.99)</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">What You Can Do Now</h3>
                <ul className="text-sm space-y-1.5">
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                    <span><strong>Access the Full Platform</strong> - Explore all educational content, guides, and tools for free</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                    <span><strong>Complete the Questionnaire</strong> - Fill in your startup details (your answers are saved automatically)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                    <span><strong>Wait for Launch</strong> - We'll notify you when memo generation is enabled (you're already paid!)</span>
                  </li>
                </ul>
              </div>

              <div className="text-xs text-muted-foreground pt-2">
                <p>
                  <strong>Need a refund?</strong> Contact us anytime before launch for a full refund. 
                  Your payment will be processed immediately, but you can request a refund until the official launch date.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate("/portal")}
              variant="default"
              className="flex-1"
            >
              Start Questionnaire
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => navigate("/hub")}
              variant="outline"
              className="flex-1"
            >
              Explore Platform
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
