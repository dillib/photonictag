import { Link } from "wouter";
import { QrCode, Linkedin, Github } from "lucide-react";

// X (formerly Twitter) icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/landing" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <QrCode className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold">PhotonicTag</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Digital Product Passports for the modern enterprise. EU DPP compliant.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://linkedin.com" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://x.com" className="text-muted-foreground hover:text-foreground transition-colors">
                <XIcon className="w-5 h-5" />
              </a>
              <a href="https://github.com" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/solution" className="hover:text-foreground transition-colors">Platform</Link></li>
              <li><Link href="/use-cases" className="hover:text-foreground transition-colors">Use Cases</Link></li>
              <li><Link href="/integrations" className="hover:text-foreground transition-colors">Integrations</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/scan/demo" className="hover:text-foreground transition-colors">Live Demo</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
              <li><Link href="/eu-dpp-guide" className="hover:text-foreground transition-colors">EU DPP Guide</Link></li>
              <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="/case-studies" className="hover:text-foreground transition-colors">Case Studies</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/security" className="hover:text-foreground transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 PhotonicTag. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>SOC 2 Type II</span>
            <span>•</span>
            <span>GDPR Compliant</span>
            <span>•</span>
            <span>ISO 27001</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
