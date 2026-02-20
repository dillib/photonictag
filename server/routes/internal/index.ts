
import { Router } from "express";
import crmRouter from "./crm";
import demosRouter from "./demos";
import supportRouter from "./support";
import opsRouter from "./ops";
import { isAuthenticated } from "../../auth";

const internalRouter = Router();

// Middleware to ensure only admins/internal users can access these
// For now, using standard isAuthenticated, but could be restricted further
internalRouter.use(isAuthenticated);

internalRouter.use("/crm", crmRouter);
internalRouter.use("/demos", demosRouter);
internalRouter.use("/support", supportRouter);
internalRouter.use("/ops", opsRouter);

export default internalRouter;
