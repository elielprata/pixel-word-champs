
import { z } from 'zod';

// Schema de validação para criação de admin
export const adminSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  username: z.string().min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres')
});

// Tipo inferido do schema
export type AdminFormData = z.infer<typeof adminSchema>;

// Interface para usuário admin na lista
export interface AdminUser {
  id: string;
  email: string;
  username: string;
  created_at: string;
  role: string;
}

// Interface para verificação de status do sistema
export interface SystemHealth {
  database: boolean;
  authentication: boolean;
  permissions: boolean;
  performance: number;
}

// Interface para dados do admin hook
export interface AdminData {
  users: any[];
  adminUsers: AdminUser[];
  userStats: any;
  systemHealth: SystemHealth | undefined;
  isLoading: boolean;
  hasError: any;
  refetchAll: () => void;
}
