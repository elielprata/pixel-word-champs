
import { ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

export const createSuccessResponse = <T>(data: T): ApiResponse<T> => {
  logger.debug('Criando resposta de sucesso da API', { hasData: !!data }, 'API_HELPERS');
  return {
    success: true,
    data,
    error: undefined
  };
};

export const createErrorResponse = <T>(error: string): ApiResponse<T> => {
  logger.error('Criando resposta de erro da API', { error }, 'API_HELPERS');
  return {
    success: false,
    data: null,
    error
  };
};

export const handleServiceError = (error: unknown, context: string): string => {
  logger.error(`Erro no serviço [${context}]`, { error }, 'API_HELPERS');
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Erro inesperado';
};
