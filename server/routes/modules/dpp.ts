
import { Router, Request, Response } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../auth";

const router = Router();

// ==========================================
// DPP REGIONAL EXTENSIONS
// ==========================================

router.get("/products/:productId/regional-extensions", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const extensions = await storage.getRegionalExtensionsByProductId(req.params.productId);
        res.json(extensions);
    } catch (error) {
        console.error("Error fetching regional extensions:", error);
        res.status(500).json({ error: "Failed to fetch regional extensions" });
    }
});

router.get("/products/:productId/regional-extensions/:regionCode", isAuthenticated, async (req: Request, res: Response) => {
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

router.post("/products/:productId/regional-extensions", isAuthenticated, async (req: Request, res: Response) => {
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

router.patch("/regional-extensions/:id", isAuthenticated, async (req: Request, res: Response) => {
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

router.delete("/regional-extensions/:id", isAuthenticated, async (req: Request, res: Response) => {
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

export default router;
