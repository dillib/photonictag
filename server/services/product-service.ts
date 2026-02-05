import { storage } from "../storage";
import { eventBus } from "../events/event-bus";
import { cacheService } from "./cache-service";
import type { Product, InsertProduct } from "@shared/schema";

export class ProductService {
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly CACHE_PREFIX = "product";

  async getProduct(id: string): Promise<Product | undefined> {
    // Try cache first
    const cacheKey = cacheService.generateKey(this.CACHE_PREFIX, id);
    const cached = await cacheService.get<Product>(cacheKey);
    
    if (cached) {
      console.log(`[ProductService] Cache hit for product ${id}`);
      return cached;
    }

    // Fetch from database
    const product = await storage.getProduct(id);
    
    if (product) {
      // Cache the result
      await cacheService.set(cacheKey, product, this.CACHE_TTL);
    }
    
    return product;
  }

  async getAllProducts(): Promise<Product[]> {
    // For lists, we might want to cache differently or not at all
    // depending on update frequency
    return storage.getAllProducts();
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const product = await storage.createProduct(data);
    
    // Cache the new product
    const cacheKey = cacheService.generateKey(this.CACHE_PREFIX, product.id);
    await cacheService.set(cacheKey, product, this.CACHE_TTL);
    
    await eventBus.publish({
      type: "com.photonictag.product.created",
      source: "product-service",
      data: product,
      subject: product.id,
    });

    return product;
  }

  async updateProduct(id: string, data: Partial<InsertProduct> & { qrCodeData?: string | null }): Promise<Product | undefined> {
    const product = await storage.updateProduct(id, data);
    
    if (product) {
      // Invalidate cache
      const cacheKey = cacheService.generateKey(this.CACHE_PREFIX, id);
      await cacheService.delete(cacheKey);
      
      // Cache updated product
      await cacheService.set(cacheKey, product, this.CACHE_TTL);
      
      await eventBus.publish({
        type: "com.photonictag.product.updated",
        source: "product-service",
        data: product,
        subject: id,
      });
    }

    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const product = await storage.getProduct(id);
    const deleted = await storage.deleteProduct(id);
    
    if (deleted) {
      // Invalidate cache
      const cacheKey = cacheService.generateKey(this.CACHE_PREFIX, id);
      await cacheService.delete(cacheKey);
      
      if (product) {
        await eventBus.publish({
          type: "com.photonictag.product.deleted",
          source: "product-service",
          data: { id, productName: product.productName },
          subject: id,
        });
      }
    }

    return deleted;
  }
}

export const productService = new ProductService();
