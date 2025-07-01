
// Tipos para configuração semanal
export interface WeeklyConfig {
  id: string;
  start_date: string;
  end_date: string;
  status: 'scheduled' | 'active' | 'completed';
  activated_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyConfigRpcResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

// Type guard para validar resposta RPC
export const isWeeklyConfigRpcResponse = (data: any): data is WeeklyConfigRpcResponse => {
  return data && typeof data === 'object' && typeof data.success === 'boolean';
};

// Interface para resultado de finalização
export interface FinalizeResult {
  success: boolean;
  message?: string;
  error?: string;
  snapshot_id?: string;
  profiles_reset?: number;
  activated_competition?: {
    id: string;
    start_date: string;
    end_date: string;
  };
}
