
import { Router, Request, Response } from "express";
import { insertEnterpriseConnectorSchema } from "@shared/schema";
import { storage } from "../../storage";
import { sapSyncService } from "../../services/sap-sync-service";
import { auditService } from "../../services/audit-service";
import { isAuthenticated } from "../../auth";
import sapMonitoringRoutes from "../sap-monitoring"; // Re-use existing monitoring routes if possible or refactor that too. 

// Note: The original file imported sapMonitoringRoutes and used it at /api/integrations/sap
// We will keep that logic in the main router or here.
// For now, let's put the connector management endpoints here.

const router = Router();

// ==========================================
// ENTERPRISE INTEGRATIONS ENDPOINTS
// ==========================================

/**
 * @swagger
 * tags:
 *   name: SAP
 *   description: SAP ERP integration and data synchronization
 */

/**
 * @swagger
 * /api/sap/connectors:
 *   get:
 *     summary: List all enterprise connectors
 *     tags: [SAP]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: List of connectors
 */
router.get("/connectors", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const connectors = await storage.getAllEnterpriseConnectors();
        res.json(connectors);
    } catch (error) {
        console.error("Error fetching connectors:", error);
        res.status(500).json({ error: "Failed to fetch connectors" });
    }
});

router.get("/connectors/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const connector = await storage.getEnterpriseConnector(req.params.id);
        if (!connector) {
            return res.status(404).json({ error: "Connector not found" });
        }
        res.json(connector);
    } catch (error) {
        console.error("Error fetching connector:", error);
        res.status(500).json({ error: "Failed to fetch connector" });
    }
});

router.post("/connectors", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const parsed = insertEnterpriseConnectorSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid connector data", details: parsed.error.issues });
        }
        const connector = await storage.createEnterpriseConnector(parsed.data);
        res.status(201).json(connector);
    } catch (error) {
        console.error("Error creating connector:", error);
        res.status(500).json({ error: "Failed to create connector" });
    }
});

router.patch("/connectors/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const connector = await storage.updateEnterpriseConnector(req.params.id, req.body);
        if (!connector) {
            return res.status(404).json({ error: "Connector not found" });
        }
        res.json(connector);
    } catch (error) {
        console.error("Error updating connector:", error);
        res.status(500).json({ error: "Failed to update connector" });
    }
});

router.delete("/connectors/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const deleted = await storage.deleteEnterpriseConnector(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: "Connector not found" });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting connector:", error);
        res.status(500).json({ error: "Failed to delete connector" });
    }
});

router.post("/connectors/:id/test", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const connector = await storage.getEnterpriseConnector(req.params.id);
        if (!connector) {
            return res.status(404).json({ error: "Connector not found" });
        }

        // Test real SAP connection using SAP sync service
        const testResult = await sapSyncService.testConnection(req.params.id);

        if (testResult.success) {
            await storage.updateEnterpriseConnector(req.params.id, { status: "active" as const });
        }

        res.json(testResult);
    } catch (error) {
        console.error("Error testing connector:", error);
        res.status(500).json({ error: "Connection test failed" });
    }
});

router.post("/connectors/:id/sync", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const connector = await storage.getEnterpriseConnector(req.params.id);
        if (!connector) {
            return res.status(404).json({ error: "Connector not found" });
        }

        // Create sync log
        const syncLog = await storage.createIntegrationSyncLog({
            connectorId: connector.id,
            syncType: "manual",
            status: "running",
            recordsProcessed: 0,
            recordsCreated: 0,
            recordsUpdated: 0,
            recordsFailed: 0,
            startedAt: new Date(),
        });

        try {
            // Execute real SAP sync
            const syncResult = await sapSyncService.executeSync({
                connectorId: connector.id,
                direction: connector.syncDirection,
                batchSize: 100,
                dryRun: false
            });

            // Update sync log with results
            await storage.updateIntegrationSyncLog(syncLog.id, {
                status: syncResult.success ? "completed" : "failed",
                recordsProcessed: syncResult.recordsProcessed,
                recordsCreated: syncResult.recordsCreated,
                recordsUpdated: syncResult.recordsUpdated,
                recordsFailed: syncResult.recordsFailed,
                errorMessage: syncResult.errors.length > 0
                    ? syncResult.errors.map(e => `${e.record}: ${e.error}`).join('; ')
                    : undefined,
                completedAt: new Date(),
            });

            // Update connector with last sync info
            await storage.updateEnterpriseConnector(connector.id, {
                lastSyncAt: new Date(),
                lastSyncStatus: syncResult.success ? "completed" : "failed",
                productsSynced: (connector.productsSynced || 0) + syncResult.recordsCreated,
            } as any);

            // Log sync completion in audit trail
            await auditService.logCreate("integration_sync", syncLog.id, {
                connectorId: connector.id,
                result: syncResult
            } as any);

            res.json({
                success: syncResult.success,
                message: syncResult.success
                    ? `Sync completed: ${syncResult.recordsCreated} created, ${syncResult.recordsUpdated} updated`
                    : "Sync completed with errors",
                syncLogId: syncLog.id,
                stats: {
                    recordsProcessed: syncResult.recordsProcessed,
                    recordsCreated: syncResult.recordsCreated,
                    recordsUpdated: syncResult.recordsUpdated,
                    recordsFailed: syncResult.recordsFailed,
                    conflicts: syncResult.conflicts.length,
                    duration: syncResult.duration
                }
            });
        } catch (syncError) {
            // Mark sync as failed
            await storage.updateIntegrationSyncLog(syncLog.id, {
                status: "failed",
                errorMessage: syncError instanceof Error ? syncError.message : "Unknown error",
                completedAt: new Date(),
            });

            throw syncError;
        }
    } catch (error) {
        console.error("Error syncing connector:", error);
        res.status(500).json({
            error: "Sync failed",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

router.get("/connectors/:id/logs", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const logs = await storage.getSyncLogsByConnectorId(req.params.id);
        res.json(logs);
    } catch (error) {
        console.error("Error fetching sync logs:", error);
        res.status(500).json({ error: "Failed to fetch sync logs" });
    }
});

router.get("/connectors/:id/stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const stats = await sapSyncService.getSyncStats(req.params.id);
        res.json(stats);
    } catch (error) {
        console.error("Error fetching sync stats:", error);
        res.status(500).json({ error: "Failed to fetch sync stats" });
    }
});

export default router;
