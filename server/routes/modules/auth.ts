
import { Router } from "express";
import passwordlessRoutes from "../../auth/passwordless-routes";

const router = Router();

// ==========================================
// PASSWORDLESS AUTHENTICATION ROUTES
// ==========================================
router.use("/passwordless", passwordlessRoutes);

export default router;
