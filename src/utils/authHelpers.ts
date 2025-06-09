
import type { User, ApiResponse } from '@/types';
import { createFallbackUser as createFallback } from './userMapper';
import { TIMING_CONFIG } from '@/constants/app';

export const createFallbackUser = createFallback;

export const createTimeoutPromise = (timeoutMs: number = TIMING_CONFIG.DEFAULT_TIMEOUT): Promise<ApiResponse<User>> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout na chamada getCurrentUser`)), timeoutMs);
  });
};
