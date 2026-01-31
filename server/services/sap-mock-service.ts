/**
 * SAP Mock OData Service
 *
 * Simulates a real SAP S/4HANA OData v2/v4 API for demo purposes.
 * This allows testing SAP integration without connecting to a real SAP system.
 *
 * Key SAP Tables Simulated:
 * - MARA: Material Master (General Data)
 * - MARC: Material Master (Plant Data)
 * - MAKT: Material Descriptions
 * - MBEW: Material Valuation
 * - MCH1: Batch Master
 */

import { randomUUID } from "crypto";

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

/**
 * Mock SAP S/4HANA Database
 * In-memory storage simulating SAP tables
 */
class SAPMockDatabase {
  private materials: Map<string, SAPMaterial> = new Map();
  private lastMaterialNumber = 100000;

  constructor() {
    this.seedInitialData();
  }

  /**
   * Seed 100 realistic SAP materials across different industries
   */
  private seedInitialData(): void {
    const industries = [
      { prefix: "EV", name: "Electric Vehicles", plants: ["1000", "1010"] },
      { prefix: "BAT", name: "Batteries", plants: ["2000", "2010"] },
      { prefix: "ELEC", name: "Electronics", plants: ["3000", "3010"] },
      { prefix: "FASH", name: "Fashion/Textiles", plants: ["4000", "4010"] },
      { prefix: "FOOD", name: "Food & Beverage", plants: ["5000", "5010"] },
      { prefix: "PHARM", name: "Pharmaceuticals", plants: ["6000", "6010"] },
      { prefix: "CHEM", name: "Chemicals", plants: ["7000", "7010"] },
      { prefix: "AUTO", name: "Automotive Parts", plants: ["8000", "8010"] },
    ];

    let materialCount = 0;

    industries.forEach((industry) => {
      for (let i = 0; i < 12; i++) {
        const matnr = this.generateMaterialNumber();
        const material = this.generateRealisticMaterial(
          matnr,
          industry.prefix,
          industry.name,
          industry.plants[i % 2]
        );
        this.materials.set(matnr, material);
        materialCount++;

        if (materialCount >= 100) return;
      }
    });

    console.log(`[SAP Mock] Seeded ${this.materials.size} materials`);
  }

  private generateMaterialNumber(): string {
    return String(this.lastMaterialNumber++).padStart(18, '0');
  }

