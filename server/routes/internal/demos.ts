
import { Router, Request, Response } from "express";
import { storage } from "../../storage";
import { demoFactoryService } from "../../services/demo-factory-service";

const demosRouter = Router();

demosRouter.get("/personas", async (req: Request, res: Response) => {
    const personas = await storage.getAllPersonas();
    if (personas.length === 0) {
        await demoFactoryService.initializeDefaultPersonas();
        return res.json(await storage.getAllPersonas());
    }
    res.json(personas);
});

demosRouter.post("/generate", async (req: Request, res: Response) => {
    const { personaName, customerName } = req.body;
    const salesRepId = (req.user as any)?.id || "system";

    try {
        const result = await demoFactoryService.createDemoFromPersona(
            personaName,
            salesRepId,
            customerName
        );
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default demosRouter;
