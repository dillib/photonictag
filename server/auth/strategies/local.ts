import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { db } from "../../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { User } from "@shared/schema";

const BCRYPT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

async function checkAccountLockout(user: User): Promise<{ locked: boolean; remainingMs?: number }> {
  if (!user.lockoutUntil) {
    return { locked: false };
  }

  const now = new Date();
  if (user.lockoutUntil > now) {
    const remainingMs = user.lockoutUntil.getTime() - now.getTime();
    return { locked: true, remainingMs };
  }

  // Lockout expired, reset failed attempts
  await db.update(users).set({
    failedLoginAttempts: 0,
    lockoutUntil: null,
    updatedAt: new Date(),
  }).where(eq(users.id, user.id));

  return { locked: false };
}

async function recordFailedLogin(user: User): Promise<void> {
  const attempts = (user.failedLoginAttempts || 0) + 1;
  const updates: Partial<typeof users.$inferInsert> = {
    failedLoginAttempts: attempts,
    updatedAt: new Date(),
  };

  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    updates.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
  }

  await db.update(users).set(updates).where(eq(users.id, user.id));
}

async function recordSuccessfulLogin(user: User): Promise<void> {
  await db.update(users).set({
    failedLoginAttempts: 0,
    lockoutUntil: null,
    lastLoginAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(users.id, user.id));
}

export const localStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  },
  async (email, password, done) => {
    try {
      // Find user by email
      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

      if (!user) {
        return done(null, false, { message: "Invalid email or password" });
      }

      // Check if account is active
      if (!user.isActive) {
        return done(null, false, { message: "Account is disabled" });
      }

      // Check for account lockout
      const lockoutStatus = await checkAccountLockout(user);
      if (lockoutStatus.locked) {
        const remainingMinutes = Math.ceil((lockoutStatus.remainingMs || 0) / 60000);
        return done(null, false, {
          message: `Account locked. Try again in ${remainingMinutes} minute(s)`
        });
      }

      // Check if user has a password (might be SSO-only)
      if (!user.passwordHash) {
        return done(null, false, {
          message: "Please sign in using your SSO provider"
        });
      }

      // Verify password
      const isValid = await verifyPassword(password, user.passwordHash);

      if (!isValid) {
        await recordFailedLogin(user);
        return done(null, false, { message: "Invalid email or password" });
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return done(null, false, {
          message: "Please verify your email before signing in"
        });
      }

      // Success - reset failed attempts and record login
      await recordSuccessfulLogin(user);

      // Return user without sensitive fields
      const { passwordHash, emailVerifyToken, passwordResetToken, ...safeUser } = user;
      return done(null, safeUser);

    } catch (error) {
      console.error("[LocalStrategy] Error during authentication:", error);
      return done(error);
    }
  }
);

export async function createUserWithPassword(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<{ user: User; verifyToken: string }> {
  const passwordHash = await hashPassword(password);
  const verifyToken = crypto.randomUUID();
  const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const [user] = await db.insert(users).values({
    email: email.toLowerCase(),
    passwordHash,
    firstName,
    lastName,
    emailVerified: false,
    emailVerifyToken: verifyToken,
    emailVerifyExpires: verifyExpires,
    isActive: true,
  }).returning();

  return { user, verifyToken };
}

export async function verifyEmail(token: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.emailVerifyToken, token));

  if (!user) {
    return null;
  }

  if (user.emailVerifyExpires && user.emailVerifyExpires < new Date()) {
    return null; // Token expired
  }

  const [updatedUser] = await db.update(users).set({
    emailVerified: true,
    emailVerifyToken: null,
    emailVerifyExpires: null,
    updatedAt: new Date(),
  }).where(eq(users.id, user.id)).returning();

  return updatedUser;
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

  if (!user || !user.isActive) {
    return null;
  }

  const resetToken = crypto.randomUUID();
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.update(users).set({
    passwordResetToken: resetToken,
    passwordResetExpires: resetExpires,
    updatedAt: new Date(),
  }).where(eq(users.id, user.id));

  return resetToken;
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token));

  if (!user) {
    return false;
  }

  if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
    return false; // Token expired
  }

  const passwordHash = await hashPassword(newPassword);

  await db.update(users).set({
    passwordHash,
    passwordResetToken: null,
    passwordResetExpires: null,
    failedLoginAttempts: 0,
    lockoutUntil: null,
    updatedAt: new Date(),
  }).where(eq(users.id, user.id));

  return true;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
  return user || null;
}
