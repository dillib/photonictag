import React, { Suspense } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScrollToTop } from "@/components/scroll-to-top";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

const Landing = React.lazy(() => import("@/pages/landing"));
const Dashboard = React.lazy(() => import("@/pages/dashboard"));
const Products = React.lazy(() => import("@/pages/products"));
const ProductForm = React.lazy(() => import("@/pages/product-form"));
const ProductDetail = React.lazy(() => import("@/pages/product-detail"));
const IoTDevices = React.lazy(() => import("@/pages/iot-devices"));
const SAPConnector = React.lazy(() => import("@/pages/sap-connector"));
const PublicScan = React.lazy(() => import("@/pages/public-scan"));
const Integrations = React.lazy(() => import("@/pages/integrations"));
const NotFound = React.lazy(() => import("@/pages/not-found"));
const LeadsPage = React.lazy(() => import("@/pages/admin/leads"));
const InternalDashboard = React.lazy(() => import("@/pages/internal-dashboard"));
const SupportInternal = React.lazy(() => import("@/pages/internal-support"));

// Auth pages
const LoginPage = React.lazy(() => import("@/pages/auth/login"));
const RegisterPage = React.lazy(() => import("@/pages/auth/register"));
const ForgotPasswordPage = React.lazy(() => import("@/pages/auth/forgot-password"));
const ResetPasswordPage = React.lazy(() => import("@/pages/auth/reset-password"));
const VerifyEmailPage = React.lazy(() => import("@/pages/auth/verify-email"));

// ... AdminLayout and ProtectedRoute remain unchanged ...
function CustomerLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-sidebar">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden bg-background rounded-tl-[2rem] border-t border-l border-border shadow-sm">
          <header className="flex h-14 items-center justify-between gap-4 border-b px-4 shrink-0 bg-background/80 backdrop-blur-md z-10">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
            <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function PlatformLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-sidebar">
        {/* We can place a PlatformSidebar here later, for now reuse AppSidebar */}
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden bg-background rounded-tl-[2rem] border-t border-l border-border shadow-sm">
          <header className="flex h-14 items-center justify-between gap-4 border-b px-4 shrink-0 bg-background/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <span className="font-semibold text-foreground">Platform Administration</span>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
            <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page for protected routes
    if (location !== "/") {
      return <Redirect to="/auth/login" />;
    }
    // Show landing page for root path when not authenticated
    return <Landing />;
  }

  if (location.startsWith("/admin")) {
    return <PlatformLayout>{children}</PlatformLayout>;
  }

  return <CustomerLayout>{children}</CustomerLayout>;
}

function Router() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <Switch>
        <Route path="/">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/products">
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        </Route>
        <Route path="/products/new">
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        </Route>
        <Route path="/products/:id/edit">
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        </Route>
        <Route path="/products/:id">
          <ProtectedRoute>
            <ProductDetail />
          </ProtectedRoute>
        </Route>
        <Route path="/iot-devices">
          <ProtectedRoute>
            <IoTDevices />
          </ProtectedRoute>
        </Route>
        <Route path="/integrations/sap">
          <ProtectedRoute>
            <SAPConnector />
          </ProtectedRoute>
        </Route>
        <Route path="/leads">
          <ProtectedRoute>
            <LeadsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/internal">
          <ProtectedRoute>
            <InternalDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/support">
          <ProtectedRoute>
            <SupportInternal />
          </ProtectedRoute>
        </Route>
        <Route path="/product/:id">
          <PublicScan />
        </Route>
        <Route path="/scan/demo">
          <PublicScan isDemo />
        </Route>
        <Route path="/landing" component={Landing} />
        <Route path="/integrations" component={Integrations} />
        {/* Auth routes */}
        <Route path="/admin/login">
          <LoginPage
            title="Platform Admin Login"
            subtitle="Sign in to the administration portal"
            defaultEmail="admin@photonictag.com"
            redirectUrl="/admin/internal"
          />
        </Route>
        <Route path="/crm/login">
          <LoginPage
            title="CRM Login"
            subtitle="Sign in to the partner and sales CRM"
            defaultEmail="demo@photonictag.com"
            redirectUrl="/leads"
          />
        </Route>
        <Route path="/demo/login">
          <LoginPage
            title="Demo Login"
            subtitle="Sign in to the demonstration environment"
            defaultEmail="demo@photonictag.com"
            redirectUrl="/"
          />
        </Route>
        <Route path="/auth/login">
          <LoginPage />
        </Route>
        <Route path="/auth/register" component={RegisterPage} />
        <Route path="/auth/forgot-password" component={ForgotPasswordPage} />
        <Route path="/auth/reset-password" component={ResetPasswordPage} />
        <Route path="/auth/verify-email" component={VerifyEmailPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="photonictag-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ScrollToTop />
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
