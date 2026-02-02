import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Master admin emails - these users automatically get admin privileges
// Set via MASTER_ADMIN_EMAILS environment variable (comma-separated)
export const MASTER_ADMIN_EMAILS: string[] = process.env.MASTER_ADMIN_EMAILS
  ? process.env.MASTER_ADMIN_EMAILS.split(",").map(email => email.trim())
  : [];

// User storage table - Extended for enterprise authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash"), // nullable for SSO-only users
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),

  // Email verification
  emailVerified: boolean("email_verified").default(false),
  emailVerifyToken: varchar("email_verify_token"),
  emailVerifyExpires: timestamp("email_verify_expires"),

  // Password reset
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),

  // Account security
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockoutUntil: timestamp("lockout_until"),
  lastLoginAt: timestamp("last_login_at"),

  // Account status
  isActive: boolean("is_active").default(true),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
