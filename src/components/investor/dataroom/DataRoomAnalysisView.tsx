import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  FileText, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Sparkles,
  FileSpreadsheet,
  Image,
  Clock,
  Zap,
  X,
  Upload,
  FolderOpen,
  Trash2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDataRoom, useDataRoomFiles, useUpdateDataRoomStatus, useAddDataRoomFile } from "@/hooks/useDataRoom";
import { DataRoomMemoView } from "./DataRoomMemoView";
import { DataRoomChat } from "./DataRoomChat";
import type { DataRoomMemo, DataRoomFile } from "@/types/dataRoom";
import { cn } from "@/lib/utils";

async function readErrorMessage(response: Response): Promise<string> {
  // Never assume the body is valid JSON (edge errors, gateways, etc.)
  const raw = await response.text().catch(() => "");
  if (!raw) return `Request failed (${response.status})`;
  try {
    const parsed = JSON.parse(raw) as any;
    return parsed?.error || parsed?.message || raw;
  } catch {
    return raw;
  }
}

async function safeReadJson<T = any>(response: Response): Promise<T> {
  const raw = await response.text().catch(() => "");
  if (!raw) throw new Error("Empty response from server");
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error("Server returned an invalid response");
  }
}

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

// Mini file card for sidebar
function MiniFileCard({ 
  file, 
  onRemove 
}: { 
  file: DataRoomFile; 
  onRemove?: () => void;
}) {
  const config = FILE_TYPE_CONFIG[file.file_type] || { icon: FileText, color: 'text-muted-foreground', label: 'File' };
  const Icon = config.icon;
  
  const getStatusIcon = () => {
    switch (file.extraction_status) {
      case 'pending': return <Clock className="w-3 h-3 text-muted-foreground" />;
      case 'processing': return <Loader2 className="w-3 h-3 text-primary animate-spin" />;
      case 'completed': return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'error': return <AlertCircle className="w-3 h-3 text-destructive" />;
      default: return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="group flex items-center gap-2 p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
      <Icon className={cn("w-4 h-4 shrink-0", config.color)} />
      <span className="flex-1 text-xs truncate">{file.file_name}</span>
      {getStatusIcon()}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/10 rounded"
        >
          <X className="w-3 h-3 text-destructive" />
        </button>
      )}
    </div>
  );
}

// Processing overlay
function ProcessingOverlay({ 
  progress, 
  processingCount, 
  pendingCount 
}: { 
  progress: number;
  processingCount: number;
  pendingCount: number;
}) {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4 p-8 rounded-2xl bg-card/90 border border-border/30 shadow-2xl max-w-sm">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Extracting Documents</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {processingCount} processing, {pendingCount} pending
          </p>
        </div>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm font-medium text-primary">{progress}%</p>
        </div>
      </div>
    </div>
  );
}

