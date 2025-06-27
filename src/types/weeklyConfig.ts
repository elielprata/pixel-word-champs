
// Interface para o retorno das funções RPC de competições semanais
export interface WeeklyConfigRpcResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

// Type guard para verificar se o retorno é uma resposta válida
export function isWeeklyConfigRpcResponse(data: any): data is WeeklyConfigRpcResponse {
  return data && typeof data === 'object' && typeof data.success === 'boolean';
}

// Interface para as configurações semanais
export interface WeeklyConfig {
  id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'scheduled' | 'completed';
  activated_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}
