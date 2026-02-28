import OpenAI from "openai";
import { storage } from "../storage";
import { eventBus } from "../events/event-bus";
import type {
  AIInsight,
  InsertAIInsight,
  AIInsightType,
  Product,
  AISummary,
  SustainabilityInsight,
  RepairSummary,
  CircularityScore,
  RiskAssessment,
  BiogenicSignature,
  VerificationEvent
} from "@shared/schema";

// Initialize OpenAI client only if API key is present
const openai = process.env.AI_INTEGRATIONS_OPENAI_API_KEY
  ? new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  })
  : null;

async function getChatCompletion(messages: Array<{ role: "user" | "assistant" | "system"; content: string }>): Promise<string> {
  if (!openai) {
    throw new Error("AI features are disabled. Please configure OPENAI_API_KEY in .env file to enable AI-generated insights.");
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    response_format: { type: "json_object" },
  });

  return response.choices[0]?.message?.content || "{}";
}

export class AIService {
  async getInsight(id: string): Promise<AIInsight | undefined> {
    return storage.getAIInsight(id);
  }

  async getInsightsByProductId(productId: string): Promise<AIInsight[]> {
    return storage.getAIInsightsByProductId(productId);
  }

  async generateSummary(product: Product): Promise<AISummary> {
    const prompt = `Summarize this product for a Digital Product Passport:
Product: ${product.productName}
Manufacturer: ${product.manufacturer}
Materials: ${product.materials}
Carbon Footprint: ${product.carbonFootprint} kg CO2e
Repairability Score: ${product.repairabilityScore}/10

Provide a concise summary (2-3 sentences) and list 3-5 key features.
Respond in JSON format: { "summary": "...", "keyFeatures": ["...", "..."] }`;

    const response = await getChatCompletion([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(response) as AISummary;

    await this.storeInsight(product.id, "summary", parsed as unknown as Record<string, unknown>);

    return parsed;
  }

  async generateSustainabilityInsight(product: Product): Promise<SustainabilityInsight> {
    const prompt = `Analyze sustainability for this product:
Product: ${product.productName}
Materials: ${product.materials}
Carbon Footprint: ${product.carbonFootprint} kg CO2e
Recycling Instructions: ${product.recyclingInstructions}

Provide:
1. Overall sustainability score (1-100)
2. Carbon footprint analysis
3. Circularity recommendations
4. Improvement suggestions

Respond in JSON format: { "overallScore": 75, "carbonAnalysis": "...", "circularityRecommendations": ["..."], "improvements": ["..."] }`;

    const response = await getChatCompletion([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(response) as SustainabilityInsight;

    await this.storeInsight(product.id, "sustainability", parsed as unknown as Record<string, unknown>);

    return parsed;
  }

  async generateRepairSummary(product: Product): Promise<RepairSummary> {
    const prompt = `Generate repair guidance for:
Product: ${product.productName}
Materials: ${product.materials}
Repairability Score: ${product.repairabilityScore}/10
Warranty: ${product.warrantyInfo}

Provide:
1. Repairability rating (Excellent/Good/Fair/Poor)
2. Common repair instructions
3. Common issues
4. Parts availability assessment

Respond in JSON format: { "repairabilityRating": "...", "repairInstructions": ["..."], "commonIssues": ["..."], "partsAvailability": "..." }`;

    const response = await getChatCompletion([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(response) as RepairSummary;

    await this.storeInsight(product.id, "repair", parsed as unknown as Record<string, unknown>);

    return parsed;
  }

  async generateCircularityScore(product: Product): Promise<CircularityScore> {
    const recycledContent = product.recycledContentPercent ?? 0;
    const recyclability = product.recyclabilityPercent ?? 0;

    const prompt = `Analyze circularity and material efficiency for this product:
Product: ${product.productName}
Materials: ${product.materials}
Recycled Content: ${recycledContent}%
Recyclability: ${recyclability}%
Recycling Instructions: ${product.recyclingInstructions}
Disassembly Instructions: ${product.disassemblyInstructions || "Not provided"}
Take-Back Programs: ${JSON.stringify(product.takeBackPrograms || [])}

Provide a circularity assessment:
1. Overall circularity score (0-100)
2. Grade (A+, A, B, C, D, F)
3. Recyclability analysis
4. Material efficiency assessment
5. End-of-life options
6. Improvement recommendations

Respond in JSON format: { "score": 75, "grade": "B", "recyclabilityAnalysis": "...", "materialEfficiency": "...", "endOfLifeOptions": ["..."], "recommendations": ["..."] }`;

    const response = await getChatCompletion([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(response) as CircularityScore;

    await this.storeInsight(product.id, "circularity", parsed as unknown as Record<string, unknown>);

    return parsed;
  }

  async generateRiskAssessment(product: Product): Promise<RiskAssessment> {
    const hasAllFields = !!(product.manufacturer && product.batchNumber && product.materials &&
      product.carbonFootprint && product.recyclingInstructions);
    const hasCertifications = (product.safetyCertifications?.length ?? 0) > 0;
    const hasCeMarking = product.ceMarking === true;

    const prompt = `Analyze risk factors for this Digital Product Passport:
Product: ${product.productName}
Manufacturer: ${product.manufacturer}
Country of Origin: ${product.countryOfOrigin || "Not specified"}
Batch Number: ${product.batchNumber}
CE Marking: ${hasCeMarking ? "Yes" : "No"}
Safety Certifications: ${JSON.stringify(product.safetyCertifications || [])}
Environmental Certifications: ${JSON.stringify(product.environmentalCertifications || [])}
Has Complete Core Data: ${hasAllFields ? "Yes" : "No"}

Analyze and identify:
1. Overall risk level (Low/Medium/High)
2. Specific risk flags with severity and descriptions
3. Data completeness percentage (0-100)
4. Counterfeit risk assessment
5. Any compliance issues
6. Recommendations for risk mitigation

Consider: missing mandatory fields, certification gaps, traceability issues, potential counterfeit indicators.

Respond in JSON format: { "overallRisk": "Low", "riskFlags": [{"type": "...", "severity": "Low", "description": "..."}], "dataCompleteness": 85, "counterfeitRisk": "...", "complianceIssues": ["..."], "recommendations": ["..."] }`;

    const response = await getChatCompletion([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(response) as RiskAssessment;

    await this.storeInsight(product.id, "risk_assessment", parsed as unknown as Record<string, unknown>);

    return parsed;
  }

  private async storeInsight(productId: string, insightType: AIInsightType, content: Record<string, unknown>): Promise<AIInsight> {
    const insightData: InsertAIInsight = {
      productId,
      insightType,
      content,
      model: "gpt-4o",
      isStale: false,
    };

    const insight = await storage.createAIInsight(insightData);

    await eventBus.publish({
      type: "com.photonictag.ai.insights_generated",
      source: "ai-service",
      data: { insightId: insight.id, productId, insightType },
      subject: productId,
    });

    return insight;
  }

  async markInsightsStale(productId: string): Promise<void> {
    await storage.markInsightStale(productId);
  }

  // ==========================================
  // PHASE 2: BIOGENIC TAG VERIFICATION ENGINE
  // ==========================================

  /**
   * Enrolls a product's Biogenic Signature.
   * In a real system, this takes raw data from an industrial imaging sensor.
   * Here, we use the AI Engine to simulate creating a realistic physics-based optical signature
   * based on the product's defined materials and manufacturing data.
   */
  async enrollBiogenicSignature(product: Product): Promise<BiogenicSignature> {
    // Check if one already exists
    const existing = await storage.getBiogenicSignature(product.id);
    if (existing) {
      return existing;
    }

    const prompt = `Simulate a Biogenic Optical Tag enrollment profile for the following product:
Product: ${product.productName}
Manufacturer: ${product.manufacturer}
Materials: ${product.materials}

Generate a complex, unforgeable digital twin reference.
Provide:
1. spectralReflectanceCurve: An array of exactly 10 floating-point numbers between 0.0 and 1.0 representing the optical reflection signature.
2. microRefractionIndex: A realistic float value representing the index of refraction for this material mix (e.g., 1.45 to 2.4).
3. surfaceTopographyHash: A simulated SHA-256 style hash string representing the unique microscopic surface map.

Respond in exact JSON format:
{
  "spectralReflectanceCurve": [0.1, 0.2, ...],
  "microRefractionIndex": 1.55,
  "surfaceTopographyHash": "a1b2c3..."
}`;

    const response = await getChatCompletion([{ role: "system", content: "You are a highly precise physics API generating simulated optical material properties." }, { role: "user", content: prompt }]);
    const parsed = JSON.parse(response) as { spectralReflectanceCurve: number[], microRefractionIndex: number, surfaceTopographyHash: string };

    const signatureStr = `SIG-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    return storage.createBiogenicSignature({
      productId: product.id,
      spectralReflectanceCurve: parsed.spectralReflectanceCurve,
      microRefractionIndex: parsed.microRefractionIndex,
      surfaceTopographyHash: parsed.surfaceTopographyHash,
      cryptographicSignature: signatureStr,
      status: "active"
    });
  }

  /**
   * Verifies an incoming scan against the enrolled Biogenic Signature.
   * The AI Engine analyzes the variances between the reference curve and scanned curve
   * to determine authenticity.
   */
  async verifyScan(
    productId: string,
    sensorId: string,
    scannedCurve: number[],
    scannedTopographyHash: string,
    locationData?: { lat: number, lng: number, locationName: string }
  ): Promise<VerificationEvent> {
    const signature = await storage.getBiogenicSignature(productId);

    if (!signature || signature.status !== "active") {
      throw new Error("No active biogenic signature found for this product.");
    }

    const prompt = `Analyze this incoming optical sensor scan against the enrolled reference signature.
    
Reference Signature:
- Spectral Curve: ${JSON.stringify(signature.spectralReflectanceCurve)}
- Topography Hash: ${signature.surfaceTopographyHash}

Incoming Scan Data:
- Scanned Curve: ${JSON.stringify(scannedCurve)}
- Scanned Topography: ${scannedTopographyHash}

Task:
Calculate the variance. Optical sensors in the field have some noise (up to 5% variance is typical in authentic items). 
If the scanned curve closely matches the reference curve AND the topography hashes match or have minor corruption logic, it passes.
Otherwise, it fails due to potential counterfeiting.

Provide:
1. confidenceScore: A float between 0.0 and 1.0 (e.g., 0.998 for near perfect match).
2. status: "passed", "failed", or "inconclusive".
3. aiReasoning: A technical explanation of the decision (e.g., "Reflectance curve variance within acceptable 2% margin. Topography matches reference.").

Respond in exact JSON format:
{
  "confidenceScore": 0.985,
  "status": "passed",
  "aiReasoning": "..."
}`;

    const response = await getChatCompletion([{ role: "system", content: "You are an AI Trust Engine analyzing complex optical sensor data to authenticate physical products." }, { role: "user", content: prompt }]);
    const decision = JSON.parse(response) as { confidenceScore: number, status: "passed" | "failed" | "inconclusive", aiReasoning: string };

    // Emit event on bus for live dashboard updates
    eventBus.publish({
      type: "com.photonictag.verification.scan_processed",
      source: "ai-service",
      subject: productId,
      data: {
        sensorId,
        status: decision.status,
        confidence: decision.confidenceScore
      }
    });

    return storage.createVerificationEvent({
      productId: productId,
      sensorId: sensorId,
      scannedReflectanceCurve: scannedCurve,
      scannedTopographyHash: scannedTopographyHash,
      confidenceScore: decision.confidenceScore,
      status: decision.status,
      aiReasoning: decision.aiReasoning,
      lat: locationData?.lat,
      lng: locationData?.lng,
      location: locationData?.locationName,
    });
  }
}

export const aiService = new AIService();
