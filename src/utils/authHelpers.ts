
import { User } from '@/types';
import type { ApiResponse } from '@/types';
import { createFallbackUser as createFallback } from './userMapper';

export const createFallbackUser = createFallback;

export const createTimeoutPromise = (timeoutMs: number): Promise<ApiResponse<User>> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout na chamada getCurrentUser`)), timeoutMs);
  });
};
