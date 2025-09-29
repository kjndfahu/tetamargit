export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (
  message: string,
  code?: string,
  statusCode?: number,
  isOperational?: boolean
): AppError => {
  return new AppError(message, code, statusCode, isOperational);
};

export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};

export const handleError = (error: unknown): string => {
  if (isAppError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Neočakávaná chyba';
};

export const logError = (error: unknown, context?: string): void => {
  const errorMessage = handleError(error);
  const timestamp = new Date().toISOString();
  
  console.error(`[${timestamp}] ${context ? `[${context}] ` : ''}${errorMessage}`, error);
  
  // В продакшене здесь можно добавить отправку в сервис логирования
  // например, Sentry, LogRocket и т.д.
};

export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => R,
  errorHandler?: (error: unknown) => void
) => {
  return (...args: T): R | undefined => {
    try {
      return fn(...args);
    } catch (error) {
      logError(error, fn.name);
      errorHandler?.(error);
      return undefined;
    }
  };
};

export const asyncWithErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorHandler?: (error: unknown) => void
) => {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, fn.name);
      errorHandler?.(error);
      return undefined;
    }
  };
};

