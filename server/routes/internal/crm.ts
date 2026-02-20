
import { Router, Request, Response } from "express";
import { storage } from "../../storage";
import { internalAIService } from "../../services/internal-ai-service";

const crmRouter = Router();

/**
 * @swagger
 * /api/internal/crm/accounts:
 *   get:
 *     summary: List all customer accounts (Internal CRM)
 *     tags: [Internal]
 */
crmRouter.get("/accounts", async (req: Request, res: Response) => {
    const accounts = await storage.getAllCustomerAccounts();
    // Update health scores on the fly for demo purposes
    for (const account of accounts) {
        account.healthScore = await internalAIService.calculateAccountHealth(account);
    }
    res.json(accounts);
});

crmRouter.get("/accounts/:id/next-action", async (req: Request, res: Response) => {
    const account = await storage.getCustomerAccount(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });

    const action = await internalAIService.getNextBestAction(account);
    res.json({ action });
});

crmRouter.post("/accounts", async (req: Request, res: Response) => {
    const account = await storage.createCustomerAccount(req.body);
    res.status(201).json(account);
});

export default crmRouter;
