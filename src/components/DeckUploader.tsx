import { useState, useCallback } from 'react';
import { Upload, FileText, Image, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DeckUploaderProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  acceptedFormats?: string[];
  maxSizeMB?: number;
}

export const DeckUploader = ({
  onFileSelect,
  isUploading = false,
  acceptedFormats = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'],
  maxSizeMB = 5
}: DeckUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return false;
    }

    // Check file type
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    const validExtensions = acceptedFormats.map(f => f.toLowerCase());
    if (!validExtensions.includes(fileExt)) {
      setError(`Invalid file type. Accepted formats: ${acceptedFormats.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect, acceptedFormats, maxSizeMB]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setError(null);
  };

  const getFileIcon = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || ext === 'pptx') return <FileText className="w-8 h-8 text-primary" />;
    return <Image className="w-8 h-8 text-primary" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer",
            "hover:border-primary/50 hover:bg-primary/5",
            dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25",
            error && "border-destructive"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          <div className="flex flex-col items-center gap-4 text-center">
            <div className={cn(
              "p-4 rounded-full transition-colors",
              dragActive ? "bg-primary/20" : "bg-muted"
            )}>
              <Upload className={cn(
                "w-8 h-8 transition-colors",
                dragActive ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            
            <div>
              <p className="text-lg font-medium">
                {dragActive ? 'Drop your deck here' : 'Upload your pitch deck'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag & drop or click to browse
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {['PDF', 'PNG', 'JPG'].map(format => (
                <span
                  key={format}
                  className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground"
                >
                  {format}
                </span>
              ))}
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">
                Maximum file size: {maxSizeMB}MB
              </p>
              <p className="text-xs text-muted-foreground/70">
                File too large? Compress it with{' '}
                <a 
                  href="https://www.ilovepdf.com/compress_pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  ILovePDF
                </a>
                {' '}or{' '}
                <a 
                  href="https://smallpdf.com/compress-pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  Smallpdf
                </a>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-xl p-4 bg-muted/30">
          <div className="flex items-center gap-4">
            {getFileIcon(selectedFile)}
            
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSelection}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};
