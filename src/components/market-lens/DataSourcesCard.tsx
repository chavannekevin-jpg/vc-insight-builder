import { Database, FileText, ExternalLink } from "lucide-react";

interface DataSourcesCardProps {
  sourcesCount: number;
  sourcesList: string[];
}

export function DataSourcesCard({ sourcesCount, sourcesList }: DataSourcesCardProps) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
          <Database className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-medium text-foreground">Data Sources</h3>
            <p className="text-sm text-muted-foreground">
              This analysis is synthesized from {sourcesCount} reports in the Knowledge Base
            </p>
          </div>
          
          {sourcesList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sourcesList.map((source, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-xs"
                >
                  <FileText className="w-3 h-3 text-muted-foreground" />
                  <span className="text-foreground">{source}</span>
                </div>
              ))}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground/70">
            Data is automatically updated as new reports are added to the platform.
          </p>
        </div>
      </div>
    </div>
  );
}
