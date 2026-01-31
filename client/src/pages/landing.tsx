import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  QrCode,
  Shield,
  Leaf,
  Truck,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Building2,
  Star,
  Quote,
  Clock,
  Zap,
  Shirt,
  Cpu,
  Package,
  Play,
  BarChart3,
} from "lucide-react";
import { Link } from "wouter";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

// Customer testimonials
const testimonials = [
  {
    quote: "PhotonicTag reduced our EU DPP compliance preparation time by 80%. We went from scrambling to confident in just 6 weeks.",
    author: "Sarah Chen",
    title: "VP of Sustainability",
    company: "GreenCell Energy",
    logo: "GC"
  },
  {
    quote: "The SAP integration was seamless. Our entire product catalog was synced with digital passports in under a week.",
    author: "Marcus Weber",
    title: "CTO",
    company: "EuroTextile Group",
    logo: "ET"
  },
  {
    quote: "Our customers love scanning products to verify authenticity. It's become a key differentiator for our brand.",
    author: "Elena Rodriguez",
    title: "Head of Digital",
    company: "Milano Leather Co.",
    logo: "ML"
  }
];

// Enterprise logos (placeholder names)
const enterpriseLogos = [
  "TechCorp", "GreenEnergy", "FashionForward",
  "AutoParts Pro", "SmartHome Inc", "PackagingPlus"
];

// Key benefits (brief)
const keyBenefits = [
  {
    icon: QrCode,
    title: "Digital Passports",
    description: "Unique QR codes for every product with full lifecycle data"
  },
  {
    icon: Shield,
    title: "Anti-Counterfeit",
    description: "Tamper-proof verification consumers can trust"
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description: "Carbon footprint, recyclability, and material tracking"
  },
  {
    icon: BarChart3,
    title: "SAP Integration",
    description: "Native sync with SAP S/4HANA and other ERPs"
  }
];

export default function Landing() {
  const [email, setEmail] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to registration with pre-filled email
    window.location.href = `/auth/register?email=${encodeURIComponent(email)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 text-center text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">EU Battery Passport Deadline: February 2027</span>
          <span className="hidden sm:inline">—</span>
          <span className="hidden sm:inline">Start your compliance journey today</span>
          <Link href="/eu-dpp-guide" className="underline font-semibold hover:no-underline ml-1">
            Learn more →
          </Link>
        </div>
      </div>

      <PublicNav />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge variant="secondary" className="gap-1">
                <Shield className="w-3 h-3" />
                EU DPP 2027 Ready
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                4.9/5 on G2
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Digital Product Passports{" "}
              <span className="text-primary">Made Simple</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Create tamper-proof digital identities for every product.
              Verify authenticity, ensure EU compliance, and build consumer trust — all with a single scan.
            </p>

            {/* Email Capture Form */}
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
              <Input
                type="email"
                placeholder="Enter your work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
                required
              />
              <Button type="submit" size="lg" className="h-12 px-6 whitespace-nowrap">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <p className="text-sm text-muted-foreground">
              14-day free trial • No credit card required • Setup in minutes
            </p>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 pt-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>SOC 2 Type II</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>ISO 27001</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-y bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by 850+ brands preparing for EU DPP compliance
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {enterpriseLogos.map((logo, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                <Building2 className="w-5 h-5" />
                <span className="font-semibold">{logo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <p className="text-4xl sm:text-5xl font-bold text-primary">2.8M+</p>
              <p className="text-sm text-muted-foreground">Products Tracked</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-4xl sm:text-5xl font-bold text-primary">850+</p>
              <p className="text-sm text-muted-foreground">Enterprise Brands</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-4xl sm:text-5xl font-bold text-primary">15M+</p>
              <p className="text-sm text-muted-foreground">Consumer Scans</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-4xl sm:text-5xl font-bold text-primary">99.9%</p>
              <p className="text-sm text-muted-foreground">Uptime SLA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits - Brief */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything You Need for EU DPP Compliance
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One platform. Complete compliance. Zero headaches.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyBenefits.map((benefit, i) => (
              <Card key={i} className="text-center border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link href="/solution" className="gap-2">
                Explore All Features
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* EU Compliance Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 gap-1 bg-amber-500/10 text-amber-700 border-amber-500/20">
              <Clock className="w-3 h-3" />
              Compliance Timeline
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              EU DPP Deadlines Are Approaching
            </h2>
            <p className="text-lg text-muted-foreground">
              Don't wait until the last minute.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-5 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white mx-auto flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <p className="text-xl font-bold">Feb 2027</p>
                <p className="text-sm font-medium">Batteries</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardContent className="p-5 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white mx-auto flex items-center justify-center">
                  <Shirt className="w-5 h-5" />
                </div>
                <p className="text-xl font-bold">2027-28</p>
                <p className="text-sm font-medium">Textiles</p>
              </CardContent>
            </Card>
            <Card className="border-purple-500/30 bg-purple-500/5">
              <CardContent className="p-5 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-purple-500 text-white mx-auto flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <p className="text-xl font-bold">2028-29</p>
                <p className="text-sm font-medium">Electronics</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-5 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white mx-auto flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <p className="text-xl font-bold">2029-30</p>
                <p className="text-sm font-medium">All Products</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/use-cases" className="gap-2">
                See Industry Requirements
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Trusted by Industry Leaders
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-primary/20" />
                  <p className="text-muted-foreground text-sm italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{testimonial.logo}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.title}, {testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" asChild>
              <Link href="/case-studies" className="gap-2">
                Read Case Studies
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works - Brief */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Get Started in Three Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground mx-auto flex items-center justify-center text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold">Connect Your Data</h3>
              <p className="text-sm text-muted-foreground">
                Import from SAP, spreadsheets, or API
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground mx-auto flex items-center justify-center text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold">Generate Passports</h3>
              <p className="text-sm text-muted-foreground">
                Auto-create QR codes with compliance data
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground mx-auto flex items-center justify-center text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold">Scan & Verify</h3>
              <p className="text-sm text-muted-foreground">
                Anyone can verify with a smartphone
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Button size="lg" variant="outline" asChild>
              <Link href="/scan/demo" className="gap-2">
                <Play className="w-4 h-4" />
                Try Live Demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready for EU DPP Compliance?
          </h2>
          <p className="text-lg opacity-90">
            Join 850+ brands using PhotonicTag. Start free — no credit card required.
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

          <div className="flex flex-wrap justify-center gap-6 text-sm opacity-80 pt-2">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              14-day free trial
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              No credit card
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
