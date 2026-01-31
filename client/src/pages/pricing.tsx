import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  ArrowRight,
  Calculator,
  Sparkles,
  Building2,
  Package,
  Activity,
  QrCode,
  Shield,
  Brain,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Clock,
  Zap,
  Database,
  Users,
  HelpCircle,
  Gift,
  Star,
  X
} from "lucide-react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

const platformTiers = [
  {
    name: "Pilot",
    price: 0,
    description: "Try PhotonicTag free with up to 100 products",
    features: [
      "100 product identities",
      "Basic dashboard",
      "QR code generation",
      "Consumer scan pages",
      "1 team member",
      "Community support",
      "14-day data retention",
    ],
    limitations: [
      "No API access",
      "No custom branding",
      "PhotonicTag watermark",
    ],
    productLimit: 100,
    popular: false,
    cta: "Start Free",
    ctaVariant: "outline" as const,
  },
  {
    name: "Starter",
    price: 149,
    description: "For small brands preparing for EU DPP compliance",
    features: [
      "Up to 2,500 product identities",
      "Full admin dashboard",
      "REST API access",
      "Basic analytics",
      "3 team members",
      "Email support (48hr)",
      "QR + NFC support",
      "Custom branding",
    ],
    limitations: [],
    productLimit: 2500,
    popular: false,
    cta: "Start Free Trial",
    ctaVariant: "outline" as const,
  },
  {
    name: "Growth",
    price: 499,
    description: "For growing businesses with traceability needs",
    features: [
      "Up to 25,000 product identities",
      "Advanced analytics & reports",
      "Full API + webhooks",
      "10 team members",
      "Priority support (24hr)",
      "Supply chain tracking",
      "AI sustainability scoring",
      "SAP connector (read-only)",
      "Custom compliance reports",
    ],
    limitations: [],
    productLimit: 25000,
    popular: true,
    cta: "Start Free Trial",
    ctaVariant: "default" as const,
  },
  {
    name: "Enterprise",
    price: null,
    description: "For large organizations with complex requirements",
    features: [
      "Unlimited product identities",
      "Full SAP S/4HANA integration",
      "Bidirectional ERP sync",
      "Unlimited team members",
      "Dedicated account manager",
      "99.9% SLA guarantee",
      "Custom AI models",
      "On-premise deployment option",
      "Custom integrations",
      "Advanced security & SSO",
    ],
    limitations: [],
    productLimit: null,
    popular: false,
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
  },
];

const compliancePenalties = [
  {
    regulation: "EU Battery Regulation",
    penalty: "Up to €100,000",
    perUnit: "per non-compliant battery",
    deadline: "Feb 2027",
  },
  {
    regulation: "EU ESPR (Textiles)",
    penalty: "Up to €50,000",
    perUnit: "per product line",
    deadline: "2027-28",
  },
  {
    regulation: "Market Access Denial",
    penalty: "100%",
    perUnit: "of EU revenue at risk",
    deadline: "Immediate",
  },
];

const roiMetrics = [
  {
    metric: "80%",
    label: "Faster Compliance",
    description: "Average reduction in DPP preparation time",
    icon: Clock,
  },
  {
    metric: "€2.1M",
    label: "Penalties Avoided",
    description: "Average savings per enterprise customer",
    icon: Shield,
  },
  {
    metric: "45%",
    label: "Cost Reduction",
    description: "vs. building in-house solution",
    icon: DollarSign,
  },
  {
    metric: "6 months",
    label: "SAP Integration",
    description: "Development time saved with native connector",
    icon: Database,
  },
];

const usageRates = {
  identityStandard: { rate: 0.05, label: "Standard products" },
  identityHighValue: { rate: 0.35, label: "Luxury/high-value goods" },
  traceabilityEvent: { rate: 0.005, label: "Per supply chain event" },
  authenticationScan: { rate: 0.08, label: "Per verification scan" },
};

