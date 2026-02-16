import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Calculator, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const MAX_WEEKLY_PER_PROJECT = 12.5;
const MAX_MONTHLY_PER_PROJECT = 50;
const MARKUP = 1.2;

const ANCHORS: [number, number][] = [
  [1, 333.33],
  [4, 333.33],
  [12.5, 200],
  [50, 133.33],
];

function getRate(hours: number): number {
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

export default function PublicRateCard() {
  const [hours, setHours] = useState(10);
  const rate = getRate(hours) * MARKUP;
  const total = hours * rate;
  const weeksNeeded = hours / MAX_WEEKLY_PER_PROJECT;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Consulting Rate Card</h1>
          <p className="text-muted-foreground">Engagement pricing overview</p>
        </div>

        <Separator />

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

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rate</p>
                <p className="text-2xl font-bold text-foreground">{formatEur(rate)}<span className="text-lg font-normal text-muted-foreground">/h</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{formatEur(total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rate Card
            </CardTitle>
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
                    const rate = getRate(h) * MARKUP;
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
                        <td className="py-3 px-4 text-right">{formatEur(rate)}/h</td>
                        <td className="py-3 pl-4 text-right font-medium">{formatEur(h * rate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Methodology */}
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
                ensuring availability for concurrent projects and consistent delivery quality. 
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
                <li><strong className="text-foreground">Weekly (12.5h):</strong> €{getRate(12.5) * MARKUP}/h — sprint-based or weekly retainer</li>
                <li><strong className="text-foreground">Monthly (50h):</strong> €{ANCHORS[ANCHORS.length - 1][1] * MARKUP}/h — embedded consulting, ongoing delivery</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-1">Interpolation</h4>
              <p>
                For engagements between anchor points, the rate is calculated using <strong className="text-foreground">linear interpolation</strong>, 
                providing a smooth and predictable pricing curve. The rate for any number of hours between 
                1 and 50 can be read directly from the Rate Card above.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground pt-4">
          All prices in EUR, excluding VAT where applicable.
        </div>
      </div>
    </div>
  );
}
