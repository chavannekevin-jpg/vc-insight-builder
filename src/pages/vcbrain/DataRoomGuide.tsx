import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DataRoomGuide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/how-vcs-work/data-room");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ContentBlock>
      <h1 className="text-4xl font-bold text-foreground mb-4">
        The Data Room: Your Secret Weapon for Closing Faster
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        A well-organized data room signals professionalism, accelerates due diligence, 
        and removes friction from your fundraise.
      </p>

      <Callout type="info">
        <strong>The Truth About Data Rooms:</strong> VCs don't spend hours reading your 
        data room before investing. But they do use it to validate claims, answer specific 
        questions, and confirm you're organized. Delays in providing materials kill deals.
      </Callout>

      {/* Why Data Rooms Matter */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Why Data Rooms Matter</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Speed</h3>
            <p className="text-muted-foreground text-sm">
              When VCs ask for documents, same-day responses signal readiness. Delays create 
              doubt about your operational capabilities.
            </p>
          </Card>
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Trust</h3>
            <p className="text-muted-foreground text-sm">
              Organization and transparency build confidence. A messy data room makes VCs 
              wonder what else is disorganized.
            </p>
          </Card>
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Control</h3>
            <p className="text-muted-foreground text-sm">
              You choose what to share and when. A structured data room lets you manage 
              the narrative rather than react to requests.
            </p>
          </Card>
        </div>
      </section>

      {/* Data Room Structure */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">The Complete Data Room Structure</h2>
        <p className="text-muted-foreground mb-6">
          Organize your data room into clear sections. VCs should find what they need in 
          under 30 seconds.
        </p>

        <div className="space-y-6">
          {/* Company Overview */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">1</div>
              <h3 className="text-lg font-bold text-foreground">Company Overview</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Contents:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Pitch deck (current version)</li>
                  <li>• Executive summary (1-pager)</li>
                  <li>• Company fact sheet</li>
                  <li>• Product demo video or screenshots</li>
                </ul>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">Pro Tip:</p>
                <p className="text-xs text-muted-foreground">
                  Include a "Read Me First" document that guides VCs through the data room 
                  and highlights key documents.
                </p>
              </div>
            </div>
          </Card>

          {/* Financial Information */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">2</div>
              <h3 className="text-lg font-bold text-foreground">Financial Information</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Contents:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Historical financial statements (P&L, Balance Sheet)</li>
                  <li>• Monthly revenue and burn tracking</li>
                  <li>• Financial projections (3-5 year model)</li>
                  <li>• Key assumptions document</li>
                  <li>• Current runway calculation</li>
                  <li>• Bank statements (last 3-6 months)</li>
                </ul>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">Pro Tip:</p>
                <p className="text-xs text-muted-foreground">
                  Include an "Assumptions" tab in your model that explains key drivers. 
                  VCs will stress-test these numbers.
                </p>
              </div>
            </div>
          </Card>

          {/* Cap Table & Corporate */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">3</div>
              <h3 className="text-lg font-bold text-foreground">Cap Table & Corporate</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Contents:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Current cap table (fully diluted)</li>
                  <li>• Previous funding terms (SAFEs, notes, priced rounds)</li>
                  <li>• Certificate of incorporation</li>
                  <li>• Bylaws</li>
                  <li>• Stock option plan</li>
                  <li>• 409A valuation (if applicable)</li>
                </ul>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">Pro Tip:</p>
                <p className="text-xs text-muted-foreground">
                  Use a cap table tool (Carta, Pulley, AngelList) for clean, exportable 
                  tables. Hand-managed spreadsheets create doubt.
                </p>
              </div>
            </div>
          </Card>

          {/* Team */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">4</div>
              <h3 className="text-lg font-bold text-foreground">Team</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Contents:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Founder bios and LinkedIn profiles</li>
                  <li>• Org chart (current and planned)</li>
                  <li>• Key hire plan with priorities</li>
                  <li>• Employment agreements template</li>
                  <li>• IP assignment agreements</li>
                </ul>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">Pro Tip:</p>
                <p className="text-xs text-muted-foreground">
                  Include brief notes on why each founder is uniquely suited for this 
                  problem. VCs invest in founder-market fit.
                </p>
              </div>
            </div>
          </Card>

          {/* Customers & Traction */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">5</div>
              <h3 className="text-lg font-bold text-foreground">Customers & Traction</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Contents:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Customer list with logos and context</li>
                  <li>• Case studies or testimonials</li>
                  <li>• Key metrics dashboard (MRR, churn, NPS)</li>
                  <li>• Pipeline and sales funnel data</li>
                  <li>• Reference list (3-5 customers willing to speak)</li>
                </ul>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">Pro Tip:</p>
                <p className="text-xs text-muted-foreground">
                  Prep your references before sharing their contact info. A surprised 
                  or lukewarm reference can kill a deal.
                </p>
              </div>
            </div>
          </Card>

          {/* Product & Technology */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">6</div>
              <h3 className="text-lg font-bold text-foreground">Product & Technology</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Contents:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Product roadmap (next 6-12 months)</li>
                  <li>• Architecture overview</li>
                  <li>• Security practices documentation</li>
                  <li>• Technology stack summary</li>
                  <li>• Patents or IP documentation</li>
                </ul>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">Pro Tip:</p>
                <p className="text-xs text-muted-foreground">
                  Don't share source code unless explicitly requested. Focus on 
                  architecture and capabilities.
                </p>
              </div>
            </div>
          </Card>

          {/* Legal & Compliance */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">7</div>
              <h3 className="text-lg font-bold text-foreground">Legal & Compliance</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Contents:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Material contracts (top customers, vendors)</li>
                  <li>• Any pending litigation disclosure</li>
                  <li>• Regulatory compliance documents</li>
                  <li>• Insurance policies</li>
                  <li>• Privacy policy and terms of service</li>
                </ul>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">Pro Tip:</p>
                <p className="text-xs text-muted-foreground">
                  Include a "known issues" document that proactively addresses any 
                  legal or compliance concerns.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* How VCs Use Data Rooms */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">How VCs Actually Use Data Rooms</h2>
        
        <div className="space-y-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Before the First Meeting</h3>
            <p className="text-muted-foreground mb-3">
              Most VCs don't look at data rooms before meeting you. They rely on the intro, 
              deck, and first conversation.
            </p>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Exception:</strong> Hot deals where VCs are competing for allocation 
                may request data room access earlier.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">During Due Diligence</h3>
            <p className="text-muted-foreground mb-3">
              This is when data rooms matter most. VCs are validating claims, checking 
              for red flags, and building their IC memo.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">What They Verify:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Revenue claims match financials</li>
                  <li>• Customer logos are real customers</li>
                  <li>• Cap table math checks out</li>
                  <li>• IP is properly assigned</li>
                </ul>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">Red Flags They Spot:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Missing documents</li>
                  <li>• Inconsistent numbers</li>
                  <li>• Outdated information</li>
                  <li>• Disorganization</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">For Investment Committee</h3>
            <p className="text-muted-foreground mb-3">
              The sponsoring partner pulls specific documents to build the IC presentation. 
              Easy access means faster IC scheduling.
            </p>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Key documents for IC:</strong> Financial model, cap table, customer 
                list, and any supporting data for bold claims in the deck.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Data Room Best Practices */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Data Room Best Practices</h2>

        <ComparisonTable
          good={[
            "Clear folder structure with numbered sections",
            "File naming convention: 01_CompanyName_Document_Date",
            "PDF format for final documents (prevents editing)",
            "Separate 'current' and 'archive' folders",
            "Index document explaining what's included",
            "Version control for updated documents",
            "Watermarked documents for tracking"
          ]}
          bad={[
            "Dumping all files in one folder",
            "Cryptic file names: 'Final_v3_REAL_final.xlsx'",
            "Broken links or missing attachments",
            "Outdated documents without dates",
            "Sensitive info in unprotected files",
            "Huge files that take forever to download",
            "Password-protected files without sharing the password"
          ]}
        />
      </section>

      {/* Data Room Checklist */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Pre-Fundraise Data Room Checklist</h2>
        
        <Checklist items={[
          "Pitch deck is current and matches your verbal pitch",
          "Financial model has clear assumptions tab",
          "Cap table exported from management tool (not a spreadsheet)",
          "All IP assignments from founders and early employees signed",
          "Customer reference list with 3-5 prepped contacts",
          "Employment agreements template in place",
          "Corporate documents organized (incorporation, bylaws)",
          "Known issues document prepared (proactive transparency)",
          "All files named consistently and dated"
        ]} />

        <Callout type="success">
          <strong>The Speed Test:</strong> Can you share your data room within 2 hours of 
          a VC request? If not, you're not ready to fundraise.
        </Callout>
      </section>

      {/* Tools & Platforms */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Data Room Tools</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Enterprise Options</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• <strong>Carta:</strong> Cap table + data room</li>
              <li>• <strong>DocSend:</strong> Analytics + access control</li>
              <li>• <strong>Visible:</strong> Investor updates + data room</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">Best for later-stage or larger raises</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Startup-Friendly</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• <strong>Google Drive:</strong> Free, familiar, shareable</li>
              <li>• <strong>Notion:</strong> Organized, collaborative</li>
              <li>• <strong>Dropbox:</strong> Simple file sharing</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">Best for early-stage with limited budget</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Key Features</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• <strong>Access control:</strong> Revoke after pass</li>
              <li>• <strong>Analytics:</strong> See who viewed what</li>
              <li>• <strong>Watermarking:</strong> Track document sharing</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">Prioritize based on your security needs</p>
          </Card>
        </div>
      </section>

      {/* Security Considerations */}
      <section className="mt-12">
        <Card className="p-6 bg-gradient-to-br from-destructive/10 to-transparent border-destructive/30">
          <h3 className="text-lg font-bold text-foreground mb-4">Security Considerations</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Do</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use link expiration for sensitive docs</li>
                <li>• Watermark documents with recipient name</li>
                <li>• Track who accesses what (analytics)</li>
                <li>• Revoke access for passed investors</li>
                <li>• Keep master copies separate from shared</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Don't</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Share customer PII or sensitive data</li>
                <li>• Include source code (unless requested)</li>
                <li>• Use "anyone with link" for sensitive docs</li>
                <li>• Share passwords in same channel as files</li>
                <li>• Forget to remove competitor VCs' access</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>

      <div className="mt-12 flex justify-center">
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Get Your VC Analysis
        </Button>
      </div>
    </ContentBlock>
  );
}