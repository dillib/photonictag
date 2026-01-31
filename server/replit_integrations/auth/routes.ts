import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Check if running in local development mode
const isLocalMode = !process.env.REPL_ID;

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      // In local mode, return mock user directly
      if (isLocalMode) {
        res.json({
          id: "local-dev-user",
          email: "dev@localhost",
          firstName: "Local",
          lastName: "Developer",
          profileImageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return;
      }

      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
