import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Loader2,
  Briefcase,
  Phone,
  Handshake,
  Trophy,
  XCircle,
  MoreVertical,
  Trash2,
  Building2,
  User,
  Mail,
  TrendingUp,
  BarChart3,
  PieChart,
  List,
  LayoutGrid,
  Zap,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Gauge,
} from "lucide-react";
import {
  useBusinessOpportunities,
  useCreateOpportunity,
  useUpdateOpportunity,
  useDeleteOpportunity,
  BusinessOpportunity,
  OpportunityStatus,
  CurrencyCode,
} from "@/hooks/useBusinessOpportunities";
import { formatDistanceToNow, differenceInDays, subDays, isAfter } from "date-fns";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<OpportunityStatus, { label: string; icon: any; color: string; glowColor: string }> = {
  lead: { label: "Lead", icon: Briefcase, color: "text-blue-400 bg-blue-500/20 border-blue-500/30", glowColor: "shadow-blue-500/20" },
  contacted: { label: "Contacted", icon: Phone, color: "text-purple-400 bg-purple-500/20 border-purple-500/30", glowColor: "shadow-purple-500/20" },
  negotiating: { label: "Negotiating", icon: Handshake, color: "text-amber-400 bg-amber-500/20 border-amber-500/30", glowColor: "shadow-amber-500/20" },
  won: { label: "Won", icon: Trophy, color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30", glowColor: "shadow-emerald-500/20" },
  lost: { label: "Lost", icon: XCircle, color: "text-rose-400 bg-rose-500/20 border-rose-500/30", glowColor: "shadow-rose-500/20" },
};

const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; locale: string }> = {
  USD: { symbol: "$", locale: "en-US" },
  EUR: { symbol: "€", locale: "de-DE" },
  CHF: { symbol: "CHF", locale: "de-CH" },
};

type ViewMode = "kanban" | "list" | "analytics";

interface BusinessCRMViewProps {
  userId?: string | null;
}

