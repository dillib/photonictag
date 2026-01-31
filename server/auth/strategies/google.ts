import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { db } from "../../db";
import { users, oauthAccounts } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import type { User, OAuthAccount } from "@shared/schema";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.APP_URL || "http://localhost:5000";

export function createGoogleStrategy() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn("[GoogleAuth] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET - Google OAuth disabled");
    return null;
  }

  return new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${APP_URL}/api/auth/google/callback`,
      scope: ["email", "profile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const result = await handleGoogleCallback(profile, accessToken, refreshToken);
        return done(null, result.user);
      } catch (error) {
        console.error("[GoogleStrategy] Error:", error);
        return done(error as Error);
      }
    }
  );
}

interface GoogleCallbackResult {
  user: User;
  isNewUser: boolean;
}

async function handleGoogleCallback(
  profile: Profile,
  accessToken: string,
  refreshToken?: string
): Promise<GoogleCallbackResult> {
  const googleId = profile.id;
  const email = profile.emails?.[0]?.value?.toLowerCase();
  const firstName = profile.name?.givenName;
  const lastName = profile.name?.familyName;
  const profileImageUrl = profile.photos?.[0]?.value;

  if (!email) {
    throw new Error("No email provided by Google");
  }

  // Check if we have an existing OAuth account link
  const [existingOAuthAccount] = await db.select()
    .from(oauthAccounts)
    .where(and(
      eq(oauthAccounts.provider, "google"),
      eq(oauthAccounts.providerAccountId, googleId)
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
    // Link Google account to existing user
    await db.insert(oauthAccounts).values({
      userId: existingUser.id,
      provider: "google",
      providerAccountId: googleId,
      accessToken,
      refreshToken,
    });

    // Update user profile if needed
    await db.update(users).set({
      profileImageUrl: profileImageUrl || existingUser.profileImageUrl,
      firstName: firstName || existingUser.firstName,
      lastName: lastName || existingUser.lastName,
      emailVerified: true, // Google emails are verified
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(users.id, existingUser.id));

    const [updatedUser] = await db.select().from(users).where(eq(users.id, existingUser.id));
    return { user: updatedUser, isNewUser: false };
  }

  // Create new user
  const [newUser] = await db.insert(users).values({
    email,
    firstName,
    lastName,
    profileImageUrl,
    emailVerified: true, // Google emails are verified
    isActive: true,
    lastLoginAt: new Date(),
  }).returning();

  // Create OAuth account link
  await db.insert(oauthAccounts).values({
    userId: newUser.id,
    provider: "google",
    providerAccountId: googleId,
    accessToken,
    refreshToken,
  });

  return { user: newUser, isNewUser: true };
}

export async function getGoogleAccountForUser(userId: string): Promise<OAuthAccount | null> {
  const [account] = await db.select()
    .from(oauthAccounts)
    .where(and(
      eq(oauthAccounts.userId, userId),
      eq(oauthAccounts.provider, "google")
    ));
  return account || null;
}

export async function unlinkGoogleAccount(userId: string): Promise<boolean> {
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
      eq(oauthAccounts.provider, "microsoft") // or other providers
    ));

  if (!user.passwordHash && otherAccounts.length === 0) {
    throw new Error("Cannot unlink Google account - it's your only sign-in method");
  }

  await db.delete(oauthAccounts).where(and(
    eq(oauthAccounts.userId, userId),
    eq(oauthAccounts.provider, "google")
  ));

  return true;
}
