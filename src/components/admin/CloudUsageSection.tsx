import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, HardDrive, Server, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TableStat {
  table_name: string;
  row_count: number;
  size_bytes: number;
  size_pretty: string;
}

interface StorageStat {
  bucket_id: string;
  bucket_name: string;
  file_count: number;
  total_size_bytes: number;
  total_size_pretty: string;
}

interface EdgeFnStat {
  name: string;
  calls: number;
  errors: number;
  avgDuration: number;
  lastCalled: string;
}

interface CloudUsageData {
  database: TableStat[];
  storage: StorageStat[];
  edgeFunctions: EdgeFnStat[];
}

export function CloudUsageSection() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["cloud-usage-stats"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("cloud-usage-stats", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.error) throw res.error;
      return res.data as CloudUsageData;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalRows = data?.database?.reduce((sum, t) => sum + t.row_count, 0) || 0;
  const totalDbSize = data?.database?.reduce((sum, t) => sum + t.size_bytes, 0) || 0;
  const totalFiles = data?.storage?.reduce((sum, s) => sum + s.file_count, 0) || 0;
  const totalStorageSize = data?.storage?.reduce((sum, s) => sum + s.total_size_bytes, 0) || 0;
  const totalEdgeCalls = data?.edgeFunctions?.reduce((sum, e) => sum + e.calls, 0) || 0;

  function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Cloud Usage</h2>
          <p className="text-muted-foreground text-sm">Database, storage, and backend function metrics</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="w-4 h-4" /> Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalRows.toLocaleString()} rows</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(totalDbSize)} across {data?.database?.length || 0} tables
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <HardDrive className="w-4 h-4" /> Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalFiles.toLocaleString()} files</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(totalStorageSize)} across {data?.storage?.length || 0} buckets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Server className="w-4 h-4" /> Edge Functions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalEdgeCalls.toLocaleString()} calls</p>
            <p className="text-xs text-muted-foreground mt-1">
              {data?.edgeFunctions?.length || 0} functions tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Database Tables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Database Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table</TableHead>
                <TableHead className="text-right">Rows</TableHead>
                <TableHead className="text-right">Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.database || []).map((t) => (
                <TableRow key={t.table_name}>
                  <TableCell className="font-mono text-sm">{t.table_name}</TableCell>
                  <TableCell className="text-right">{t.row_count.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{t.size_pretty}</TableCell>
                </TableRow>
              ))}
              {(!data?.database || data.database.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No table data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Storage Buckets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Storage Buckets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bucket</TableHead>
                <TableHead className="text-right">Files</TableHead>
                <TableHead className="text-right">Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.storage || []).map((s) => (
                <TableRow key={s.bucket_id}>
                  <TableCell className="font-mono text-sm">{s.bucket_name}</TableCell>
                  <TableCell className="text-right">{s.file_count.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{s.total_size_pretty}</TableCell>
                </TableRow>
              ))}
              {(!data?.storage || data.storage.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No storage data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edge Functions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Edge Function Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Function</TableHead>
                <TableHead className="text-right">Calls</TableHead>
                <TableHead className="text-right">Avg Duration</TableHead>
                <TableHead className="text-right">Errors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.edgeFunctions || []).map((fn) => (
                <TableRow key={fn.name}>
                  <TableCell className="font-medium text-sm">{fn.name}</TableCell>
                  <TableCell className="text-right">{fn.calls.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{(fn.avgDuration / 1000).toFixed(1)}s</TableCell>
                  <TableCell className="text-right">
                    {fn.errors > 0 ? (
                      <Badge variant="destructive">{fn.errors}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(!data?.edgeFunctions || data.edgeFunctions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No edge function data yet. Data appears once AI functions are called.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
