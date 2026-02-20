
import { Router, Request, Response } from "express";
import { seedDemoData } from "../../seed-demo-data";
import { isAuthenticated, isAdmin } from "../../auth";

const router = Router();

// ==========================================
// ADMIN/DEMO ENDPOINTS
// ==========================================

router.post("/seed-demo-data", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
        await seedDemoData();
        res.json({ success: true, message: "Demo data seeded successfully" });
    } catch (error) {
        console.error("Error seeding demo data:", error);
        res.status(500).json({ error: "Failed to seed demo data" });
    }
});

export default router;
