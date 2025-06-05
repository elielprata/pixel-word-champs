
interface ErrorWithMessage {
  message: string;
}

interface ErrorWithCode {
  code: string;
  message: string;
}

export type AppError = ErrorWithMessage | ErrorWithCode | Error | string | unknown;

export const errorHandler = {
  getErrorMessage(error: AppError): string {
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Ocorreu um erro inesperado';
  },

  logError(error: AppError, context?: string): void {
    console.error(`[${context || 'APP_ERROR'}]:`, error);
  },

  handleApiError(error: AppError): string {
    this.logError(error, 'API_ERROR');
    
    if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
      switch (error.code) {
        case 'PGRST116':
          return 'Dados não encontrados';
        case 'PGRST301':
          return 'Acesso negado';
        default:
          return this.getErrorMessage(error);
      }
    }
    
    return this.getErrorMessage(error);
  }
};
