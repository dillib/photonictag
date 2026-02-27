import type { Express, RequestHandler } from "express";
import session from "express-session";
import passport from "passport";
import connectPg from "connect-pg-simple";
import authRouter, { initializeAuthStrategies } from "./routes";
import { db } from "../db";
import { users, userOrganizations } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV !== "production";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 7 days

  // Require SESSION_SECRET in production
  if (!isDevelopment && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required in production");
  }

  const sessionSecret = process.env.SESSION_SECRET || "dev-secret-change-in-production";

  // Use PostgreSQL session store in production
  if (process.env.DATABASE_URL && !isDevelopment) {
    const PgStore = connectPg(session);
    const sessionStore = new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    });

    return session({
      secret: sessionSecret,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: true,
        maxAge: sessionTtl,
        sameSite: "lax",
      },
    });
  }

  // Use memory store in development
  return session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Allow HTTP for local dev
      maxAge: sessionTtl,
      sameSite: "lax",
    },
  });
}

export async function setupAuth(app: Express) {
  console.log("[Auth] Setting up authentication...");

  // Trust proxy for secure cookies behind reverse proxy (Railway, Cloudflare, etc.)
  if (!isDevelopment) {
    app.set("trust proxy", 1);
  }

  // Setup session
  app.use(getSession());

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Initialize auth strategies
  initializeAuthStrategies();

  // Mount auth routes
  app.use("/api/auth", authRouter);

  // Keep backward compatibility with existing routes
  app.get("/api/login", (req, res) => {
    // Redirect to new login page
    res.redirect("/auth/login");
  });

  console.log("[Auth] Authentication setup complete");
}

// Middleware to require authentication
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if user is still active
  const user = req.user as any;
  const [dbUser] = await db.select({ isActive: users.isActive })
    .from(users)
    .where(eq(users.id, user.id));

  if (!dbUser?.isActive) {
    req.logout(() => {
      res.status(401).json({ message: "Account is disabled" });
    });
    return;
  }

  next();
};

// Middleware to require admin
export const isAdmin: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as any;
  if (!user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

// Middleware to require specific organization tenant access
export const requireOrg = async (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as any;
  // If no org header is provided, we can maybe default to their first org?
  // But for strictest API design, we should require "x-org-id" or similar.
  // For now, let's just assert they belong to *some* organization, or a specific one passed via params.
  const targetOrgId = req.headers["x-org-id"] || req.params.orgId;

  if (!targetOrgId) {
    return res.status(400).json({ message: "Missing x-org-id header or orgId parameter" });
  }

  const [membership] = await db.select()
    .from(userOrganizations)
    .where(and(eq(userOrganizations.userId, user.id), eq(userOrganizations.organizationId, targetOrgId as string)));

  if (!membership && !user.isAdmin) {
    // Note: SUPER_ADMIN (user.isAdmin = true) can bypass this block.
    return res.status(403).json({ message: "Forbidden: You do not have access to this organization" });
  }

  // Attach org membership info to request context
  req.orgMembership = membership;
  req.currentOrgId = targetOrgId;

  next();
};

export { authRouter };
