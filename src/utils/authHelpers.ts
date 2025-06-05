
import { User } from '@/types';
import type { ApiResponse } from '@/types';

export const createFallbackUser = (session: any): User => {
  console.log('Criando usuário fallback com dados da sessão');
  return {
    id: session.user.id,
    username: session.user.email?.split('@')[0] || '',
    email: session.user.email || '',
    created_at: session.user.created_at,
    updated_at: session.user.updated_at || '',
    total_score: 0,
    games_played: 0
  };
};

export const createTimeoutPromise = (timeoutMs: number): Promise<ApiResponse<User>> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout na chamada getCurrentUser`)), timeoutMs);
  });
};