// Generating memo overlay
function GeneratingMemoOverlay({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4 p-8 rounded-2xl bg-card/90 border border-border/30 shadow-2xl max-w-sm">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Generating Due Diligence Memo</h3>
          <p className="text-sm text-muted-foreground mt-1">
            AI is analyzing all documents...
          </p>
        </div>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm font-medium text-primary">{progress}%</p>
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
  const addFileRecord = useAddDataRoomFile(roomId);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingMemo, setIsGeneratingMemo] = useState(false);
  const [memoProgress, setMemoProgress] = useState(0);
  const [showDocPanel, setShowDocPanel] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Calculate file status
  const processingFiles = files.filter(f => f.extraction_status === 'processing');
  const pendingFiles = files.filter(f => f.extraction_status === 'pending');
  const completedFiles = files.filter(f => f.extraction_status === 'completed');
  const errorFiles = files.filter(f => f.extraction_status === 'error');
  const allFilesProcessed = files.length > 0 && files.every(
    f => f.extraction_status === 'completed' || f.extraction_status === 'error'
  );
  const totalFiles = files.length;
  const processedCount = completedFiles.length + errorFiles.length;
  const overallProgress = totalFiles > 0 ? Math.round((processedCount / totalFiles) * 100) : 0;

  const memo = room?.summary_json as DataRoomMemo | null;

  // Function to auto-save data room analysis to dealflow
  const saveDataRoomToDealflow = async (roomId: string, memo: DataRoomMemo, companyName: string) => {
    const { data: deckCompany, error: deckCompanyError } = await supabase
      .from("investor_deck_companies")
      .insert([{
        investor_id: investorId,
        name: memo.company_name || companyName,
        stage: "Unknown",
        description: memo.executive_summary?.slice(0, 500) || null,
        category: null,
        memo_json: memo as any,
      }])
      .select("id")
      .single();

    if (deckCompanyError) throw deckCompanyError;
    if (!deckCompany?.id) throw new Error("Failed to create deck company");

    const { data: existingDeal } = await supabase
      .from("investor_dealflow")
      .select("id")
      .eq("investor_id", investorId)
      .eq("deck_company_id", deckCompany.id)
      .single();

    if (existingDeal) return;

    const { error: dealflowError } = await supabase.from("investor_dealflow").insert({
      investor_id: investorId,
      deck_company_id: deckCompany.id,
      company_id: null,
      source: "data_room",
      status: "reviewing",
    } as any);

    if (dealflowError) throw dealflowError;
  };

  // Poll for file processing status
  useEffect(() => {
    if (room?.status === 'processing' || processingFiles.length > 0 || pendingFiles.length > 0) {
      const interval = setInterval(() => {
        refetchFiles();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [room?.status, processingFiles.length, pendingFiles.length, refetchFiles]);

  // Auto-process files on mount or when new files are added
  const processFiles = useCallback(async () => {
    if (isProcessing) return;
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
        throw new Error(await readErrorMessage(response));
      }

      const result = await safeReadJson<any>(response);
      console.log("Process result:", result);
      
      // Refetch files to update UI
      await refetchFiles();
      
      // If there are more files to process, schedule another call
      if (result.remaining > 0) {
        setTimeout(() => {
          setIsProcessing(false);
        }, 500); // Small delay before allowing next batch
      }
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [roomId, isProcessing, refetchFiles]);

  // Auto-process when there are pending files - trigger repeatedly until done
  useEffect(() => {
    const hasPendingOrProcessing = pendingFiles.length > 0 || processingFiles.length > 0;
    if (hasPendingOrProcessing && !isProcessing && !isGeneratingMemo) {
      const timer = setTimeout(() => {
        processFiles();
      }, 1000); // 1 second delay between batches
      return () => clearTimeout(timer);
    }
  }, [pendingFiles.length, processingFiles.length, isProcessing, isGeneratingMemo, processFiles]);

  // Auto-generate memo when all files are processed and no memo exists
  const generateMemo = useCallback(async () => {
    if (isGeneratingMemo || memo) return;
    
    setIsGeneratingMemo(true);
    setMemoProgress(0);
    
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
        throw new Error(await readErrorMessage(response));
      }

      const data = await safeReadJson<any>(response);
      setMemoProgress(100);
      
      await updateStatus.mutateAsync({
        roomId,
        status: 'ready',
        summaryJson: data.memo,
      });

      // Auto-save to dealflow
      try {
        await saveDataRoomToDealflow(roomId, data.memo, room?.company_name || "Unknown");
      } catch (saveError) {
        console.error("Failed to auto-save to dealflow:", saveError);
      }

      toast({ title: "Analysis complete", description: "Due diligence memo is ready and saved to your dealflow." });
      refetchRoom();
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
  }, [roomId, isGeneratingMemo, memo, room?.company_name, updateStatus, refetchRoom]);

  // Auto-generate memo when files are processed
  useEffect(() => {
    if (allFilesProcessed && completedFiles.length > 0 && !memo && !isGeneratingMemo && !isProcessing) {
      generateMemo();
    }
  }, [allFilesProcessed, completedFiles.length, memo, isGeneratingMemo, isProcessing, generateMemo]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;
    if (!newFiles || newFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(newFiles)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${investorId}/${roomId}/${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('data-room-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        await addFileRecord.mutateAsync({
          room_id: roomId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: fileName,
          extraction_status: 'pending',
          extracted_text: null,
          page_count: null,
        });
      }

      toast({ title: "Files uploaded", description: `${newFiles.length} file(s) added to the data room.` });
      refetchFiles();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Handle file removal
  const handleRemoveFile = async (fileId: string, storagePath: string) => {
    try {
      await supabase.storage.from('data-room-files').remove([storagePath]);
      await supabase.from('investor_data_room_files').delete().eq('id', fileId);
      refetchFiles();
      toast({ title: "File removed" });
    } catch (error) {
      toast({ title: "Failed to remove file", variant: "destructive" });
    }
  };

  // Regenerate memo
  const handleRegenerate = async () => {
    // Clear existing memo first
    await updateStatus.mutateAsync({
      roomId,
      status: 'processing',
      summaryJson: undefined,
    });
    await refetchRoom();
    // Trigger regeneration
    setTimeout(() => generateMemo(), 100);
  };

  // Show processing overlay
  const showProcessingOverlay = (processingFiles.length > 0 || pendingFiles.length > 0) && !memo;
  const showMemoOverlay = isGeneratingMemo;

  return (
    <div className="flex flex-col h-full animate-fade-in relative">
      {/* Overlays */}
      {showProcessingOverlay && (
        <ProcessingOverlay 
          progress={overallProgress} 
          processingCount={processingFiles.length}
          pendingCount={pendingFiles.length}
        />
      )}
      {showMemoOverlay && <GeneratingMemoOverlay progress={memoProgress} />}

      {/* Header */}
      <div className="shrink-0 p-4 border-b border-border/20 bg-gradient-to-r from-card/80 via-card/60 to-card/40 backdrop-blur-xl">
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
            <h2 className="text-xl font-bold tracking-tight truncate">
              {room?.company_name || "Data Room"}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <Badge 
                variant="outline" 
                className="text-xs gap-1.5 bg-background/50 cursor-pointer hover:bg-background/80"
                onClick={() => setShowDocPanel(!showDocPanel)}
              >
                <FolderOpen className="w-3 h-3" />
                {files.length} document{files.length !== 1 ? 's' : ''}
              </Badge>
              {memo && (
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

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {memo && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isGeneratingMemo}
                  className="gap-1.5 rounded-xl"
                >
                  <RefreshCw className={cn("w-4 h-4", isGeneratingMemo && "animate-spin")} />
                  <span className="hidden sm:inline">Regenerate</span>
                </Button>
                <Button 
                  onClick={() => onSaveToDealflow(roomId, memo)} 
                  size="sm"
                  className="gap-1.5 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add to Dealflow</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content - Split view */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Document sidebar panel */}
        <div className={cn(
          "absolute inset-y-0 left-0 w-72 bg-card/95 backdrop-blur-xl border-r border-border/30 z-40 transform transition-transform duration-300 ease-out",
          showDocPanel ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Documents</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowDocPanel(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Upload button */}
              <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">Add Files</span>
              </label>
            </div>
            
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-2">
                {files.map(file => (
                  <MiniFileCard
                    key={file.id}
                    file={file}
                    onRemove={() => handleRemoveFile(file.id, file.storage_path)}
                  />
                ))}
              </div>
            </ScrollArea>

            {/* Reprocess button */}
            {errorFiles.length > 0 && (
              <div className="p-4 border-t border-border/30">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={processFiles}
                  disabled={isProcessing}
                  className="w-full gap-2"
                >
                  <RefreshCw className={cn("w-4 h-4", isProcessing && "animate-spin")} />
                  Retry Failed ({errorFiles.length})
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Memo + Chat Split View */}
        {memo ? (
          <div className="flex-1 flex">
            {/* Left: Memo */}
            <div className="w-1/2 border-r border-border/20 overflow-hidden">
              <DataRoomMemoView memo={memo} />
            </div>
            
            {/* Right: Chat */}
            <div className="w-1/2 overflow-hidden">
              <DataRoomChat roomId={roomId} files={completedFiles} />
            </div>
          </div>
        ) : (
          /* Waiting state when no memo yet */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Preparing Analysis</h3>
              <p className="text-muted-foreground mb-6">
                Upload documents and we'll automatically extract and analyze them to generate your due diligence memo.
              </p>
              
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                <span className="font-medium">Upload Documents</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
