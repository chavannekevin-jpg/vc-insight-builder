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
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { Users, Building2, TrendingUp, Calendar } from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

interface DailyStats {
  date: string;
  users: number;
  companies: number;
}

interface StatsData {
  totalUsers: number;
  totalCompanies: number;
  usersLast7Days: number;
  companiesLast7Days: number;
  dailyData: DailyStats[];
}

export const AdminStatsCard = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const thirtyDaysAgo = subDays(new Date(), 30);
      const sevenDaysAgo = subDays(new Date(), 7);

      // Fetch all profiles (user signups)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, created_at")
        .order("created_at", { ascending: true });

      if (profilesError) throw profilesError;

      // Fetch all companies
      const { data: companies, error: companiesError } = await supabase
        .from("companies")
        .select("id, created_at")
        .order("created_at", { ascending: true });

      if (companiesError) throw companiesError;

      // Calculate totals
      const totalUsers = profiles?.length || 0;
      const totalCompanies = companies?.length || 0;

      // Count last 7 days
      const usersLast7Days = (profiles || []).filter(
        p => new Date(p.created_at) >= sevenDaysAgo
      ).length;
      
      const companiesLast7Days = (companies || []).filter(
        c => new Date(c.created_at) >= sevenDaysAgo
      ).length;

      // Generate daily data for last 30 days
      const days = eachDayOfInterval({
        start: thirtyDaysAgo,
        end: new Date()
      });

      const dailyData: DailyStats[] = days.map(day => {
        const dayStart = startOfDay(day);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const usersOnDay = (profiles || []).filter(p => {
          const createdAt = new Date(p.created_at);
          return createdAt >= dayStart && createdAt < dayEnd;
        }).length;

        const companiesOnDay = (companies || []).filter(c => {
          const createdAt = new Date(c.created_at);
          return createdAt >= dayStart && createdAt < dayEnd;
        }).length;

        return {
          date: format(day, "MMM d"),
          users: usersOnDay,
          companies: companiesOnDay
        };
      });

      setStats({
        totalUsers,
        totalCompanies,
        usersLast7Days,
        companiesLast7Days,
        dailyData
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
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

  if (!stats) {
    return null;
  }

  const chartConfig = {
    users: {
      label: "User Signups",
      color: "hsl(var(--primary))"
    },
    companies: {
      label: "Companies Created",
      color: "hsl(var(--chart-2))"
    }
  };

  return (
    <ModernCard className="col-span-full">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Platform Statistics</h2>
            <p className="text-sm text-muted-foreground">User signups & company creation over time</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
          </div>

          <div className="p-4 rounded-lg bg-chart-2/5 border border-chart-2/10">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-chart-2" />
              <span className="text-xs text-muted-foreground">Total Companies</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalCompanies}</p>
          </div>

          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Users (7 days)</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.usersLast7Days}</p>
          </div>

          <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Companies (7 days)</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.companiesLast7Days}</p>
          </div>
        </div>

        {/* Timeline Chart */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Last 30 Days Activity</h3>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={stats.dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                width={30}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="users" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                name="User Signups"
              />
              <Bar 
                dataKey="companies" 
                fill="hsl(var(--chart-2))" 
                radius={[4, 4, 0, 0]}
                name="Companies"
              />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Recent Activity List */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Signups Summary</h3>
          <div className="space-y-2">
            {stats.dailyData.slice(-7).reverse().map((day, index) => (
              <div 
                key={day.date} 
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 text-sm"
              >
                <span className="text-muted-foreground">{day.date}</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium">{day.users}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-chart-2" />
                    <span className="font-medium">{day.companies}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModernCard>
  );
};
