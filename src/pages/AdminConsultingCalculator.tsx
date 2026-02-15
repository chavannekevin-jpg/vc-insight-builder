import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Euro, TrendingDown, Calculator } from "lucide-react";

const WEEKLY_HOURS = 37.5;
const MAX_SINGLE_PROJECT_WEEKLY = WEEKLY_HOURS / 3; // 12.5h
const MARKUP = 1.2;

// Anchor points: [hours, floorRate]
const ANCHORS: [number, number][] = [
  [1, 250],
  [4, 250],
  [37.5, 150],
  [150, 100],
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

function hoursLabel(h: number): string {
  if (h < WEEKLY_HOURS) return `${h}h`;
  const weeks = h / WEEKLY_HOURS;
  if (weeks < 4) return `${h}h (~${weeks.toFixed(1)} weeks)`;
  const months = h / 150;
  return `${h}h (~${months.toFixed(1)} months)`;
}

export default function AdminConsultingCalculator() {
  const [hours, setHours] = useState(10);

  const floorRate = getFloorRate(hours);
  const listedRate = floorRate * MARKUP;
  const totalListed = hours * listedRate;
  const totalFloor = hours * floorRate;
  const negotiationSpread = totalListed - totalFloor;

  const weeksNeeded = hours / WEEKLY_HOURS;
  const weeklyHours = weeksNeeded >= 1 ? hours / weeksNeeded : hours;
  const exceedsCapacity = weeklyHours > MAX_SINGLE_PROJECT_WEEKLY && hours > MAX_SINGLE_PROJECT_WEEKLY;

  return (
    <AdminLayout title="Consulting Rate Calculator">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Slider Section */}
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
                <span className="text-3xl font-bold text-foreground">{hoursLabel(hours)}</span>
                <span className="text-sm text-muted-foreground">
                  {weeksNeeded.toFixed(1)} weeks
                </span>
              </div>
              <Slider
                value={[hours]}
                onValueChange={([v]) => setHours(v)}
                min={1}
                max={150}
                step={0.5}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1h (advisory)</span>
                <span>37.5h (1 week)</span>
                <span>150h (1 month)</span>
              </div>
            </div>

            {/* Capacity Warning */}
            {exceedsCapacity && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Exceeds 1/3 rule</p>
                  <p className="text-sm text-muted-foreground">
                    This project requires ~{weeklyHours.toFixed(1)}h/week, exceeding the {MAX_SINGLE_PROJECT_WEEKLY}h/week cap per single project.
                  </p>
                </div>
              </div>
            )}
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
              For a <span className="font-semibold text-foreground">{hoursLabel(hours)}</span> engagement, quote{" "}
              <span className="font-semibold text-foreground">{formatEur(listedRate)}/h</span> (total{" "}
              <span className="font-semibold text-foreground">{formatEur(totalListed)}</span>). Floor:{" "}
              <span className="font-semibold text-foreground">{formatEur(floorRate)}/h</span> ({formatEur(totalFloor)}).
            </p>
          </CardContent>
        </Card>

        {/* Reference Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Rate Card Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Engagement</th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">Listed</th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">Floor</th>
                    <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Total (listed)</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 4, 10, 20, 37.5, 75, 150].map((h) => {
                    const fr = getFloorRate(h);
                    const lr = fr * MARKUP;
                    return (
                      <tr key={h} className="border-b last:border-0">
                        <td className="py-2 pr-4">{hoursLabel(h)}</td>
                        <td className="py-2 px-4 text-right">{formatEur(lr)}/h</td>
                        <td className="py-2 px-4 text-right">{formatEur(fr)}/h</td>
                        <td className="py-2 pl-4 text-right">{formatEur(h * lr)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