  private generateRealisticMaterial(
    matnr: string,
    prefix: string,
    industryName: string,
    plant: string
  ): SAPMaterial {
    const productNames = {
      EV: ["Battery Pack", "Motor Controller", "Inverter Module", "Charging Cable"],
      BAT: ["Li-ion Cell", "Battery Module", "BMS Unit", "Cooling Plate"],
      ELEC: ["Smartphone", "Laptop", "Tablet", "Smart Watch"],
      FASH: ["Organic Cotton T-Shirt", "Recycled Denim Jeans", "Sustainable Sneakers", "Eco Jacket"],
      FOOD: ["Organic Coffee Beans", "Sustainable Palm Oil", "Fair Trade Chocolate", "Plant-Based Protein"],
      PHARM: ["Antibiotics Tablet", "Vitamin Supplement", "Injectable Vaccine", "Topical Cream"],
      CHEM: ["Industrial Solvent", "Eco-Friendly Detergent", "Water Treatment Agent", "Bio-Plastic Resin"],
      AUTO: ["Brake Pad", "Air Filter", "Oil Filter", "Spark Plug"],
    };

    const names = productNames[prefix as keyof typeof productNames] || ["Generic Product"];
    const name = names[Math.floor(Math.random() * names.length)];

    const carbonFootprints = { EV: 850, BAT: 620, ELEC: 180, FASH: 45, FOOD: 12, PHARM: 28, CHEM: 95, AUTO: 65 };
    const recyclability = { EV: 85, BAT: 90, ELEC: 75, FASH: 60, FOOD: 20, PHARM: 30, CHEM: 40, AUTO: 80 };
    const repairScores = { EV: 7, BAT: 6, ELEC: 5, FASH: 8, FOOD: 1, PHARM: 1, CHEM: 3, AUTO: 9 };

    const batch = `BATCH-${matnr.slice(-6)}`;
    const sku = `${prefix}-${matnr.slice(-8)}`;

    return {
      MATNR: matnr,
      MATNR_EXT: sku,
      MAKTX: `${name} - ${industryName}`,
      MATKL: prefix,
      MEINS: prefix === "FOOD" ? "KG" : "EA",
      WERKS: plant,
      CHARG: batch,
      NTGEW: Math.random() * 50 + 0.5,
      GEWEI: "KG",
      BRGEW: Math.random() * 60 + 1,
      VOLUM: Math.random() * 10 + 0.1,
      VOLEH: "L",
      LABOR: `LAB-${plant}`,
      RAUBE: "Room Temperature",
      TEMPB: "15-25°C",
      STOFF: prefix === "CHEM" || prefix === "PHARM" ? `HMS-${Math.floor(Math.random() * 9999)}` : "",
      TRAGR: prefix === "CHEM" ? "HAZMAT" : "GENERAL",
      ZZECO_CERT: this.randomCertifications(),
      ZZCARBON: carbonFootprints[prefix as keyof typeof carbonFootprints] || 100,
      ZZRECYCLE: recyclability[prefix as keyof typeof recyclability] || 50,
      ZZREPAIR_SCORE: repairScores[prefix as keyof typeof repairScores] || 5,
      ZZWARRANTY: `${Math.floor(Math.random() * 3) + 1} years limited warranty`,
      ZZORIGIN: this.randomCountry(),
      ERSDA: this.randomDate(2020, 2024),
      LAEDA: this.randomDate(2024, 2026),
      LVORM: false,
      metadata: {
        uri: `https://sap-mock.photonictag.com/sap/opu/odata/sap/API_MATERIAL_STOCK_SRV/A_Material('${matnr}')`,
        type: "API_MATERIAL_STOCK_SRV.A_MaterialType"
      }
    };
  }

  private randomCertifications(): string {
    const certs = [
      "ISO 14001",
      "ISO 9001",
      "REACH",
      "RoHS",
      "CE",
      "Energy Star",
      "FSC",
      "GOTS",
      "Fair Trade",
      "Carbon Neutral"
    ];
    const selected = [];
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const cert = certs[Math.floor(Math.random() * certs.length)];
      if (!selected.includes(cert)) selected.push(cert);
    }
    return selected.join(", ");
  }

  private randomCountry(): string {
    const countries = ["Germany", "China", "USA", "Japan", "South Korea", "Taiwan", "Vietnam", "India"];
    return countries[Math.floor(Math.random() * countries.length)];
  }

  private randomDate(startYear: number, endYear: number): string {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  // CRUD Operations (simulating OData)

  getAllMaterials(skip = 0, top = 100): SAPMaterial[] {
    return Array.from(this.materials.values()).slice(skip, skip + top);
  }

  getMaterialByNumber(matnr: string): SAPMaterial | undefined {
    return this.materials.get(matnr);
  }

  getMaterialsByPlant(plant: string): SAPMaterial[] {
    return Array.from(this.materials.values()).filter(m => m.WERKS === plant);
  }

  getMaterialsByCategory(category: string): SAPMaterial[] {
    return Array.from(this.materials.values()).filter(m => m.MATKL === category);
  }

  createMaterial(material: Omit<SAPMaterial, 'MATNR' | 'ERSDA' | 'LAEDA' | 'metadata'>): SAPMaterial {
    const matnr = this.generateMaterialNumber();
    const now = new Date().toISOString().split('T')[0].replace(/-/g, '');

    const newMaterial: SAPMaterial = {
      ...material,
      MATNR: matnr,
      ERSDA: now,
      LAEDA: now,
      metadata: {
        uri: `https://sap-mock.photonictag.com/sap/opu/odata/sap/API_MATERIAL_STOCK_SRV/A_Material('${matnr}')`,
        type: "API_MATERIAL_STOCK_SRV.A_MaterialType"
      }
    };

    this.materials.set(matnr, newMaterial);
    return newMaterial;
  }

  updateMaterial(matnr: string, updates: Partial<SAPMaterial>): SAPMaterial | undefined {
    const material = this.materials.get(matnr);
    if (!material) return undefined;

    const updated = {
      ...material,
      ...updates,
      MATNR: matnr, // Don't allow changing material number
      LAEDA: new Date().toISOString().split('T')[0].replace(/-/g, '')
    };

    this.materials.set(matnr, updated);
    return updated;
  }

  deleteMaterial(matnr: string): boolean {
    // SAP uses deletion flags rather than actual deletion
    const material = this.materials.get(matnr);
    if (!material) return false;

    material.LVORM = true;
    this.materials.set(matnr, material);
    return true;
  }

  getTotalCount(): number {
    return this.materials.size;
  }

  searchMaterials(query: string): SAPMaterial[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.materials.values()).filter(m =>
      m.MAKTX.toLowerCase().includes(lowerQuery) ||
      m.MATNR.includes(query) ||
      m.MATNR_EXT.toLowerCase().includes(lowerQuery)
    );
  }
}

