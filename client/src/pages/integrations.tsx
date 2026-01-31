import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  QrCode,
  Zap,
  Shield,
  Truck,
  BarChart3,
  Globe,
  ArrowRight,
  Check,
  Clock,
  Code2,
  Database,
  RefreshCw,
  Lock,
  Layers,
  ShoppingCart,
  Wifi,
  Smartphone,
  FileCode,
  Plug,
  Star,
  Building2,
  Factory,
  Package,
  CircuitBoard
} from "lucide-react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

// Featured Enterprise Integration - SAP
const sapFeatures = [
  { text: "Real-time bidirectional sync with SAP S/4HANA", included: true },
  { text: "Material Master (MARA/MARC/MAKT) integration", included: true },
  { text: "Batch and serial number management", included: true },
  { text: "Plant and storage location mapping", included: true },
  { text: "OData v2/v4 and RFC support", included: true },
  { text: "OAuth 2.0 authentication", included: true },
  { text: "Configurable field mapping", included: true },
  { text: "Conflict resolution with audit trail", included: true },
  { text: "Scheduled and on-demand sync", included: true },
  { text: "SAP Business One support", included: true },
];

const sapBenefits = [
  {
    icon: RefreshCw,
    title: "Bidirectional Sync",
    description: "Changes in SAP automatically reflect in DPP, and vice versa"
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description: "Sub-second sync latency for critical product data"
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "OAuth 2.0, encrypted connections, audit logging"
  },
  {
    icon: Layers,
    title: "No Data Silos",
    description: "Single source of truth across all systems"
  }
];

// Enterprise ERP Integrations
const erpIntegrations = [
  {
    name: "SAP S/4HANA",
    logo: "SAP",
    status: "live",
    description: "Full bidirectional sync with SAP's flagship ERP system",
    features: ["Material Master sync", "Batch management", "OData API", "Real-time updates"],
    setupTime: "2-4 hours",
    docsLink: "/docs/integrations/sap"
  },
  {
    name: "SAP Business One",
    logo: "SAP",
    status: "live",
    description: "Connect small and medium business SAP environments",
    features: ["Item master sync", "Inventory tracking", "Service Layer API"],
    setupTime: "1-2 hours",
    docsLink: "/docs/integrations/sap-b1"
  },
  {
    name: "SAP ECC",
    logo: "SAP",
    status: "live",
    description: "Legacy SAP ECC system support via RFC and IDoc",
    features: ["RFC connectivity", "IDoc processing", "BAPI support"],
    setupTime: "4-8 hours",
    docsLink: "/docs/integrations/sap-ecc"
  },
  {
    name: "Oracle NetSuite",
    logo: "Oracle",
    status: "beta",
    description: "Cloud ERP integration for product and inventory data",
    features: ["Item records sync", "Inventory levels", "REST API"],
    setupTime: "2-3 hours",
    docsLink: "/docs/integrations/netsuite"
  },
  {
    name: "Microsoft Dynamics 365",
    logo: "Microsoft",
    status: "coming",
    description: "Integration with Microsoft's business applications",
    features: ["Product catalog", "Supply chain", "Dataverse API"],
    setupTime: "3-4 hours",
    docsLink: "/docs/integrations/dynamics"
  },
  {
    name: "Infor CloudSuite",
    logo: "Infor",
    status: "coming",
    description: "Industry-specific ERP for manufacturing",
    features: ["Item master", "Lot tracking", "ION API"],
    setupTime: "3-5 hours",
    docsLink: "/docs/integrations/infor"
  }
];

// Identity Technologies
const identityIntegrations = [
  {
    name: "QR Codes",
    icon: QrCode,
    status: "live",
    description: "Generate unique, tamper-evident QR codes for every product unit",
    features: ["Dynamic QR generation", "Scan analytics", "Custom branding", "Batch printing"],
    setupTime: "Instant"
  },
  {
    name: "NFC Tags",
    icon: Smartphone,
    status: "live",
    description: "Tap-to-verify authentication with NFC-enabled devices",
    features: ["NTAG encoding", "Tap-to-verify", "iOS & Android", "Anti-clone protection"],
    setupTime: "10 minutes"
  },
  {
    name: "RFID",
    icon: Wifi,
    status: "live",
    description: "Industrial-grade RFID for warehouse and logistics tracking",
    features: ["UHF RFID support", "Bulk scanning", "EPC encoding", "Reader integration"],
    setupTime: "30 minutes"
  },
  {
    name: "Digital Watermarks",
    icon: Shield,
    status: "beta",
    description: "Invisible authentication marks embedded in packaging",
    features: ["Invisible to eye", "Camera detection", "Print integration", "Counterfeit detection"],
    setupTime: "1-2 hours"
  }
];

