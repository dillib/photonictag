import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { createUserWithPassword } from "./auth/strategies/local";

export async function seedDefaultUsers() {
    console.log("[Seed] Checking for default users...");

    // 1. Admin User
    const [adminUser] = await db.select().from(users).where(eq(users.email, "admin@photonictag.com"));
    if (!adminUser) {
        console.log("[Seed] Creating default admin user (admin@photonictag.com)...");
        const { user } = await createUserWithPassword(
            "admin@photonictag.com",
            "admin123",
            "Platform",
            "Admin"
        );
        // Force email confirmation and admin status
        await db.update(users).set({
            emailVerified: true,
            isAdmin: true,
            emailVerifyToken: null,
        }).where(eq(users.id, user.id));
        console.log("[Seed] Admin user created.");
    }

    // 2. Demo User
    const [demoUser] = await db.select().from(users).where(eq(users.email, "demo@photonictag.com"));
    if (!demoUser) {
        console.log("[Seed] Creating default demo user (demo@photonictag.com)...");
        const { user } = await createUserWithPassword(
            "demo@photonictag.com",
            "demo123",
            "Demo",
            "User"
        );
        // Force email confirmation
        await db.update(users).set({
            emailVerified: true,
            emailVerifyToken: null,
        }).where(eq(users.id, user.id));
        console.log("[Seed] Demo user created.");
    }
}
