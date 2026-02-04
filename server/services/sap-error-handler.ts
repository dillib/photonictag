/**
 * SAP Error Handler
 * Maps SAP error codes to user-friendly messages and suggestions
 */

export interface SAPError {
  code: string;
  message: string;
  category: 'connection' | 'authentication' | 'data' | 'system' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage: string;
  suggestion: string;
  documentationUrl?: string;
}

// SAP Error Code Mappings
const SAP_ERROR_MAP: Record<string, SAPError> = {
  // Connection Errors
  'RFC_CONNECTION_CLOSED': {
    code: 'RFC_CONNECTION_CLOSED',
    message: 'RFC connection was closed by SAP system',
    category: 'connection',
    severity: 'high',
    userMessage: 'Connection to SAP was lost. The system may have restarted or timed out.',
    suggestion: 'Try reconnecting. If this persists, check SAP system status with your Basis team.',
    documentationUrl: 'https://help.sap.com/docs/SAP_NETWEAVER_700/',
  },
  'RFC_COMMUNICATION_FAILURE': {
    code: 'RFC_COMMUNICATION_FAILURE',
    message: 'Cannot communicate with SAP system',
    category: 'connection',
    severity: 'critical',
    userMessage: 'Unable to reach SAP system. Network or firewall issue detected.',
    suggestion: 'Verify hostname and port are correct. Check firewall rules allow connection on port 33xx.',
  },
  'RFC_INVALID_PARAMETER': {
    code: 'RFC_INVALID_PARAMETER',
    message: 'Invalid connection parameters',
    category: 'connection',
    severity: 'medium',
    userMessage: 'Connection settings are incorrect.',
    suggestion: 'Check Client ID, System ID, and Hostname in connection settings.',
  },
  
  // Authentication Errors
  'AUTHENTICATION_FAILED': {
    code: 'AUTHENTICATION_FAILED',
    message: 'SAP authentication failed',
    category: 'authentication',
    severity: 'high',
    userMessage: 'Login to SAP failed. Username or password is incorrect.',
    suggestion: 'Verify credentials. For OAuth, check if token has expired and refresh it.',
  },
  'NO_AUTHORITY': {
    code: 'NO_AUTHORITY',
    message: 'User lacks required authorization',
    category: 'authentication',
    severity: 'high',
    userMessage: 'Your SAP user doesn\'t have permission for this operation.',
    suggestion: 'Contact your SAP security team to grant RFC access and table read permissions.',
  },
  'PASSWORD_EXPIRED': {
    code: 'PASSWORD_EXPIRED',
    message: 'SAP password has expired',
    category: 'authentication',
    severity: 'medium',
    userMessage: 'SAP password has expired and needs to be reset.',
    suggestion: 'Log into SAP GUI to reset your password, then update it in PhotonicTag settings.',
  },
  
  // Data Errors
  'DATA_NOT_FOUND': {
    code: 'DATA_NOT_FOUND',
    message: 'Requested data not found in SAP',
    category: 'data',
    severity: 'low',
    userMessage: 'No data found for the specified criteria.',
    suggestion: 'Check filter criteria. The material or batch may not exist in SAP.',
  },
  'FIELD_MAPPING_ERROR': {
    code: 'FIELD_MAPPING_ERROR',
    message: 'Field mapping failed',
    category: 'data',
    severity: 'medium',
    userMessage: 'Could not map SAP fields to PhotonicTag fields.',
    suggestion: 'Review field mappings. Some SAP fields may have been renamed or removed.',
  },
  'INVALID_DATA_FORMAT': {
    code: 'INVALID_DATA_FORMAT',
    message: 'Data format is invalid',
    category: 'data',
    severity: 'medium',
    userMessage: 'SAP returned data in an unexpected format.',
    suggestion: 'Check field transformations. Date or number formats may need adjustment.',
  },
  
  // System Errors
  'SYSTEM_OVERLOAD': {
    code: 'SYSTEM_OVERLOAD',
    message: 'SAP system is overloaded',
    category: 'system',
    severity: 'medium',
    userMessage: 'SAP system is currently under heavy load.',
    suggestion: 'Try again later or reduce sync batch size. Consider scheduling sync during off-peak hours.',
  },
  'LOCKED_BY_OTHER_USER': {
    code: 'LOCKED_BY_OTHER_USER',
    message: 'Record is locked by another user',
    category: 'system',
    severity: 'low',
    userMessage: 'Data is being edited by another user in SAP.',
    suggestion: 'Wait a few minutes and retry. The lock will be released when the other user finishes.',
  },
  'SYSTEM_SHUTDOWN': {
    code: 'SYSTEM_SHUTDOWN',
    message: 'SAP system is shutting down',
    category: 'system',
    severity: 'critical',
    userMessage: 'SAP system is currently unavailable due to maintenance or shutdown.',
    suggestion: 'Wait for SAP system to come back online. Contact Basis team for maintenance schedule.',
  },
};

