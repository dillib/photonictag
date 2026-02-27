import { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import crypto from "crypto";
import { z } from "zod";
import { db } from "../db";
import { users, oauthAccounts } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  localStrategy,
  createUserWithPassword,
  verifyEmail,
  createPasswordResetToken,
  resetPassword,
  getUserByEmail,
} from "./strategies/local";
import { createGoogleStrategy } from "./strategies/google";
import { createMicrosoftStrategy } from "./strategies/microsoft";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  isEmailConfigured,
} from "./email-service";

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// Initialize passport strategies
export function initializeAuthStrategies() {
  // Local strategy
  passport.use(localStrategy);

  // Google strategy (if configured)
  const googleStrategy = createGoogleStrategy();
  if (googleStrategy) {
    passport.use("google", googleStrategy);
  }

  // Microsoft strategy (if configured)
  const microsoftStrategy = createMicrosoftStrategy();
  if (microsoftStrategy) {
    passport.use("microsoft", microsoftStrategy);
  }

  // Serialize/deserialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      if (user) {
        // Remove sensitive fields
        const { passwordHash, emailVerifyToken, passwordResetToken, ...safeUser } = user;
        done(null, safeUser);
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error);
    }
  });

  console.log("[Auth] Strategies initialized:");
  console.log("  - Local (email/password): enabled");
  console.log(`  - Google OAuth: ${googleStrategy ? "enabled" : "disabled (no credentials)"}`);
  console.log(`  - Microsoft OAuth: ${microsoftStrategy ? "enabled" : "disabled (no credentials)"}`);
}

// Helper function to check if a provider is enabled
function isProviderEnabled(provider: string): boolean {
  if (provider === "google") {
    return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }
  if (provider === "microsoft") {
    return !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
  }
  return false;
}

// ============================================
// AUTH CONFIGURATION ENDPOINT
// ============================================

router.get("/config", (req, res) => {
  res.json({
    providers: {
      local: true,
      google: isProviderEnabled("google"),
      microsoft: isProviderEnabled("microsoft"),
    },
    features: {
      registration: true,
      passwordReset: true,
      emailVerification: true,
    },
  });
});

// ============================================
// LOCAL AUTH ROUTES
// ============================================

// Register new user
router.post("/register", async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await getUserByEmail(data.email);
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    // Create user
    const { user, verifyToken } = await createUserWithPassword(
      data.email,
      data.password,
      data.firstName,
      data.lastName
    );

    // Check if email is configured
    const emailEnabled = isEmailConfigured();

    if (emailEnabled) {
      // Send verification email
      await sendVerificationEmail(data.email, verifyToken, data.firstName);
      res.status(201).json({
        message: "Account created! Please check your email to verify your account.",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } else {
      // Auto-verify user when email is not configured
      await db.update(users).set({
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
        updatedAt: new Date(),
      }).where(eq(users.id, user.id));

      console.log(`[Auth] Auto-verified user ${data.email} (email not configured)`);

      res.status(201).json({
        message: "Account created! You can now sign in.",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("[Auth] Registration error:", error);
    res.status(500).json({ message: "Failed to create account" });
  }
});

// Login with email/password
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  try {
    loginSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
  }

  passport.authenticate("local", (err: Error, user: any, info: any) => {
    if (err) {
      console.error("[Auth] Login error:", err);
      return res.status(500).json({ message: `An error occurred during login: ${err.message}` });
    }

    if (!user) {
      return res.status(401).json({ message: info?.message || "Invalid credentials" });
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error("[Auth] Session error:", loginErr);
        return res.status(500).json({ message: "Failed to create session" });
      }

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          isAdmin: user.isAdmin,
        },
      });
    });
  })(req, res, next);
});

// Verify email
router.post("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = verifyEmailSchema.parse(req.body);

    const user = await verifyEmail(token);

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    // Send welcome email
    await sendWelcomeEmail(user.email, user.firstName || undefined);

    res.json({ message: "Email verified successfully! You can now sign in." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("[Auth] Email verification error:", error);
    res.status(500).json({ message: "Failed to verify email" });
  }
});

