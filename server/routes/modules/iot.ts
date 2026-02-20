
import { Router, Request, Response } from "express";
import { insertIoTDeviceSchema } from "@shared/schema";
import { iotService } from "../../services/iot-service";
import { auditService } from "../../services/audit-service";
import { isAuthenticated } from "../../auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: IoT
 *   description: IoT device and sensor management
 */

/**
 * @swagger
 * /api/iot/devices:
 *   get:
 *     summary: Retrieve a list of all IoT devices
 *     tags: [IoT]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *         description: filter by product ID
 *     responses:
 *       200:
 *         description: A list of devices.
 */
router.get("/devices", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const { productId } = req.query;
        let devices;
        if (productId) {
            devices = await iotService.getDevicesByProductId(productId as string);
        } else {
            devices = await iotService.getAllDevices();
        }
        res.json(devices);
    } catch (error) {
        console.error("Error fetching IoT devices:", error);
        res.status(500).json({ error: "Failed to fetch IoT devices" });
    }
});

router.get("/devices/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const device = await iotService.getDevice(req.params.id);
        if (!device) {
            return res.status(404).json({ error: "IoT device not found" });
        }
        res.json(device);
    } catch (error) {
        console.error("Error fetching IoT device:", error);
        res.status(500).json({ error: "Failed to fetch IoT device" });
    }
});

router.post("/devices", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const parsed = insertIoTDeviceSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid IoT device data", details: parsed.error.issues });
        }

        const device = await iotService.registerDevice(parsed.data);

        await auditService.logCreate("iot_device", device.id, device as unknown as Record<string, unknown>);

        res.status(201).json(device);
    } catch (error) {
        console.error("Error registering IoT device:", error);
        res.status(500).json({ error: "Failed to register IoT device" });
    }
});

router.patch("/devices/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        if (!status || !["active", "inactive", "lost", "damaged"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const device = await iotService.updateDeviceStatus(req.params.id, status);
        if (!device) {
            return res.status(404).json({ error: "IoT device not found" });
        }
        res.json(device);
    } catch (error) {
        console.error("Error updating IoT device status:", error);
        res.status(500).json({ error: "Failed to update IoT device status" });
    }
});

router.post("/devices/:deviceId/reading", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const { deviceId } = req.params;
        const reading = req.body;

        if (!reading.timestamp) {
            reading.timestamp = new Date().toISOString();
        }

        const device = await iotService.recordSensorReading(deviceId, reading);
        if (!device) {
            return res.status(404).json({ error: "IoT device not found" });
        }
        res.json(device);
    } catch (error) {
        console.error("Error recording sensor reading:", error);
        res.status(500).json({ error: "Failed to record sensor reading" });
    }
});

router.post("/scan/:deviceId", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const { deviceId } = req.params;
        const { location } = req.body;

        const result = await iotService.scanDevice(deviceId, location);
        if (!result) {
            return res.status(404).json({ error: "IoT device not found" });
        }
        res.json(result);
    } catch (error) {
        console.error("Error scanning IoT device:", error);
        res.status(500).json({ error: "Failed to scan IoT device" });
    }
});

router.delete("/devices/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const deleted = await iotService.deleteDevice(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: "IoT device not found" });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting IoT device:", error);
        res.status(500).json({ error: "Failed to delete IoT device" });
    }
});

export default router;
