import { storage } from '../storage';
import { sapMockService } from './sap-mock-service';
import type { EnterpriseConnector } from '@shared/schema';

export interface HealthCheckResult {
  connectorId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  responseTime: number;
  error?: string;
  consecutiveFailures: number;
  recommendation?: string;
}

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  connectors: HealthCheckResult[];
  lastUpdated: Date;
}

/**
 * SAP Connection Health Monitor
 * Checks connection status and provides recommendations
 */
export class SAPHealthMonitor {
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 5000; // 5 seconds

  /**
   * Start periodic health checks
   */
  startMonitoring(): void {
    if (this.checkInterval) return;
    
    // Initial check
    this.checkAllConnections();
    
    // Schedule periodic checks
    this.checkInterval = setInterval(() => {
      this.checkAllConnections();
    }, this.CHECK_INTERVAL_MS);
    
    console.log('[SAPHealthMonitor] Started monitoring (5min intervals)');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('[SAPHealthMonitor] Stopped monitoring');
    }
  }

  /**
   * Check all SAP connections
   */
  async checkAllConnections(): Promise<HealthStatus> {
    const connectors = await storage.getEnterpriseConnectors();
    const sapConnectors = connectors.filter(c => c.connectorType === 'sap');
    
    const results: HealthCheckResult[] = [];
    
    for (const connector of sapConnectors) {
      const result = await this.checkConnection(connector);
      results.push(result);
      
      // Store health status
      await storage.updateConnectorHealth(connector.id, {
        status: result.status,
        lastCheck: result.lastCheck,
        error: result.error,
        consecutiveFailures: result.consecutiveFailures,
      });
    }
    
    const unhealthyCount = results.filter(r => r.status === 'unhealthy').length;
    const degradedCount = results.filter(r => r.status === 'degraded').length;
    
    const overall = unhealthyCount > 0 ? 'unhealthy' : 
                    degradedCount > 0 ? 'degraded' : 'healthy';
    
    return {
      overall,
      connectors: results,
      lastUpdated: new Date(),
    };
  }

  /**
   * Check single connection with retry logic
   */
  async checkConnection(
    connector: EnterpriseConnector,
    attempt: number = 1
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Get previous health status for failure tracking
      const previousHealth = await storage.getConnectorHealth(connector.id);
      
      // Test connection
      const connectionResult = sapMockService.testConnection();
      const isConnected = connectionResult.success;
      
      const responseTime = Date.now() - startTime;
      
      if (isConnected) {
        return {
          connectorId: connector.id,
          status: responseTime > 5000 ? 'degraded' : 'healthy',
          lastCheck: new Date(),
          responseTime,
          consecutiveFailures: 0,
          recommendation: responseTime > 5000 ? 
            'Connection is slow. Consider checking network latency or SAP system load.' : undefined,
        };
      }
      
      throw new Error('Connection test failed');
      
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      // Retry logic
      if (attempt < this.MAX_RETRIES) {
        console.log(`[SAPHealthMonitor] Retry ${attempt}/${this.MAX_RETRIES} for connector ${connector.id}`);
        await this.delay(this.RETRY_DELAY_MS * attempt); // Exponential backoff
        return this.checkConnection(connector, attempt + 1);
      }
      
      // Max retries reached
      const previousHealth = await storage.getConnectorHealth(connector.id);
      const consecutiveFailures = (previousHealth?.consecutiveFailures || 0) + 1;
      
      return {
        connectorId: connector.id,
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime,
        error: error.message,
        consecutiveFailures,
        recommendation: this.getRecommendation(error.message, consecutiveFailures),
      };
    }
  }

  /**
   * Get recommendation based on error and failure count
   */
  private getRecommendation(error: string, failures: number): string {
    if (failures >= 3) {
      return 'Connection has failed multiple times. Check SAP system status and credentials.';
    }
    
    if (error.includes('ECONNREFUSED')) {
      return 'SAP server is not reachable. Check hostname and network connectivity.';
    }
    
    if (error.includes('AUTHENTICATION')) {
      return 'Authentication failed. Verify credentials and OAuth tokens.';
    }
    
    if (error.includes('TIMEOUT')) {
      return 'Connection timeout. SAP system may be under heavy load.';
    }
    
    return 'Check SAP connection settings and system availability.';
  }

  /**
   * Get quick health status for a connector
   */
  async getConnectorHealth(connectorId: string): Promise<HealthCheckResult | null> {
    const health = await storage.getConnectorHealth(connectorId);
    if (!health) return null;
    
    return {
      connectorId,
      status: health.status as any,
      lastCheck: health.lastCheck || new Date(0),
      responseTime: health.responseTime || 0,
      error: health.error || undefined,
      consecutiveFailures: health.consecutiveFailures || 0,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const sapHealthMonitor = new SAPHealthMonitor();
