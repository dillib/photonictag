
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SAPSyncService } from '../services/sap-sync-service';
import { storage } from '../storage';
import { sapMockService } from '../services/sap-mock-service';
import { productService } from '../services/product-service';

// Mock dependencies
vi.mock('../storage');
vi.mock('../services/sap-mock-service');
vi.mock('../services/product-service');
vi.mock('../services/identity-service');
vi.mock('../services/qr-service');
vi.mock('../services/trace-service');

describe('SAPSyncService', () => {
    let service: SAPSyncService;

    beforeEach(() => {
        vi.resetAllMocks();
        service = new SAPSyncService();
    });

    it('should fail if connector is not found', async () => {
        // Mock storage.getEnterpriseConnector to return null
        vi.mocked(storage.getEnterpriseConnector).mockResolvedValue(undefined);

        const result = await service.executeSync({
            connectorId: 'non-existent',
            direction: 'inbound',
        });

        expect(result.success).toBe(false);
        expect(result.errors).toContainEqual(expect.objectContaining({
            record: 'SYNC_ENGINE',
            error: 'Connector not found'
        }));
    });

    it('should call syncFromSAP when direction is inbound', async () => {
        const mockConnector = {
            id: '1',
            name: 'Test Connector',
            type: 'sap-s4hana',
            status: 'active',
            config: {},
            fieldMappings: [],
            syncSchedule: 'daily',
            syncDirection: 'inbound',
        };

        vi.mocked(storage.getEnterpriseConnector).mockResolvedValue(mockConnector as any);

        // Mock sapMockService.getMaterials
        vi.mocked(sapMockService.getMaterials).mockReturnValue({
            d: { results: [] }
        } as any);

        const result = await service.executeSync({
            connectorId: '1',
            direction: 'inbound',
        });

        expect(storage.getEnterpriseConnector).toHaveBeenCalledWith('1');
        expect(sapMockService.getMaterials).toHaveBeenCalled();
        expect(result.success).toBe(true);
    });
});