const volumeDiscounts = [
  { threshold: "10K+", discount: "10% off" },
  { threshold: "100K+", discount: "20% off" },
  { threshold: "1M+", discount: "35% off" },
  { threshold: "10M+", discount: "Custom pricing" },
];

const faqs = [
  {
    question: "What's included in the free Pilot plan?",
    answer: "The Pilot plan includes 100 product identities, basic dashboard, QR code generation, and consumer scan pages. It's perfect for testing PhotonicTag before committing. Data is retained for 14 days.",
  },
  {
    question: "How does SAP integration pricing work?",
    answer: "Read-only SAP connector is included in Growth ($499/mo). Full bidirectional SAP S/4HANA integration with real-time sync is available in Enterprise plans, which includes dedicated implementation support.",
  },
  {
    question: "What are compliance penalties for not having DPP?",
    answer: "EU Battery Regulation penalties can reach €100,000 per non-compliant product. More critically, products without valid DPPs cannot be sold in the EU market after the deadline.",
  },
  {
    question: "Can I switch plans as I grow?",
    answer: "Yes, you can upgrade or downgrade at any time. When upgrading, you'll be prorated. Product identities and data are preserved when switching plans.",
  },
  {
    question: "What's the difference between annual and monthly billing?",
    answer: "Annual billing saves you 20% compared to monthly. Enterprise customers typically negotiate custom terms with additional volume discounts.",
  },
];

