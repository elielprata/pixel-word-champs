
import { logger } from '@/utils/logger';

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
    logger.warn('Erro sem mensagem identificável', { error }, 'ERROR_HANDLER');
    return 'Ocorreu um erro inesperado';
  },

  logError(error: AppError, context?: string): void {
    logger.error(`Erro capturado [${context || 'GENERIC'}]`, { error }, 'ERROR_HANDLER');
  },

  handleApiError(error: AppError): string {
    this.logError(error, 'API_ERROR');
    
    if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
      switch (error.code) {
        case 'PGRST116':
          logger.debug('Erro de dados não encontrados capturado', { code: error.code }, 'ERROR_HANDLER');
          return 'Dados não encontrados';
        case 'PGRST301':
          logger.warn('Erro de acesso negado capturado', { code: error.code }, 'ERROR_HANDLER');
          return 'Acesso negado';
        default:
          logger.debug('Erro com código não mapeado', { code: error.code }, 'ERROR_HANDLER');
          return this.getErrorMessage(error);
      }
    }
    
    return this.getErrorMessage(error);
  }
};
