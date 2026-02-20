
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "PhotonicTag API",
            version: "1.0.0",
            description: "Enterprise Digital Product Passport (DPP) API",
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                sessionAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "connect.sid",
                },
            },
            schemas: {
                Product: {
                    type: "object",
                    required: ["productName", "manufacturer", "batchNumber", "carbonFootprint", "repairabilityScore", "warrantyInfo", "recyclingInstructions"],
                    properties: {
                        id: { type: "string", format: "uuid" },
                        productName: { type: "string" },
                        productCategory: { type: "string" },
                        modelNumber: { type: "string" },
                        sku: { type: "string" },
                        manufacturer: { type: "string" },
                        batchNumber: { type: "string" },
                        carbonFootprint: { type: "integer" },
                        repairabilityScore: { type: "integer" },
                        warrantyInfo: { type: "string" },
                        recyclingInstructions: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
            },
        },
    },
    apis: ["./server/routes/modules/*.ts"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
    // Swagger UI route
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

    // JSON specification
    app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(specs);
    });

    console.log("[Swagger] API documentation available at /api-docs");
}
