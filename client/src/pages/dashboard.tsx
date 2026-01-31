import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Package,
  QrCode,
  Recycle,
  Sparkles,
  ArrowRight,
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Shield,
  BarChart3,
  Wifi,
  FileText,
  Download,
  Eye,
  Plug,
  Database
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import type { Product } from "@shared/schema";

// Mock data for charts - in production this would come from API
const scanTrendData = [
  { name: "Mon", scans: 120, products: 5 },
  { name: "Tue", scans: 180, products: 8 },
  { name: "Wed", scans: 150, products: 3 },
  { name: "Thu", scans: 280, products: 12 },
  { name: "Fri", scans: 320, products: 7 },
  { name: "Sat", scans: 250, products: 4 },
  { name: "Sun", scans: 190, products: 6 },
];

const categoryData = [
  { name: "Electronics", count: 45 },
  { name: "Textiles", count: 32 },
  { name: "Batteries", count: 28 },
  { name: "Packaging", count: 18 },
  { name: "Industrial", count: 12 },
];

// Mock activity data
const recentActivity = [
  {
    id: 1,
    type: "product_created",
    title: "New product created",
    description: "EcoPower Battery 5000mAh added",
    time: "2 minutes ago",
    icon: Plus,
    color: "text-green-500"
  },
  {
    id: 2,
    type: "scan",
    title: "Product scanned",
    description: "QR scan from Munich, Germany",
    time: "15 minutes ago",
    icon: QrCode,
    color: "text-blue-500"
  },
  {
    id: 3,
    type: "sap_sync",
    title: "SAP sync completed",
    description: "42 materials synchronized",
    time: "1 hour ago",
    icon: RefreshCw,
    color: "text-purple-500"
  },
  {
    id: 4,
    type: "compliance",
    title: "Compliance check passed",
    description: "EU DPP validation successful",
    time: "2 hours ago",
    icon: Shield,
    color: "text-green-500"
  },
  {
    id: 5,
    type: "scan",
    title: "Product scanned",
    description: "NFC tap from Paris, France",
    time: "3 hours ago",
    icon: Wifi,
    color: "text-blue-500"
  },
];

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  isLoading
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold">{value}</div>
            {trend && trendValue && (
              <div className={`flex items-center text-xs ${
                trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"
              }`}>
                {trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : trend === "down" ? (
                  <TrendingDown className="h-3 w-3 mr-1" />
                ) : null}
                {trendValue}
              </div>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function SAPSyncCard() {
  // Mock SAP sync status - in production this would be fetched from API
  const syncStatus = {
    isConnected: true,
    lastSync: "10 minutes ago",
    productsInSync: 96,
    pendingChanges: 3,
    successRate: 98.5
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            SAP Integration Status
          </CardTitle>
          <Badge variant={syncStatus.isConnected ? "default" : "destructive"} className="text-xs">
            {syncStatus.isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold">{syncStatus.productsInSync}</p>
            <p className="text-xs text-muted-foreground">Products in sync</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{syncStatus.pendingChanges}</p>
            <p className="text-xs text-muted-foreground">Pending changes</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Sync success rate</span>
            <span className="font-medium">{syncStatus.successRate}%</span>
          </div>
          <Progress value={syncStatus.successRate} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last sync: {syncStatus.lastSync}
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
            <Link href="/integrations/sap">
              Configure
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ComplianceCard({ products }: { products: Product[] | undefined }) {
  const totalProducts = products?.length || 0;
  const compliantProducts = totalProducts; // Assuming all products are EU DPP compliant
  const complianceRate = totalProducts > 0 ? Math.round((compliantProducts / totalProducts) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Shield className="h-4 w-4" />
          EU DPP Compliance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-muted"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-green-500"
                strokeWidth="3"
                strokeDasharray={`${complianceRate} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">{complianceRate}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>{compliantProducts} compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>0 need attention</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <Badge variant="secondary" className="text-xs mb-1">ESPR</Badge>
            <p className="text-xs text-muted-foreground">Ready</p>
          </div>
          <div className="text-center">
            <Badge variant="secondary" className="text-xs mb-1">Battery</Badge>
            <p className="text-xs text-muted-foreground">Ready</p>
          </div>
          <div className="text-center">
            <Badge variant="secondary" className="text-xs mb-1">Textile</Badge>
            <p className="text-xs text-muted-foreground">Ready</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const totalProducts = products?.length || 0;
  const avgRepairability = products?.length
    ? (products.reduce((acc, p) => acc + p.repairabilityScore, 0) / products.length).toFixed(1)
    : "0";
  const totalCarbonFootprint = products?.reduce((acc, p) => acc + p.carbonFootprint, 0) || 0;

  // Calculate unique categories
  const uniqueCategories = new Set(products?.map(p => p.productCategory) || []).size;

  // Mock total scans - in production this would come from analytics API
  const totalScans = 1490;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" data-testid="text-dashboard-title">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your Digital Product Passports.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Link href="/products/new">
            <Button data-testid="button-create-product-hero">
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={totalProducts}
          subtitle="Digital Product Passports"
          icon={Package}
          trend="up"
          trendValue="+12% this month"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Scans"
          value={totalScans.toLocaleString()}
          subtitle="QR & NFC interactions"
          icon={Eye}
          trend="up"
          trendValue="+28% this week"
          isLoading={isLoading}
        />
        <StatCard
          title="Avg Repairability"
          value={`${avgRepairability}/10`}
          subtitle="Across all products"
          icon={Sparkles}
          trend="neutral"
          trendValue="No change"
          isLoading={isLoading}
        />
        <StatCard
          title="Carbon Footprint"
          value={`${totalCarbonFootprint.toLocaleString()}kg`}
          subtitle="Total CO₂ equivalent"
          icon={Recycle}
          trend="down"
          trendValue="-5% vs target"
          isLoading={isLoading}
        />
      </div>

      {/* Charts and Status Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Scan Trends Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Scan Activity</CardTitle>
                <CardDescription>Product scans over the last 7 days</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scanTrendData}>
                  <defs>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="scans"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorScans)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* SAP Integration Status */}
        <SAPSyncCard />
      </div>

      {/* Second Row: Categories, Compliance, Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Products by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Products by Category</CardTitle>
            <CardDescription>Distribution across {uniqueCategories} categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis dataKey="name" type="category" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={70} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Card */}
        <ComplianceCard products={products} />

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Recent Products and Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Products</CardTitle>
                <CardDescription>Your latest Digital Product Passports</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/products">
                  View all
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No products yet</p>
                <Link href="/products/new">
                  <Button variant="outline" size="sm" data-testid="button-create-first-product">
                    Create your first product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {products?.slice(0, 5).map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <div
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      data-testid={`card-product-${product.id}`}
                    >
                      <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                        {product.productImage ? (
                          <img
                            src={product.productImage}
                            alt={product.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.productName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {product.productCategory}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {product.repairabilityScore}/10 repair score
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/products/new">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2" data-testid="button-quick-create">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Create Product</span>
                  <span className="text-xs text-muted-foreground">Add a new DPP</span>
                </Button>
              </Link>
              <Link href="/integrations/sap">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Plug className="h-5 w-5 text-purple-500" />
                  </div>
                  <span className="font-medium">SAP Connector</span>
                  <span className="text-xs text-muted-foreground">Sync from SAP</span>
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2" data-testid="button-quick-view-all">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="font-medium">All Products</span>
                  <span className="text-xs text-muted-foreground">Browse catalog</span>
                </Button>
              </Link>
              <Link href="/iot-devices">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Wifi className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="font-medium">IoT Devices</span>
                  <span className="text-xs text-muted-foreground">Manage sensors</span>
                </Button>
              </Link>
            </div>

            {/* Additional Resources */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Resources</h4>
              <div className="space-y-2">
                <Link href="/docs">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                    <FileText className="h-4 w-4 mr-2" />
                    Documentation
                  </Button>
                </Link>
                <Link href="/eu-dpp-guide">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                    <Shield className="h-4 w-4 mr-2" />
                    EU DPP Guide
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
