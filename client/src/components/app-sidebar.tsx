import { Link, useLocation } from "wouter";
import { Package, LayoutDashboard, Plus, LogOut, QrCode, Wifi, Plug, Users, Rocket, LifeBuoy, Activity } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Intelligence Hub",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Digital Twins",
    url: "/products",
    icon: Package,
  },
  {
    title: "Audit Log",
    url: "/leads",
    icon: Users,
  },
  {
    title: "Sensors & Readers",
    url: "/iot-devices",
    icon: Wifi,
  },
  {
    title: "ERP Sync (SAP)",
    url: "/integrations/sap",
    icon: Plug,
  },
  {
    title: "Enroll Twin",
    url: "/products/new",
    icon: Plus,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout, isLoggingOut } = useAuth();

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      return user.email;
    }
    return "User";
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/landing" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-primary shadow-sm"
          >
            <QrCode className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight">PhotonicTag</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Identity, speed of light</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item, index) => {
                const isActive = location === item.url ||
                  (item.url !== "/" && location.startsWith(item.url));
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild data-active={isActive}>
                        <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s/g, '-')}`}>
                          <motion.div
                            className="flex items-center gap-2 w-full"
                            whileHover={{ x: 2 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                            <span className={isActive ? 'font-medium text-foreground' : 'text-muted-foreground'}>{item.title}</span>
                          </motion.div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground">
            Internal Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[
                { title: "Internal Hub", url: "/admin/internal", icon: Rocket },
                { title: "AI Support", url: "/admin/support", icon: LifeBuoy },
              ].map((item, index) => {
                const isActive = location === item.url;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navigationItems.length + index) * 0.05 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild data-active={isActive}>
                        <Link href={item.url}>
                          <motion.div
                            className="flex items-center gap-2 w-full"
                            whileHover={{ x: 2 }}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </motion.div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <AnimatePresence>
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-border shadow-sm">
                  <AvatarImage src={user.profileImageUrl || undefined} alt={getDisplayName()} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{getDisplayName()}</p>
                  {user.email && (
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  )}
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarFooter>
    </Sidebar>
  );
}