function PricingCalculator() {
  const [tier, setTier] = useState<"starter" | "growth" | "enterprise">("growth");
  const [productVolume, setProductVolume] = useState(10000);
  const [isHighValue, setIsHighValue] = useState(false);
  const [includeSAP, setIncludeSAP] = useState(false);
  const [includeAI, setIncludeAI] = useState(true);
  const [traceabilityEvents, setTraceabilityEvents] = useState(50000);
  const [authScans, setAuthScans] = useState(5000);
  const [isAnnual, setIsAnnual] = useState(true);

  const calculation = useMemo(() => {
    const tierPrices = { starter: 149, growth: 499, enterprise: 2500 };
    const identityRate = isHighValue ? 0.35 : 0.05;
    const eventRate = 0.005;
    const scanRate = 0.08;

    // Volume discounts
    let volumeDiscount = 1;
    if (productVolume >= 10000000) volumeDiscount = 0.65;
    else if (productVolume >= 1000000) volumeDiscount = 0.65;
    else if (productVolume >= 100000) volumeDiscount = 0.80;
    else if (productVolume >= 10000) volumeDiscount = 0.90;

    const monthlyPlatform = tierPrices[tier];
    const sapAddon = includeSAP && tier !== "enterprise" ? 500 : 0;
    const aiAddon = includeAI && tier === "starter" ? 149 : 0;

    const annualPlatform = (monthlyPlatform + sapAddon + aiAddon) * 12;
    const annualIdentities = productVolume * identityRate * volumeDiscount;
    const annualEvents = traceabilityEvents * eventRate;
    const annualScans = authScans * scanRate;

    const annualTotal = annualPlatform + annualIdentities + annualEvents + annualScans;
    const annualDiscount = isAnnual ? 0.20 : 0;

    return {
      platform: annualPlatform,
      identities: annualIdentities,
      events: annualEvents,
      scans: annualScans,
      subtotal: annualTotal,
      discount: annualTotal * annualDiscount,
      finalTotal: annualTotal * (1 - annualDiscount),
      volumeDiscount: (1 - volumeDiscount) * 100,
    };
  }, [tier, productVolume, isHighValue, includeSAP, includeAI, traceabilityEvents, authScans, isAnnual]);

  return (
    <Card className="bg-card" data-testid="pricing-calculator">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <CardTitle>Pricing Calculator</CardTitle>
        </div>
        <CardDescription>Estimate your annual investment based on your needs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Platform Tier</Label>
              <Tabs value={tier} onValueChange={(v) => setTier(v as typeof tier)}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="starter" data-testid="calc-tier-starter">Starter</TabsTrigger>
                  <TabsTrigger value="growth" data-testid="calc-tier-growth">Growth</TabsTrigger>
                  <TabsTrigger value="enterprise" data-testid="calc-tier-enterprise">Enterprise</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Products per Year</Label>
                <span className="text-sm font-medium">{productVolume.toLocaleString()}</span>
              </div>
              <Slider
                value={[productVolume]}
                onValueChange={([v]) => setProductVolume(v)}
                min={100}
                max={1000000}
                step={100}
                data-testid="calc-products-slider"
              />
              {calculation.volumeDiscount > 0 && (
                <p className="text-xs text-primary">Volume discount: {calculation.volumeDiscount}% off per-product fees</p>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Switch
                  checked={isHighValue}
                  onCheckedChange={setIsHighValue}
                  data-testid="calc-high-value-switch"
                />
                <Label className="text-sm">Luxury/high-value products ($0.35 vs $0.05/unit)</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Add-Ons</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={includeSAP}
                    onCheckedChange={setIncludeSAP}
                    disabled={tier === "enterprise"}
                    data-testid="calc-sap-switch"
                  />
                  <Label className="text-sm">
                    SAP Connector (+$500/mo)
                    {tier === "enterprise" && <span className="text-primary ml-1">(included)</span>}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={includeAI}
                    onCheckedChange={setIncludeAI}
                    disabled={tier !== "starter"}
                    data-testid="calc-ai-switch"
                  />
                  <Label className="text-sm">
                    AI Sustainability Scoring (+$149/mo)
                    {tier !== "starter" && <span className="text-primary ml-1">(included)</span>}
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Supply Chain Events/Year</Label>
                <span className="text-sm font-medium">{traceabilityEvents.toLocaleString()}</span>
              </div>
              <Slider
                value={[traceabilityEvents]}
                onValueChange={([v]) => setTraceabilityEvents(v)}
                min={0}
                max={1000000}
                step={1000}
                data-testid="calc-events-slider"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Verification Scans/Year</Label>
                <span className="text-sm font-medium">{authScans.toLocaleString()}</span>
              </div>
              <Slider
                value={[authScans]}
                onValueChange={([v]) => setAuthScans(v)}
                min={0}
                max={100000}
                step={100}
                data-testid="calc-scans-slider"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Card className="bg-muted/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Platform + Add-ons (annual)</span>
                  <span className="font-medium">${calculation.platform.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Product Identities</span>
                  <span className="font-medium">${Math.round(calculation.identities).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Supply Chain Events</span>
                  <span className="font-medium">${Math.round(calculation.events).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Verification Scans</span>
                  <span className="font-medium">${Math.round(calculation.scans).toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Switch
                      checked={isAnnual}
                      onCheckedChange={setIsAnnual}
                      data-testid="calc-annual-switch"
                    />
                    <Label className="text-sm font-medium">Annual billing (20% discount)</Label>
                  </div>
                  {isAnnual && calculation.discount > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span className="text-sm">Annual Savings</span>
                      <span className="font-medium">-${Math.round(calculation.discount).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm opacity-80">Estimated Annual Investment</p>
                  <p className="text-4xl font-bold" data-testid="calc-total">${Math.round(calculation.finalTotal).toLocaleString()}</p>
                  <p className="text-sm opacity-80 mt-1">~${Math.round(calculation.finalTotal / 12).toLocaleString()}/month</p>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full gap-2" asChild data-testid="calc-cta">
              <Link href="/contact">
                Get Custom Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Compliance Warning Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm flex-wrap">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">EU Battery Passport deadline: February 2027</span>
          <span className="hidden sm:inline">—</span>
          <span className="hidden sm:inline">Non-compliance penalties up to €100,000 per product</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="text-pricing-title">
            Invest in Compliance, Not Penalties
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Transparent, usage-based pricing that scales with your business.
            Start free, pay only for what you use.
          </p>
        </div>

        {/* ROI Section */}
        <section className="mb-16">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">The Cost of Compliance vs. Non-Compliance</h2>
                <p className="text-muted-foreground">PhotonicTag pays for itself by avoiding penalties and reducing manual effort</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {roiMetrics.map((item, i) => (
                  <div key={i} className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-primary">{item.metric}</p>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4 text-center">EU DPP Non-Compliance Penalties</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {compliancePenalties.map((penalty, i) => (
                    <div key={i} className="bg-background rounded-lg p-4 border border-destructive/20">
                      <p className="text-sm text-muted-foreground">{penalty.regulation}</p>
                      <p className="text-2xl font-bold text-destructive">{penalty.penalty}</p>
                      <p className="text-xs text-muted-foreground">{penalty.perUnit}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">Deadline: {penalty.deadline}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4 bg-muted rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                billingPeriod === "monthly" ? "bg-background shadow" : "text-muted-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`px-4 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                billingPeriod === "annual" ? "bg-background shadow" : "text-muted-foreground"
              }`}
            >
              Annual
              <Badge className="bg-green-500 text-white text-xs">Save 20%</Badge>
            </button>
          </div>
        </div>

        {/* Platform Tiers */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformTiers.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''}`}
                data-testid={`card-plan-${plan.name.toLowerCase()}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gap-1">
                      <Star className="w-3 h-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                {plan.name === "Pilot" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="secondary" className="gap-1">
                      <Gift className="w-3 h-3" />
                      Free Forever
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    {plan.price === null ? (
                      <span className="text-3xl font-bold">Custom</span>
                    ) : plan.price === 0 ? (
                      <span className="text-4xl font-bold">$0</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">
                          ${billingPeriod === "annual" ? Math.round(plan.price * 0.8) : plan.price}
                        </span>
                        <span className="text-muted-foreground">/mo</span>
                        {billingPeriod === "annual" && plan.price > 0 && (
                          <p className="text-xs text-muted-foreground line-through">${plan.price}/mo</p>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation) => (
                      <li key={limitation} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <X className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full gap-2 mt-6"
                    variant={plan.ctaVariant}
                    asChild
                    data-testid={`button-plan-${plan.name.toLowerCase()}`}
                  >
                    {plan.name === "Enterprise" ? (
                      <Link href="/contact">{plan.cta}</Link>
                    ) : (
                      <Link href="/auth/register">
                        {plan.cta}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* SAP Integration Highlight */}
        <section className="mb-20">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Database className="w-10 h-10 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <Badge className="mb-2 bg-blue-500">Save 6+ Months</Badge>
                  <h2 className="text-2xl font-bold mb-2">Native SAP S/4HANA Integration</h2>
                  <p className="text-muted-foreground mb-4">
                    Skip 6+ months of custom development. Our certified SAP connector provides
                    bidirectional sync with Material Master, batch data, and sustainability fields.
                    The only DPP platform with deep ERP integration.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Badge variant="secondary">OData API Native</Badge>
                    <Badge variant="secondary">Real-time Sync</Badge>
                    <Badge variant="secondary">Zero Middleware</Badge>
                    <Badge variant="secondary">SAP Certified Partner</Badge>
                  </div>
                </div>
                <div className="flex-shrink-0 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Starting at</p>
                  <p className="text-3xl font-bold text-blue-600">$500<span className="text-lg">/mo</span></p>
                  <p className="text-xs text-muted-foreground">or included in Enterprise</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Usage-Based Pricing */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Usage-Based Pricing</h2>
            <p className="text-muted-foreground">Pay only for what you use, with volume discounts</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card data-testid="card-usage-identity">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Product Identities</h3>
                <p className="text-sm text-muted-foreground">Digital Passport + QR code per product</p>
                <div className="pt-2 border-t space-y-1">
                  <p className="text-sm"><span className="font-bold text-primary">$0.05</span> standard products</p>
                  <p className="text-sm"><span className="font-bold text-primary">$0.35</span> luxury/high-value</p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-usage-events">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Supply Chain Events</h3>
                <p className="text-sm text-muted-foreground">Every tracked event in the lifecycle</p>
                <div className="pt-2 border-t">
                  <p className="text-sm"><span className="font-bold text-primary">$0.005</span> per event</p>
                  <p className="text-xs text-muted-foreground mt-1">First 10K events/mo included in Growth+</p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-usage-scans">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Verification Scans</h3>
                <p className="text-sm text-muted-foreground">Consumer & B2B authenticity checks</p>
                <div className="pt-2 border-t">
                  <p className="text-sm"><span className="font-bold text-primary">$0.08</span> per scan</p>
                  <p className="text-xs text-muted-foreground mt-1">First 1K scans/mo included in all paid plans</p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-usage-volume">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold">Volume Discounts</h3>
                <p className="text-sm text-muted-foreground">Scale and save more</p>
                <div className="pt-2 border-t space-y-1">
                  {volumeDiscounts.map((vd, i) => (
                    <p key={i} className="text-sm">
                      <span className="font-medium">{vd.threshold}</span>
                      <span className="text-primary ml-2">{vd.discount}</span>
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Calculator */}
        <section className="mb-20">
          <PricingCalculator />
        </section>

        {/* Example Costs */}
        <section className="mb-20 bg-muted/30 rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Real-World Examples</h2>
            <p className="text-muted-foreground">See what customers like you typically invest</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card data-testid="example-startup">
              <CardHeader className="pb-2">
                <Badge variant="secondary" className="w-fit mb-2">D2C Brand</Badge>
                <CardTitle className="text-lg">5,000 Products/Year</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Starter Platform</span>
                  <span>$1,788</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product Identities</span>
                  <span>$250</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scans & Events</span>
                  <span>$500</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Annual Total</span>
                  <span className="text-primary">~$2,500</span>
                </div>
                <p className="text-xs text-muted-foreground pt-2">~$0.50 per product fully loaded</p>
              </CardContent>
            </Card>

            <Card data-testid="example-midsize" className="border-primary">
              <CardHeader className="pb-2">
                <Badge className="w-fit mb-2">Mid-Size Manufacturer</Badge>
                <CardTitle className="text-lg">100,000 Products/Year</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Growth Platform + SAP</span>
                  <span>$9,590</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product Identities (20% off)</span>
                  <span>$4,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scans & Events</span>
                  <span>$3,000</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Annual Total</span>
                  <span className="text-primary">~$16,500</span>
                </div>
                <p className="text-xs text-muted-foreground pt-2">~$0.17 per product fully loaded</p>
              </CardContent>
            </Card>

            <Card data-testid="example-enterprise">
              <CardHeader className="pb-2">
                <Badge variant="secondary" className="w-fit mb-2">Enterprise</Badge>
                <CardTitle className="text-lg">1M+ Products/Year</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Enterprise License</span>
                  <span>$30,000+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product Identities (35% off)</span>
                  <span>$32,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full SAP Integration</span>
                  <span>Included</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Annual Total</span>
                  <span className="text-primary">~$75,000+</span>
                </div>
                <p className="text-xs text-muted-foreground pt-2">~$0.075 per product fully loaded</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-2">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center">
          <div className="bg-primary text-primary-foreground rounded-lg p-8">
            <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold mb-2">Start Your EU DPP Journey Today</h2>
            <p className="opacity-90 mb-6 max-w-xl mx-auto">
              Begin with our free Pilot plan or start a 14-day trial of any paid tier.
              No credit card required. Our team is here to help you succeed.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild data-testid="button-start-trial">
                <Link href="/auth/register" className="gap-2">
                  Start Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10" asChild data-testid="button-talk-sales">
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
