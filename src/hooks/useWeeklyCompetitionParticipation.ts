
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ParticipationData {
  id: string;
  competition_id: string;
  user_id: string;
  user_score: number;
  user_position: number | null;
  created_at: string;
}

export const useWeeklyCompetitionParticipation = (competitionId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [participation, setParticipation] = useState<ParticipationData | null>(null);
  const [isParticipating, setIsParticipating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (competitionId && user?.id) {
      checkParticipation();
    }
  }, [competitionId, user?.id]);

  const checkParticipation = async () => {
    if (!competitionId || !user?.id) return;

    try {
      console.log('🔍 Verificando participação na competição:', competitionId);

      const { data, error } = await supabase
        .from('competition_participations')
        .select('*')
        .eq('competition_id', competitionId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao verificar participação:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Usuário já participando:', data);
        setParticipation(data);
        setIsParticipating(true);
      } else {
        console.log('ℹ️ Usuário não está participando ainda');
        setIsParticipating(false);
      }

    } catch (error) {
      console.error('❌ Erro ao verificar participação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinCompetition = async () => {
    if (!competitionId || !user?.id || isParticipating) return;

    try {
      console.log('🎯 Inscrevendo usuário na competição:', competitionId);

      const { data, error } = await supabase
        .from('competition_participations')
        .insert({
          competition_id: competitionId,
          user_id: user.id,
          user_score: 0
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao inscrever na competição:', error);
        throw error;
      }

      console.log('✅ Inscrição realizada com sucesso:', data);
      setParticipation(data);
      setIsParticipating(true);

      toast({
        title: "Inscrição realizada!",
        description: "Você foi inscrito na competição semanal com sucesso.",
      });

      return data;

    } catch (error) {
      console.error('❌ Erro ao inscrever na competição:', error);
      toast({
        title: "Erro na inscrição",
        description: "Não foi possível inscrever na competição. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateScore = async (newScore: number) => {
    if (!participation || !user?.id) return;

    try {
      console.log('📊 Atualizando pontuação:', newScore);

      const { data, error } = await supabase
        .from('competition_participations')
        .update({ user_score: newScore })
        .eq('id', participation.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar pontuação:', error);
        throw error;
      }

      console.log('✅ Pontuação atualizada:', data);
      setParticipation(data);

      return data;

    } catch (error) {
      console.error('❌ Erro ao atualizar pontuação:', error);
      throw error;
    }
  };

  // Monitorar mudanças em tempo real na participação
  useEffect(() => {
    if (!competitionId || !user?.id) return;

    const channel = supabase
      .channel(`participation-${competitionId}-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'competition_participations',
          filter: `competition_id=eq.${competitionId} AND user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📡 Mudança na participação detectada:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setParticipation(payload.new as ParticipationData);
            setIsParticipating(true);
          } else if (payload.eventType === 'DELETE') {
            setParticipation(null);
            setIsParticipating(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [competitionId, user?.id]);

  return {
    participation,
    isParticipating,
    isLoading,
    joinCompetition,
    updateScore,
    refetch: checkParticipation
  };
};
