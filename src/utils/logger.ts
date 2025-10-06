export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  error?: Error;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  storageKey: string;
}

export class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableStorage: true,
      maxStorageEntries: 1000,
      storageKey: 'app_logs',
      ...config
    };

    this.loadLogs();
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = LogLevel[entry.level];
    const context = entry.context ? `[${entry.context}]` : '';
    const message = entry.message;
    
    return `${timestamp} ${level} ${context} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error
    };

    this.logs.push(entry);
    this.trimLogs();

    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    if (this.config.enableStorage) {
      this.saveLogs();
    }
  }

  private logToConsole(entry: LogEntry): void {
    const formattedMessage = this.formatMessage(entry);
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, entry.data || '', entry.error || '');
        break;
      case LogLevel.FATAL:
        console.error(`🚨 FATAL: ${formattedMessage}`, entry.data || '', entry.error || '');
        break;
    }
  }

  private trimLogs(): void {
    if (this.logs.length > this.config.maxStorageEntries) {
      this.logs = this.logs.slice(-this.config.maxStorageEntries);
    }
  }

  private saveLogs(): void {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error);
    }
  }

  private loadLogs(): void {
    if (!this.config.enableStorage) return;

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error);
    }
  }

  debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, context?: string, data?: any, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, data, error);
  }

  fatal(message: string, context?: string, data?: any, error?: Error): void {
    this.log(LogLevel.FATAL, message, context, data, error);
  }

  getLogs(level?: LogLevel, context?: string): LogEntry[] {
    let filtered = this.logs;

    if (level !== undefined) {
      filtered = filtered.filter(log => log.level >= level);
    }

    if (context) {
      filtered = filtered.filter(log => log.context === context);
    }

    return filtered;
  }

  clearLogs(): void {
    this.logs = [];
    if (this.config.enableStorage) {
      localStorage.removeItem(this.config.storageKey);
    }
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  enableConsole(enable: boolean): void {
    this.config.enableConsole = enable;
  }

  enableStorage(enable: boolean): void {
    this.config.enableStorage = enable;
  }
}

// Создаем глобальный экземпляр логгера
export const logger = new Logger();

// Утилиты для быстрого логирования
export const logDebug = (message: string, context?: string, data?: any): void => {
  logger.debug(message, context, data);
};

export const logInfo = (message: string, context?: string, data?: any): void => {
  logger.info(message, context, data);
};

export const logWarn = (message: string, context?: string, data?: any): void => {
  logger.warn(message, context, data);
};

export const logError = (message: string, context?: string, data?: any, error?: Error): void => {
  logger.error(message, context, data, error);
};

export const logFatal = (message: string, context?: string, data?: any, error?: Error): void => {
  logger.fatal(message, context, data, error);
};

// Утилиты для логирования производительности
export const logPerformance = (name: string, duration: number, context?: string): void => {
  logger.info(`Performance: ${name} took ${duration.toFixed(2)}ms`, context, { duration, name });
};

export const logApiCall = (endpoint: string, method: string, duration: number, status: number, context?: string): void => {
  logger.info(`API Call: ${method} ${endpoint}`, context, { endpoint, method, duration, status });
};

export const logUserAction = (action: string, details?: any, context?: string): void => {
  logger.info(`User Action: ${action}`, context, { action, details });
};

export const logSecurityEvent = (event: string, details?: any, context?: string): void => {
  logger.warn(`Security Event: ${event}`, context, { event, details });
};

// Утилиты для логирования ошибок
export const logAndThrow = (message: string, context?: string, data?: any): never => {
  logger.error(message, context, data);
  throw new Error(message);
};

export const logAndReturn = <T>(message: string, fallback: T, context?: string, data?: any): T => {
  logger.error(message, context, data);
  return fallback;
};

// Утилиты для группировки логов
export const logGroup = (name: string, fn: () => void, context?: string): void => {
  logger.info(`Group Start: ${name}`, context);
  const startTime = performance.now();
  
  try {
    fn();
  } catch (error) {
    logger.error(`Group Error: ${name}`, context, undefined, error as Error);
    throw error;
  } finally {
    const duration = performance.now() - startTime;
    logger.info(`Group End: ${name}`, context, { duration });
  }
};

export const logAsyncGroup = async (name: string, fn: () => Promise<void>, context?: string): Promise<void> => {
  logger.info(`Async Group Start: ${name}`, context);
  const startTime = performance.now();
  
  try {
    await fn();
  } catch (error) {
    logger.error(`Async Group Error: ${name}`, context, undefined, error as Error);
    throw error;
  } finally {
    const duration = performance.now() - startTime;
    logger.info(`Async Group End: ${name}`, context, { duration });
  }
};

