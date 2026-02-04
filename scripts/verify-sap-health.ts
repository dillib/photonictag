
import { sapHealthMonitor } from "../server/services/sap-health-monitor";
import { sapMockService } from "../server/services/sap-mock-service";
import { storage } from "../server/storage";

// Mock storage for the test
storage.getEnterpriseConnectors = async () => [
  {
    id: "test-connector-1",
    name: "SAP Test",
    connectorType: "sap",
    status: "active",
    config: {
      systemType: "S4HANA",
      hostname: "sap.example.com",
    },
    // Add other required fields with defaults
    syncDirection: "inbound",
    fieldMappings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    productsSynced: 0
  }
];

storage.getConnectorHealth = async () => null;
storage.updateConnectorHealth = async (id, health) => {
  console.log(`[Storage] Updated health for ${id}:`, health.status);
  return { ...health, connectorId: id };
};

async function runTest() {
  console.log("🧪 Starting SAP Health Monitor Verification...");

  // 1. Mock a successful connection
  console.log("\n--- Test 1: Healthy Connection ---");
  // Force mock service to return success
  sapMockService.testConnection = async () => true;
  
  const health1 = await sapHealthMonitor.checkAllConnections();
  console.log("Status:", health1.overall);
  console.log("Connectors:", health1.connectors.length);
  
  if (health1.overall === 'healthy') {
    console.log("✅ Test 1 Passed: System reports Healthy");
  } else {
    console.error("❌ Test 1 Failed: Expected Healthy, got", health1.overall);
  }

  // 2. Mock a failed connection
  console.log("\n--- Test 2: Unhealthy Connection ---");
  // Force mock service to fail
  sapMockService.testConnection = async () => false;
  
  // Reset monitor internal state if needed (not needed here as we create fresh calls)
  const health2 = await sapHealthMonitor.checkAllConnections();
  // Note: It might retry, so this might take a few seconds
  
  console.log("Status:", health2.overall);
  
  if (health2.overall === 'unhealthy' || health2.overall === 'degraded') {
     console.log("✅ Test 2 Passed: System reports Unhealthy/Degraded on failure");
  } else {
     console.error("❌ Test 2 Failed: Expected Unhealthy, got", health2.overall);
  }
}

runTest().catch(console.error);
