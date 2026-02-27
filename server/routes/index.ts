
import { Router } from "express";
import productsRouter from "./modules/products";
import iotRouter from "./modules/iot";
import sapRouter from "./modules/sap";
import authRouter from "./modules/auth"; // Passwordless
import traceRouter from "./modules/trace";
import leadsRouter from "./modules/leads";
import dppRouter from "./modules/dpp";
import adminRouter from "./modules/admin";
import sapMonitoringRoutes from "./sap-monitoring";
import internalRouter from "./internal";
import verifyRouter from "./modules/verify";

export const apiRouter = Router();

// Internal management (Phase 6)
apiRouter.use("/internal", internalRouter);

// Health check
apiRouter.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount modules
apiRouter.use("/products", productsRouter); // /api/products
apiRouter.use("/iot", iotRouter); // /api/iot
apiRouter.use("/integrations/connectors", sapRouter); // /api/integrations/connectors (Note: original was /api/integrations/connectors)
apiRouter.use("/integrations/sap", sapMonitoringRoutes); // /api/integrations/sap - Monitoring
apiRouter.use("/auth", authRouter); // /api/auth
apiRouter.use("/", traceRouter); // Trace router uses /products path mostly, need to be careful.
// Trace router defined: /products/:productId/trace AND /audit-logs
// We should mount it at root or refactor trace router to just be specific paths.
// Let's keep it root for now to match exactly or mount specifically.
// Review Trace Router: 
// /products/:productId/trace -> should be under /products? but existing product router is /products
// It's cleaner if product router handles /products sub-resources.
// BUT I separated them. 
// Solution: Mount trace router at /api level (apiRouter root) so it catches /products/.../trace
// Same for /audit-logs
apiRouter.use(traceRouter);

apiRouter.use("/leads", leadsRouter); // /api/leads
apiRouter.use("/", dppRouter); // DPP router defines /products/:id/regional-extensions. Mount at root.
apiRouter.use("/admin", adminRouter); // /api/admin
apiRouter.use("/v1", verifyRouter); // /api/v1/verify

export default apiRouter;