// E-commerce Platforms
const ecommerceIntegrations = [
  {
    name: "Shopify",
    icon: ShoppingCart,
    status: "live",
    description: "Automatic DPP creation when products are added to your store",
    features: ["Auto-sync products", "Order tracking", "Webhook events", "Theme integration"],
    setupTime: "15 minutes"
  },
  {
    name: "WooCommerce",
    icon: Globe,
    status: "live",
    description: "WordPress plugin for seamless product passport integration",
    features: ["Product sync", "Variation support", "REST API", "QR in orders"],
    setupTime: "20 minutes"
  },
  {
    name: "Magento / Adobe Commerce",
    icon: Layers,
    status: "beta",
    description: "Enterprise e-commerce with full product catalog sync",
    features: ["Catalog integration", "Multi-store", "GraphQL API", "B2B support"],
    setupTime: "1-2 hours"
  },
  {
    name: "BigCommerce",
    icon: Package,
    status: "coming",
    description: "Headless commerce integration for modern storefronts",
    features: ["Catalog API", "Webhook sync", "Custom fields"],
    setupTime: "30 minutes"
  }
];

// Supply Chain & Logistics
const supplyChainIntegrations = [
  {
    name: "Warehouse Management",
    icon: Building2,
    status: "live",
    description: "Connect to WMS systems for real-time inventory visibility",
    features: ["Location tracking", "Pick/pack events", "Inventory counts", "Zone management"],
    setupTime: "2-4 hours"
  },
  {
    name: "Logistics Carriers",
    icon: Truck,
    status: "live",
    description: "Track shipments across major carriers worldwide",
    features: ["Multi-carrier support", "Shipment events", "Delivery confirmation", "Returns tracking"],
    setupTime: "1 hour"
  },
  {
    name: "Manufacturing Execution",
    icon: Factory,
    status: "beta",
    description: "Connect production floor systems for complete traceability",
    features: ["Production orders", "Quality events", "Equipment data", "OEE metrics"],
    setupTime: "4-8 hours"
  },
  {
    name: "IoT Sensors",
    icon: CircuitBoard,
    status: "live",
    description: "Environmental monitoring and condition tracking",
    features: ["Temperature logs", "Humidity tracking", "Location data", "Alert thresholds"],
    setupTime: "30 minutes"
  }
];

// API Capabilities
const apiCapabilities = [
  {
    title: "RESTful API",
    description: "Standard REST endpoints with JSON responses",
    icon: Code2
  },
  {
    title: "Webhooks",
    description: "Real-time event notifications to your systems",
    icon: Zap
  },
  {
    title: "GraphQL",
    description: "Flexible queries for complex data needs",
    icon: Database
  },
  {
    title: "SDKs",
    description: "Libraries for Node.js, Python, Java, and more",
    icon: FileCode
  }
];

// Customer logos/testimonials
const enterpriseCustomers = [
  { name: "Electronics Manufacturer", industry: "Consumer Electronics", products: "500K+" },
  { name: "Fashion Brand", industry: "Textiles & Apparel", products: "1.2M+" },
  { name: "Battery Producer", industry: "Energy Storage", products: "2M+" },
  { name: "Automotive Supplier", industry: "Automotive Parts", products: "800K+" },
];

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "live":
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Live</Badge>;
    case "beta":
      return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Beta</Badge>;
    case "coming":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Coming Soon</Badge>;
    default:
      return null;
  }
}

