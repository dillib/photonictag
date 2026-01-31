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
import { Loader2, Server, RefreshCw, CheckCircle2, XCircle, Clock, ArrowLeftRight, Database, Settings2, TrendingUp, AlertCircle, Activity } from "lucide-react";
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

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
    case "error":
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
    case "pending":
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    default:
      return <Badge variant="outline">Inactive</Badge>;
  }
}

export default function SAPConnector() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("config");
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: connectors, isLoading } = useQuery<EnterpriseConnector[]>({
    queryKey: ["/api/integrations/connectors"],
  });

  const sapConnector = connectors?.find(c => c.connectorType === "sap");

  // Query for sync logs
  const { data: syncLogs } = useQuery<IntegrationSyncLog[]>({
    queryKey: [`/api/integrations/connectors/${sapConnector?.id}/logs`],
    enabled: !!sapConnector?.id,
  });

  // Query for sync stats
  const { data: syncStats } = useQuery<{
    totalSyncs: number;
    lastSyncAt: Date | null;
    totalRecordsProcessed: number;
    totalRecordsCreated: number;
    totalRecordsUpdated: number;
    totalRecordsFailed: number;
    successRate: number;
  }>({
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
        title: "Configuration saved",
        description: "SAP connector settings have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save connector configuration.",
        variant: "destructive",
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
        title: "Connection successful",
        description: "Successfully connected to SAP system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connectors"] });
    },
    onError: () => {
      toast({
        title: "Connection failed",
        description: "Could not connect to SAP system. Please check your configuration.",
        variant: "destructive",
      });
    },
  });

  const triggerSync = useMutation({
    mutationFn: async () => {
      if (!sapConnector) throw new Error("No connector configured");
      setIsSyncing(true);
      setSyncProgress(0);

      // Simulate progress (in real app, you'd use WebSocket or polling for real progress)
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      try {
        const result = await apiRequest("POST", `/api/integrations/connectors/${sapConnector.id}/sync`);
        clearInterval(progressInterval);
        setSyncProgress(100);
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      } finally {
        setTimeout(() => {
          setIsSyncing(false);
          setSyncProgress(0);
        }, 1000);
      }
    },
    onSuccess: (data: any) => {
      toast({
        title: "Sync completed",
        description: data.message || "Product data synchronization completed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connectors"] });
      queryClient.invalidateQueries({ queryKey: [`/api/integrations/connectors/${sapConnector?.id}/logs`] });
      queryClient.invalidateQueries({ queryKey: [`/api/integrations/connectors/${sapConnector?.id}/stats`] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync failed",
        description: error.message || "Could not complete synchronization. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <SiSap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-sap-title">SAP Connector</h1>
            <p className="text-muted-foreground">Connect your SAP system to sync product master data</p>
          </div>
        </div>
        {sapConnector && <StatusBadge status={sapConnector.status} />}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="config" data-testid="tab-config">
            <Settings2 className="w-4 h-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="mapping" data-testid="tab-mapping">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Field Mapping
          </TabsTrigger>
          <TabsTrigger value="sync" data-testid="tab-sync">
            <Database className="w-4 h-4 mr-2" />
            Sync Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Settings</CardTitle>
              <CardDescription>Configure your SAP system connection details</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => saveConnector.mutate(data))} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Connection Name</FormLabel>
                          <FormControl>
                            <Input placeholder="SAP Production" {...field} data-testid="input-connection-name" />
                          </FormControl>
                          <FormDescription>A friendly name for this connection</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="systemType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SAP System Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-system-type">
                                <SelectValue placeholder="Select system type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="S4HANA">S/4HANA</SelectItem>
                              <SelectItem value="ECC">ECC (ERP Central Component)</SelectItem>
                              <SelectItem value="Business_One">Business One</SelectItem>
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
                          <FormLabel>Hostname / Server URL</FormLabel>
                          <FormControl>
                            <Input placeholder="sap-prod.company.com" {...field} data-testid="input-hostname" />
                          </FormControl>
                          <FormDescription>Your SAP server hostname or IP address</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Port</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="443" {...field} data-testid="input-port" />
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
                          <FormLabel>Client</FormLabel>
                          <FormControl>
                            <Input placeholder="100" {...field} data-testid="input-client" />
                          </FormControl>
                          <FormDescription>SAP client number</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="systemId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System ID (SID)</FormLabel>
                          <FormControl>
                            <Input placeholder="PRD" {...field} data-testid="input-system-id" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="apiType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-api-type">
                                <SelectValue placeholder="Select API type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="OData">OData (Recommended)</SelectItem>
                              <SelectItem value="RFC">RFC (Remote Function Call)</SelectItem>
                              <SelectItem value="IDoc">IDoc (Intermediate Document)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>How to communicate with SAP</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="syncDirection"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sync Direction</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-sync-direction">
                                <SelectValue placeholder="Select direction" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="inbound">Inbound (SAP to PhotonicTag)</SelectItem>
                              <SelectItem value="outbound">Outbound (PhotonicTag to SAP)</SelectItem>
                              <SelectItem value="bidirectional">Bidirectional</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="syncFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sync Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-sync-frequency">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="realtime">Real-time (Webhooks)</SelectItem>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="manual">Manual Only</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="oauthEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">OAuth 2.0</FormLabel>
                            <FormDescription>Use OAuth for authentication (recommended for S/4HANA Cloud)</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-oauth" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="flex gap-3">
                    <Button type="submit" disabled={saveConnector.isPending} data-testid="button-save-config">
                      {saveConnector.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Configuration
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => testConnection.mutate()}
                      disabled={!sapConnector || testConnection.isPending}
                      data-testid="button-test-connection"
                    >
                      {testConnection.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <Server className="w-4 h-4 mr-2" />
                      Test Connection
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping</CardTitle>
              <CardDescription>Map SAP material master fields to PhotonicTag DPP fields</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
                  <div>SAP Field</div>
                  <div>PhotonicTag Field</div>
                  <div>Transformation</div>
                </div>
                {defaultFieldMappings.map((mapping, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 items-center" data-testid={`row-mapping-${index}`}>
                    <Input value={mapping.sourceField} readOnly className="bg-muted font-mono text-sm" />
                    <Input value={mapping.targetField} readOnly className="bg-muted font-mono text-sm" />
                    <Input value={mapping.transformation || "none"} readOnly className="bg-muted text-sm" />
                  </div>
                ))}
                <p className="text-sm text-muted-foreground mt-4">
                  Field mappings define how SAP material master data maps to PhotonicTag product fields.
                  Contact support for custom mapping configurations.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          {/* Real-time Sync Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products Synced</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-products-synced">
                  {sapConnector?.productsSynced || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total from SAP system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {syncStats?.successRate?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {syncStats?.totalRecordsProcessed || 0} records processed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-last-sync">
                  {sapConnector?.lastSyncAt
                    ? new Date(sapConnector.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "Never"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {sapConnector?.lastSyncAt
                    ? new Date(sapConnector.lastSyncAt).toLocaleDateString()
                    : "No sync history"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connection</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-sync-status">
                  {sapConnector?.status === "active" ? (
                    <span className="text-green-600">Online</span>
                  ) : (
                    <span className="text-gray-600">Offline</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {sapConnector?.status === "active" ? "Ready to sync" : "Not configured"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Live Sync Progress */}
          {isSyncing && (
            <Alert>
              <Activity className="h-4 w-4 animate-pulse" />
              <AlertTitle>Synchronization in Progress</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>Syncing product data from SAP S/4HANA...</p>
                <Progress value={syncProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">{syncProgress}% complete</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Manual Sync Card */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Synchronization</CardTitle>
              <CardDescription>
                Trigger a manual sync to pull latest product data from your SAP system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={() => triggerSync.mutate()}
                  disabled={!sapConnector || sapConnector.status !== "active" || triggerSync.isPending}
                  data-testid="button-trigger-sync"
                  size="lg"
                >
                  {triggerSync.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Now
                </Button>
                <div className="flex flex-col justify-center">
                  <p className="text-sm font-medium">
                    {sapConnector?.status === "active"
                      ? "Ready to sync"
                      : "Configure connection first"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bidirectional sync: SAP ↔ PhotonicTag
                  </p>
                </div>
              </div>

              {sapConnector?.status === "active" && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {syncStats?.totalRecordsCreated || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Created</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {syncStats?.totalRecordsUpdated || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Updated</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {syncStats?.totalRecordsFailed || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sync History */}
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>Recent synchronization operations</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] w-full">
                {syncLogs && syncLogs.length > 0 ? (
                  <div className="space-y-4">
                    {syncLogs.slice(0, 10).map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between border-b pb-3 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          {log.status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : log.status === "failed" ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {log.syncType === "manual" ? "Manual Sync" : "Automated Sync"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.startedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {log.recordsProcessed} records
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.recordsCreated} created • {log.recordsUpdated} updated
                            {log.recordsFailed > 0 && (
                              <span className="text-red-600"> • {log.recordsFailed} failed</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Database className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium">No sync history yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Trigger your first sync to see history here
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
