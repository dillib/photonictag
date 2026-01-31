import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  QrCode,
  Shield,
  Leaf,
  Truck,
  Recycle,
  Sparkles,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Globe,
  Lock,
  Factory,
  Users,
  Zap,
  Brain,
  Wifi,
  FileCheck,
  Target,
  TrendingUp,
  Clock,
  DollarSign,
  AlertTriangle,
  Building2,
  Shirt,
  Cpu,
  Package,
  Play,
  XCircle,
  CircleDot,
  Layers,
  Database,
  RefreshCw,
  Settings,
  Code,
  Terminal
} from "lucide-react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

const platformCapabilities = [
  {
    title: "Digital Product Passports",
    description: "Create EU DPP-compliant digital identities for every product with all required sustainability and traceability data fields.",
    icon: QrCode,
    color: "blue",
    features: [
      "EU Ecodesign Regulation compliant",
      "Unique identifier per product unit",
      "Batch QR code generation",
      "Real-time data synchronization"
    ]
  },
  {
    title: "Supply Chain Traceability",
    description: "Track products from raw materials to end consumer with complete chain of custody and immutable event logging.",
    icon: Truck,
    color: "green",
    features: [
      "End-to-end visibility",
      "Multi-tier supplier tracking",
      "GPS and timestamp logging",
      "Automated event capture"
    ]
  },
  {
    title: "Anti-Counterfeiting",
    description: "Protect your brand with physics-rooted authentication. Every scan verifies authenticity and logs verification events.",
    icon: Shield,
    color: "purple",
    features: [
      "Tamper-proof identifiers",
      "Real-time verification API",
      "Counterfeit detection alerts",
      "Brand protection analytics"
    ]
  },
  {
    title: "IoT Device Integration",
    description: "Connect NFC tags, RFID chips, and BLE beacons. Enable contactless scanning and real-time sensor data integration.",
    icon: Wifi,
    color: "orange",
    features: [
      "NFC/RFID/BLE support",
      "Sensor data streaming",
      "Device lifecycle management",
      "OTA firmware tracking"
    ]
  },
  {
    title: "AI-Powered Insights",
    description: "Leverage AI to auto-generate sustainability scores, repair guides, risk assessments, and circularity recommendations.",
    icon: Brain,
    color: "pink",
    features: [
      "Automated sustainability scoring",
      "AI-generated repair guides",
      "Compliance risk analysis",
      "Circularity optimization"
    ]
  },
  {
    title: "Sustainability Reporting",
    description: "Measure and communicate environmental impact with precision. Track carbon, recyclability, and materials across your portfolio.",
    icon: Leaf,
    color: "emerald",
    features: [
      "Carbon footprint calculator",
      "EU repairability scoring",
      "Material composition tracking",
      "ESG report generation"
    ]
  },
];

const businessMetrics = [
  {
    metric: "80%",
    label: "Faster Compliance",
    description: "Reduce EU DPP compliance preparation time"
  },
  {
    metric: "45%",
    label: "Cost Reduction",
    description: "Lower product authentication costs"
  },
  {
    metric: "3x",
    label: "Consumer Engagement",
    description: "Increase in product page interactions"
  },
  {
    metric: "60%",
    label: "Counterfeit Reduction",
    description: "Decrease in counterfeit incidents"
  }
];

