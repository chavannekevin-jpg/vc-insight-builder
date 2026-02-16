import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Euro, TrendingDown, Calculator, FileText, ExternalLink, Copy } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const MAX_WEEKLY_PER_PROJECT = 12.5; // 1/3 of 37.5h week
const MAX_MONTHLY_PER_PROJECT = 50; // 1/3 of ~150h month
const MARKUP = 1.2;

// Anchor points: [hours, floorRate]
const ANCHORS: [number, number][] = [
  [1, 333.33],
  [4, 333.33],
  [12.5, 200],   // 1 week at 1/3 capacity
  [50, 133.33],  // 1 month at 1/3 capacity
];

function getFloorRate(hours: number): number {
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const [h1, r1] = ANCHORS[i];
    const [h2, r2] = ANCHORS[i + 1];
    if (hours >= h1 && hours <= h2) {
      const t = (hours - h1) / (h2 - h1);
      return r1 + t * (r2 - r1);
    }
  }
  return ANCHORS[ANCHORS.length - 1][1];
}

function formatEur(n: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function durationLabel(h: number): string {
  if (h <= 4) return `${h}h`;
  const weeks = h / MAX_WEEKLY_PER_PROJECT;
  if (weeks <= 4) return `${h}h (~${weeks.toFixed(1)} weeks)`;
  const months = h / MAX_MONTHLY_PER_PROJECT;
  return `${h}h (~${months.toFixed(1)} months)`;
}

const RATE_TABLE = [1, 2, 4, 8, 12.5, 25, 37.5, 50];

export default function AdminConsultingCalculator() {
  const [hours, setHours] = useState(10);

  const floorRate = getFloorRate(hours);
  const listedRate = floorRate * MARKUP;
  const totalListed = hours * listedRate;
  const totalFloor = hours * floorRate;
  const negotiationSpread = totalListed - totalFloor;
  const weeksNeeded = hours / MAX_WEEKLY_PER_PROJECT;

  const publicUrl = `${window.location.origin}/rate-card`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copied to clipboard");
  };

  return (
    <AdminLayout title="Consulting Rate Calculator">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Share bar */}
        <div className="flex items-center gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="h-4 w-4 mr-1" />
            Copy link
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/rate-card" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              Preview public page
            </a>
          </Button>
        </div>

        {/* Slider */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Engagement Size
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-bold text-foreground">{durationLabel(hours)}</span>
                <span className="text-sm text-muted-foreground">
                  {weeksNeeded.toFixed(1)} weeks
                </span>
              </div>
              <Slider
                value={[hours]}
                onValueChange={([v]) => setHours(v)}
                min={1}
                max={50}
                step={0.5}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1h (advisory)</span>
                <span>12.5h (1 week)</span>
                <span>50h (1 month)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Listed Rate (quote this)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{formatEur(listedRate)}<span className="text-lg font-normal text-muted-foreground">/h</span></p>
              <p className="text-sm text-muted-foreground mt-1">Total: {formatEur(totalListed)}</p>
            </CardContent>
          </Card>

          <Card className="border-accent/30 bg-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Floor Rate (minimum)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{formatEur(floorRate)}<span className="text-lg font-normal text-muted-foreground">/h</span></p>
              <p className="text-sm text-muted-foreground mt-1">Total: {formatEur(totalFloor)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Negotiation Range */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Negotiation buffer</p>
                <p className="text-xl font-bold text-foreground">{formatEur(negotiationSpread)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">20% markup built in</p>
                <p className="text-sm text-muted-foreground">
                  {formatEur(listedRate)}/h → {formatEur(floorRate)}/h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed">
              For a <span className="font-semibold text-foreground">{durationLabel(hours)}</span> engagement, quote{" "}
              <span className="font-semibold text-foreground">{formatEur(listedRate)}/h</span> (total{" "}
              <span className="font-semibold text-foreground">{formatEur(totalListed)}</span>). Floor:{" "}
              <span className="font-semibold text-foreground">{formatEur(floorRate)}/h</span> ({formatEur(totalFloor)}).
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* === RATE CARD FOR SCREENSHOTS === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rate Card
            </CardTitle>
            <p className="text-sm text-muted-foreground">Reference table for quotes &amp; contracts</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 font-semibold text-foreground">Engagement</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Duration</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Rate / hour</th>
                    <th className="text-right py-3 pl-4 font-semibold text-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {RATE_TABLE.map((h) => {
                    const fr = getFloorRate(h);
                    const lr = fr * MARKUP;
                    const weeks = h / MAX_WEEKLY_PER_PROJECT;
                    let duration = `${h}h`;
                    if (h === 12.5) duration = "1 week";
                    else if (h === 25) duration = "2 weeks";
                    else if (h === 37.5) duration = "3 weeks";
                    else if (h === 50) duration = "1 month";
                    else if (weeks >= 1) duration = `~${weeks.toFixed(1)} weeks`;
                    return (
                      <tr key={h} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">{h}h</td>
                        <td className="py-3 px-4 text-muted-foreground">{duration}</td>
                        <td className="py-3 px-4 text-right">{formatEur(lr)}/h</td>
                        <td className="py-3 pl-4 text-right font-medium">{formatEur(h * lr)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* === METHODOLOGY EXPLANATION === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Pricing Methodology
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Capacity Allocation</h4>
              <p>
                Each client engagement is capped at <strong className="text-foreground">1/3 of total weekly capacity</strong> (12.5h out of 37.5h), 
                ensuring availability for concurrent projects and reducing single-client dependency risk. 
                A one-month engagement therefore represents up to 50 billable hours.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-1">Rate Structure</h4>
              <p>
                Rates follow a <strong className="text-foreground">volume-based sliding scale</strong>. 
                Short advisory engagements (1–4h) are priced at the premium rate to account for context-switching 
                and preparation overhead. Longer engagements benefit from reduced per-hour pricing as commitment increases:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong className="text-foreground">Advisory (1–4h):</strong> €{ANCHORS[0][1] * MARKUP}/h — spot consulting, reviews, workshops</li>
                <li><strong className="text-foreground">Weekly (12.5h):</strong> €{getFloorRate(12.5) * MARKUP}/h — sprint-based or weekly retainer</li>
                <li><strong className="text-foreground">Monthly (50h):</strong> €{ANCHORS[ANCHORS.length - 1][1] * MARKUP}/h — embedded consulting, ongoing delivery</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-1">Interpolation</h4>
              <p>
                For engagements between anchor points, the rate is calculated using <strong className="text-foreground">linear interpolation</strong>, 
                providing a smooth and predictable pricing curve. The quoted rate for any number of hours between 
                1 and 50 can be read directly from the Rate Card above.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-1">Negotiation Buffer</h4>
              <p>
                All listed rates include a <strong className="text-foreground">20% negotiation margin</strong>. 
                The listed rate is the initial quote; the floor rate represents the minimum acceptable rate after negotiation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
