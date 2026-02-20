
import {
    ISapClient,
    GetMaterialsParams
} from './client-interface';
import {
    SAPMaterial,
    SAPODataResponse,
    SAPODataSingleResponse,
    SAPErrorResponse,
    SAPSystemInfo
} from './types';
import { sapMockService } from '../sap-mock-service';

/**
 * Mock implementation of ISapClient that delegates to existing sapMockService logic.
 * This satisfies the interface while maintaining demo functionality.
 */
export class MockSapClient implements ISapClient {
    async getMaterials(params: GetMaterialsParams): Promise<SAPODataResponse<SAPMaterial> | SAPErrorResponse> {
        // Current sync logic wraps it in 'd' results
        return sapMockService.getMaterials(params);
    }

    async getMaterial(matnr: string): Promise<SAPODataSingleResponse<SAPMaterial> | SAPErrorResponse> {
        return sapMockService.getMaterial(matnr);
    }

    async createMaterial(data: Partial<SAPMaterial>): Promise<SAPODataSingleResponse<SAPMaterial> | SAPErrorResponse> {
        return sapMockService.createMaterial(data);
    }

    async updateMaterial(matnr: string, updates: Partial<SAPMaterial>): Promise<SAPODataSingleResponse<SAPMaterial> | SAPErrorResponse> {
        return sapMockService.updateMaterial(matnr, updates);
    }

    async deleteMaterial(matnr: string): Promise<{ success: boolean } | SAPErrorResponse> {
        const result = sapMockService.deleteMaterial(matnr);
        if ('error' in result) return result;
        return { success: true };
    }

    async testConnection(): Promise<{ success: boolean; systemInfo?: SAPSystemInfo; message?: string }> {
        const result = sapMockService.testConnection();
        return {
            success: result.success,
            systemInfo: result.systemInfo,
            message: result.success ? "Successfully connected to mock SAP system" : "Failed to connect"
        };
    }
}

// Export singleton
export const mockSapClient = new MockSapClient();
