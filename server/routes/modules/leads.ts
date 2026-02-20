
import { Router, Request, Response } from "express";
import { insertLeadSchema } from "@shared/schema";
import { storage } from "../../storage";
import { auditService } from "../../services/audit-service";
import { isAuthenticated } from "../../auth";

const router = Router();

// ==========================================
// LEADS ENDPOINTS
// ==========================================

// Capture a new lead (public endpoint)
router.post("/", async (req: Request, res: Response) => {
    try {
        const parsed = insertLeadSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid lead data", details: parsed.error.issues });
        }

        // Check if lead already exists
        const existingLead = await storage.getLeadByEmail(parsed.data.email);
        if (existingLead) {
            // Update existing lead with new message/metadata if provided
            const updated = await storage.updateLead(existingLead.id, {
                name: parsed.data.name,
                message: parsed.data.message,
                notes: parsed.data.notes,
                company: parsed.data.company,
                phone: parsed.data.phone,
                metadata: {
                    ...(existingLead.metadata as Record<string, unknown> || {}),
                    ...(parsed.data.metadata || {}),
                    lastInteraction: new Date().toISOString(),
                    interactionCount: ((existingLead.metadata as any)?.interactionCount || 0) + 1,
                }
            } as any);
            return res.json({ success: true, message: "Lead updated", lead: updated, isNew: false });
        }

        // Create new lead
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

        // Log for audit
        await auditService.logCreate("lead", lead.id, lead as unknown as Record<string, unknown>);

        res.status(201).json({ success: true, message: "Thank you! We'll be in touch soon.", lead, isNew: true });
    } catch (error) {
        console.error("Error creating lead:", error);
        res.status(500).json({ error: "Failed to capture lead" });
    }
});

// Get all leads (requires auth - for admin dashboard)
router.get("/", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const leads = await storage.getAllLeads();
        res.json(leads);
    } catch (error) {
        console.error("Error fetching leads:", error);
        res.status(500).json({ error: "Failed to fetch leads" });
    }
});

// Update lead status (requires auth)
router.patch("/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const lead = await storage.updateLead(req.params.id, req.body);
        if (!lead) {
            return res.status(404).json({ error: "Lead not found" });
        }
        res.json(lead);
    } catch (error) {
        console.error("Error updating lead:", error);
        res.status(500).json({ error: "Failed to update lead" });
    }
});

// Delete lead (requires auth)
router.delete("/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const deleted = await storage.deleteLead(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: "Lead not found" });
        }
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting lead:", error);
        res.status(500).json({ error: "Failed to delete lead" });
    }
});

export default router;
