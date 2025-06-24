
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface FlowAuditData {
  profilesWithSessions: number;
  profilesWithScores: number;
  orphanedSessions: number;
  activeCompetitions: number;
  weeklyRankingEntries: number;
  participationEntries: number;
  lastRankingUpdate: string | null;
  dataConsistencyIssues: string[];
}

interface SessionData {
  id: string;
  user_id: string;
  total_score: number;
  is_completed: boolean;
  competition_id: string | null;
}

interface ProfileData {
  id: string;
  username: string;
  total_score: number;
  games_played: number;
}

export const useRankingFlowAudit = () => {
  const [auditData, setAuditData] = useState<FlowAuditData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const performAudit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      logger.info('Iniciando auditoria do fluxo de ranking', undefined, 'RANKING_AUDIT');

      // 1. Verificar perfis com sessões de jogo
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, total_score, games_played');

      if (profilesError) throw profilesError;

      // 2. Verificar sessões de jogo
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('id, user_id, total_score, is_completed, competition_id');

      if (sessionsError) throw sessionsError;

      // 3. Verificar competições ativas
      const { data: competitionsData, error: competitionsError } = await supabase
        .from('custom_competitions')
        .select('id, status, competition_type')
        .eq('status', 'active');

      if (competitionsError) throw competitionsError;

      // 4. Verificar entradas no ranking semanal atual
      const currentWeekStart = getCurrentWeekStart();
      const { data: weeklyRankingData, error: weeklyError } = await supabase
        .from('weekly_rankings')
        .select('id, user_id, total_score, position')
        .eq('week_start', currentWeekStart);

      if (weeklyError) throw weeklyError;

      // 5. Verificar participações em competições
      const { data: participationsData, error: participationsError } = await supabase
        .from('competition_participations')
        .select('id, user_id, competition_id, user_score');

      if (participationsError) throw participationsError;

      // Análise dos dados
      const profilesWithSessions = new Set(
        (sessionsData as SessionData[]).map(s => s.user_id)
      ).size;

      const profilesWithScores = (profilesData as ProfileData[]).filter(
        p => p.total_score > 0
      ).length;

      const orphanedSessions = (sessionsData as SessionData[]).filter(
        s => s.is_completed && !s.competition_id
      ).length;

      // Verificar inconsistências
      const dataConsistencyIssues: string[] = [];

      // Verificar se há sessões completadas sem pontuação nos perfis
      const sessionsWithScore = (sessionsData as SessionData[]).filter(
        s => s.is_completed && s.total_score > 0
      );

      for (const session of sessionsWithScore) {
        const profile = (profilesData as ProfileData[]).find(p => p.id === session.user_id);
        if (profile && profile.total_score === 0) {
          dataConsistencyIssues.push(
            `Usuário ${profile.username} tem sessão com pontuação (${session.total_score}) mas total_score zerado`
          );
        }
      }

      // Verificar se há perfis com pontuação mas sem entradas no ranking semanal
      const profilesInRanking = new Set(
        (weeklyRankingData || []).map(w => w.user_id)
      );

      for (const profile of (profilesData as ProfileData[])) {
        if (profile.total_score > 0 && !profilesInRanking.has(profile.id)) {
          dataConsistencyIssues.push(
            `Usuário ${profile.username} tem pontuação (${profile.total_score}) mas não está no ranking semanal`
          );
        }
      }

      // Buscar última atualização do ranking
      const { data: lastUpdateData } = await supabase
        .from('weekly_rankings')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      const auditResults: FlowAuditData = {
        profilesWithSessions,
        profilesWithScores,
        orphanedSessions,
        activeCompetitions: (competitionsData || []).length,
        weeklyRankingEntries: (weeklyRankingData || []).length,
        participationEntries: (participationsData || []).length,
        lastRankingUpdate: lastUpdateData?.updated_at || null,
        dataConsistencyIssues
      };

      setAuditData(auditResults);
      logger.info('Auditoria concluída', auditResults, 'RANKING_AUDIT');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na auditoria';
      setError(errorMessage);
      logger.error('Erro na auditoria do fluxo', { error: errorMessage }, 'RANKING_AUDIT');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentWeekStart = (): string => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  };

  useEffect(() => {
    performAudit();
  }, []);

  return {
    auditData,
    isLoading,
    error,
    refetch: performAudit
  };
};
