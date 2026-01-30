import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  FileText, 
  MessageSquare, 
  BookOpen,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Sparkles,
  FileSpreadsheet,
  Image,
  Clock,
  Zap
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDataRoom, useDataRoomFiles, useUpdateDataRoomStatus } from "@/hooks/useDataRoom";
import { DataRoomMemoView } from "./DataRoomMemoView";
import { DataRoomChat } from "./DataRoomChat";
import type { DataRoomMemo, DataRoomFile } from "@/types/dataRoom";
import { cn } from "@/lib/utils";

interface DataRoomAnalysisViewProps {
  roomId: string;
  investorId: string;
  onBack: () => void;
  onSaveToDealflow: (roomId: string, memo: DataRoomMemo) => void;
}

const FILE_TYPE_CONFIG: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  'application/pdf': { icon: FileText, color: 'text-red-500', label: 'PDF' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileSpreadsheet, color: 'text-green-500', label: 'Excel' },
  'application/vnd.ms-excel': { icon: FileSpreadsheet, color: 'text-green-500', label: 'Excel' },
  'text/csv': { icon: FileSpreadsheet, color: 'text-green-500', label: 'CSV' },
  'image/png': { icon: Image, color: 'text-blue-500', label: 'PNG' },
  'image/jpeg': { icon: Image, color: 'text-blue-500', label: 'JPG' },
  'image/webp': { icon: Image, color: 'text-blue-500', label: 'WebP' },
};