const BusinessCRMView = ({ userId }: BusinessCRMViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<BusinessOpportunity | null>(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    company_name: "",
    contact_name: "",
    contact_email: "",
    value_estimate: "",
    currency: "USD" as CurrencyCode,
    status: "lead" as OpportunityStatus,
    notes: "",
  });

  const { data: opportunities = [], isLoading } = useBusinessOpportunities(userId || null);
  const createOpportunity = useCreateOpportunity(userId || null);
  const updateOpportunity = useUpdateOpportunity(userId || null);
  const deleteOpportunity = useDeleteOpportunity(userId || null);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(
      (opp) =>
        opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [opportunities, searchQuery]);

  const groupedOpportunities = useMemo(
    () => ({
      lead: filteredOpportunities.filter((o) => o.status === "lead"),
      contacted: filteredOpportunities.filter((o) => o.status === "contacted"),
      negotiating: filteredOpportunities.filter((o) => o.status === "negotiating"),
      won: filteredOpportunities.filter((o) => o.status === "won"),
      lost: filteredOpportunities.filter((o) => o.status === "lost"),
    }),
    [filteredOpportunities]
  );

  // Enhanced analytics calculations
  const analytics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);
    
    // Basic stats
    const totalValue = opportunities.reduce((sum, opp) => sum + (opp.value_estimate || 0), 0);
    const wonOpps = opportunities.filter(o => o.status === "won");
    const lostOpps = opportunities.filter(o => o.status === "lost");
    const activeOpps = opportunities.filter(o => !["won", "lost"].includes(o.status));
    
    const wonValue = wonOpps.reduce((sum, opp) => sum + (opp.value_estimate || 0), 0);
    const lostValue = lostOpps.reduce((sum, opp) => sum + (opp.value_estimate || 0), 0);
    const pipelineValue = activeOpps.reduce((sum, opp) => sum + (opp.value_estimate || 0), 0);
    
    const closedOpps = [...wonOpps, ...lostOpps];
    const winRate = closedOpps.length > 0 ? (wonOpps.length / closedOpps.length) * 100 : 0;
    
    // Velocity: deals closed in last 30 days
    const recentWins = wonOpps.filter(o => isAfter(new Date(o.updated_at), thirtyDaysAgo));
    const recentWinValue = recentWins.reduce((sum, o) => sum + (o.value_estimate || 0), 0);
    
    // Previous period for comparison
    const previousWins = wonOpps.filter(o => 
      isAfter(new Date(o.updated_at), sixtyDaysAgo) && 
      !isAfter(new Date(o.updated_at), thirtyDaysAgo)
    );
    const previousWinValue = previousWins.reduce((sum, o) => sum + (o.value_estimate || 0), 0);
    const velocityChange = previousWinValue > 0 ? ((recentWinValue - previousWinValue) / previousWinValue) * 100 : 0;
    
    // Average deal size
    const avgDealSize = wonOpps.length > 0 ? wonValue / wonOpps.length : 0;
    
    // Average days to close (from created to won)
    const avgDaysToClose = wonOpps.length > 0
      ? wonOpps.reduce((sum, o) => sum + differenceInDays(new Date(o.updated_at), new Date(o.created_at)), 0) / wonOpps.length
      : 0;
    
    // Conversion rates by stage
    const totalLeads = opportunities.length;
    const conversionRates = {
      leadToContacted: totalLeads > 0 ? ((opportunities.filter(o => o.status !== "lead").length / totalLeads) * 100) : 0,
      contactedToNegotiating: opportunities.filter(o => ["contacted", "negotiating", "won", "lost"].includes(o.status)).length > 0
        ? ((opportunities.filter(o => ["negotiating", "won", "lost"].includes(o.status)).length / opportunities.filter(o => ["contacted", "negotiating", "won", "lost"].includes(o.status)).length) * 100)
        : 0,
      negotiatingToWon: opportunities.filter(o => ["negotiating", "won", "lost"].includes(o.status)).length > 0
        ? ((wonOpps.length / opportunities.filter(o => ["negotiating", "won", "lost"].includes(o.status)).length) * 100)
        : 0,
    };
    
    // Weighted pipeline (probability-adjusted)
    const stageProbabilities: Record<OpportunityStatus, number> = {
      lead: 0.1,
      contacted: 0.25,
      negotiating: 0.5,
      won: 1,
      lost: 0,
    };
    const weightedPipeline = activeOpps.reduce((sum, o) => sum + (o.value_estimate || 0) * stageProbabilities[o.status], 0);
    
    // Forecast (weighted pipeline + recent win rate trend)
    const forecastMultiplier = winRate > 0 ? winRate / 100 : 0.3;
    const monthlyForecast = weightedPipeline * forecastMultiplier;
    
    // Deals aging (stale deals > 30 days without update)
    const staleDeals = activeOpps.filter(o => differenceInDays(now, new Date(o.updated_at)) > 30);
    
    return {
      totalValue,
      wonValue,
      lostValue,
      pipelineValue,
      winRate,
      recentWinValue,
      velocityChange,
      avgDealSize,
      avgDaysToClose,
      conversionRates,
      weightedPipeline,
      monthlyForecast,
      staleDeals: staleDeals.length,
      activeDeals: activeOpps.length,
      closedDeals: closedOpps.length,
    };
  }, [opportunities]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      company_name: "",
      contact_name: "",
      contact_email: "",
      value_estimate: "",
      currency: "USD",
      status: "lead",
      notes: "",
    });
    setEditingOpportunity(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (opp: BusinessOpportunity) => {
    setFormData({
      name: opp.name,
      description: opp.description || "",
      company_name: opp.company_name || "",
      contact_name: opp.contact_name || "",
      contact_email: opp.contact_email || "",
      value_estimate: opp.value_estimate?.toString() || "",
      currency: opp.currency || "USD",
      status: opp.status,
      notes: opp.notes || "",
    });
    setEditingOpportunity(opp);
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    const data = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      company_name: formData.company_name.trim() || null,
      contact_name: formData.contact_name.trim() || null,
      contact_email: formData.contact_email.trim() || null,
      value_estimate: formData.value_estimate ? parseFloat(formData.value_estimate) : null,
      currency: formData.currency,
      status: formData.status,
      notes: formData.notes.trim() || null,
    };

    if (editingOpportunity) {
      await updateOpportunity.mutateAsync({ id: editingOpportunity.id, ...data });
    } else {
      await createOpportunity.mutateAsync(data);
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleStatusChange = (id: string, status: OpportunityStatus) => {
    updateOpportunity.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    deleteOpportunity.mutate(id);
  };

  const formatValue = (value: number | null, currency: CurrencyCode = "USD") => {
    if (!value) return null;
    const config = CURRENCY_CONFIG[currency];
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const formatFullValue = (value: number, currency: CurrencyCode = "USD") => {
    const config = CURRENCY_CONFIG[currency];
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderKanbanView = () => (
    <div className="flex gap-4 min-w-max h-full pb-4">
      {(["lead", "contacted", "negotiating", "won", "lost"] as const).map((status) => {
        const config = STATUS_CONFIG[status];
        const Icon = config.icon;
        const columnValue = groupedOpportunities[status].reduce((sum, o) => sum + (o.value_estimate || 0), 0);

        return (
          <div 
            key={status} 
            className={cn(
              "w-72 rounded-xl flex flex-col min-h-[450px]",
              "bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl",
              "border border-border/50 shadow-lg",
              config.glowColor
            )}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-lg", config.color.split(" ").slice(1).join(" "))}>
                    <Icon className={cn("w-4 h-4", config.color.split(" ")[0])} />
                  </div>
                  <span className="font-semibold text-sm">{config.label}</span>
                </div>
                <Badge variant="secondary" className="text-xs font-medium">
                  {groupedOpportunities[status].length}
                </Badge>
              </div>
              {columnValue > 0 && (
                <p className="text-xs text-muted-foreground">
                  Total: <span className="font-medium text-foreground">{formatFullValue(columnValue)}</span>
                </p>
              )}
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {groupedOpportunities[status].map((opp) => (
                <div
                  key={opp.id}
                  onClick={() => handleOpenEdit(opp)}
                  className={cn(
                    "group relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4",
                    "cursor-pointer transition-all duration-200",
                    "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
                    "hover:-translate-y-0.5"
                  )}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-sm line-clamp-2">{opp.name}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          {(["lead", "contacted", "negotiating", "won", "lost"] as const)
                            .filter((s) => s !== status)
                            .map((newStatus) => {
                              const cfg = STATUS_CONFIG[newStatus];
                              const StatusIcon = cfg.icon;
                              return (
                                <DropdownMenuItem
                                  key={newStatus}
                                  onClick={() => handleStatusChange(opp.id, newStatus)}
                                >
                                  <StatusIcon className={cn("w-4 h-4 mr-2", cfg.color.split(" ")[0])} />
                                  Move to {cfg.label}
                                </DropdownMenuItem>
                              );
                            })}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(opp.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {opp.company_name && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                        <Building2 className="w-3 h-3" />
                        <span className="truncate">{opp.company_name}</span>
                      </div>
                    )}

                    {opp.description && (
                      <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-3">{opp.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      {opp.value_estimate ? (
                        <Badge className={cn("text-xs font-semibold", config.color)}>
                          {formatValue(opp.value_estimate, opp.currency)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">No value</span>
                      )}
                      <span className="text-[10px] text-muted-foreground/70">
                        {formatDistanceToNow(new Date(opp.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {groupedOpportunities[status].length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className={cn("p-3 rounded-xl mb-2", config.color.split(" ").slice(1).join(" "))}>
                    <Icon className={cn("w-5 h-5", config.color.split(" ")[0])} />
                  </div>
                  <p className="text-xs text-muted-foreground">No {config.label.toLowerCase()} deals</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 text-xs font-medium text-muted-foreground bg-muted/30 rounded-lg border border-border/30">
        <span>Opportunity</span>
        <span>Company</span>
        <span>Status</span>
        <span>Value</span>
        <span>Created</span>
        <span></span>
      </div>
      {filteredOpportunities.map((opp) => {
        const config = STATUS_CONFIG[opp.status];
        const Icon = config.icon;
        return (
          <div
            key={opp.id}
            onClick={() => handleOpenEdit(opp)}
            className={cn(
              "group grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-4",
              "bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl",
              "cursor-pointer transition-all duration-200",
              "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
              "items-center"
            )}
          >
            <div>
              <p className="font-semibold text-sm">{opp.name}</p>
              {opp.contact_name && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3" />
                  {opp.contact_name}
                </p>
              )}
            </div>
            <span className="text-sm text-muted-foreground truncate">{opp.company_name || "-"}</span>
            <Badge className={cn("text-xs w-fit border", config.color)}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
            <span className="text-sm font-semibold">
              {opp.value_estimate ? formatValue(opp.value_estimate, opp.currency) : "-"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(opp.created_at), { addSuffix: true })}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {(["lead", "contacted", "negotiating", "won", "lost"] as const)
                  .filter((s) => s !== opp.status)
                  .map((newStatus) => {
                    const cfg = STATUS_CONFIG[newStatus];
                    const StatusIcon = cfg.icon;
                    return (
                      <DropdownMenuItem
                        key={newStatus}
                        onClick={() => handleStatusChange(opp.id, newStatus)}
                      >
                        <StatusIcon className={cn("w-4 h-4 mr-2", cfg.color.split(" ")[0])} />
                        Move to {cfg.label}
                      </DropdownMenuItem>
                    );
                  })}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(opp.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
    </div>
  );

  const renderAnalyticsView = () => (
    <div className="space-y-6 pb-6">
      {/* Hero Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pipeline Value */}
        <div className="relative overflow-hidden bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium">Active Pipeline</span>
            </div>
            <p className="text-3xl font-bold tracking-tight">{formatFullValue(analytics.pipelineValue)}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.activeDeals} active opportunities
            </p>
          </div>
        </div>
        
        {/* Won */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-card/50 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-5 shadow-lg shadow-emerald-500/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Trophy className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-emerald-400">Won Revenue</span>
            </div>
            <p className="text-3xl font-bold tracking-tight text-emerald-400">{formatFullValue(analytics.wonValue)}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {opportunities.filter(o => o.status === "won").length} deals closed
            </p>
          </div>
        </div>
        
        {/* Win Rate */}
        <div className="relative overflow-hidden bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium">Win Rate</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight text-primary">{analytics.winRate.toFixed(0)}%</p>
              <span className="text-xs text-muted-foreground">of closed</span>
            </div>
            <Progress value={analytics.winRate} className="mt-3 h-1.5" />
          </div>
        </div>
        
        {/* Velocity */}
        <div className="relative overflow-hidden bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-xs font-medium">30-Day Velocity</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight">{formatFullValue(analytics.recentWinValue)}</p>
              {analytics.velocityChange !== 0 && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs",
                    analytics.velocityChange > 0 ? "text-emerald-400 bg-emerald-500/20" : "text-rose-400 bg-rose-500/20"
                  )}
                >
                  {analytics.velocityChange > 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {Math.abs(analytics.velocityChange).toFixed(0)}%
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">vs previous 30 days</p>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Gauge className="w-4 h-4" />
            <span className="text-xs font-medium">Weighted Pipeline</span>
          </div>
          <p className="text-xl font-bold">{formatFullValue(analytics.weightedPipeline)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Probability-adjusted value</p>
        </div>
        
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">Forecast</span>
          </div>
          <p className="text-xl font-bold">{formatFullValue(analytics.monthlyForecast)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Expected monthly revenue</p>
        </div>
        
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-medium">Avg Deal Size</span>
          </div>
          <p className="text-xl font-bold">{formatFullValue(analytics.avgDealSize)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">From won deals</p>
        </div>
        
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Avg Time to Close</span>
          </div>
          <p className="text-xl font-bold">{analytics.avgDaysToClose.toFixed(0)} <span className="text-sm font-normal">days</span></p>
          <p className="text-[10px] text-muted-foreground mt-1">From lead to won</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              Conversion Funnel
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm text-muted-foreground">Lead → Contacted</div>
              <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${analytics.conversionRates.leadToContacted}%` }}
                />
              </div>
              <span className="w-12 text-right text-sm font-semibold">{analytics.conversionRates.leadToContacted.toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm text-muted-foreground">Contacted → Nego</div>
              <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${analytics.conversionRates.contactedToNegotiating}%` }}
                />
              </div>
              <span className="w-12 text-right text-sm font-semibold">{analytics.conversionRates.contactedToNegotiating.toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm text-muted-foreground">Nego → Won</div>
              <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${analytics.conversionRates.negotiatingToWon}%` }}
                />
              </div>
              <span className="w-12 text-right text-sm font-semibold">{analytics.conversionRates.negotiatingToWon.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Pipeline by Stage */}
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              Pipeline by Stage
            </h3>
            {analytics.staleDeals > 0 && (
              <Badge variant="secondary" className="text-xs text-amber-400 bg-amber-500/20">
                {analytics.staleDeals} stale deals
              </Badge>
            )}
          </div>
          <div className="space-y-3">
            {(["lead", "contacted", "negotiating", "won", "lost"] as const).map((status) => {
              const config = STATUS_CONFIG[status];
              const Icon = config.icon;
              const count = groupedOpportunities[status].length;
              const value = groupedOpportunities[status].reduce((sum, o) => sum + (o.value_estimate || 0), 0);
              const percentage = opportunities.length > 0 ? (count / opportunities.length) * 100 : 0;

              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-28">
                    <Icon className={cn("w-4 h-4", config.color.split(" ")[0])} />
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <div className="flex-1 h-2.5 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        status === "lead" && "bg-blue-500",
                        status === "contacted" && "bg-purple-500",
                        status === "negotiating" && "bg-amber-500",
                        status === "won" && "bg-emerald-500",
                        status === "lost" && "bg-rose-500"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                  <span className="text-sm font-semibold w-24 text-right">{formatFullValue(value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lost Value */}
      {analytics.lostValue > 0 && (
        <div className="bg-gradient-to-r from-rose-500/10 to-card/50 backdrop-blur-sm border border-rose-500/30 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20">
                <XCircle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p className="font-semibold text-rose-400">Lost Revenue</p>
                <p className="text-xs text-muted-foreground">{opportunities.filter(o => o.status === "lost").length} opportunities didn't close</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-rose-400">{formatFullValue(analytics.lostValue)}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Enhanced Toolbar */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-card/90 via-card/60 to-card/90 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Business CRM</h2>
                <p className="text-xs text-muted-foreground">
                  {opportunities.length} opportunities • {formatFullValue(analytics.pipelineValue)} pipeline
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Advanced Mode Toggle */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30 border border-border/30 backdrop-blur-sm">
              <Switch
                id="advanced-mode"
                checked={advancedMode}
                onCheckedChange={setAdvancedMode}
                className="scale-90"
              />
              <Label htmlFor="advanced-mode" className="text-xs font-medium cursor-pointer">
                Advanced
              </Label>
            </div>

            {/* View Mode Toggles (only in advanced mode) */}
            {advancedMode && (
              <div className="flex items-center bg-muted/30 border border-border/30 rounded-xl p-1">
                <Button
                  variant={viewMode === "kanban" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-lg h-8 px-3 gap-1.5"
                  onClick={() => setViewMode("kanban")}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Board</span>
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-lg h-8 px-3 gap-1.5"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">List</span>
                </Button>
                <Button
                  variant={viewMode === "analytics" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-lg h-8 px-3 gap-1.5"
                  onClick={() => setViewMode("analytics")}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Analytics</span>
                </Button>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deals..."
                className="pl-9 w-52 h-10 rounded-xl bg-muted/30 border-border/30"
              />
            </div>

            <Button size="sm" className="gap-2 h-10 px-4 rounded-xl shadow-lg shadow-primary/20" onClick={handleOpenAdd}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Deal</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5">
        {opportunities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mb-6 shadow-lg shadow-primary/10">
              <Briefcase className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Track your business opportunities</h3>
            <p className="text-muted-foreground mb-8 max-w-md">
              Add deals, partnerships, and other business opportunities to track their progress through your pipeline.
            </p>
            <Button size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/20" onClick={handleOpenAdd}>
              <Plus className="w-5 h-5" />
              Add Your First Deal
            </Button>
          </div>
        ) : advancedMode && viewMode === "list" ? (
          renderListView()
        ) : advancedMode && viewMode === "analytics" ? (
          renderAnalyticsView()
        ) : (
          renderKanbanView()
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="w-4 h-4 text-primary" />
              </div>
              {editingOpportunity ? "Edit Opportunity" : "Add Opportunity"}
            </DialogTitle>
            <DialogDescription>
              {editingOpportunity ? "Update the opportunity details" : "Track a new business opportunity in your pipeline"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Opportunity Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Partnership with Acme Corp"
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" /> Company
                </label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Company name"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Deal Value</label>
                <div className="flex gap-2">
                  <Select
                    value={formData.currency}
                    onValueChange={(value: CurrencyCode) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger className="w-[90px] h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">$ USD</SelectItem>
                      <SelectItem value="EUR">€ EUR</SelectItem>
                      <SelectItem value="CHF">CHF</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={formData.value_estimate}
                    onChange={(e) => setFormData({ ...formData, value_estimate: e.target.value })}
                    placeholder="Amount"
                    className="flex-1 h-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" /> Contact Name
                </label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="Contact person"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Contact Email
                </label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="email@example.com"
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the opportunity..."
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes, next steps, etc..."
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 h-11">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.name.trim() || createOpportunity.isPending || updateOpportunity.isPending}
                className="flex-1 h-11 shadow-lg shadow-primary/20"
              >
                {createOpportunity.isPending || updateOpportunity.isPending
                  ? "Saving..."
                  : editingOpportunity
                  ? "Save Changes"
                  : "Add Opportunity"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessCRMView;