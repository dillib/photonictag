// Re-export from new auth system
export { setupAuth, isAuthenticated, isAdmin, getSession } from "../../auth";
export { authStorage, type IAuthStorage } from "./storage";

// Placeholder for backward compatibility with registerAuthRoutes
// The new auth system mounts routes in setupAuth
export function registerAuthRoutes() {
  // Routes are now registered in setupAuth via the auth router
  console.log("[Auth] Auth routes are now registered via setupAuth");
}
