
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { dailyCompetitionService } from '@/services/dailyCompetitionService';
import { supabase } from '@/integrations/supabase/client';

export const useParticipationManagement = () => {
  const { user } = useAuth();
  const [userParticipations, setUserParticipations] = useState<Record<string, any>>({});
  const [eligibilityStatus, setEligibilityStatus] = useState<Record<string, boolean>>({});
  const [participationProgress, setParticipationProgress] = useState<Record<string, any>>({});

  // Verificar elegibilidade para participação
  const checkEligibility = async (competitionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Verificar se já participou desta competição
      const hasParticipated = await dailyCompetitionService.checkUserParticipation(user.id, competitionId);
      
      // Verificar se usuário não está banido
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_banned')
        .eq('id', user.id)
        .single();

      const isEligible = !hasParticipated && !profile?.is_banned;
      
      setEligibilityStatus(prev => ({
        ...prev,
        [competitionId]: isEligible
      }));

      return isEligible;
    } catch (error) {
      console.error('❌ Erro ao verificar elegibilidade:', error);
      return false;
    }
  };

  // Inscrição automática em competições ativas
  const autoEnrollInActiveCompetitions = async () => {
    if (!user) return;

    try {
      console.log('🎯 Verificando inscrição automática em competições...');
      
      const response = await dailyCompetitionService.getActiveDailyCompetitions();
      if (!response.success) return;

      for (const competition of response.data) {
        const isEligible = await checkEligibility(competition.id);
        
        if (isEligible) {
          console.log(`📝 Inscrevendo automaticamente em: ${competition.title}`);
          
          // Criar participação
          const { error } = await supabase
            .from('competition_participations')
            .insert({
              competition_id: competition.id,
              user_id: user.id,
              user_score: 0,
              user_position: null,
              payment_status: 'not_eligible'
            });

          if (!error) {
            setUserParticipations(prev => ({
              ...prev,
              [`${user.id}-${competition.id}`]: true
            }));
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro na inscrição automática:', error);
    }
  };

  // Tracking de progresso individual
  const trackUserProgress = async (competitionId: string) => {
    if (!user) return;

    try {
      const { data: participation } = await supabase
        .from('competition_participations')
        .select('user_score, user_position, created_at')
        .eq('competition_id', competitionId)
        .eq('user_id', user.id)
        .single();

      if (participation) {
        setParticipationProgress(prev => ({
          ...prev,
          [competitionId]: {
            score: participation.user_score,
            position: participation.user_position,
            joinedAt: participation.created_at
          }
        }));
      }
    } catch (error) {
      console.error('❌ Erro ao rastrear progresso:', error);
    }
  };

  useEffect(() => {
    if (user) {
      autoEnrollInActiveCompetitions();
    }
  }, [user]);

  return {
    userParticipations,
    eligibilityStatus,
    participationProgress,
    checkEligibility,
    autoEnrollInActiveCompetitions,
    trackUserProgress
  };
};
