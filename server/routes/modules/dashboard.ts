import { Router } from "express";
import { db } from "../../db";
import { products, verificationEvents, traceEvents, dppRegionalExtensions } from "@shared/schema";
import { desc, sql, eq } from "drizzle-orm";
import { subDays, startOfDay, format } from "date-fns";
import { isAuthenticated } from "../../auth";

const router = Router();

router.get("/metrics", isAuthenticated, async (req, res) => {
    try {
        // 1. Top Line Stats
        // Count total active digital twins
        const [productsCountResult] = await db.select({ count: sql<number>`count(*)` }).from(products);
        const totalProducts = Number(productsCountResult.count);

        // Count total verifications
        const [verificationsCountResult] = await db.select({ count: sql<number>`count(*)` }).from(verificationEvents);
        const totalVerifications = Number(verificationsCountResult.count);

        // Calculate pass rate
        const [passedCountResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(verificationEvents)
            .where(eq(verificationEvents.status, "passed"));

        const passedVerifications = Number(passedCountResult.count);
        const passRate = totalVerifications > 0
            ? Math.round((passedVerifications / totalVerifications) * 100)
            : 0;

        // 2. EU DPP Compliance Count
        const [compliantCountResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(dppRegionalExtensions)
            .where(sql`${dppRegionalExtensions.payload}->'EU'->'espr'->>'complianceStatus' = 'compliant'`);
        const complianceReadiness = Number(compliantCountResult.count);

        // 3. Verification Trend (Last 7 Days)
        const sevenDaysAgo = startOfDay(subDays(new Date(), 6));

        // Fetch raw events from the last 7 days
        const recentVerifications = await db.query.verificationEvents.findMany({
            where: sql`${verificationEvents.timestamp} >= ${sevenDaysAgo.toISOString()}`,
        });

        // Initialize an array with the last 7 days set to 0
        const trendMap = new Map();
        for (let i = 6; i >= 0; i--) {
            const d = subDays(new Date(), i);
            trendMap.set(format(d, "EEE"), { name: format(d, "EEE"), scans: 0, products: 0 }); // EEE formats like "Mon", "Tue"
        }

        // Aggregate counts by day
        recentVerifications.forEach(event => {
            if (!event.timestamp) return;
            const dayStr = format(new Date(event.timestamp), "EEE"); // EEE = Mon, Tue
            if (trendMap.has(dayStr)) {
                const dayData = trendMap.get(dayStr);
                dayData.scans += 1;
                // Currently counting scans. If we wanted unique products per day, we'd need a Set per day.
            }
        });

        const scanTrendData = Array.from(trendMap.values());

        // 4. Activity Feed (Merged Trace & Verification Events)
        const recentTraces = await db.query.traceEvents.findMany({
            orderBy: [desc(traceEvents.timestamp)],
            limit: 10,
        });

        const recentScans = await db.query.verificationEvents.findMany({
            orderBy: [desc(verificationEvents.timestamp)],
            limit: 10,
        });

        // Format and merge them into a unified "activity" timeline
        const mappedTraces = recentTraces.map(t => ({
            id: `trace-${t.id}`,
            originalId: t.id,
            type: "trace",
            title: `Event: ${t.eventType}`,
            description: `Product ID: ${t.productId.substring(0, 8)} - ${t.location?.name || 'Unknown Location'}`,
            timestamp: t.timestamp ? new Date(t.timestamp).getTime() : 0,
            timeLabel: t.timestamp ? new Date(t.timestamp).toLocaleString() : "Unknown Time"
        }));

        const mappedScans = recentScans.map(s => ({
            id: `scan-${s.id}`,
            originalId: s.id,
            type: "scan",
            title: `Product Scanned (${s.status})`,
            description: `Scan Confidence: ${(Number(s.confidenceScore) * 100).toFixed(1)}%`,
            timestamp: s.timestamp ? new Date(s.timestamp).getTime() : 0,
            timeLabel: s.timestamp ? new Date(s.timestamp).toLocaleString() : "Unknown Time",
            status: s.status
        }));

        let recentActivity = [...mappedTraces, ...mappedScans]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10);

        // 5. Mock SAP Status (for now, as SAP sync logs aren't fully populated with live data)
        const syncStatus = {
            isConnected: true,
            lastSync: "Just now",
            productsInSync: totalProducts,
            pendingChanges: 0,
            successRate: 100
        };

        const metrics = {
            totalProducts,
            totalVerifications,
            passRate,
            complianceReadiness,
            scanTrendData,
            recentActivity,
            syncStatus
        };

        return res.json(metrics);

    } catch (error) {
        console.error("[Dashboard API] Error fetching metrics:", error);
        return res.status(500).json({ error: "Failed to load dashboard metrics" });
    }
});

export default router;