// Request password reset
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    // Always return success to prevent email enumeration
    const token = await createPasswordResetToken(email);

    if (token) {
      // Get user for first name
      const user = await getUserByEmail(email);
      await sendPasswordResetEmail(email, token, user?.firstName || undefined);
    }

    res.json({
      message: "If an account with that email exists, we've sent password reset instructions.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("[Auth] Forgot password error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
});

// Reset password
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    const success = await resetPassword(token, password);

    if (!success) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    res.json({ message: "Password reset successfully! You can now sign in with your new password." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("[Auth] Password reset error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// Resend verification email
router.post("/resend-verification", async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await getUserByEmail(email);

    if (!user) {
      // Don't reveal whether the email exists
      return res.json({ message: "If an account with that email exists, we've sent a verification email." });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate new verification token
    const verifyToken = crypto.randomUUID();
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.update(users).set({
      emailVerifyToken: verifyToken,
      emailVerifyExpires: verifyExpires,
      updatedAt: new Date(),
    }).where(eq(users.id, user.id));

    await sendVerificationEmail(email, verifyToken, user.firstName || undefined);

    res.json({ message: "Verification email sent!" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("[Auth] Resend verification error:", error);
    res.status(500).json({ message: "Failed to send verification email" });
  }
});

// ============================================
// GOOGLE OAUTH ROUTES
// ============================================

router.get("/google", (req, res, next) => {
  if (!isProviderEnabled("google")) {
    return res.status(404).json({ message: "Google sign-in is not configured" });
  }
  passport.authenticate("google", { scope: ["email", "profile"] })(req, res, next);
});

router.get("/google/callback",
  (req, res, next) => {
    if (!isProviderEnabled("google")) {
      return res.redirect("/auth/login?error=google_not_configured");
    }
    passport.authenticate("google", {
      failureRedirect: "/auth/login?error=google_auth_failed",
    })(req, res, next);
  },
  (req, res) => {
    res.redirect("/");
  }
);

// ============================================
// MICROSOFT OAUTH ROUTES
// ============================================

router.get("/microsoft", (req, res, next) => {
  if (!isProviderEnabled("microsoft")) {
    return res.status(404).json({ message: "Microsoft sign-in is not configured" });
  }
  passport.authenticate("microsoft", { scope: ["openid", "email", "profile"] })(req, res, next);
});

router.get("/microsoft/callback",
  (req, res, next) => {
    if (!isProviderEnabled("microsoft")) {
      return res.redirect("/auth/login?error=microsoft_not_configured");
    }
    passport.authenticate("microsoft", {
      failureRedirect: "/auth/login?error=microsoft_auth_failed",
    })(req, res, next);
  },
  (req, res) => {
    res.redirect("/");
  }
);

// ============================================
// SESSION ROUTES
// ============================================

// Get current user
router.get("/user", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.json(req.user);
});

// Logout
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("[Auth] Logout error:", err);
      return res.status(500).json({ message: "Failed to logout" });
    }
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("[Auth] Session destroy error:", destroyErr);
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
});

// Also support GET for logout (for redirect flows)
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("[Auth] Logout error:", err);
    }
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("[Auth] Session destroy error:", destroyErr);
      }
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });
});

// ============================================
// ACCOUNT LINKING ROUTES
// ============================================

// Get linked accounts
router.get("/linked-accounts", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const user = req.user as any;
  const accounts = await db.select({
    provider: oauthAccounts.provider,
    createdAt: oauthAccounts.createdAt,
  }).from(oauthAccounts).where(eq(oauthAccounts.userId, user.id));

  // Check if user has a password
  const [userRecord] = await db.select({ hasPassword: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id));

  res.json({
    hasPassword: !!userRecord?.hasPassword,
    linkedProviders: accounts.map(a => a.provider),
  });
});

export default router;
