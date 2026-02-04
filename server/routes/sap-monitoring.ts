import { Router, Request, Response } from "express";
import { sapHealthMonitor } from "../services/sap-health-monitor";
import { isAuthenticated, isAdmin } from "../auth";
import { storage } from "../storage";

const router = Router();

/**
 * GET /api/integrations/sap/health
 * Get overall SAP integration health status
 */
router.get("/health", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const healthStatus = await sapHealthMonitor.checkAllConnections();
    res.json(healthStatus);
  } catch (error) {
    console.error("Failed to check SAP health:", error);
    res.status(500).json({ error: "Failed to check health status" });
  }
});

/**
 * POST /api/integrations/sap/check-connection/:id
 * Force an immediate health check for a specific connector
 */
router.post("/check-connection/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const connectorId = req.params.id;
    const connector = await storage.getEnterpriseConnector(connectorId);
    
    if (!connector) {
      return res.status(404).json({ error: "Connector not found" });
    }
    
    const result = await sapHealthMonitor.checkConnection(connector);
    res.json(result);
  } catch (error) {
    console.error("Failed to run health check:", error);
    res.status(500).json({ error: "Health check failed" });
  }
});

export default router;
