
import { Router, Request, Response } from "express";
import { traceService } from "../../services/trace-service";
import { auditService } from "../../services/audit-service";
import { isAuthenticated, isAdmin } from "../../auth";

const router = Router();

// ==========================================
// TRACE EVENT ENDPOINTS
// ==========================================

router.get("/products/:productId/trace", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const events = await traceService.getProductTimeline(req.params.productId);
        res.json(events);
    } catch (error) {
        console.error("Error fetching trace events:", error);
        res.status(500).json({ error: "Failed to fetch trace events" });
    }
});

router.post("/products/:productId/trace", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const { eventType, actor, location, description, metadata } = req.body;

        const event = await traceService.recordEvent(
            req.params.productId,
            eventType,
            actor,
            { location, description, metadata }
        );

        await auditService.logCreate("trace_event", event.id, event as unknown as Record<string, unknown>);

        res.status(201).json(event);
    } catch (error) {
        console.error("Error recording trace event:", error);
        res.status(500).json({ error: "Failed to record trace event" });
    }
});

// ==========================================
// AUDIT LOG ENDPOINTS
// ==========================================

router.get("/audit-logs", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
        const { entityType, entityId } = req.query;
        const logs = await auditService.getAuditLogs(
            entityType as string | undefined,
            entityId as string | undefined
        );
        res.json(logs);
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        res.status(500).json({ error: "Failed to fetch audit logs" });
    }
});

// ==========================================
// SEARCH ENDPOINTS (Assuming this might belong here or generally)
// ==========================================
// Note: original routes.ts didn't seem to show search, but I see start of a search service in file list?
// Actually checking original `routes.ts` content again...
// It ended abruptly in `view_file` output so I might have missed some endpoints.
// Let me double check `routes.ts` content again to be sure I didn't miss anything.

export default router;
