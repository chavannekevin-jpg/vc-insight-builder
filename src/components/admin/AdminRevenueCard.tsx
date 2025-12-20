import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ModernCard } from "@/components/ModernCard";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  BarChart,
  Bar
} from "recharts";
import { DollarSign, TrendingUp, Tag, Users } from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

interface DailyRevenue {
  date: string;
  revenue: number;
  count: number;
}

interface RevenueData {
  totalRevenue: number;
  last7DaysRevenue: number;
  last30DaysRevenue: number;
  avgTransactionValue: number;
  totalTransactions: number;
  discountCodeUsage: number;
  dailyData: DailyRevenue[];
}

export const AdminRevenueCard = () => {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const thirtyDaysAgo = subDays(new Date(), 30);
      const sevenDaysAgo = subDays(new Date(), 7);

      // Fetch all purchases
      const { data: purchases, error } = await supabase
        .from("memo_purchases")
        .select("amount_paid, created_at, discount_code_used")
        .order("created_at", { ascending: true });

      if (error) throw error;

      const allPurchases = purchases || [];
      
      const totalRevenue = allPurchases.reduce((sum, p) => sum + Number(p.amount_paid), 0);
      const totalTransactions = allPurchases.length;
      const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      const last7Days = allPurchases.filter(p => new Date(p.created_at) >= sevenDaysAgo);
      const last7DaysRevenue = last7Days.reduce((sum, p) => sum + Number(p.amount_paid), 0);

      const last30Days = allPurchases.filter(p => new Date(p.created_at) >= thirtyDaysAgo);
      const last30DaysRevenue = last30Days.reduce((sum, p) => sum + Number(p.amount_paid), 0);

      const discountCodeUsage = allPurchases.filter(p => p.discount_code_used).length;

      // Generate daily data for last 30 days
      const days = eachDayOfInterval({
        start: thirtyDaysAgo,
        end: new Date()
      });

      const dailyData: DailyRevenue[] = days.map(day => {
        const dayStart = startOfDay(day);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const dayPurchases = allPurchases.filter(p => {
          const createdAt = new Date(p.created_at);
          return createdAt >= dayStart && createdAt < dayEnd;
        });

        return {
          date: format(day, "MMM d"),
          revenue: dayPurchases.reduce((sum, p) => sum + Number(p.amount_paid), 0),
          count: dayPurchases.length,
        };
      });

      setData({
        totalRevenue,
        last7DaysRevenue,
        last30DaysRevenue,
        avgTransactionValue,
        totalTransactions,
        discountCodeUsage,
        dailyData,
      });
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ModernCard className="col-span-full">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </ModernCard>
    );
  }

  if (!data) {
    return null;
  }

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-3))"
    },
  };

  return (
    <ModernCard className="col-span-full">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Revenue Analytics</h2>
            <p className="text-sm text-muted-foreground">Purchase history and revenue trends</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${data.totalRevenue.toFixed(2)}</p>
          </div>

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Last 7 Days</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${data.last7DaysRevenue.toFixed(2)}</p>
          </div>

          <div className="p-4 rounded-lg bg-chart-2/5 border border-chart-2/10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-chart-2" />
              <span className="text-xs text-muted-foreground">Last 30 Days</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${data.last30DaysRevenue.toFixed(2)}</p>
          </div>

          <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Avg Transaction</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${data.avgTransactionValue.toFixed(2)}</p>
          </div>

          <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Discount Uses</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{data.discountCodeUsage}</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Daily Revenue (Last 30 Days)</h3>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={data.dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent formatter={(value) => `$${Number(value).toFixed(2)}`} />} 
              />
              <Area 
                type="monotone"
                dataKey="revenue" 
                fill="hsl(var(--chart-3))" 
                fillOpacity={0.2}
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                name="Revenue"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
    </ModernCard>
  );
};
