
import crypto from "crypto";
import { storage } from '../storage';
import { UserPersona, Organization, Product } from '../../shared/schema';

/**
 * Service to dynamically generate customer demo environments.
 * Seeds organizations with persona-specific data.
 */
export class DemoFactoryService {
    /**
     * Create a new organization and seed it with persona data.
     */
    async createDemoFromPersona(
        personaName: string,
        salesRepId: string,
        customerName: string
    ): Promise<{ organization: Organization; demoId: string }> {
        const personas = await storage.getAllPersonas();
        const persona = personas.find(p => p.name === personaName);

        if (!persona) {
            throw new Error(`Persona ${personaName} not found.`);
        }

        // 1. Create Organization
        const slug = `${customerName.toLowerCase().replace(/\s+/g, '-')}-demo-${Date.now()}`;
        const org = await storage.createOrganization({
            name: `${customerName} (Demo - ${persona.name})`,
            slug,
            isActive: true,
        });

        // 2. Link Sales Rep (implicitly via demo instance record)
        const demoInstance = await storage.createDemoInstance({
            id: crypto.randomUUID(),
            orgId: org.id,
            personaId: persona.id,
            salesRepId,
            expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
            status: 'active',
            createdAt: new Date(),
        });

        // 3. Seed Data (Products, IoT etc)
        await this.seedPersonaData(org.id, persona);

        return { organization: org, demoId: demoInstance.id };
    }

    private async seedPersonaData(orgId: string, persona: UserPersona): Promise<void> {
        const template = persona.templateData as any;

        if (template.products) {
            for (const productTemplate of template.products) {
                const product = await storage.createProduct({
                    ...productTemplate,
                    orgId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                // Optionally seed IoT devices if in template
                if (template.iotDevices) {
                    const deviceTemplate = template.iotDevices.find((d: any) => d.productName === productTemplate.name);
                    if (deviceTemplate) {
                        await storage.createIoTDevice({
                            ...deviceTemplate,
                            orgId,
                            productId: product.id,
                        });
                    }
                }
            }
        }
    }

    /**
     * Pre-load standard personas if they don't exist.
     */
    async initializeDefaultPersonas(): Promise<void> {
        const existing = await storage.getAllPersonas();
        if (existing.length > 0) return;

        const defaults: any[] = [
            {
                name: "Automotive Precision",
                industry: "Automotive",
                description: "Focus on EV battery tracing and motor controller DPP.",
                templateData: {
                    products: [
                        { name: "Lithium-Ion Cell Pack", category: "Battery", sku: "EV-BATT-001" },
                        { name: "High-Torque Motor Controller", category: "Electronics", sku: "EV-CTRL-500" }
                    ],
                    iotDevices: [
                        { productName: "Lithium-Ion Cell Pack", deviceId: "TEMP-SENS-01", deviceType: "sensor" }
                    ]
                },
                isDefault: true
            },
            {
                name: "Sustainable Textiles",
                industry: "Textiles",
                description: "Organic cotton sourcing and recycled polyester tracing.",
                templateData: {
                    products: [
                        { name: "Organic Cotton T-Shirt", category: "Apparel", sku: "TX-TEE-ORG" },
                        { name: "Recycled Marine Polyester Jacket", category: "Apparel", sku: "TX-JKT-REC" }
                    ]
                },
                isDefault: true
            }
        ];

        for (const p of defaults) {
            await storage.createPersona(p);
        }
    }
}

export const demoFactoryService = new DemoFactoryService();
