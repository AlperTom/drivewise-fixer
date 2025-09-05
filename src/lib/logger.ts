/**
 * Production-ready logging utility
 * Replaces console.log/error with structured logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep only last 100 logs in memory

  private createEntry(
    level: LogLevel, 
    message: string, 
    context?: Record<string, any>, 
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In development, still use console for immediate feedback
    if (this.isDevelopment) {
      const consoleMethod = entry.level === 'error' ? console.error : 
                           entry.level === 'warn' ? console.warn : 
                           console.log;
      
      consoleMethod(`[${entry.level.toUpperCase()}] ${entry.message}`, 
                   entry.context || '', 
                   entry.error || '');
    }

    // In production, you could send to monitoring service here
    // Example: this.sendToMonitoring(entry);
  }

  debug(message: string, context?: Record<string, any>) {
    this.addLog(this.createEntry('debug', message, context));
  }

  info(message: string, context?: Record<string, any>) {
    this.addLog(this.createEntry('info', message, context));
  }

  warn(message: string, context?: Record<string, any>) {
    this.addLog(this.createEntry('warn', message, context));
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.addLog(this.createEntry('error', message, context, error));
  }

  // Get recent logs for debugging
  getRecentLogs(level?: LogLevel): LogEntry[] {
    return level ? 
      this.logs.filter(log => log.level === level) : 
      this.logs;
  }

  // Clear logs
  clear() {
    this.logs = [];
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience functions
export const logError = (message: string, error?: Error, context?: Record<string, any>) => {
  logger.error(message, error, context);
};

export const logInfo = (message: string, context?: Record<string, any>) => {
  logger.info(message, context);
};

export const logWarn = (message: string, context?: Record<string, any>) => {
  logger.warn(message, context);
};

export const logDebug = (message: string, context?: Record<string, any>) => {
  logger.debug(message, context);
};