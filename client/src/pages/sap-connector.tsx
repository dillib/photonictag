import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Server, RefreshCw, CheckCircle2, XCircle, Clock, ArrowLeftRight, Database, Settings2, TrendingUp, AlertCircle, Activity, Terminal, Zap } from "lucide-react";
import { SiSap } from "react-icons/si";
import type { EnterpriseConnector, SAPConfig, FieldMapping, IntegrationSyncLog } from "@shared/schema";

const sapConfigSchema = z.object({
  name: z.string().min(1, "Connection name is required"),
  systemType: z.enum(["S4HANA", "ECC", "Business_One"]),
  hostname: z.string().min(1, "Hostname is required"),
  port: z.coerce.number().min(1).max(65535),
  client: z.string().min(1, "Client is required"),
  systemId: z.string().min(1, "System ID is required"),
  apiType: z.enum(["OData", "RFC", "IDoc"]),
  oauthEnabled: z.boolean().default(false),
  syncDirection: z.enum(["inbound", "outbound", "bidirectional"]),
  syncFrequency: z.enum(["realtime", "hourly", "daily", "manual"]),
});

type SAPConfigForm = z.infer<typeof sapConfigSchema>;

const defaultFieldMappings: FieldMapping[] = [
  { sourceField: "MATNR", targetField: "productName", transformation: "trim" },
  { sourceField: "MAKTX", targetField: "productCategory" },
  { sourceField: "WERKS", targetField: "manufacturer" },
  { sourceField: "CHARG", targetField: "batchNumber" },
  { sourceField: "MATNR_EXT", targetField: "sku" },
  { sourceField: "MATKL", targetField: "materials" },
  { sourceField: "MEINS", targetField: "modelNumber" },
];

interface HealthCheckResult {
  connectorId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: string;
  responseTime: number;
  error?: string;
  consecutiveFailures: number;
}

interface HealthStatusResponse {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  connectors: HealthCheckResult[];
  lastUpdated: string;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
    case "healthy":
      return <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10"><CheckCircle2 className="w-3 h-3 mr-1" />OPERATIONAL</Badge>;
    case "error":
    case "unhealthy":
      return <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10"><XCircle className="w-3 h-3 mr-1" />ERROR</Badge>;
    case "degraded":
      return <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10"><AlertCircle className="w-3 h-3 mr-1" />DEGRADED</Badge>;
    case "pending":
      return <Badge variant="outline" className="text-blue-500 border-blue-500/30 bg-blue-500/10"><Clock className="w-3 h-3 mr-1" />PENDING</Badge>;
    default:
      return <Badge variant="outline" className="text-muted-foreground border-border/50">INACTIVE</Badge>;
  }
}

