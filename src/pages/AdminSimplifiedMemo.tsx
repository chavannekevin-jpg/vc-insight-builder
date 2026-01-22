import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FileText,
  Code,
  Eye,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Layers,
  Database,
  Paintbrush,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import the component and demo data for preview
import { SimplifiedMemoViewer } from "@/components/templates/SimplifiedMemoViewer";
import { DEMO_COMPANY } from "@/data/demo/demoSignalFlow";
import { DEMO_SECTION_TOOLS, DEMO_HOLISTIC_VERDICTS } from "@/data/demo/demoSignalFlowTools";
import { getDemoMemo } from "@/data/acceleratorDemo/demoMemos";

// ============================================================================
// DOCUMENTATION CONTENT
// ============================================================================

const PURPOSE_CONTENT = `
A lightweight, self-contained investment memo viewer optimized for quick scanning. 
Unlike the full paid memo (which uses 23+ specialized components), this template 
consolidates analysis into a single-page experience with expandable detail sections.

**Key Characteristics:**
- Single-file component with no external dependencies beyond shadcn/ui
- Built-in helper functions for score coloring and styling
- Progressive disclosure via expandable sections
- Responsive layout with mobile support
`;

const USE_CASES = [
  "Demo environments where full component library isn't needed",
  "Quick previews or executive summaries",
  "External reports or PDF exports",
  "Landing page showcases",
  "Partner/white-label implementations",
  "Offline or static HTML exports",
];

const DATA_REQUIREMENTS = [
  {
    field: "sections",
    type: "Array<{title, narrative, keyPoints}>",
    source: "demoMemos.ts or API",
    required: true,
  },
  {
    field: "sectionTools",
    type: "Record<string, SectionToolData>",
    source: "demoSignalFlowTools.ts pattern",
    required: false,
  },
  {
    field: "holisticVerdicts",
    type: "Record<string, {verdict, stageContext}>",
    source: "Manual or AI-generated",
    required: false,
  },
  {
    field: "aiActionPlan",
    type: "{summaryLine, items[]}",
    source: "AI or manual creation",
    required: false,
  },
];

const UI_PATTERNS = [
  {
    name: "Score Coloring",
    description: "Emerald (70+), Amber (55-69), Red (<55)",
    function: "getScoreColor(score)",
  },
  {
    name: "Section Cards",
    description: "Colored header band based on section score",
    function: "CardHeader with conditional bg classes",
  },
  {
    name: "VC Perspective Block",
    description: "Muted background with italic stage context",
    function: "Inline div with bg-muted/30",
  },
  {
    name: "Expandable Tools",
    description: "Collapse/expand for progressive disclosure",
    function: "ExpandableTools sub-component",
  },
  {
    name: "Jump Navigation",
    description: "Section badges with mini-scores for quick nav",
    function: "SectionNavBar sub-component",
  },
];

const RECONSTRUCTION_STEPS = [
  "Create data files following the demoSignalFlow*.ts patterns",
  "Import SimplifiedMemoViewer from @/components/templates/SimplifiedMemoViewer",
  "Prepare your sections array with title, narrative, and keyPoints",
  "Optionally prepare sectionTools with scores, VC logic, action plans, benchmarks",
  "Optionally prepare holisticVerdicts for VC perspective per section",
  "Optionally prepare aiActionPlan with summary and prioritized items",
  "Pass all data through props to SimplifiedMemoViewer",
  "Wrap in appropriate layout (AdminLayout, DemoLayout, or custom)",
];

const USAGE_CODE = `import { SimplifiedMemoViewer } from "@/components/templates/SimplifiedMemoViewer";

// Your data
const sections = [
  {
    title: "Problem",
    narrative: "The company addresses...",
    keyPoints: ["Point 1", "Point 2"],
  },
  // ... more sections
];

const sectionTools = {
  Problem: {
    sectionScore: 78,
    vcInvestmentLogic: {
      primaryQuestions: ["Is the pain point validated?"],
      keyMetrics: ["Customer interviews", "Churn rate"],
      redFlags: ["No customer validation"],
      greenFlags: ["Strong NPS scores"],
    },
    // ... actionPlan90Day, benchmarks
  },
};

// Render
<SimplifiedMemoViewer
  companyName="Acme Corp"
  companyDescription="AI-powered solutions"
  heroStatement="Transforming the industry"
  sections={sections}
  sectionTools={sectionTools}
  holisticVerdicts={verdicts}
  aiActionPlan={actionPlan}
  onBack={() => navigate(-1)}
/>`;

const INTERFACE_CODE = `interface SimplifiedMemoViewerProps {
  companyName: string;
  companyDescription?: string;
  heroStatement?: string;
  sections: SimplifiedMemoSection[];
  sectionTools?: Record<string, SectionToolData>;
  holisticVerdicts?: Record<string, HolisticVerdict>;
  aiActionPlan?: AIActionPlan;
  onBack?: () => void;
  showBackButton?: boolean;
}

interface SimplifiedMemoSection {
  title: string;
  narrative?: string;
  keyPoints?: string[];
}

interface SectionToolData {
  sectionScore?: number;
  vcInvestmentLogic?: {
    primaryQuestions: string[];
    keyMetrics: string[];
    redFlags: string[];
    greenFlags: string[];
  };
  actionPlan90Day?: {
    milestones: Array<{
      title: string;
      description: string;
      priority: "high" | "medium" | "low";
    }>;
  };
  benchmarks?: {
    metrics: Array<{
      label: string;
      yourValue: string;
      benchmark: string;
      status: "above" | "at" | "below";
    }>;
  };
}`;

