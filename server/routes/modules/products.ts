
import { Router, Request, Response } from "express";
import { insertProductSchema } from "@shared/schema";
import { productService } from "../../services/product-service";
import { qrService } from "../../services/qr-service";
import { identityService } from "../../services/identity-service";
import { traceService } from "../../services/trace-service";
import { auditService } from "../../services/audit-service";
import { aiService } from "../../services/ai-service";
import { isAuthenticated, isAdmin } from "../../auth";
import { z } from "zod";

const router = Router();

// ==========================================
// PRODUCT ENDPOINTS
// ==========================================

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Retrieve a list of all products
 *     tags: [Products]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: A list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/:id", isAuthenticated, async (req: Request, res: Response) => {
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

router.post("/", isAuthenticated, async (req: Request, res: Response) => {
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

router.put("/:id", isAuthenticated, async (req: Request, res: Response) => {
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

router.delete("/:id", isAuthenticated, async (req: Request, res: Response) => {
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
// AI ENDPOINTS (Related to products)
// ==========================================

router.get("/:productId/insights", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const insights = await aiService.getInsightsByProductId(req.params.productId);
    res.json(insights);
  } catch (error) {
    console.error("Error fetching insights:", error);
    res.status(500).json({ error: "Failed to fetch insights" });
  }
});

// ... other AI endpoints related to products can go here or in a separate AI router
// For now, keeping product-specific AI actions here or moving to a dedicated AI router if they are general.
// The original code had /api/ai/summarize taking productId in body. 
// It's better to keep them under /api/ai if they are general AI services, but since they are product specific, let's keep them in a separate AI router for clarity as per plan "Split Trace routes" -> maybe "Split AI routes" too? 
// The plan didn't explicitly mention AI routes, but I'll put them in a separate file `server/routes/modules/ai.ts` to keep `products.ts` clean.

// ==========================================
// IDENTITY & QR ENDPOINTS (Related to products)
// ==========================================

router.get("/:productId/identity", isAuthenticated, async (req: Request, res: Response) => {
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

router.get("/:productId/qr", isAuthenticated, async (req: Request, res: Response) => {
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

router.post("/:productId/qr/regenerate", isAuthenticated, async (req: Request, res: Response) => {
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

export default router;
