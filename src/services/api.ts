
import config from '@/config/environment';
import { ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

// Configuração base do cliente HTTP
class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
    logger.debug('ApiClient inicializado', { baseUrl: this.baseUrl, timeout: this.timeout }, 'API_CLIENT');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    logger.debug('Iniciando requisição HTTP', { endpoint, method: options.method || 'GET' }, 'API_CLIENT');
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
      logger.debug('Token de autenticação adicionado à requisição', undefined, 'API_CLIENT');
    }

    const config: RequestInit = {
      ...options,
      headers: defaultHeaders,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.error('Erro na requisição HTTP', { 
          endpoint, 
          status: response.status, 
          statusText: response.statusText 
        }, 'API_CLIENT');
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      logger.info('Requisição HTTP concluída com sucesso', { endpoint, status: response.status }, 'API_CLIENT');
      return data;
    } catch (error) {
      logger.error('Erro na requisição HTTP', { endpoint, error }, 'API_CLIENT');
      if (error instanceof Error) {
        throw new ApiError(error.message, 'NETWORK_ERROR');
      }
      throw new ApiError('Erro desconhecido', 'UNKNOWN_ERROR');
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Classe personalizada de erro da API
class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    logger.error('ApiError criado', { message, code, details }, 'API_CLIENT');
  }
}

export { ApiError };
export const apiClient = new ApiClient();
