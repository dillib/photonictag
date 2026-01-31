import type { Express, RequestHandler } from "express";
import session from "express-session";
import passport from "passport";
import connectPg from "connect-pg-simple";
import authRouter, { initializeAuthStrategies } from "./routes";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Check if we're in local development mode (no Replit)
const isLocalMode = !process.env.REPL_ID;

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 7 days

  // Use PostgreSQL session store in production
  if (process.env.DATABASE_URL && !isLocalMode) {
    const PgStore = connectPg(session);
    const sessionStore = new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    });

    return session({
      secret: process.env.SESSION_SECRET || "change-this-secret-in-production",
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: !isLocalMode,
        maxAge: sessionTtl,
        sameSite: "lax",
      },
    });
  }

  // Use memory store in development
  return session({
    secret: process.env.SESSION_SECRET || "local-dev-secret-change-in-production",
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

  // Trust proxy for secure cookies behind reverse proxy
  if (!isLocalMode) {
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
  // In local development mode, you can bypass auth or use mock user
  if (isLocalMode && process.env.DEV_BYPASS_AUTH === "true") {
    // Create a mock user for local development
    if (!req.user) {
      (req as any).user = {
        id: "local-dev-user",
        email: "dev@localhost",
        firstName: "Local",
        lastName: "Developer",
        isAdmin: true,
      };
    }
    return next();
  }

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

export { authRouter };
