import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { db } from "../../db";
import { users, oauthAccounts } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import type { User, OAuthAccount } from "@shared/schema";

// Microsoft OAuth profile type
interface MicrosoftProfile {
  id: string;
  displayName?: string;
  emails?: Array<{ value: string }>;
  name?: { givenName?: string; familyName?: string };
  _json?: { mail?: string; givenName?: string; surname?: string };
}

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const APP_URL = process.env.APP_URL || "http://localhost:5000";

export function createMicrosoftStrategy() {
  if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET) {
    console.warn("[MicrosoftAuth] Missing MICROSOFT_CLIENT_ID or MICROSOFT_CLIENT_SECRET - Microsoft OAuth disabled");
    return null;
  }

  return new MicrosoftStrategy(
    {
      clientID: MICROSOFT_CLIENT_ID,
      clientSecret: MICROSOFT_CLIENT_SECRET,
      callbackURL: `${APP_URL}/api/auth/microsoft/callback`,
      scope: ["openid", "email", "profile"],
      tenant: "common", // Allow personal + work accounts
    },
    async (accessToken: string, refreshToken: string, profile: MicrosoftProfile, done: (error: any, user?: any) => void) => {
      try {
        const result = await handleMicrosoftCallback(profile, accessToken, refreshToken);
        return done(null, result.user);
      } catch (error) {
        console.error("[MicrosoftStrategy] Error:", error);
        return done(error as Error);
      }
    }
  );
}

interface MicrosoftCallbackResult {
  user: User;
  isNewUser: boolean;
}

async function handleMicrosoftCallback(
  profile: MicrosoftProfile,
  accessToken: string,
  refreshToken?: string
): Promise<MicrosoftCallbackResult> {
  const microsoftId = profile.id;
  const email = profile.emails?.[0]?.value?.toLowerCase() || profile._json?.mail?.toLowerCase();
  const firstName = profile.name?.givenName || profile._json?.givenName;
  const lastName = profile.name?.familyName || profile._json?.surname;
  const displayName = profile.displayName;

  if (!email) {
    throw new Error("No email provided by Microsoft");
  }

  // Check if we have an existing OAuth account link
  const [existingOAuthAccount] = await db.select()
    .from(oauthAccounts)
    .where(and(
      eq(oauthAccounts.provider, "microsoft"),
      eq(oauthAccounts.providerAccountId, microsoftId)
    ));

  if (existingOAuthAccount) {
    // Update tokens
    await db.update(oauthAccounts).set({
      accessToken,
      refreshToken: refreshToken || existingOAuthAccount.refreshToken,
    }).where(eq(oauthAccounts.id, existingOAuthAccount.id));

    // Get the linked user
    const [user] = await db.select().from(users).where(eq(users.id, existingOAuthAccount.userId));

    if (!user) {
      throw new Error("Linked user not found");
    }

    // Update last login
    await db.update(users).set({
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(users.id, user.id));

    return { user, isNewUser: false };
  }

  // Check if user exists with this email
  let [existingUser] = await db.select().from(users).where(eq(users.email, email));

  if (existingUser) {
    // Link Microsoft account to existing user
    await db.insert(oauthAccounts).values({
      userId: existingUser.id,
      provider: "microsoft",
      providerAccountId: microsoftId,
      accessToken,
      refreshToken,
    });

    // Update user profile if needed
    const updates: Partial<typeof users.$inferInsert> = {
      emailVerified: true, // Microsoft emails are verified
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    };

    if (!existingUser.firstName && firstName) {
      updates.firstName = firstName;
    }
    if (!existingUser.lastName && lastName) {
      updates.lastName = lastName;
    }

    await db.update(users).set(updates).where(eq(users.id, existingUser.id));

    const [updatedUser] = await db.select().from(users).where(eq(users.id, existingUser.id));
    return { user: updatedUser, isNewUser: false };
  }

  // Create new user
  const [newUser] = await db.insert(users).values({
    email,
    firstName: firstName || displayName?.split(" ")[0],
    lastName: lastName || displayName?.split(" ").slice(1).join(" "),
    emailVerified: true, // Microsoft emails are verified
    isActive: true,
    lastLoginAt: new Date(),
  }).returning();

  // Create OAuth account link
  await db.insert(oauthAccounts).values({
    userId: newUser.id,
    provider: "microsoft",
    providerAccountId: microsoftId,
    accessToken,
    refreshToken,
  });

  return { user: newUser, isNewUser: true };
}

export async function getMicrosoftAccountForUser(userId: string): Promise<OAuthAccount | null> {
  const [account] = await db.select()
    .from(oauthAccounts)
    .where(and(
      eq(oauthAccounts.userId, userId),
      eq(oauthAccounts.provider, "microsoft")
    ));
  return account || null;
}

export async function unlinkMicrosoftAccount(userId: string): Promise<boolean> {
  // Check if user has a password (can't unlink if it's their only auth method)
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    return false;
  }

  // Count other OAuth accounts
  const otherAccounts = await db.select()
    .from(oauthAccounts)
    .where(and(
      eq(oauthAccounts.userId, userId),
      eq(oauthAccounts.provider, "google") // or other providers
    ));

  if (!user.passwordHash && otherAccounts.length === 0) {
    throw new Error("Cannot unlink Microsoft account - it's your only sign-in method");
  }

  await db.delete(oauthAccounts).where(and(
    eq(oauthAccounts.userId, userId),
    eq(oauthAccounts.provider, "microsoft")
  ));

  return true;
}
