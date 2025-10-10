// Centralized error logging utility
export class ErrorLogger {
  private static isDevelopment = process.env.NODE_ENV === 'development';

  static logError(context: string, error: unknown, additionalInfo?: Record<string, any>) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    const logData = {
      context,
      error: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
      ...additionalInfo
    };

    if (this.isDevelopment) {
      console.error(`[${context}]`, logData);
    } else {
      // In production, you might want to send to an error tracking service
      console.warn(`[${context}] ${errorMessage}`);
    }
  }

  static logWarning(context: string, message: string, additionalInfo?: Record<string, any>) {
    const logData = {
      context,
      message,
      timestamp: new Date().toISOString(),
      ...additionalInfo
    };

    if (this.isDevelopment) {
      console.warn(`[${context}]`, logData);
    } else {
      console.warn(`[${context}] ${message}`);
    }
  }

  static logInfo(context: string, message: string, additionalInfo?: Record<string, any>) {
    const logData = {
      context,
      message,
      timestamp: new Date().toISOString(),
      ...additionalInfo
    };

    if (this.isDevelopment) {
      console.info(`[${context}]`, logData);
    }
  }
}
