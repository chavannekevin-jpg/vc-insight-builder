import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  FolderOpen, 
  Upload, 
  FileText, 
  FileSpreadsheet,
  Image,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Files
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCreateDataRoom } from "@/hooks/useDataRoom";
import { cn } from "@/lib/utils";

interface DataRoomUploadProps {
  investorId: string;
  onBack: () => void;
  onRoomCreated: (roomId: string) => void;
}

interface QueuedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

const SUPPORTED_TYPES = {
  'application/pdf': { icon: FileText, label: 'PDF', color: 'text-red-500' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileSpreadsheet, label: 'Excel', color: 'text-green-500' },
  'application/vnd.ms-excel': { icon: FileSpreadsheet, label: 'Excel', color: 'text-green-500' },
  'text/csv': { icon: FileSpreadsheet, label: 'CSV', color: 'text-green-500' },
  'image/png': { icon: Image, label: 'Image', color: 'text-blue-500' },
  'image/jpeg': { icon: Image, label: 'Image', color: 'text-blue-500' },
  'image/webp': { icon: Image, label: 'Image', color: 'text-blue-500' },
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILES = 15;

export function DataRoomUpload({ investorId, onBack, onRoomCreated }: DataRoomUploadProps) {
  const [companyName, setCompanyName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const createRoom = useCreateDataRoom(investorId);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): string | null => {
    if (!Object.keys(SUPPORTED_TYPES).includes(file.type)) {
      return `Unsupported file type: ${file.type || 'unknown'}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`;
    }
    return null;
  };

  const addFiles = (files: FileList | File[]) => {
    const newFiles: QueuedFile[] = [];
    const fileArray = Array.from(files);
    
    if (queuedFiles.length + fileArray.length > MAX_FILES) {
      toast({
        title: "Too many files",
        description: `Maximum ${MAX_FILES} files allowed`,
        variant: "destructive",
      });
      return;
    }
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        toast({ title: "Invalid file", description: `${file.name}: ${error}`, variant: "destructive" });
        continue;
      }
      
      // Check for duplicates
      if (queuedFiles.some(q => q.file.name === file.name && q.file.size === file.size)) {
        continue;
      }
      
      newFiles.push({
        file,
        id: crypto.randomUUID(),
        status: 'pending',
        progress: 0,
      });
    }
    
    setQueuedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [queuedFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setQueuedFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadAndProcess = async () => {
    if (!companyName.trim()) {
      toast({ title: "Company name required", variant: "destructive" });
      return;
    }
    if (queuedFiles.length === 0) {
      toast({ title: "Add at least one file", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    setUploadProgress(0);

    try {
      // 1. Create the data room
      const room = await createRoom.mutateAsync(companyName.trim());
      
      // 2. Get auth for storage upload
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const totalFiles = queuedFiles.length;

      // 3. Upload files sequentially with progress
      for (let i = 0; i < queuedFiles.length; i++) {
        const qf = queuedFiles[i];
        
        setQueuedFiles(prev => prev.map(f => 
          f.id === qf.id ? { ...f, status: 'uploading', progress: 0 } : f
        ));

        try {
          // Upload to storage
          const storagePath = `${session.user.id}/${room.id}/${qf.file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("data-room-files")
            .upload(storagePath, qf.file);
          
          if (uploadError) throw uploadError;

          // Create file record
          await supabase.from("investor_data_room_files").insert({
            room_id: room.id,
            file_name: qf.file.name,
            file_type: qf.file.type,
            file_size: qf.file.size,
            storage_path: storagePath,
            extraction_status: 'pending',
          });

          setQueuedFiles(prev => prev.map(f => 
            f.id === qf.id ? { ...f, status: 'completed', progress: 100 } : f
          ));
          
          setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
        } catch (err) {
          setQueuedFiles(prev => prev.map(f => 
            f.id === qf.id ? { ...f, status: 'error', error: (err as Error).message } : f
          ));
        }
      }

      // 4. Update room status
      await supabase
        .from("investor_data_rooms")
        .update({ status: 'processing' })
        .eq("id", room.id);

      toast({ title: "Data room created", description: "Processing documents..." });
      onRoomCreated(room.id);
      
    } catch (error) {
      toast({
        title: "Failed to create data room",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setIsCreating(false);
    }
  };

  const getFileIcon = (type: string) => {
    const config = SUPPORTED_TYPES[type as keyof typeof SUPPORTED_TYPES];
    return config?.icon || FileText;
  };

  const getFileColor = (type: string) => {
    const config = SUPPORTED_TYPES[type as keyof typeof SUPPORTED_TYPES];
    return config?.color || 'text-muted-foreground';
  };

  const completedCount = queuedFiles.filter(f => f.status === 'completed').length;
  const errorCount = queuedFiles.filter(f => f.status === 'error').length;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Glassmorphism Header */}
      <div className="p-6 border-b border-border/20 bg-gradient-to-r from-card/60 to-card/30 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            disabled={isCreating}
            className="rounded-full bg-background/50 hover:bg-background/80"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Create Data Room
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Upload documents for AI-powered due diligence analysis
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Files className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {queuedFiles.length} / {MAX_FILES}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Company Name Card */}
          <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="company-name" className="text-base font-semibold">Company Name</Label>
                <p className="text-xs text-muted-foreground">Enter the name of the company you're analyzing</p>
              </div>
            </div>
            <Input
              id="company-name"
              placeholder="e.g., Acme Corp, TechStartup Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isCreating}
              className="max-w-md bg-background/50 border-border/50 focus:border-primary/50"
            />
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "rounded-2xl border-2 border-dashed p-10 transition-all duration-300",
              "bg-gradient-to-br from-card/60 to-muted/20 backdrop-blur-xl",
              isDragging
                ? "border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/10"
                : "border-border/40 hover:border-primary/40 hover:shadow-md",
              isCreating && "pointer-events-none opacity-50"
            )}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center mb-6 shadow-lg">
                <FolderOpen className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Drop your files here</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                PDF, Excel, CSV, or images • Max {MAX_FILE_SIZE / 1024 / 1024}MB per file
              </p>
              <label>
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isCreating}
                />
                <Button asChild variant="outline" size="lg" className="cursor-pointer gap-2 rounded-xl">
                  <span>
                    <Upload className="w-4 h-4" />
                    Browse Files
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {/* File Queue */}
          {queuedFiles.length > 0 && (
            <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-border/20 flex items-center justify-between bg-gradient-to-r from-muted/30 to-transparent">
                <div className="flex items-center gap-2">
                  <Files className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">Documents</span>
                  <span className="text-sm text-muted-foreground">({queuedFiles.length})</span>
                </div>
                {!isCreating && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQueuedFiles([])}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <div className="divide-y divide-border/20 max-h-[350px] overflow-y-auto">
                {queuedFiles.map((qf) => {
                  const Icon = getFileIcon(qf.file.type);
                  const iconColor = getFileColor(qf.file.type);
                  return (
                    <div
                      key={qf.id}
                      className={cn(
                        "flex items-center gap-4 p-4 transition-colors",
                        qf.status === 'completed' && "bg-green-500/5",
                        qf.status === 'error' && "bg-destructive/5",
                        qf.status === 'uploading' && "bg-primary/5"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        qf.status === 'completed' ? "bg-green-500/10" :
                        qf.status === 'error' ? "bg-destructive/10" :
                        "bg-muted/50"
                      )}>
                        <Icon className={cn("w-5 h-5", iconColor)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{qf.file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {(qf.file.size / 1024).toFixed(1)} KB
                          </span>
                          {qf.status === 'uploading' && (
                            <span className="text-xs text-primary">Uploading...</span>
                          )}
                          {qf.status === 'completed' && (
                            <span className="text-xs text-green-600">Ready</span>
                          )}
                          {qf.status === 'error' && (
                            <span className="text-xs text-destructive">Failed</span>
                          )}
                        </div>
                        {qf.status === 'uploading' && (
                          <Progress value={qf.progress} className="h-1 mt-2" />
                        )}
                      </div>
                      {qf.status === 'pending' && !isCreating && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(qf.id)}
                          className="shrink-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      {qf.status === 'uploading' && (
                        <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
                      )}
                      {qf.status === 'completed' && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      )}
                      {qf.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isCreating && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <div className="flex-1">
                  <p className="font-semibold">Creating Data Room...</p>
                  <p className="text-sm text-muted-foreground">
                    Uploading {completedCount} of {queuedFiles.length} files
                  </p>
                </div>
                <span className="text-2xl font-bold text-primary">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Action Button */}
          {!isCreating && (
            <Button
              onClick={uploadAndProcess}
              disabled={!companyName.trim() || queuedFiles.length === 0}
              className="w-full gap-3 h-14 text-lg rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
              size="lg"
            >
              <Sparkles className="w-5 h-5" />
              Create Data Room & Analyse
            </Button>
          )}

          <p className="text-xs text-muted-foreground text-center max-w-md mx-auto">
            Our AI will extract and analyze all documents to generate a comprehensive 
            due diligence memorandum with key metrics, red flags, and investment insights.
          </p>
        </div>
      </div>
    </div>
  );
}
