
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from '../services/product-service';
import { storage } from '../storage';

// Mock dependencies
vi.mock('../storage');

describe('ProductService', () => {
    let service: ProductService;

    beforeEach(() => {
        vi.resetAllMocks();
        service = new ProductService();
    });

    it('should get all products', async () => {
        const mockProducts = [
            { id: '1', productName: 'Product 1' },
            { id: '2', productName: 'Product 2' },
        ];

        vi.mocked(storage.getAllProducts).mockResolvedValue(mockProducts as any);

        const products = await service.getAllProducts();

        expect(storage.getAllProducts).toHaveBeenCalled();
        expect(products).toEqual(mockProducts);
        expect(products.length).toBe(2);
    });

    it('should get product by id', async () => {
        const mockProduct = { id: '1', productName: 'Product 1' };

        vi.mocked(storage.getProduct).mockResolvedValue(mockProduct as any);

        const product = await service.getProduct('1');

        expect(storage.getProduct).toHaveBeenCalledWith('1');
        expect(product).toEqual(mockProduct);
    });
});
