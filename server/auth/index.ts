import type { Express, RequestHandler } from "express";
import session from "express-session";
import passport from "passport";
import connectPg from "connect-pg-simple";
import authRouter, { initializeAuthStrategies } from "./routes";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

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

export { authRouter };
