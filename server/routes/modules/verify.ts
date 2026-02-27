import { Router } from "express";
import { db } from "../../db";
import { biogenicTags, opticalVerifications } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import rateLimit from "express-rate-limit";

const router = Router();

// ============================================
// THE MONEY MAKER: Verification Endpoint
// ============================================
// In production, this would charge per-scan via Stripe Metered Billing

// Strict Rate Limiting for the public verification endpoint
const verificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 scans per windowMs
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { success: false, error: "Too many verification attempts from this IP, please try again after 15 minutes." }
});

const verificationPayloadSchema = z.object({
    identityId: z.string().uuid(),
    fieldHash: z.string().min(10, "Field hash required"),
    scannerHardware: z.string().optional(),
    lightingConditions: z.string().optional(),
    location: z.object({
        lat: z.number(),
        lng: z.number(),
    }).optional(),
});

router.post("/verify", verificationLimiter, async (req, res) => {
    try {
        const payload = verificationPayloadSchema.parse(req.body);

        // 1. Fetch the Factory Registration
        const tag = await db.query.biogenicTags.findFirst({
            where: eq(biogenicTags.identityId, payload.identityId),
        });

        if (!tag) {
            return res.status(404).json({
                success: false,
                error: "Product not registered in Biogenic Registry",
            });
        }

        // 2. Mock AI Confidence Engine (In an actual Deep Tech stack, this runs an ML model)
        // Here we simulate matching logic: If field hash matches factory hash closely
        let confidenceScore = 0;
        let status: "verified" | "failed" | "inconclusive" = "failed";

        if (payload.fieldHash === tag.factoryHash) {
            confidenceScore = 99;
            status = "verified";
        } else if (payload.fieldHash.includes(tag.factoryHash.substring(0, 5))) {
            confidenceScore = 75; // Partial match, perhaps poor lighting
            status = "inconclusive";
        } else {
            confidenceScore = 12; // Complete mismatch -> Counterfeit detected
            status = "failed";
        }

        // 3. Immutably Log the Verification (The basis for the Audit Trail & Billing)
        const verificationRecord = await db.insert(opticalVerifications).values({
            biogenicTagId: tag.id,
            fieldHash: payload.fieldHash,
            scannerHardware: payload.scannerHardware,
            lightingConditions: payload.lightingConditions,
            location: payload.location,
            confidenceScore,
            status,
            // If auth middleware is present, grab user.
            scannedByUserId: (req.user as any)?.id || undefined,
        }).returning();

        // 4. Fire "com.photonictag.verification" Event Bus Webhooks (Later phase)

        return res.json({
            success: true,
            verificationId: verificationRecord[0].id,
            result: {
                status,
                confidenceScore,
                materialType: tag.materialType,
                message: status === "verified"
                    ? "Authentic product verified."
                    : status === "inconclusive"
                        ? "Results inconclusive. Please try rescanning under better lighting."
                        : "ALERT: Counterfeit or unregistered signature detected.",
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: error.errors });
        }
        console.error("Verification Error:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

export default router;
