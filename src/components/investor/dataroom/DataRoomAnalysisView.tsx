import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Sparkles
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDataRoom, useDataRoomFiles, useUpdateDataRoomStatus } from "@/hooks/useDataRoom";
import { DataRoomMemoView } from "./DataRoomMemoView";
import { DataRoomChat } from "./DataRoomChat";
import type { DataRoomMemo } from "@/types/dataRoom";
import { cn } from "@/lib/utils";

interface DataRoomAnalysisViewProps {
  roomId: string;
  investorId: string;
  onBack: () => void;
  onSaveToDealflow: (roomId: string, memo: DataRoomMemo) => void;
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

  // Poll for file processing status
  useEffect(() => {
    if (room?.status === 'processing') {
      const interval = setInterval(() => {
        refetchFiles();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [room?.status, refetchFiles]);

  // Check if all files are processed
  const allFilesProcessed = files.length > 0 && files.every(
    f => f.extraction_status === 'completed' || f.extraction_status === 'error'
  );
  const processingFiles = files.filter(f => f.extraction_status === 'processing' || f.extraction_status === 'pending');
  const completedFiles = files.filter(f => f.extraction_status === 'completed');
  const errorFiles = files.filter(f => f.extraction_status === 'error');

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
      setIsGeneratingMemo(false);
    }
  };

  // Auto-process files on mount if needed
  useEffect(() => {
    if (room?.status === 'processing' && processingFiles.length > 0 && !isProcessing) {
      // Files need processing
      processFiles();
    }
  }, [room?.status]);

  const memo = room?.summary_json as DataRoomMemo | null;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold tracking-tight truncate">
              {room?.company_name || "Data Room"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {files.length} document{files.length !== 1 ? 's' : ''}
              </Badge>
              {room?.status === 'ready' && memo && (
                <Badge variant="secondary" className="text-xs">
                  Score: {memo.overall_score}/100
                </Badge>
              )}
            </div>
          </div>
          {memo && (
            <Button onClick={() => onSaveToDealflow(roomId, memo)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add to Dealflow
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b px-4">
          <TabsList className="h-12 bg-transparent">
            <TabsTrigger value="files" className="gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="memo" className="gap-2" disabled={!memo}>
              <BookOpen className="w-4 h-4" />
              Memo
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2" disabled={completedFiles.length === 0}>
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Files Tab */}
        <TabsContent value="files" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-4">
              {/* Processing Status */}
              {processingFiles.length > 0 && (
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <div>
                      <p className="font-medium">Processing documents...</p>
                      <p className="text-sm text-muted-foreground">
                        {processingFiles.length} file{processingFiles.length !== 1 ? 's' : ''} remaining
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* File List */}
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.page_count ? `${file.page_count} pages • ` : ''}
                        {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : ''}
                      </p>
                    </div>
                    {file.extraction_status === 'pending' && (
                      <Badge variant="outline" className="text-xs">Pending</Badge>
                    )}
                    {file.extraction_status === 'processing' && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    )}
                    {file.extraction_status === 'completed' && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    {file.extraction_status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              {allFilesProcessed && completedFiles.length > 0 && (
                <div className="pt-4 space-y-3">
                  <Separator />
                  {!memo ? (
                    <Button 
                      onClick={generateMemo} 
                      disabled={isGeneratingMemo}
                      className="w-full gap-2"
                      size="lg"
                    >
                      {isGeneratingMemo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating Due Diligence Memo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Due Diligence Memo
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={generateMemo} 
                      disabled={isGeneratingMemo}
                      variant="outline"
                      className="w-full gap-2"
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
                <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                  <p className="text-sm text-destructive">
                    {errorFiles.length} file{errorFiles.length !== 1 ? 's' : ''} failed to process. 
                    These will be excluded from the analysis.
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
