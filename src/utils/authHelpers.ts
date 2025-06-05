
import { User } from '@/types';
import type { ApiResponse } from '@/types';
import { createFallbackUser as createFallback } from './userMapper';

export const createFallbackUser = createFallback;

// Tornar timeout configurável
const DEFAULT_TIMEOUT_MS = 5000;

export const createTimeoutPromise = (timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<ApiResponse<User>> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout na chamada getCurrentUser`)), timeoutMs);
  });
};