function FileStatusCard({ file }: { file: DataRoomFile }) {
  const config = FILE_TYPE_CONFIG[file.file_type] || { icon: FileText, color: 'text-muted-foreground', label: 'File' };
  const Icon = config.icon;
  
  const getStatusInfo = () => {
    switch (file.extraction_status) {
      case 'pending':
        return { 
          icon: Clock, 
          color: 'text-muted-foreground', 
          bg: 'bg-muted/50',
          label: 'Waiting...',
          progress: 0 
        };
      case 'processing':
        return { 
          icon: Loader2, 
          color: 'text-primary', 
          bg: 'bg-primary/10',
          label: 'Extracting...',
          progress: 50,
          animate: true 
        };
      case 'completed':
        return { 
          icon: CheckCircle2, 
          color: 'text-green-500', 
          bg: 'bg-green-500/10',
          label: 'Complete',
          progress: 100 
        };
      case 'error':
        return { 
          icon: AlertCircle, 
          color: 'text-destructive', 
          bg: 'bg-destructive/10',
          label: 'Failed',
          progress: 0 
        };
      default:
        return { 
          icon: Clock, 
          color: 'text-muted-foreground', 
          bg: 'bg-muted/50',
          label: 'Unknown',
          progress: 0 
        };
    }
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <div className={cn(
      "rounded-xl border border-border/30 p-4 transition-all duration-300",
      "bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-sm",
      file.extraction_status === 'processing' && "ring-2 ring-primary/20"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          status.bg
        )}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-sm">{file.file_name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {config.label}
            </Badge>
            {file.file_size && (
              <span className="text-xs text-muted-foreground">
                {(file.file_size / 1024).toFixed(0)} KB
              </span>
            )}
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2 mt-2">
            <StatusIcon className={cn(
              "w-3.5 h-3.5", 
              status.color,
              status.animate && "animate-spin"
            )} />
            <span className={cn("text-xs font-medium", status.color)}>
              {status.label}
            </span>
          </div>

          {/* Progress bar for processing */}
          {file.extraction_status === 'processing' && (
            <div className="mt-2">
              <Progress value={50} className="h-1" />
            </div>
          )}
          
          {/* Extracted text preview */}
          {file.extraction_status === 'completed' && file.extracted_text && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {file.extracted_text.slice(0, 100)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function DataRoomAnalysisView({ 
  roomId, 
  investorId, 
  onBack,
  onSaveToDealflow 
}: DataRoomAnalysisViewProps) {
  const { data: room, refetch: refetchRoom } = useDataRoom(roomId);
  const { data: files = [], refetch: refetchFiles } = useDataRoomFiles(roomId);
  const updateStatus = useUpdateDataRoomStatus(investorId);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingMemo, setIsGeneratingMemo] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("files");
  const [memoProgress, setMemoProgress] = useState(0);

  // Poll for file processing status
  useEffect(() => {
    if (room?.status === 'processing') {
      const interval = setInterval(() => {
        refetchFiles();
      }, 2000); // Poll every 2 seconds for faster updates
      return () => clearInterval(interval);
    }
  }, [room?.status, refetchFiles]);

  // Check if all files are processed
  const allFilesProcessed = files.length > 0 && files.every(
    f => f.extraction_status === 'completed' || f.extraction_status === 'error'
  );
  const processingFiles = files.filter(f => f.extraction_status === 'processing');
  const pendingFiles = files.filter(f => f.extraction_status === 'pending');
  const completedFiles = files.filter(f => f.extraction_status === 'completed');
  const errorFiles = files.filter(f => f.extraction_status === 'error');

  // Calculate overall progress
  const totalFiles = files.length;
  const processedCount = completedFiles.length + errorFiles.length;
  const overallProgress = totalFiles > 0 ? Math.round((processedCount / totalFiles) * 100) : 0;

  const processFiles = async () => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-data-room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ roomId }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to process files");
      }

      toast({ title: "Processing started", description: "Extracting document contents..." });
      refetchFiles();
    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMemo = async () => {
    setIsGeneratingMemo(true);
    setMemoProgress(0);
    
    // Simulate progress while waiting
    const progressInterval = setInterval(() => {
      setMemoProgress(prev => Math.min(prev + 5, 90));
    }, 2000);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-data-room-memo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ roomId }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate memo");
      }

      const data = await response.json();
      setMemoProgress(100);
      
      // Update room with memo
      await updateStatus.mutateAsync({
        roomId,
        status: 'ready',
        summaryJson: data.memo,
      });

      toast({ title: "Analysis complete", description: "Due diligence memo is ready." });
      refetchRoom();
      setActiveTab("memo");
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setIsGeneratingMemo(false);
      setMemoProgress(0);
    }
  };

  // Auto-process files on mount if needed
  useEffect(() => {
    if (room?.status === 'processing' && (processingFiles.length > 0 || pendingFiles.length > 0) && !isProcessing) {
      processFiles();
    }
  }, [room?.status]);

  const memo = room?.summary_json as DataRoomMemo | null;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Glassmorphism Header */}
      <div className="p-6 border-b border-border/20 bg-gradient-to-r from-card/60 via-card/40 to-card/30 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="rounded-full bg-background/50 hover:bg-background/80"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold tracking-tight truncate">
              {room?.company_name || "Data Room"}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="text-xs gap-1.5 bg-background/50">
                <FileText className="w-3 h-3" />
                {files.length} document{files.length !== 1 ? 's' : ''}
              </Badge>
              {room?.status === 'ready' && memo && (
                <Badge 
                  className={cn(
                    "text-xs gap-1.5",
                    memo.overall_score >= 70 ? "bg-green-500/10 text-green-600 border-green-500/30" :
                    memo.overall_score >= 50 ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" :
                    "bg-red-500/10 text-red-600 border-red-500/30"
                  )}
                  variant="outline"
                >
                  <Zap className="w-3 h-3" />
                  Score: {memo.overall_score}/100
                </Badge>
              )}
            </div>
          </div>
          {memo && (
            <Button 
              onClick={() => onSaveToDealflow(roomId, memo)} 
              className="gap-2 rounded-xl shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add to Dealflow
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border/20 px-4 bg-gradient-to-r from-muted/20 to-transparent">
          <TabsList className="h-14 bg-transparent gap-1">
            <TabsTrigger 
              value="files" 
              className="gap-2 data-[state=active]:bg-background/80 rounded-lg px-4"
            >
              <FileText className="w-4 h-4" />
              Documents
              {processingFiles.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {processingFiles.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="memo" 
              className="gap-2 data-[state=active]:bg-background/80 rounded-lg px-4" 
              disabled={!memo}
            >
              <BookOpen className="w-4 h-4" />
              Memo
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="gap-2 data-[state=active]:bg-background/80 rounded-lg px-4" 
              disabled={completedFiles.length === 0}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Files Tab */}
        <TabsContent value="files" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {/* Processing Status Banner */}
              {(processingFiles.length > 0 || pendingFiles.length > 0) && (
                <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">Extracting Documents</p>
                      <p className="text-sm text-muted-foreground">
                        {processingFiles.length} processing, {pendingFiles.length} pending
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-primary">{overallProgress}%</span>
                    </div>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>
              )}

              {/* File Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file) => (
                  <FileStatusCard key={file.id} file={file} />
                ))}
              </div>

              {/* Action Buttons */}
              {allFilesProcessed && completedFiles.length > 0 && (
                <div className="pt-4 space-y-4">
                  <Separator className="bg-border/30" />
                  
                  {isGeneratingMemo ? (
                    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <div className="flex-1">
                          <p className="font-semibold text-lg">Generating Due Diligence Memo</p>
                          <p className="text-sm text-muted-foreground">
                            AI is analyzing all documents...
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-primary">{memoProgress}%</span>
                      </div>
                      <Progress value={memoProgress} className="h-2" />
                    </div>
                  ) : !memo ? (
                    <Button 
                      onClick={generateMemo} 
                      disabled={isGeneratingMemo}
                      className="w-full gap-3 h-14 text-lg rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                      size="lg"
                    >
                      <Sparkles className="w-5 h-5" />
                      Generate Due Diligence Memo
                    </Button>
                  ) : (
                    <Button 
                      onClick={generateMemo} 
                      disabled={isGeneratingMemo}
                      variant="outline"
                      className="w-full gap-2 rounded-xl"
                    >
                      <RefreshCw className={cn("w-4 h-4", isGeneratingMemo && "animate-spin")} />
                      Regenerate Memo
                    </Button>
                  )}
                  
                  <p className="text-xs text-muted-foreground text-center">
                    AI will analyze {completedFiles.length} document{completedFiles.length !== 1 ? 's' : ''} and generate a comprehensive investment memo.
                  </p>
                </div>
              )}

              {errorFiles.length > 0 && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <p className="font-semibold text-destructive">
                      {errorFiles.length} file{errorFiles.length !== 1 ? 's' : ''} failed to process
                    </p>
                  </div>
                  <p className="text-sm text-destructive/80">
                    These files will be excluded from the analysis. You can still proceed with the remaining documents.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Memo Tab */}
        <TabsContent value="memo" className="flex-1 overflow-hidden m-0">
          {memo && <DataRoomMemoView memo={memo} />}
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 overflow-hidden m-0">
          <DataRoomChat roomId={roomId} files={completedFiles} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
