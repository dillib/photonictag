
// SAP Material Master Data Structure (MARA + MARC + MAKT combined)
export interface SAPMaterial {
    MATNR: string;           // Material Number (SKU)
    MATNR_EXT: string;       // External Material Number
    MAKTX: string;           // Material Description
    MATKL: string;           // Material Group (Category)
    MEINS: string;           // Base Unit of Measure
    WERKS: string;           // Plant (Manufacturing Location)
    CHARG: string;           // Batch Number
    NTGEW: number;           // Net Weight
    GEWEI: string;           // Weight Unit
    BRGEW: number;           // Gross Weight
    VOLUM: number;           // Volume
    VOLEH: string;           // Volume Unit
    LABOR: string;           // Laboratory/Office
    RAUBE: string;           // Storage Conditions
    TEMPB: string;           // Temperature Conditions
    STOFF: string;           // Hazardous Material Number
    TRAGR: string;           // Transportation Group
    ZZECO_CERT: string;      // Environmental Certifications (Custom Z-field)
    ZZCARBON: number;        // Carbon Footprint (Custom Z-field)
    ZZRECYCLE: number;       // Recyclability % (Custom Z-field)
    ZZREPAIR_SCORE: number;  // Repairability Score (Custom Z-field)
    ZZWARRANTY: string;      // Warranty Info (Custom Z-field)
    ZZORIGIN: string;        // Country of Origin (Custom Z-field)
    ERSDA: string;           // Created On
    LAEDA: string;           // Last Changed On
    LVORM: boolean;          // Deletion Flag
    metadata?: {
        uri: string;
        type: string;
    };
}

export interface SAPODataResponse<T> {
    d: {
        results: T[];
        __count?: number;
    };
}

export interface SAPODataSingleResponse<T> {
    d: T;
}

export interface SAPErrorResponse {
    error: {
        code: string;
        message: {
            lang: string;
            value: string;
        };
        innererror?: {
            errordetails: Array<{
                code: string;
                message: string;
                severity: string;
                target: string;
            }>;
        };
    };
}

export interface SAPSystemInfo {
    systemId: string;
    client: string;
    systemType: string;
    version: string;
    apiVersion: string;
    hostname: string;
}
