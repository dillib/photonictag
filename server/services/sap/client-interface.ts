
import { SAPMaterial, SAPODataResponse, SAPODataSingleResponse, SAPErrorResponse, SAPSystemInfo } from './types';

export interface GetMaterialsParams {
    $skip?: number;
    $top?: number;
    $filter?: string;
    $search?: string;
}

export interface ISapClient {
    getMaterials(params: GetMaterialsParams): Promise<SAPODataResponse<SAPMaterial> | SAPErrorResponse>;
    getMaterial(matnr: string): Promise<SAPODataSingleResponse<SAPMaterial> | SAPErrorResponse>;
    createMaterial(data: Partial<SAPMaterial>): Promise<SAPODataSingleResponse<SAPMaterial> | SAPErrorResponse>;
    updateMaterial(matnr: string, updates: Partial<SAPMaterial>): Promise<SAPODataSingleResponse<SAPMaterial> | SAPErrorResponse>;
    deleteMaterial(matnr: string): Promise<{ success: boolean } | SAPErrorResponse>;
    testConnection(): Promise<{ success: boolean; systemInfo?: SAPSystemInfo; message?: string }>;
}
