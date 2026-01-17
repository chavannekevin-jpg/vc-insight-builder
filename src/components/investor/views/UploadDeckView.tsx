import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Upload, FileText, Loader2, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ParsedMemo {
  company_name: string;
  tagline: string;
  problem: string;
  solution: string;
  market_size: string;
  business_model: string;
  traction: string;
  team: string;
  ask: string;
  key_risks: string[];
  recommendation: string;
}

const UploadDeckView = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedMemo, setParsedMemo] = useState<ParsedMemo | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      handleFileUpload(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);

    // Simulate processing - this will be replaced with actual API call
    setTimeout(() => {
      setParsedMemo({
        company_name: "Sample Startup",
        tagline: "Making X easier for Y",
        problem: "Description of the problem the startup is solving...",
        solution: "Overview of the proposed solution...",
        market_size: "$10B TAM with 20% CAGR",
        business_model: "SaaS with annual subscriptions",
        traction: "100 customers, $500K ARR",
        team: "2 founders with relevant experience",
        ask: "Raising $2M Seed round",
        key_risks: [
          "Early stage with limited traction",
          "Competitive market",
          "Execution risk",
        ],
        recommendation: "Worth a first meeting to explore further",
      });
      setIsProcessing(false);
      toast({ title: "Deck analyzed successfully!" });
    }, 3000);
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setParsedMemo(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <h2 className="text-lg font-semibold">Upload Deck</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a pitch deck and get an instant AI-generated investment memo summary
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {!uploadedFile ? (
          /* Upload Zone */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`h-full min-h-[400px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Drop your pitch deck here</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              Upload a PDF pitch deck and our AI will extract key information into a shareable memo
            </p>
            <label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button asChild className="gap-2 cursor-pointer">
                <span>
                  <Upload className="w-4 h-4" />
                  Select File
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-4">Supports PDF files up to 50MB</p>
          </div>
        ) : isProcessing ? (
          /* Processing State */
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analyzing deck...</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Our AI is reading through the pitch deck and extracting key information
            </p>
            <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              {uploadedFile.name}
            </div>
          </div>
        ) : parsedMemo ? (
          /* Parsed Memo */
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold">{parsedMemo.company_name}</h3>
                <p className="text-muted-foreground">{parsedMemo.tagline}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetUpload}>
                  Upload Another
                </Button>
                <Button size="sm" className="gap-1.5">
                  <ExternalLink className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Memo Sections */}
            <div className="grid gap-4">
              <MemoSection title="Problem" content={parsedMemo.problem} />
              <MemoSection title="Solution" content={parsedMemo.solution} />
              <MemoSection title="Market Size" content={parsedMemo.market_size} />
              <MemoSection title="Business Model" content={parsedMemo.business_model} />
              <MemoSection title="Traction" content={parsedMemo.traction} />
              <MemoSection title="Team" content={parsedMemo.team} />
              <MemoSection title="Ask" content={parsedMemo.ask} />
              
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-yellow-600">Key Risks</h4>
                <ul className="space-y-1">
                  {parsedMemo.key_risks.map((risk, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-yellow-500">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-primary">Recommendation</h4>
                <p className="text-sm">{parsedMemo.recommendation}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const MemoSection = ({ title, content }: { title: string; content: string }) => (
  <div className="bg-card border border-border rounded-lg p-4">
    <h4 className="font-semibold mb-2">{title}</h4>
    <p className="text-sm text-muted-foreground">{content}</p>
  </div>
);

export default UploadDeckView;