/**
 * SAP Mock OData Service
 * Exposes OData v2/v4 compatible endpoints
 */
export class SAPMockService {
  private db: SAPMockDatabase;
  private systemInfo = {
    systemId: "PRD",
    client: "100",
    systemType: "S/4HANA 2023",
    version: "SAP S/4HANA 2023 FPS01",
    apiVersion: "OData V2",
    hostname: "sap-s4hana-mock.local"
  };

  constructor() {
    this.db = new SAPMockDatabase();
  }

  /**
   * GET /sap/opu/odata/sap/API_MATERIAL_STOCK_SRV/A_Material
   * List all materials (with pagination)
   */
  getMaterials(params: {
    $skip?: number;
    $top?: number;
    $filter?: string;
    $search?: string;
  }): SAPODataResponse<SAPMaterial> {
    const skip = params.$skip || 0;
    const top = Math.min(params.$top || 100, 1000); // SAP limits to max 1000

    let materials: SAPMaterial[];

    if (params.$search) {
      materials = this.db.searchMaterials(params.$search);
    } else if (params.$filter) {
      // Simple filter parsing (in production would use proper OData parser)
      materials = this.applyFilter(params.$filter);
    } else {
      materials = this.db.getAllMaterials(skip, top);
    }

    return {
      d: {
        results: materials,
        __count: this.db.getTotalCount()
      }
    };
  }

  /**
   * GET /sap/opu/odata/sap/API_MATERIAL_STOCK_SRV/A_Material('MATNR')
   * Get single material by number
   */
  getMaterial(matnr: string): SAPODataSingleResponse<SAPMaterial> | SAPErrorResponse {
    const material = this.db.getMaterialByNumber(matnr);

    if (!material) {
      return this.createErrorResponse("404", `Material ${matnr} not found`);
    }

    return {
      d: material
    };
  }

  /**
   * POST /sap/opu/odata/sap/API_MATERIAL_STOCK_SRV/A_Material
   * Create new material
   */
  createMaterial(data: Partial<SAPMaterial>): SAPODataSingleResponse<SAPMaterial> | SAPErrorResponse {
    try {
      // Validate required fields
      if (!data.MAKTX || !data.WERKS || !data.MEINS) {
        return this.createErrorResponse("400", "Missing required fields: MAKTX, WERKS, MEINS");
      }

      const material = this.db.createMaterial(data as any);
      return {
        d: material
      };
    } catch (error) {
      return this.createErrorResponse("500", "Internal server error");
    }
  }