// Generic error patterns for errors without specific codes
const ERROR_PATTERNS = [
  {
    pattern: /connection.*refused|ECONNREFUSED/i,
    error: {
      code: 'CONNECTION_REFUSED',
      message: 'Connection refused by server',
      category: 'connection' as const,
      severity: 'critical' as const,
      userMessage: 'SAP server refused the connection.',
      suggestion: 'Check if SAP system is running and accessible. Verify hostname and port.',
    },
  },
  {
    pattern: /timeout|ETIMEDOUT/i,
    error: {
      code: 'CONNECTION_TIMEOUT',
      message: 'Connection timed out',
      category: 'connection' as const,
      severity: 'high' as const,
      userMessage: 'Connection to SAP timed out.',
      suggestion: 'SAP system may be slow or overloaded. Try increasing timeout or retry later.',
    },
  },
  {
    pattern: /unauthorized|401|403/i,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Unauthorized access',
      category: 'authentication' as const,
      severity: 'high' as const,
      userMessage: 'Access denied. Invalid credentials or insufficient permissions.',
      suggestion: 'Check username/password. Ensure user has RFC_READ_TABLE and other required permissions.',
    },
  },
  {
    pattern: /not found|404/i,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: 'Resource not found',
      category: 'data' as const,
      severity: 'low' as const,
      userMessage: 'The requested SAP resource was not found.',
      suggestion: 'Verify table names and function modules exist in your SAP system.',
    },
  },
];

export class SAPErrorHandler {
  /**
   * Parse error and return structured SAP error info
   */
  static parseError(error: any): SAPError {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const errorCode = error?.code || error?.sapCode;
    
    // Check for specific SAP error code
    if (errorCode && SAP_ERROR_MAP[errorCode]) {
      return SAP_ERROR_MAP[errorCode];
    }
    
    // Check error message for known patterns
    for (const { pattern, error: mappedError } of ERROR_PATTERNS) {
      if (pattern.test(errorMessage)) {
        return mappedError;
      }
    }
    
    // Check if message contains any known SAP error codes
    for (const [code, sapError] of Object.entries(SAP_ERROR_MAP)) {
      if (errorMessage.includes(code)) {
        return sapError;
      }
    }
    
    // Unknown error - return generic
    return {
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
      category: 'unknown',
      severity: 'medium',
      userMessage: 'An unexpected error occurred while connecting to SAP.',
      suggestion: 'Check the error details and try again. If the problem persists, contact support.',
    };
  }

  /**
   * Get error by code directly
   */
  static getErrorByCode(code: string): SAPError | null {
    return SAP_ERROR_MAP[code] || null;
  }

  /**
   * Get all errors by category
   */
  static getErrorsByCategory(category: SAPError['category']): SAPError[] {
    return Object.values(SAP_ERROR_MAP).filter(e => e.category === category);
  }

  /**
   * Format error for API response
   */
  static formatForApi(error: any): {
    success: false;
    error: {
      code: string;
      message: string;
      category: string;
      severity: string;
      suggestion: string;
      documentationUrl?: string;
    };
  } {
    const sapError = this.parseError(error);
    
    return {
      success: false,
      error: {
        code: sapError.code,
        message: sapError.userMessage,
        category: sapError.category,
        severity: sapError.severity,
        suggestion: sapError.suggestion,
        documentationUrl: sapError.documentationUrl,
      },
    };
  }

  /**
   * Log error with context
   */
  static logError(error: any, context?: Record<string, any>): void {
    const sapError = this.parseError(error);
    
    console.error('[SAP Error]', {
      code: sapError.code,
      category: sapError.category,
      severity: sapError.severity,
      message: sapError.message,
      context,
      timestamp: new Date().toISOString(),
    });
  }
}

export default SAPErrorHandler;
