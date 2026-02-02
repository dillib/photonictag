import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { insertProductSchema, insertIoTDeviceSchema, insertEnterpriseConnectorSchema, insertLeadSchema } from "@shared/schema";
import { productService } from "./services/product-service";
import { qrService } from "./services/qr-service";
import { identityService } from "./services/identity-service";
import { traceService } from "./services/trace-service";
import { aiService } from "./services/ai-service";
import { auditService } from "./services/audit-service";
import { iotService } from "./services/iot-service";
import { sapSyncService } from "./services/sap-sync-service";
import { seedDemoData } from "./seed-demo-data";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await setupAuth(app);

  // ==========================================
  // HEALTH CHECK ENDPOINT (for Railway/deployment)
  // ==========================================

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ==========================================
  // PRODUCT ENDPOINTS
  // ==========================================
  
  app.get("/api/products", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const products = await productService.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const product = await productService.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parsed = insertProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid product data", details: parsed.error.issues });
      }

      const product = await productService.createProduct(parsed.data);
      
      await qrService.generateQRCode(product.id);
      
      await identityService.createIdentity(product.id);
      
      await traceService.recordEvent(product.id, "manufactured", product.manufacturer, {
        description: `Product ${product.productName} registered in PhotonicTag`,
        location: { name: product.manufacturer },
      });
      
      await auditService.logCreate("product", product.id, product as unknown as Record<string, unknown>);
      
      const updatedProduct = await productService.getProduct(product.id);
      
      res.status(201).json(updatedProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const existingProduct = await productService.getProduct(req.params.id);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      const parsed = insertProductSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid product data", details: parsed.error.issues });
      }

      const product = await productService.updateProduct(req.params.id, parsed.data);
      
      if (product) {
        await auditService.logUpdate(
          "product", 
          product.id, 
          existingProduct as unknown as Record<string, unknown>,
          product as unknown as Record<string, unknown>
        );
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const existingProduct = await productService.getProduct(req.params.id);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      const deleted = await productService.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      await auditService.logDelete("product", req.params.id, existingProduct as unknown as Record<string, unknown>);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // ==========================================
  // IDENTITY ENDPOINTS
  // ==========================================
  
  app.get("/api/identities/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const identity = await identityService.getIdentity(req.params.id);
      if (!identity) {
        return res.status(404).json({ error: "Identity not found" });
      }
      res.json(identity);
    } catch (error) {
      console.error("Error fetching identity:", error);
      res.status(500).json({ error: "Failed to fetch identity" });
    }
  });

  app.get("/api/products/:productId/identity", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const identity = await identityService.getIdentityByProductId(req.params.productId);
      if (!identity) {
        return res.status(404).json({ error: "Identity not found for this product" });
      }
      res.json(identity);
    } catch (error) {
      console.error("Error fetching identity:", error);
      res.status(500).json({ error: "Failed to fetch identity" });
    }
  });

  app.post("/api/identities/validate", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { serialNumber } = req.body;
      const result = await identityService.validateIdentity(serialNumber);
      res.json(result);
    } catch (error) {
      console.error("Error validating identity:", error);
      res.status(500).json({ error: "Failed to validate identity" });
    }
  });

  // ==========================================
  // QR CODE ENDPOINTS
  // ==========================================
  
  app.get("/api/products/:productId/qr", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const qrCode = await qrService.getQRCodeByProductId(req.params.productId);
      if (!qrCode) {
        return res.status(404).json({ error: "QR code not found for this product" });
      }
      res.json(qrCode);
    } catch (error) {
      console.error("Error fetching QR code:", error);
      res.status(500).json({ error: "Failed to fetch QR code" });
    }
  });

  app.post("/api/products/:productId/qr/regenerate", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const product = await productService.getProduct(req.params.productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      const existingQR = await qrService.getQRCodeByProductId(req.params.productId);
      const qrCode = await qrService.regenerateQRCode(req.params.productId);
      
      await auditService.logUpdate(
        "qr_code",
        qrCode.id,
        existingQR as unknown as Record<string, unknown>,
        qrCode as unknown as Record<string, unknown>
      );
      
      res.json(qrCode);
    } catch (error) {
      console.error("Error regenerating QR code:", error);
      res.status(500).json({ error: "Failed to regenerate QR code" });
    }
  });

  app.post("/api/qr/:id/scan", async (req: Request, res: Response) => {
    try {
      const qrCode = await qrService.recordScan(req.params.id);
      if (!qrCode) {
        return res.status(404).json({ error: "QR code not found" });
      }
      res.json(qrCode);
    } catch (error) {
      console.error("Error recording scan:", error);
      res.status(500).json({ error: "Failed to record scan" });
    }
  });

  // ==========================================
  // TRACE EVENT ENDPOINTS
  // ==========================================
  
  app.get("/api/products/:productId/trace", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const events = await traceService.getProductTimeline(req.params.productId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching trace events:", error);
      res.status(500).json({ error: "Failed to fetch trace events" });
    }
  });

  app.post("/api/products/:productId/trace", isAuthenticated, async (req: Request, res: Response) => {
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
  // AI ENDPOINTS
  // ==========================================
  
  app.get("/api/products/:productId/insights", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const insights = await aiService.getInsightsByProductId(req.params.productId);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  app.post("/api/ai/summarize", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await productService.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const result = await aiService.generateSummary(product);
      res.json(result);
    } catch (error) {
      console.error("Error generating summary:", error);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  app.post("/api/ai/sustainability", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await productService.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const result = await aiService.generateSustainabilityInsight(product);
      res.json(result);
    } catch (error) {
      console.error("Error generating sustainability insights:", error);
      res.status(500).json({ error: "Failed to generate sustainability insights" });
    }
  });

  app.post("/api/ai/repair-summary", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await productService.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const result = await aiService.generateRepairSummary(product);
      res.json(result);
    } catch (error) {
      console.error("Error generating repair summary:", error);
      res.status(500).json({ error: "Failed to generate repair summary" });
    }
  });

  app.post("/api/ai/circularity", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await productService.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const result = await aiService.generateCircularityScore(product);
      res.json(result);
    } catch (error) {
      console.error("Error generating circularity score:", error);
      res.status(500).json({ error: "Failed to generate circularity score" });
    }
  });

  app.post("/api/ai/risk-assessment", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const product = await productService.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const result = await aiService.generateRiskAssessment(product);
      res.json(result);
    } catch (error) {
      console.error("Error generating risk assessment:", error);
      res.status(500).json({ error: "Failed to generate risk assessment" });
    }
  });

  // ==========================================
  // AUDIT LOG ENDPOINTS
  // ==========================================
  
  app.get("/api/audit-logs", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
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
  // IOT DEVICE ENDPOINTS
  // ==========================================

  app.get("/api/iot/devices", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { productId } = req.query;
      let devices;
      if (productId) {
        devices = await iotService.getDevicesByProductId(productId as string);
      } else {
        devices = await iotService.getAllDevices();
      }
      res.json(devices);
    } catch (error) {
      console.error("Error fetching IoT devices:", error);
      res.status(500).json({ error: "Failed to fetch IoT devices" });
    }
  });

  app.get("/api/iot/devices/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const device = await iotService.getDevice(req.params.id);
      if (!device) {
        return res.status(404).json({ error: "IoT device not found" });
      }
      res.json(device);
    } catch (error) {
      console.error("Error fetching IoT device:", error);
      res.status(500).json({ error: "Failed to fetch IoT device" });
    }
  });

  app.post("/api/iot/devices", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const parsed = insertIoTDeviceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid IoT device data", details: parsed.error.issues });
      }

      const device = await iotService.registerDevice(parsed.data);
      
      await auditService.logCreate("iot_device", device.id, device as unknown as Record<string, unknown>);
      
      res.status(201).json(device);
    } catch (error) {
      console.error("Error registering IoT device:", error);
      res.status(500).json({ error: "Failed to register IoT device" });
    }
  });

  app.patch("/api/iot/devices/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!status || !["active", "inactive", "lost", "damaged"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const device = await iotService.updateDeviceStatus(req.params.id, status);
      if (!device) {
        return res.status(404).json({ error: "IoT device not found" });
      }
      res.json(device);
    } catch (error) {
      console.error("Error updating IoT device status:", error);
      res.status(500).json({ error: "Failed to update IoT device status" });
    }
  });

  app.post("/api/iot/devices/:deviceId/reading", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { deviceId } = req.params;
      const reading = req.body;

      if (!reading.timestamp) {
        reading.timestamp = new Date().toISOString();
      }

      const device = await iotService.recordSensorReading(deviceId, reading);
      if (!device) {
        return res.status(404).json({ error: "IoT device not found" });
      }
      res.json(device);
    } catch (error) {
      console.error("Error recording sensor reading:", error);
      res.status(500).json({ error: "Failed to record sensor reading" });
    }
  });

  app.post("/api/iot/scan/:deviceId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { deviceId } = req.params;
      const { location } = req.body;

      const result = await iotService.scanDevice(deviceId, location);
      if (!result) {
        return res.status(404).json({ error: "IoT device not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error scanning IoT device:", error);
      res.status(500).json({ error: "Failed to scan IoT device" });
    }
  });

  app.delete("/api/iot/devices/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const deleted = await iotService.deleteDevice(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "IoT device not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting IoT device:", error);
      res.status(500).json({ error: "Failed to delete IoT device" });
    }
  });

  // ==========================================
  // DPP REGIONAL EXTENSIONS
  // ==========================================

  app.get("/api/products/:productId/regional-extensions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const extensions = await storage.getRegionalExtensionsByProductId(req.params.productId);
      res.json(extensions);
    } catch (error) {
      console.error("Error fetching regional extensions:", error);
      res.status(500).json({ error: "Failed to fetch regional extensions" });
    }
  });

  app.get("/api/products/:productId/regional-extensions/:regionCode", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { productId, regionCode } = req.params;
      const extension = await storage.getRegionalExtensionByProductAndRegion(
        productId, 
        regionCode as any
      );
      if (!extension) {
        return res.status(404).json({ error: "Regional extension not found" });
      }
      res.json(extension);
    } catch (error) {
      console.error("Error fetching regional extension:", error);
      res.status(500).json({ error: "Failed to fetch regional extension" });
    }
  });

  app.post("/api/products/:productId/regional-extensions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const extension = await storage.createRegionalExtension({
        ...req.body,
        productId,
      });
      res.status(201).json(extension);
    } catch (error) {
      console.error("Error creating regional extension:", error);
      res.status(500).json({ error: "Failed to create regional extension" });
    }
  });

  app.patch("/api/regional-extensions/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const extension = await storage.updateRegionalExtension(req.params.id, req.body);
      if (!extension) {
        return res.status(404).json({ error: "Regional extension not found" });
      }
      res.json(extension);
    } catch (error) {
      console.error("Error updating regional extension:", error);
      res.status(500).json({ error: "Failed to update regional extension" });
    }
  });

  app.delete("/api/regional-extensions/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteRegionalExtension(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Regional extension not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting regional extension:", error);
      res.status(500).json({ error: "Failed to delete regional extension" });
    }
  });

  // ==========================================
  // ENTERPRISE INTEGRATIONS ENDPOINTS
  // ==========================================

  app.get("/api/integrations/connectors", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const connectors = await storage.getAllEnterpriseConnectors();
      res.json(connectors);
    } catch (error) {
      console.error("Error fetching connectors:", error);
      res.status(500).json({ error: "Failed to fetch connectors" });
    }
  });

  app.get("/api/integrations/connectors/:id", isAuthenticated, async (req: Request, res: Response) => {
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

  app.post("/api/integrations/connectors", isAuthenticated, async (req: Request, res: Response) => {
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

  app.patch("/api/integrations/connectors/:id", isAuthenticated, async (req: Request, res: Response) => {
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

  app.delete("/api/integrations/connectors/:id", isAuthenticated, async (req: Request, res: Response) => {
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

  app.post("/api/integrations/connectors/:id/test", isAuthenticated, async (req: Request, res: Response) => {
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

  app.post("/api/integrations/connectors/:id/sync", isAuthenticated, async (req: Request, res: Response) => {
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

  app.get("/api/integrations/connectors/:id/logs", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const logs = await storage.getSyncLogsByConnectorId(req.params.id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching sync logs:", error);
      res.status(500).json({ error: "Failed to fetch sync logs" });
    }
  });

  app.get("/api/integrations/connectors/:id/stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const stats = await sapSyncService.getSyncStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching sync stats:", error);
      res.status(500).json({ error: "Failed to fetch sync stats" });
    }
  });

  // ==========================================
  // LEADS ENDPOINTS (public - no auth required)
  // ==========================================

  // Capture a new lead (public endpoint)
  app.post("/api/leads", async (req: Request, res: Response) => {
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
        } as any); // Type assertion for metadata compatibility
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
  app.get("/api/leads", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const leads = await storage.getAllLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  // Update lead status (requires auth)
  app.patch("/api/leads/:id", isAuthenticated, async (req: Request, res: Response) => {
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
  app.delete("/api/leads/:id", isAuthenticated, async (req: Request, res: Response) => {
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

  // ==========================================
  // ADMIN/DEMO ENDPOINTS
  // ==========================================
  
  app.post("/api/admin/seed-demo-data", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      await seedDemoData();
      res.json({ success: true, message: "Demo data seeded successfully" });
    } catch (error) {
      console.error("Error seeding demo data:", error);
      res.status(500).json({ error: "Failed to seed demo data" });
    }
  });

  return httpServer;
}