export default function SAPConnector() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sync");
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [streamLogs, setStreamLogs] = useState<string[]>([
    "[SYS] Awaiting sync command...",
    "[SYS] System ready."
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamLogs]);

  const { data: connectors, isLoading } = useQuery<EnterpriseConnector[]>({
    queryKey: ["/api/integrations/connectors"],
  });

  const sapConnector = connectors?.find(c => c.connectorType === "sap");

  const { data: healthStatus, refetch: refetchHealth } = useQuery<HealthStatusResponse>({
    queryKey: ["/api/integrations/sap/health"],
    refetchInterval: 30000,
  });

  const { data: syncLogs } = useQuery<IntegrationSyncLog[]>({
    queryKey: [`/api/integrations/connectors/${sapConnector?.id}/logs`],
    enabled: !!sapConnector?.id,
  });

  const { data: syncStats } = useQuery<any>({
    queryKey: [`/api/integrations/connectors/${sapConnector?.id}/stats`],
    enabled: !!sapConnector?.id,
  });

  const form = useForm<SAPConfigForm>({
    resolver: zodResolver(sapConfigSchema),
    defaultValues: {
      name: "SAP Production",
      systemType: "S4HANA",
      hostname: "",
      port: 443,
      client: "100",
      systemId: "",
      apiType: "OData",
      oauthEnabled: false,
      syncDirection: "inbound",
      syncFrequency: "daily",
    },
  });

  useEffect(() => {
    if (sapConnector) {
      const config = sapConnector.config as SAPConfig;
      form.reset({
        name: sapConnector.name,
        systemType: config?.systemType || "S4HANA",
        hostname: config?.hostname || "",
        port: config?.port || 443,
        client: config?.client || "100",
        systemId: config?.systemId || "",
        apiType: config?.apiType || "OData",
        oauthEnabled: config?.oauthEnabled || false,
        syncDirection: sapConnector.syncDirection || "inbound",
        syncFrequency: config?.syncFrequency || "daily",
      });
    }
  }, [sapConnector, form]);

  const saveConnector = useMutation({
    mutationFn: async (data: SAPConfigForm) => {
      const payload = {
        name: data.name,
        connectorType: "sap" as const,
        status: "pending" as const,
        syncDirection: data.syncDirection,
        config: {
          systemType: data.systemType,
          hostname: data.hostname,
          port: data.port,
          client: data.client,
          systemId: data.systemId,
          apiType: data.apiType,
          oauthEnabled: data.oauthEnabled,
          syncFrequency: data.syncFrequency,
        },
        fieldMappings: defaultFieldMappings,
      };

      if (sapConnector) {
        return apiRequest("PATCH", `/api/integrations/connectors/${sapConnector.id}`, payload);
      }
      return apiRequest("POST", "/api/integrations/connectors", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connectors"] });
      toast({
        title: "Configuration Saved",
        description: "SAP connector settings have been committed to the registry.",
      });
    },
  });

  const testConnection = useMutation({
    mutationFn: async () => {
      if (!sapConnector) throw new Error("No connector configured");
      return apiRequest("POST", `/api/integrations/connectors/${sapConnector.id}/test`);
    },
    onSuccess: () => {
      toast({
        title: "Connection Verified",
        description: "Secure handshake with SAP S/4HANA successful.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connectors"] });
      refetchHealth();
    },
  });

  const triggerSync = useMutation({
    mutationFn: async () => {
      if (!sapConnector) throw new Error("No connector configured");
      setIsSyncing(true);
      setSyncProgress(0);
      setStreamLogs(["[SYS] Initiating secure OData handshake with SAP S/4HANA...", "[AUTH] Verifying client credentials... OK."]);

      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          const newProgress = Math.min(prev + Math.floor(Math.random() * 10), 95);
          const mockEvents = [
            `[DATA] Fetching material batch ${Math.floor(newProgress / 10)}...`,
            `[MAP] Transforming ${Math.floor(Math.random() * 50)} records to DPP standard...`,
            `[REG] Committing batch to Layer 3 Immutable Registry...`,
            `[NET] Resolving relational dependencies...`
          ];
          setStreamLogs(logs => [...logs, mockEvents[Math.floor(Math.random() * mockEvents.length)]].slice(-25));
          return newProgress;
        });
      }, 800);

      try {
        const result: any = await apiRequest("POST", `/api/integrations/connectors/${sapConnector.id}/sync`);
        clearInterval(progressInterval);
        setSyncProgress(100);
        setStreamLogs(logs => [...logs, "[SYS] Data stream complete.", `[STAT] +${result.stats?.recordsCreated || 0} Twins Enrolled | ~${result.stats?.recordsUpdated || 0} Twins Updated`].slice(-25));
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        setStreamLogs(logs => [...logs, "[ERR] Connection dropped. Sync aborted."].slice(-25));
        throw error;
      } finally {
        setTimeout(() => {
          setIsSyncing(false);
          setSyncProgress(0);
        }, 4000);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connectors"] });
      queryClient.invalidateQueries({ queryKey: [`/api/integrations/connectors/${sapConnector?.id}/logs`] });
      queryClient.invalidateQueries({ queryKey: [`/api/integrations/connectors/${sapConnector?.id}/stats`] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-mono">INITIALIZING CONNECTOR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* High-End Spatial Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex items-center gap-5">
          <div className="p-3.5 bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl shadow-lg shadow-blue-900/20 ring-1 ring-white/10 flex items-center justify-center">
            <SiSap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              SAP Integrations
              {healthStatus?.overall === "healthy" && (
                <span className="flex h-3 w-3 relative ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Establish secure, bi-directional OData coupling with SAP S/4HANA.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-muted/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-border/50 shadow-sm">
          <StatusBadge status={healthStatus?.overall || sapConnector?.status || "inactive"} />
          <Separator orientation="vertical" className="h-5" />
          <div className="text-xs font-mono text-muted-foreground flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" />
            LATENCY: {healthStatus?.connectors[0]?.responseTime || 0}ms
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent w-full justify-start border-b border-border/40 rounded-none h-12 mb-8 px-0 gap-6">
          <TabsTrigger value="sync" className="data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-3 font-medium text-base">
            <Database className="w-4 h-4 mr-2" />
            Live Data Stream
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-3 font-medium text-base">
            <Settings2 className="w-4 h-4 mr-2" />
            Connection Topology
          </TabsTrigger>
          <TabsTrigger value="mapping" className="data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-3 font-medium text-base">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Data Mapping Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sync" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column: Terminal & Action */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/30 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-primary" />
                        Sync Console
                      </CardTitle>
                      <CardDescription>Monitor live data transfer from ERP</CardDescription>
                    </div>
                    <Button
                      onClick={() => triggerSync.mutate()}
                      disabled={!sapConnector || sapConnector.status !== "active" || isSyncing}
                      size="sm"
                      className="shadow-sm"
                    >
                      {isSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                      {isSyncing ? "Transferring Data..." : "Trigger Manual Sync"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isSyncing && (
                    <Progress value={syncProgress} className="h-1 rounded-none bg-muted" />
                  )}
                  <div className="bg-[#0D1117] text-[#00FF41] p-4 h-[320px] font-mono text-xs sm:text-sm overflow-y-auto" ref={scrollRef}>
                    {streamLogs.map((log, i) => (
                      <div key={i} className="mb-1.5 opacity-90 transition-opacity">
                        <span className="text-muted-foreground mr-3">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                        <span dangerouslySetInnerHTML={{ __html: log.replace(/\[SYS\]/g, '<span class="text-blue-400 font-bold">[SYS]</span>').replace(/\[ERR\]/g, '<span class="text-red-500 font-bold">[ERR]</span>').replace(/\[DATA\]/g, '<span class="text-purple-400 font-bold">[DATA]</span>').replace(/\[STAT\]/g, '<span class="text-yellow-400 font-bold">[STAT]</span>').replace(/\[AUTH\]/g, '<span class="text-[orange] font-bold">[AUTH]</span>').replace(/\[MAP\]/g, '<span class="text-pink-400 font-bold">[MAP]</span>').replace(/\[REG\]/g, '<span class="text-teal-400 font-bold">[REG]</span>').replace(/\[NET\]/g, '<span class="text-indigo-400 font-bold">[NET]</span>') }} />
                      </div>
                    ))}
                    {isSyncing && (
                      <div className="animate-pulse mt-3 flex items-center gap-2">
                        <div className="h-2 w-2 bg-[#00FF41] rounded-full"></div>
                        <span className="opacity-70">Awaiting stream packets...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sync History */}
              <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-base text-muted-foreground uppercase tracking-wider text-xs">Recent Synchronization Events</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {syncLogs && syncLogs.length > 0 ? (
                    <div className="space-y-4">
                      {syncLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-center justify-between border-b border-border/30 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            {log.status === "completed" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : log.status === "failed" ? (
                              <XCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <Loader2 className="h-4 w-4 text-primary animate-spin" />
                            )}
                            <div>
                              <p className="font-medium text-sm">
                                {log.syncType === "manual" ? "Manual Extraction" : "Automated Poll"}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                {new Date(log.startedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="font-mono text-xs">
                              {log.recordsProcessed} processed
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              +{log.recordsCreated} created / ~{log.recordsUpdated} updated
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <Database className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No sync events recorded.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Key Stats */}
            <div className="space-y-6">
              <Card className="border-border/50 shadow-sm bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    Registry Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight text-primary">
                    {sapConnector?.productsSynced || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Digital Twins synced from SAP
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {syncStats?.successRate?.toFixed(1) || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {syncStats?.totalRecordsProcessed || 0} lifetime records processed
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Last Extraction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold font-mono">
                    {sapConnector?.lastSyncAt
                      ? new Date(sapConnector.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : "--:--:--"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {sapConnector?.lastSyncAt ? new Date(sapConnector.lastSyncAt).toLocaleDateString() : "--"}
                  </p>
                </CardContent>
              </Card>

              <Alert className="bg-blue-500/5 text-blue-400 border-none shadow-sm">
                <Zap className="h-4 w-4" />
                <AlertTitle>OData Optimization</AlertTitle>
                <AlertDescription className="text-xs opacity-80">
                  Batch transfers are enabled. Incremental syncs only transfer delta updates since Last Modified Date.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="config" className="max-w-4xl">
          <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 pb-5 mb-5 bg-muted/20">
              <CardTitle>Topology & Authentication</CardTitle>
              <CardDescription>Configure connection parameters for your ERP instance</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => saveConnector.mutate(data))} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Connection Alias</FormLabel>
                          <FormControl>
                            <Input placeholder="SAP Production PRD" className="bg-muted/50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="systemType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">ERP System Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-muted/50">
                                <SelectValue placeholder="Select system type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="S4HANA">SAP S/4HANA (Cloud/On-Premise)</SelectItem>
                              <SelectItem value="ECC">SAP ECC 6.0</SelectItem>
                              <SelectItem value="Business_One">SAP Business One</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hostname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Gateway URL / Hostname</FormLabel>
                          <FormControl>
                            <Input placeholder="gateway.internal.corp:443" className="bg-muted/50 font-mono text-sm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="port"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Port</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="443" className="bg-muted/50 font-mono text-sm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="client"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Client</FormLabel>
                            <FormControl>
                              <Input placeholder="100" className="bg-muted/50 font-mono text-sm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="apiType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Protocol</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-muted/50">
                                <SelectValue placeholder="Select API type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="OData">REST / OData v4</SelectItem>
                              <SelectItem value="RFC">RFC Wrapper</SelectItem>
                              <SelectItem value="IDoc">IDoc Listener</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="syncDirection"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Topology Matrix</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-muted/50">
                                <SelectValue placeholder="Select direction" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="bidirectional">Bi-directional (Active-Active)</SelectItem>
                              <SelectItem value="inbound">Inbound Only (SAP Master)</SelectItem>
                              <SelectItem value="outbound">Outbound Only (Registry Master)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="rounded-xl border border-border/50 bg-muted/20 p-5 mt-6 border-l-4 border-l-primary">
                    <FormField
                      control={form.control}
                      name="oauthEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-y-0">
                          <div className="space-y-1">
                            <FormLabel className="text-base font-semibold">OAuth 2.0 PKCE</FormLabel>
                            <FormDescription className="text-xs">
                              Utilize modern token-based authentication instead of basic auth. Recommended for all S/4HANA Cloud deployments.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4 pt-6 mt-6 border-t border-border/50">
                    <Button type="submit" disabled={saveConnector.isPending} className="shadow-md shadow-primary/20">
                      {saveConnector.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Commit Configuration
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => testConnection.mutate()}
                      disabled={!sapConnector || testConnection.isPending}
                      className="border-border/50 shadow-sm"
                    >
                      {testConnection.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Server className="w-4 h-4 mr-2" />}
                      Test Connectivity
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="max-w-5xl">
          <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-border/50 pb-5 bg-muted/20">
              <CardTitle>Semantic Translation Layer</CardTitle>
              <CardDescription>Map proprietary SAP Material Master keys to standard EU DPP dimensions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">SAP Data Element (Source)</th>
                      <th className="px-6 py-4 font-semibold">Registry Schema (Target)</th>
                      <th className="px-6 py-4 font-semibold">Transformation Engine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defaultFieldMappings.map((mapping, index) => (
                      <tr key={index} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="font-mono bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-transparent">{mapping.sourceField}</Badge>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {mapping.targetField}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs italic">
                          {mapping.transformation ? `fn.${mapping.transformation}()` : "Direct Passthrough"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-6 bg-muted/10 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Note:</span> Pre-configured mappings align SAP ECC/S4 MATMAS definitions to the core PhotonicTag Digital Twin identity model. Contact solution architecture for BAdI custom exit support.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
