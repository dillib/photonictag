import QRCode from "qrcode";
import { storage } from "../storage";
import { eventBus } from "../events/event-bus";
import { cacheService } from "./cache-service";
import type { QRCode as QRCodeType, InsertQRCode } from "@shared/schema";

export class QRService {
  private readonly CACHE_TTL = 600; // 10 minutes for QR lookups
  private readonly SCAN_CACHE_TTL = 60; // 1 minute for scan analytics
  private readonly CACHE_PREFIX = "qr";

  async getQRCode(id: string): Promise<QRCodeType | undefined> {
    // Try cache first
    const cacheKey = cacheService.generateKey(this.CACHE_PREFIX, id);
    const cached = await cacheService.get<QRCodeType>(cacheKey);
    
    if (cached) {
      console.log(`[QRService] Cache hit for QR ${id}`);
      return cached;
    }

    const qrCode = await storage.getQRCode(id);
    
    if (qrCode) {
      await cacheService.set(cacheKey, qrCode, this.CACHE_TTL);
    }
    
    return qrCode;
  }

  async getQRCodeByProductId(productId: string): Promise<QRCodeType | undefined> {
    // Try cache first
    const cacheKey = cacheService.generateKey(`${this.CACHE_PREFIX}:product`, productId);
    const cached = await cacheService.get<QRCodeType>(cacheKey);
    
    if (cached) {
      console.log(`[QRService] Cache hit for product QR ${productId}`);
      return cached;
    }

    const qrCode = await storage.getQRCodeByProductId(productId);
    
    if (qrCode) {
      await cacheService.set(cacheKey, qrCode, this.CACHE_TTL);
    }
    
    return qrCode;
  }

  async generateQRCode(productId: string, options?: { size?: number; format?: string }): Promise<QRCodeType> {
    const size = options?.size || 256;
    const format = options?.format || "png";
    
    const scanUrl = `${process.env.APP_URL || "http://localhost:5000"}/product/${productId}`;
    
    const qrImageUrl = await QRCode.toDataURL(scanUrl, {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    const qrCodeData: InsertQRCode = {
      productId,
      qrData: scanUrl,
      qrImageUrl,
      format,
      size,
    };

    const qrCode = await storage.createQRCode(qrCodeData);

    await storage.updateProduct(productId, { qrCodeData: qrImageUrl });

    // Cache the new QR code
    const cacheKey = cacheService.generateKey(this.CACHE_PREFIX, qrCode.id);
    await cacheService.set(cacheKey, qrCode, this.CACHE_TTL);
    
    const productCacheKey = cacheService.generateKey(`${this.CACHE_PREFIX}:product`, productId);
    await cacheService.set(productCacheKey, qrCode, this.CACHE_TTL);

    await eventBus.publish({
      type: "com.photonictag.qr.generated",
      source: "qr-service",
      data: { qrCodeId: qrCode.id, productId, scanUrl },
      subject: productId,
    });

    return qrCode;
  }

  async recordScan(qrCodeId: string): Promise<QRCodeType | undefined> {
    const qrCode = await storage.incrementQRScanCount(qrCodeId);
    
    if (qrCode) {
      // Update cache with new scan count
      const cacheKey = cacheService.generateKey(this.CACHE_PREFIX, qrCodeId);
      await cacheService.set(cacheKey, qrCode, this.CACHE_TTL);
      
      // Also update product cache
      const productCacheKey = cacheService.generateKey(`${this.CACHE_PREFIX}:product`, qrCode.productId);
      await cacheService.set(productCacheKey, qrCode, this.CACHE_TTL);
    }
    
    return qrCode;
  }

  async regenerateQRCode(productId: string): Promise<QRCodeType> {
    // Invalidate old cache
    const productCacheKey = cacheService.generateKey(`${this.CACHE_PREFIX}:product`, productId);
    await cacheService.delete(productCacheKey);
    
    return this.generateQRCode(productId);
  }

  /**
   * Get scan analytics with caching
   */
  async getScanAnalytics(qrCodeId: string): Promise<{ totalScans: number; lastScanAt?: Date }> {
    const cacheKey = cacheService.generateKey(`qr:analytics`, qrCodeId);
    const cached = await cacheService.get<{ totalScans: number; lastScanAt?: Date }>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const qrCode = await storage.getQRCode(qrCodeId);
    
    if (!qrCode) {
      return { totalScans: 0 };
    }

    const analytics = {
      totalScans: qrCode.scanCount || 0,
      lastScanAt: qrCode.lastScannedAt || undefined,
    };

    // Cache for 1 minute (analytics change frequently)
    await cacheService.set(cacheKey, analytics, this.SCAN_CACHE_TTL);
    
    return analytics;
  }
}

export const qrService = new QRService();
