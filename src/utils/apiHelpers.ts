
import { ApiResponse } from '@/types';

export const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  error: undefined
});

export const createErrorResponse = <T>(error: string): ApiResponse<T> => ({
  success: false,
  data: null,
  error
});

export const handleServiceError = (error: unknown, context: string): string => {
  console.error(`[${context}]:`, error);
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Erro inesperado';
};