const industryUseCases = [
  {
    industry: "Batteries & Energy Storage",
    deadline: "Feb 2027",
    urgency: "high",
    description: "Meet EU Battery Regulation requirements with complete lifecycle tracking, state of health monitoring, and mandatory recycling guidance.",
    icon: Zap,
    color: "amber",
    requirements: [
      "Battery passport with 90+ data points",
      "State of health monitoring",
      "Carbon footprint per kWh",
      "Recycled content declaration",
      "End-of-life recycling info"
    ],
    stats: { products: "280K+", customers: "45+" }
  },
  {
    industry: "Textiles & Fashion",
    deadline: "2027-28",
    urgency: "medium",
    description: "Provide full supply chain transparency from fiber to finished garment. Support sustainable fashion initiatives and build consumer trust.",
    icon: Shirt,
    color: "blue",
    requirements: [
      "Fiber origin traceability",
      "Manufacturing conditions",
      "Care & repair instructions",
      "Recyclability information",
      "Chemical composition"
    ],
    stats: { products: "1.2M+", customers: "120+" }
  },
  {
    industry: "Electronics & IoT",
    deadline: "2028-29",
    urgency: "medium",
    description: "Track component origins, manage firmware versions, and ensure compliance with e-waste regulations across complex supply chains.",
    icon: Cpu,
    color: "purple",
    requirements: [
      "Component bill of materials",
      "Firmware version tracking",
      "Repairability score",
      "Hazardous materials list",
      "E-waste handling instructions"
    ],
    stats: { products: "850K+", customers: "85+" }
  },
  {
    industry: "Luxury & Consumer Goods",
    deadline: "2029-30",
    urgency: "low",
    description: "Authenticate premium products, combat counterfeits, and provide ownership history for resale and warranty verification.",
    icon: Shield,
    color: "pink",
    requirements: [
      "Certificate of authenticity",
      "Ownership transfer history",
      "Warranty tracking",
      "Repair service locator",
      "Resale value preservation"
    ],
    stats: { products: "520K+", customers: "200+" }
  },
];

const comparisonData = [
  { feature: "EU DPP Compliance", photonic: true, manual: false, legacy: false },
  { feature: "Real-time Data Sync", photonic: true, manual: false, legacy: true },
  { feature: "SAP Integration", photonic: true, manual: false, legacy: false },
  { feature: "AI-Powered Insights", photonic: true, manual: false, legacy: false },
  { feature: "Consumer Scan Pages", photonic: true, manual: false, legacy: true },
  { feature: "IoT Device Support", photonic: true, manual: false, legacy: false },
  { feature: "Multi-language Support", photonic: true, manual: true, legacy: true },
  { feature: "Batch QR Generation", photonic: true, manual: false, legacy: true },
];

const complianceStandards = [
  { name: "EU DPP Regulation", status: "Compliant", icon: FileCheck },
  { name: "EU Battery Regulation", status: "Compliant", icon: Zap },
  { name: "ESPR Ecodesign", status: "Compliant", icon: Leaf },
  { name: "GS1 Digital Link", status: "Supported", icon: QrCode },
  { name: "ISO 14001", status: "Aligned", icon: Globe },
  { name: "GDPR", status: "Compliant", icon: Shield },
];

