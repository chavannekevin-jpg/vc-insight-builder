import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Sparkles
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCreateDataRoom, useAddDataRoomFile } from "@/hooks/useDataRoom";
import { cn } from "@/lib/utils";
import type { DataRoomFile } from "@/types/dataRoom";

interface DataRoomUploadProps {
  investorId: string;
  onBack: () => void;
  onRoomCreated: (roomId: string) => void;
}

interface QueuedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

const SUPPORTED_TYPES = {
  'application/pdf': { icon: FileText, label: 'PDF' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileSpreadsheet, label: 'Excel' },
  'application/vnd.ms-excel': { icon: FileSpreadsheet, label: 'Excel' },
  'text/csv': { icon: FileSpreadsheet, label: 'CSV' },
  'image/png': { icon: Image, label: 'Image' },
  'image/jpeg': { icon: Image, label: 'Image' },
  'image/webp': { icon: Image, label: 'Image' },
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILES = 15;

export function DataRoomUpload({ investorId, onBack, onRoomCreated }: DataRoomUploadProps) {
  const [companyName, setCompanyName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const createRoom = useCreateDataRoom(investorId);
  const addFile = useAddDataRoomFile(null);

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

    try {
      // 1. Create the data room
      const room = await createRoom.mutateAsync(companyName.trim());
      
      // 2. Get auth for storage upload
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // 3. Upload files sequentially
      for (let i = 0; i < queuedFiles.length; i++) {
        const qf = queuedFiles[i];
        
        setQueuedFiles(prev => prev.map(f => 
          f.id === qf.id ? { ...f, status: 'uploading' } : f
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
            f.id === qf.id ? { ...f, status: 'completed' } : f
          ));
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

  const allCompleted = queuedFiles.length > 0 && queuedFiles.every(f => f.status === 'completed');
  const hasErrors = queuedFiles.some(f => f.status === 'error');

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} disabled={isCreating}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Create Data Room</h2>
            <p className="text-sm text-muted-foreground/80 mt-0.5">
              Upload documents for comprehensive due diligence analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              placeholder="e.g., Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isCreating}
              className="max-w-sm"
            />
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 transition-all duration-200",
              isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border hover:border-primary/50 hover:bg-muted/20",
              isCreating && "pointer-events-none opacity-50"
            )}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                <FolderOpen className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Drop files here</h3>
              <p className="text-sm text-muted-foreground mb-4">
                PDF, Excel, CSV, or images (max {MAX_FILE_SIZE / 1024 / 1024}MB each)
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
                <Button asChild variant="outline" size="sm" className="cursor-pointer">
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Browse Files
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {/* File Queue */}
          {queuedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Documents ({queuedFiles.length})</Label>
                {!isCreating && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQueuedFiles([])}
                    className="text-muted-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {queuedFiles.map((qf) => {
                  const Icon = getFileIcon(qf.file.type);
                  return (
                    <div
                      key={qf.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                    >
                      <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{qf.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(qf.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      {qf.status === 'pending' && !isCreating && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(qf.id)}
                          className="shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      {qf.status === 'uploading' && (
                        <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                      )}
                      {qf.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      )}
                      {qf.status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={uploadAndProcess}
            disabled={!companyName.trim() || queuedFiles.length === 0 || isCreating}
            className="w-full gap-2"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Data Room...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Create Data Room & Analyse
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Once uploaded, our AI will extract and analyse all documents to generate
            a comprehensive due diligence memorandum.
          </p>
        </div>
      </div>
    </div>
  );
}