// ============================================================================
// COPY BUTTON COMPONENT
// ============================================================================

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 px-2">
      {copied ? (
        <Check className="h-4 w-4 text-emerald-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function AdminSimplifiedMemo() {
  const [codeOpen, setCodeOpen] = useState(false);

  // Get demo data for preview
  const memoData = getDemoMemo("demo-signalflow");

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Simplified Memo Template
          </h1>
          <p className="text-muted-foreground mt-1">
            A reusable, self-contained investment memo viewer component with full documentation.
          </p>
        </div>

        <Tabs defaultValue="documentation" className="space-y-6">
          <TabsList>
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Live Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Code Reference
            </TabsTrigger>
          </TabsList>

          {/* ============================================================ */}
          {/* DOCUMENTATION TAB */}
          {/* ============================================================ */}
          <TabsContent value="documentation" className="space-y-6">
            {/* Purpose */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Purpose & Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-line text-muted-foreground">
                    {PURPOSE_CONTENT}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Use Cases */}
            <Card>
              <CardHeader>
                <CardTitle>When to Use This Template</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-2 gap-2">
                  {USE_CASES.map((useCase, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Data Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Data Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium">Field</th>
                        <th className="text-left py-2 px-3 font-medium">Type</th>
                        <th className="text-left py-2 px-3 font-medium">Source</th>
                        <th className="text-left py-2 px-3 font-medium">Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DATA_REQUIREMENTS.map((req, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 px-3 font-mono text-primary">{req.field}</td>
                          <td className="py-2 px-3 font-mono text-xs">{req.type}</td>
                          <td className="py-2 px-3 text-muted-foreground">{req.source}</td>
                          <td className="py-2 px-3">
                            <Badge variant={req.required ? "default" : "outline"}>
                              {req.required ? "Required" : "Optional"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* UI Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paintbrush className="h-5 w-5 text-primary" />
                  Key UI Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {UI_PATTERNS.map((pattern, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <Badge variant="outline" className="shrink-0">
                        {i + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{pattern.name}</p>
                        <p className="text-sm text-muted-foreground">{pattern.description}</p>
                        <code className="text-xs text-primary mt-1 block">
                          {pattern.function}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reconstruction Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Reconstruction Steps</CardTitle>
                <CardDescription>
                  Follow these steps to use this template in a new context
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {RECONSTRUCTION_STEPS.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================ */}
          {/* PREVIEW TAB */}
          {/* ============================================================ */}
          <TabsContent value="preview">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Live Preview (SignalFlow Demo Data)
                </CardTitle>
                <CardDescription>
                  This preview uses the SignalFlow demo data to demonstrate the component
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border rounded-lg overflow-hidden bg-background">
                  <SimplifiedMemoViewer
                    companyName={DEMO_COMPANY.name}
                    companyDescription={DEMO_COMPANY.description}
                    heroStatement={memoData?.heroStatement || ""}
                    sections={memoData?.sections || []}
                    sectionTools={DEMO_SECTION_TOOLS as Record<string, import("@/components/templates/SimplifiedMemoViewer").SectionToolData>}
                    holisticVerdicts={DEMO_HOLISTIC_VERDICTS}
                    showBackButton={false}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================ */}
          {/* CODE REFERENCE TAB */}
          {/* ============================================================ */}
          <TabsContent value="code" className="space-y-6">
            {/* Usage Example */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Usage Example</CardTitle>
                  <CopyButton text={USAGE_CODE} />
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                  <code>{USAGE_CODE}</code>
                </pre>
              </CardContent>
            </Card>

            {/* Interface Definitions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>TypeScript Interfaces</CardTitle>
                  <CopyButton text={INTERFACE_CODE} />
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                  <code>{INTERFACE_CODE}</code>
                </pre>
              </CardContent>
            </Card>

            {/* File Location */}
            <Card>
              <CardHeader>
                <CardTitle>Component Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <FileText className="h-4 w-4 text-primary" />
                    <code className="text-sm">
                      src/components/templates/SimplifiedMemoViewer.tsx
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Import the component and its types from this file. All helper functions 
                    (getScoreColor, getScoreBg) are also exported for external use.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Related Files */}
            <Card>
              <CardHeader>
                <CardTitle>Related Demo Data Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <code>src/data/demo/demoSignalFlow.ts</code>
                    <span className="text-muted-foreground ml-2">— Company profile</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <code>src/data/demo/demoSignalFlowTools.ts</code>
                    <span className="text-muted-foreground ml-2">— Section tools & verdicts</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <code>src/data/acceleratorDemo/demoMemos.ts</code>
                    <span className="text-muted-foreground ml-2">— Memo sections & content</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