function IntegrationCard({
  name,
  icon: Icon,
  status,
  description,
  features,
  setupTime,
  logo
}: {
  name: string;
  icon?: any;
  logo?: string;
  status: string;
  description: string;
  features: string[];
  setupTime: string;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {Icon ? (
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <span className="text-white font-bold text-xs">{logo}</span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <StatusBadge status={status} />
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        <div className="space-y-2 mb-4">
          {features.slice(0, 3).map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Setup: {setupTime}
          </div>
          {status === "live" && (
            <Button variant="ghost" size="sm" className="text-xs">
              View Docs <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Integrations() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Plug className="w-3 h-3 mr-1" />
              Connect Everything
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" data-testid="text-integrations-title">
              Connect Your Entire
              <span className="text-primary block">Product Ecosystem</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              PhotonicTag integrates with your existing ERP, e-commerce, and supply chain systems.
              No data silos. No manual exports. Just seamless, real-time product data flow.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/integrations/sap">
                  <Database className="w-4 h-4 mr-2" />
                  Explore SAP Integration
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs">
                  <Code2 className="w-4 h-4 mr-2" />
                  API Documentation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured: SAP Integration */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-yellow-600">Featured Integration</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">SAP</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold">SAP S/4HANA Integration</h2>
                  <p className="text-muted-foreground">Enterprise-grade bidirectional sync</p>
                </div>
              </div>
              <p className="text-lg text-muted-foreground mb-8">
                Our deep SAP integration is built for enterprises. Sync your Material Master data,
                batch numbers, and product attributes in real-time. No middleware required.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {sapBenefits.map((benefit, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <benefit.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button size="lg" asChild>
                <Link href="/integrations/sap">
                  Configure SAP Connection
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div>
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    Full Feature List
                  </CardTitle>
                  <CardDescription>Everything included in SAP integration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {sapFeatures.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-500" />
                        </div>
                        <span className="text-sm">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">All Integrations</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect PhotonicTag with your existing tech stack. From ERP systems to e-commerce platforms.
            </p>
          </div>

          <Tabs defaultValue="erp" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="erp" className="gap-2">
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">Enterprise ERP</span>
                <span className="sm:hidden">ERP</span>
              </TabsTrigger>
              <TabsTrigger value="identity" className="gap-2">
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">Identity Tech</span>
                <span className="sm:hidden">Identity</span>
              </TabsTrigger>
              <TabsTrigger value="ecommerce" className="gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">E-commerce</span>
                <span className="sm:hidden">E-com</span>
              </TabsTrigger>
              <TabsTrigger value="supply" className="gap-2">
                <Truck className="w-4 h-4" />
                <span className="hidden sm:inline">Supply Chain</span>
                <span className="sm:hidden">Supply</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="erp">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {erpIntegrations.map((integration) => (
                  <IntegrationCard key={integration.name} {...integration} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="identity">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {identityIntegrations.map((integration) => (
                  <IntegrationCard key={integration.name} {...integration} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ecommerce">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ecommerceIntegrations.map((integration) => (
                  <IntegrationCard key={integration.name} {...integration} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="supply">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {supplyChainIntegrations.map((integration) => (
                  <IntegrationCard key={integration.name} {...integration} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* API Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">Developer-First</Badge>
              <h2 className="text-3xl font-bold mb-4">Build Custom Integrations</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our comprehensive API lets you build exactly what you need. RESTful endpoints,
                webhooks for real-time events, and SDKs in your favorite languages.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {apiCapabilities.map((cap, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background border">
                    <cap.icon className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-medium text-sm">{cap.title}</h4>
                      <p className="text-xs text-muted-foreground">{cap.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/docs">
                    <Code2 className="w-4 h-4 mr-2" />
                    API Reference
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://github.com/photonictag" target="_blank" rel="noopener noreferrer">
                    <FileCode className="w-4 h-4 mr-2" />
                    SDKs on GitHub
                  </a>
                </Button>
              </div>
            </div>
            <div>
              <Card className="bg-zinc-950 text-zinc-100 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs text-zinc-500 ml-2">api-example.ts</span>
                  </div>
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code>{`// Create a Digital Product Passport
const passport = await photonictag.passports.create({
  productName: "EcoPower Battery 5000mAh",
  manufacturer: "GreenTech Industries",
  batchNumber: "BAT-2025-001",
  materials: ["Lithium", "Cobalt", "Graphite"],
  carbonFootprint: 12.5,
  repairabilityScore: 8.2,
  certifications: ["EU_DPP", "ISO_14001"]
});

// Generate QR code
const qr = await passport.generateQR({
  format: "svg",
  size: 256
});

console.log(passport.id); // "dpp_abc123..."
console.log(qr.url); // "https://scan.photonictag.com/..."
`}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Customers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Industry Leaders</h2>
            <p className="text-muted-foreground">
              Enterprises across industries rely on PhotonicTag integrations
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {enterpriseCustomers.map((customer, i) => (
              <Card key={i} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">{customer.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{customer.industry}</p>
                  <Badge variant="secondary">{customer.products} products</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Connect Your Systems?</h2>
          <p className="text-lg opacity-90 mb-8">
            Get started with our enterprise integrations. Our team will help you configure
            the perfect setup for your product ecosystem.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/register">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
              <Link href="/contact">
                Talk to Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
