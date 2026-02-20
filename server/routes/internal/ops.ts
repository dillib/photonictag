
import { Router, Request, Response } from "express";
import { storage } from "../../storage";

const opsRouter = Router();

opsRouter.get("/health", async (req: Request, res: Response) => {
    // Simulate system health check
    res.json({
        status: "healthy",
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date()
    });
});

opsRouter.get("/metrics/:type", async (req: Request, res: Response) => {
    const { type } = req.params;
    const metrics = await storage.getMetricsByType(type as any);
    res.json(metrics);
});

opsRouter.post("/metrics", async (req: Request, res: Response) => {
    const metric = await storage.recordMetric(req.body);
    res.status(201).json(metric);
});

export default opsRouter;
