import { ModernCard } from "@/components/ModernCard";
import { Badge } from "@/components/ui/badge";

export function KnowledgeBaseIntro() {
  return (
    <ModernCard>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">What happens when you upload a report?</h2>
          <Badge variant="secondary">Admin-only</Badge>
        </div>

        <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
          <li>
            We create a draft Knowledge Base source record (title/publisher/region) and upload the PDF to private file storage.
          </li>
          <li>
            A backend processing job reads the PDF, extracts structured venture benchmarks + market notes, and writes them into the database.
          </li>
          <li>
            If extraction succeeds, the source is automatically marked <span className="font-medium text-foreground">Active</span>.
          </li>
          <li>
            Only <span className="font-medium text-foreground">Active</span> sources are pulled into memo generation prompts (so the AI cites real data).
          </li>
        </ol>

        <p className="text-xs text-muted-foreground">
          Tip: If a source stays in Draft, it’s saved but not used by the AI until it’s parsed and activated.
        </p>
      </div>
    </ModernCard>
  );
}