export default function Solution() {
  const [email, setEmail] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/auth/register?email=${encodeURIComponent(email)}`;
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
      green: { bg: "bg-green-500/10", text: "text-green-500" },
      purple: { bg: "bg-purple-500/10", text: "text-purple-500" },
      orange: { bg: "bg-orange-500/10", text: "text-orange-500" },
      pink: { bg: "bg-pink-500/10", text: "text-pink-500" },
      emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
      amber: { bg: "bg-amber-500/10", text: "text-amber-500" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  Complete Solution
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]" data-testid="text-solution-title">
                  The Complete{" "}
                  <span className="text-primary">Digital Product Passport</span>{" "}
                  Platform
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-xl">
                  Create, manage, and share tamper-proof digital identities for every product.
                  From factory floor to consumer hands — complete transparency at every step.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild data-testid="button-solution-start">
                  <Link href="/auth/register" className="gap-2">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild data-testid="button-solution-demo">
                  <Link href="/scan/demo" className="gap-2">
                    <Play className="w-4 h-4" />
                    View Demo Passport
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>EU DPP Ready</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>SAP Certified</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>ISO 27001</span>
                </div>
              </div>
            </div>

            {/* Platform Visual */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur-xl" />
              <div className="relative bg-card border-2 rounded-xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Platform Dashboard</h3>
                  <Badge variant="secondary" className="gap-1">
                    <CircleDot className="w-3 h-3 text-green-500" />
                    Live
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Products</p>
                    <p className="text-2xl font-bold">2,847</p>
                    <p className="text-xs text-green-500">+12% this month</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Scans Today</p>
                    <p className="text-2xl font-bold">14,291</p>
                    <p className="text-xs text-green-500">+8% vs yesterday</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Compliance</p>
                    <p className="text-2xl font-bold text-green-500">98%</p>
                    <p className="text-xs text-muted-foreground">EU DPP ready</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">SAP Sync</p>
                    <p className="text-2xl font-bold text-primary">Active</p>
                    <p className="text-xs text-muted-foreground">Last: 2 min ago</p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Recent Activity</span>
                    <span className="text-primary">View all →</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Product scanned in Munich, Germany</span>
                      <span className="text-muted-foreground ml-auto">2s ago</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>SAP sync completed (847 products)</span>
                      <span className="text-muted-foreground ml-auto">2m ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Value Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 gap-1">
              <TrendingUp className="w-3 h-3" />
              Proven Results
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Measurable ROI for Your Business
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our customers see significant improvements across compliance, cost, and customer engagement.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessMetrics.map((item, i) => (
              <Card key={i} className="text-center border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6 space-y-2">
                  <p className="text-4xl sm:text-5xl font-bold text-primary">{item.metric}</p>
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 gap-1">
              <Layers className="w-3 h-3" />
              Everything You Need
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Six Integrated Modules, One Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for comprehensive product identity management — from creation to consumer.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformCapabilities.map((capability) => {
              const colorClasses = getColorClasses(capability.color);
              return (
                <Card key={capability.title} className="border-2 hover:border-primary/50 transition-colors" data-testid={`card-capability-${capability.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-12 h-12 rounded-lg ${colorClasses.bg} flex items-center justify-center`}>
                        <capability.icon className={`w-6 h-6 ${colorClasses.text}`} />
                      </div>
                      <CardTitle className="text-lg">{capability.title}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">{capability.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {capability.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* SAP Integration Spotlight */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-500/5 to-blue-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="gap-1 bg-blue-500/10 text-blue-700 border-blue-500/20">
                <Database className="w-3 h-3" />
                Works with SAP
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Native SAP S/4HANA Integration
              </h2>
              <p className="text-lg text-muted-foreground">
                PhotonicTag offers the deepest SAP integration in the DPP market. Bidirectional sync
                keeps your Material Master, batch data, and product information current across all systems.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Real-time Bidirectional Sync</h3>
                    <p className="text-sm text-muted-foreground">
                      Changes in SAP automatically update digital passports. New products sync instantly.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Database className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Material Master Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Import materials, BOMs, and sustainability data directly from your SAP system.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Settings className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Zero Middleware Required</h3>
                    <p className="text-sm text-muted-foreground">
                      Direct OData API connection — no complex middleware or additional infrastructure.
                    </p>
                  </div>
                </div>
              </div>

              <Button asChild>
                <Link href="/integrations/sap" className="gap-2">
                  Explore SAP Integration
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-blue-500/5 rounded-2xl blur-xl" />
              <Card className="relative border-2 border-blue-500/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">SAP Connector Status</h3>
                    <Badge className="bg-green-500 text-white">Connected</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">System</span>
                      <span className="font-medium">SAP S/4HANA Cloud</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span className="font-medium text-green-500">2 minutes ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Materials Synced</span>
                      <span className="font-medium">12,847</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sync Frequency</span>
                      <span className="font-medium">Every 5 minutes</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>All systems operational • 99.99% uptime</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Use Cases */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 gap-1">
              <Factory className="w-3 h-3" />
              Built for Your Industry
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Purpose-Built for Regulated Industries
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each industry has unique requirements. PhotonicTag provides tailored solutions with pre-configured data schemas.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {industryUseCases.map((useCase) => {
              const colorClasses = getColorClasses(useCase.color);
              return (
                <Card key={useCase.industry} className="border-2 hover:border-primary/50 transition-all" data-testid={`card-usecase-${useCase.industry.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-lg ${colorClasses.bg} flex items-center justify-center flex-shrink-0`}>
                        <useCase.icon className={`w-7 h-7 ${colorClasses.text}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-xl font-semibold">{useCase.industry}</h3>
                          <Badge
                            variant={useCase.urgency === "high" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {useCase.deadline}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{useCase.description}</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Key Requirements
                        </p>
                        <ul className="space-y-1">
                          {useCase.requirements.map((req) => (
                            <li key={req} className="flex items-center gap-2 text-xs">
                              <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-col justify-end">
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Products tracked</span>
                            <span className="font-semibold">{useCase.stats.products}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Customers</span>
                            <span className="font-semibold">{useCase.stats.customers}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Why PhotonicTag?</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Built Different. Built Better.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how PhotonicTag compares to manual processes and legacy solutions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 font-medium">
                    <div className="flex flex-col items-center gap-1">
                      <Badge className="bg-primary">PhotonicTag</Badge>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">
                    Manual Process
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">
                    Legacy Systems
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-4 px-4 font-medium">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {row.photonic ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.manual ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.legacy ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="gap-1">
                <Code className="w-3 h-3" />
                Easy Integration
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Build with Our REST API
              </h2>
              <p className="text-lg text-muted-foreground">
                Integrate PhotonicTag into your existing systems with our comprehensive REST API.
                Create passports, log events, and verify products programmatically.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Terminal className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">RESTful Endpoints</h3>
                    <p className="text-sm text-muted-foreground">
                      Full CRUD operations for products, events, and passports with JSON responses.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">API Key Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                      Secure access with API keys and OAuth 2.0 for enterprise integrations.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Webhooks & Events</h3>
                    <p className="text-sm text-muted-foreground">
                      Real-time notifications for scans, updates, and compliance alerts.
                    </p>
                  </div>
                </div>
              </div>

              <Button asChild>
                <Link href="/docs" className="gap-2">
                  View API Documentation
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl blur-xl" />
              <Card className="relative border-2 overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-muted-foreground font-mono">api-example.js</span>
                </div>
                <CardContent className="p-0">
                  <pre className="p-4 text-xs overflow-x-auto font-mono">
                    <code className="text-muted-foreground">{`// Create a Digital Product Passport
const response = await fetch(
  'https://api.photonictag.com/v1/passports',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      productName: 'EcoPower Battery 5kWh',
      category: 'batteries',
      materials: [
        { name: 'Lithium', percent: 12 },
        { name: 'Cobalt', percent: 8 }
      ],
      carbonFootprint: 68,
      recyclability: 92
    })
  }
);

const passport = await response.json();
console.log(passport.qrCodeUrl);`}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Standards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Compliance & Standards</h2>
            <p className="text-muted-foreground">
              Built from the ground up for current and upcoming regulatory requirements.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {complianceStandards.map((standard) => (
              <Card key={standard.name} className="text-center" data-testid={`card-compliance-${standard.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="p-4 space-y-2">
                  <standard.icon className="w-8 h-8 text-primary mx-auto" />
                  <p className="text-sm font-medium">{standard.name}</p>
                  <Badge variant="secondary" className="text-xs">{standard.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Get Started in Three Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground mx-auto flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Connect Your Data</h3>
              <p className="text-muted-foreground">
                Import products from SAP, spreadsheets, or our REST API. We auto-map fields to EU DPP requirements.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground mx-auto flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Generate Passports</h3>
              <p className="text-muted-foreground">
                Each product gets a unique QR code linking to its digital passport with full sustainability data.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground mx-auto flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Scan & Verify</h3>
              <p className="text-muted-foreground">
                Consumers, regulators, and recyclers verify products instantly with any smartphone camera.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge variant="secondary" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
            Get Started Today
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Ready to Transform Your Product Identity?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Join 850+ brands using PhotonicTag for EU DPP compliance. Start your free trial today —
            no credit card required, setup in minutes.
          </p>

          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base bg-primary-foreground text-foreground"
              required
            />
            <Button type="submit" size="lg" variant="secondary" className="h-12 px-6 whitespace-nowrap">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="flex flex-wrap justify-center gap-6 text-sm opacity-80">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              14-day free trial
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              SAP integration included
            </span>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
