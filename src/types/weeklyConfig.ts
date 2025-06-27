
import React from 'react';

export interface WeeklyConfig {
  id: string;
  start_date: string;
  end_date: string;
  status: 'scheduled' | 'active' | 'ended' | 'completed';
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

export interface CompetitionSnapshot {
  id: string;
  competition_id: string;
  start_date: string;
  end_date: string;
  total_participants: number;
  total_prize_pool: number;
  winners_data: any[];
  rankings_data: any[];
  finalized_at: string;
  created_at: string;
}

export const isWeeklyConfigRpcResponse = (data: any): data is WeeklyConfigRpcResponse => {
  return data && typeof data === 'object' && 'success' in data;
};
