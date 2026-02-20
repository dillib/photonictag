
import { Router, Request, Response } from "express";
import { storage } from "../../storage";
import { internalAIService } from "../../services/internal-ai-service";

const supportRouter = Router();

supportRouter.get("/tickets", async (req: Request, res: Response) => {
    const { orgId } = req.query;
    if (orgId) {
        const tickets = await storage.getSupportTicketsByOrg(orgId as string);
        return res.json(tickets);
    }
    // If no orgId, in a real app we might show all for an admin
    res.json([]);
});

supportRouter.post("/tickets", async (req: Request, res: Response) => {
    const ticketData = req.body;
    // AI Triage
    const triage = await internalAIService.triageTicket(ticketData);

    const ticket = await storage.createSupportTicket({
        ...ticketData,
        aiSummary: triage.summary,
        priority: triage.priority,
        aiTags: triage.tags,
    });

    res.status(201).json(ticket);
});

export default supportRouter;
