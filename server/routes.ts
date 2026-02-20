import type { Express } from "express";
import { type Server } from "http";
import { setupAuth } from "./auth";
import apiRouter from "./routes/index";
import { setupSwagger } from "./swagger";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Setup Swagger Documentation (Phase 3)
  setupSwagger(app);

  // Mount API routes
  app.use("/api", apiRouter);

  return httpServer;
}