  /**
   * PATCH /sap/opu/odata/sap/API_MATERIAL_STOCK_SRV/A_Material('MATNR')
   * Update existing material
   */
  updateMaterial(matnr: string, updates: Partial<SAPMaterial>): SAPODataSingleResponse<SAPMaterial> | SAPErrorResponse {
    const material = this.db.updateMaterial(matnr, updates);

    if (!material) {
      return this.createErrorResponse("404", `Material ${matnr} not found`);
    }

    return {
      d: material
    };
  }

  /**
   * DELETE /sap/opu/odata/sap/API_MATERIAL_STOCK_SRV/A_Material('MATNR')
   * Delete (mark for deletion) material
   */
  deleteMaterial(matnr: string): { success: boolean } | SAPErrorResponse {
    const success = this.db.deleteMaterial(matnr);

    if (!success) {
      return this.createErrorResponse("404", `Material ${matnr} not found`);
    }

    return { success: true };
  }

  /**
   * GET /sap/opu/odata/sap/API_MATERIAL_STOCK_SRV/$metadata
   * Get service metadata (OData schema)
   */
  getMetadata(): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx">
  <edmx:DataServices m:DataServiceVersion="2.0">
    <Schema Namespace="API_MATERIAL_STOCK_SRV">
      <EntityType Name="A_Material">
        <Key>
          <PropertyRef Name="MATNR"/>
        </Key>
        <Property Name="MATNR" Type="Edm.String" MaxLength="18"/>
        <Property Name="MAKTX" Type="Edm.String" MaxLength="40"/>
        <Property Name="MATKL" Type="Edm.String" MaxLength="9"/>
        <!-- Additional properties... -->
      </EntityType>
    </Schema>
  </edmx:DataServices>
</edmx:Edmx>`;
  }

  /**
   * Test connection to SAP system
   */
  testConnection(): { success: boolean; systemInfo: typeof this.systemInfo } {
    return {
      success: true,
      systemInfo: this.systemInfo
    };
  }

  private applyFilter(filter: string): SAPMaterial[] {
    // Simple filter implementation for demo
    // Production would use proper OData filter parser
    if (filter.includes("WERKS eq")) {
      const plant = filter.match(/'([^']+)'/)?.[1];
      return plant ? this.db.getMaterialsByPlant(plant) : [];
    }

    if (filter.includes("MATKL eq")) {
      const category = filter.match(/'([^']+)'/)?.[1];
      return category ? this.db.getMaterialsByCategory(category) : [];
    }

    return this.db.getAllMaterials();
  }

  private createErrorResponse(code: string, message: string): SAPErrorResponse {
    return {
      error: {
        code: `SAP/${code}`,
        message: {
          lang: "en",
          value: message
        },
        innererror: {
          errordetails: [{
            code: code,
            message: message,
            severity: "error",
            target: ""
          }]
        }
      }
    };
  }

  /**
   * Get system info (for connection testing)
   */
  getSystemInfo() {
    return this.systemInfo;
  }

  /**
   * Batch operations (OData $batch)
   */
  executeBatch(operations: Array<{
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    url: string;
    body?: any;
  }>): any[] {
    return operations.map(op => {
      // Simplified batch processing
      const matnrMatch = op.url.match(/A_Material\('([^']+)'\)/);

      switch (op.method) {
        case 'GET':
          return matnrMatch
            ? this.getMaterial(matnrMatch[1])
            : this.getMaterials({});
        case 'POST':
          return this.createMaterial(op.body);
        case 'PATCH':
          return matnrMatch
            ? this.updateMaterial(matnrMatch[1], op.body)
            : this.createErrorResponse("400", "Invalid PATCH request");
        case 'DELETE':
          return matnrMatch
            ? this.deleteMaterial(matnrMatch[1])
            : this.createErrorResponse("400", "Invalid DELETE request");
        default:
          return this.createErrorResponse("405", "Method not allowed");
      }
    });
  }
}

// Singleton instance
export const sapMockService = new SAPMockService();
