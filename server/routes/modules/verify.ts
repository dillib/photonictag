import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { aiService } from "../../services/ai-service";
import { storage } from "../../storage";

const router = Router();

// ============================================
// PHASE 2: BIOGENIC VERIFICATION ENDPOINT
// ============================================

const verificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 scans per windowMs
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: "Too many verification attempts from this IP, please try again after 15 minutes." }
});

const verificationPayloadSchema = z.object({
    productId: z.string().uuid(),
    sensorId: z.string(),
    scannedReflectanceCurve: z.array(z.number()).length(10),
    scannedTopographyHash: z.string(),
    location: z.object({
        lat: z.number(),
        lng: z.number(),
        locationName: z.string(),
    }).optional(),
});

router.post("/verify", verificationLimiter, async (req, res) => {
    try {
        const payload = verificationPayloadSchema.parse(req.body);

        // Verify that the product actually exists
        const product = await storage.getProduct(payload.productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found in registry."
            });
        }

        // Use the AI Engine to process the scan against the enrolled biogenic signature
        const verificationEvent = await aiService.verifyScan(
            payload.productId,
            payload.sensorId,
            payload.scannedReflectanceCurve,
            payload.scannedTopographyHash,
            payload.location
        );

        return res.json({
            success: true,
            verificationId: verificationEvent.id,
            result: {
                status: verificationEvent.status,
                confidenceScore: verificationEvent.confidenceScore,
                reasoning: verificationEvent.aiReasoning,
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: error.errors });
        }

        console.error("[Verification API] Error:", error);

        const message = error instanceof Error ? error.message : "Internal Server Error";
        return res.status(500).json({ success: false, error: message });
    }
});

export default router;
