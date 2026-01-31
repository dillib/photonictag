# Deploy Lead Capture to Replit

## Quick Steps (10 minutes)

### Step 1: Update `shared/schema.ts`

Find this line (near line 890):
```typescript
// AI RESPONSE TYPES (kept for API compatibility)
```

Add this **BEFORE** it:

```typescript
// ============================================
// LEADS (for marketing & sales)
// ============================================

export type LeadSource = "landing_page" | "contact_form" | "pricing_page" | "demo_request" | "newsletter" | "linkedin" | "other";
export type LeadStatus = "new" | "contacted" | "qualified" | "demo_scheduled" | "proposal_sent" | "won" | "lost";

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  name: text("name"),
  company: text("company"),
  phone: text("phone"),
  message: text("message"),
  source: text("source").$type<LeadSource>().default("landing_page").notNull(),
  status: text("status").$type<LeadStatus>().default("new").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// ============================================
```

---

### Step 2: Update `server/storage.ts`

**A) Add to imports** (around line 30):
```typescript
  type Lead,
  type InsertLead,
  type LeadStatus,
  leads,
```

**B) Add at end of class** (before the closing `}`):
```typescript
  // Leads
  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.email, email.toLowerCase()));
    return lead;
  }

  async getAllLeads(): Promise<Lead[]> {
    return db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values({
      ...insertLead,
      email: insertLead.email.toLowerCase(),
    } as typeof leads.$inferInsert).returning();
    return lead;
  }

  async updateLead(id: string, updates: Partial<InsertLead> & { status?: LeadStatus; notes?: string }): Promise<Lead | undefined> {
    const [lead] = await db
      .update(leads)
      .set({ ...updates, updatedAt: new Date() } as typeof leads.$inferInsert)
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  async deleteLead(id: string): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id)).returning();
    return result.length > 0;
  }
```

---

### Step 3: Update `server/routes.ts`

**A) Add to import** (line 3):
```typescript
import { insertProductSchema, insertIoTDeviceSchema, insertEnterpriseConnectorSchema, insertLeadSchema } from "@shared/schema";
```

**B) Add before ADMIN/DEMO ENDPOINTS** (around line 760):
```typescript
  // ==========================================
  // LEADS ENDPOINTS (public - no auth required)
  // ==========================================

  app.post("/api/leads", async (req: Request, res: Response) => {
    try {
      const parsed = insertLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid lead data", details: parsed.error.issues });
      }

      const existingLead = await storage.getLeadByEmail(parsed.data.email);
      if (existingLead) {
        const updated = await storage.updateLead(existingLead.id, {
          ...parsed.data,
          metadata: {
            ...(existingLead.metadata as Record<string, unknown> || {}),
            ...(parsed.data.metadata || {}),
            lastInteraction: new Date().toISOString(),
            interactionCount: ((existingLead.metadata as any)?.interactionCount || 0) + 1,
          }
        });
        return res.json({ success: true, message: "Lead updated", lead: updated, isNew: false });
      }

      const lead = await storage.createLead({
        ...parsed.data,
        metadata: {
          ...(parsed.data.metadata || {}),
          userAgent: req.headers['user-agent'],
          referrer: req.headers['referer'],
          ip: req.ip,
          createdAt: new Date().toISOString(),
        }
      });

      await auditService.logCreate("lead", lead.id, lead as unknown as Record<string, unknown>);
      res.status(201).json({ success: true, message: "Thank you! We'll be in touch soon.", lead, isNew: true });
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ error: "Failed to capture lead" });
    }
  });

  app.get("/api/leads", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const leads = await storage.getAllLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.patch("/api/leads/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const lead = await storage.updateLead(req.params.id, req.body);
      if (!lead) return res.status(404).json({ error: "Lead not found" });
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteLead(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Lead not found" });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ error: "Failed to delete lead" });
    }
  });
```

---

### Step 4: Create `client/src/pages/admin/leads.tsx`

Create new file with content from: [See leads.tsx in repo]

---

### Step 5: Update `client/src/App.tsx`

**A) Add import:**
```typescript
import LeadsPage from "@/pages/admin/leads";
```

**B) Add route (after SAP Connector route):**
```typescript
      <Route path="/leads">
        <ProtectedRoute>
          <LeadsPage />
        </ProtectedRoute>
      </Route>
```

---

### Step 6: Update `client/src/components/app-sidebar.tsx`

**A) Add to imports:**
```typescript
import { Package, LayoutDashboard, Plus, LogOut, QrCode, Wifi, Plug, Users } from "lucide-react";
```

**B) Add to navigationItems array (after Products):**
```typescript
  {
    title: "Leads",
    url: "/leads",
    icon: Users,
  },
```

---

### Step 7: Update Landing Page and Contact Form

Replace the handleEmailSubmit in `landing.tsx` and onSubmit in `contact.tsx` to POST to `/api/leads`.

---

### Step 8: Push Database Schema

In Replit Shell:
```bash
npm run db:push
```

---

### Step 9: Test

1. Go to https://photonictag.com
2. Enter an email in the hero form
3. Log in and check /leads page
4. 🎉

---

## Need Help?

If this is too manual, the alternative is:
1. Share GitHub Personal Access Token (free, just auth)
2. I push directly, you pull in Replit

Your call!
