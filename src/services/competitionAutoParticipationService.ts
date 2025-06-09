import { supabase } from '@/integrations/supabase/client';
import { competitionParticipationService } from './competitionParticipationService';

export class CompetitionAutoParticipationService {
  async joinCompetitionAutomatically(sessionId: string, activeCompetitions: any[]): Promise<void> {
    try {
      console.log('🎯 Verificando participação automática em competições diárias...');
      
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        console.log('❌ Sessão não encontrada:', sessionError);
        return;
      }

      if (session.competition_id) {
        console.log('✅ Sessão já vinculada a uma competição');
        return;
      }

      if (activeCompetitions.length === 0) {
        console.log('📅 Nenhuma competição diária ativa encontrada');
        return;
      }

      const activeCompetition = activeCompetitions[0];
      const hasParticipated = await competitionParticipationService.checkUserParticipation(session.user_id, activeCompetition.id);
      
      if (hasParticipated) {
        console.log('⚠️ Usuário já participou desta competição diária');
        return;
      }

      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({ competition_id: activeCompetition.id })
        .eq('id', sessionId);

      if (updateError) {
        console.error('❌ Erro ao vincular sessão à competição:', updateError);
        return;
      }

      await competitionParticipationService.createParticipation(activeCompetition.id, session.user_id);
      console.log('✅ Usuário inscrito automaticamente na competição diária');

    } catch (error) {
      console.error('❌ Erro na participação automática:', error);
    }
  }

  async updateParticipationScore(sessionId: string, totalScore: number): Promise<void> {
    try {
      console.log('📊 Atualizando pontuação na competição diária...');
      
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session || !session.competition_id) {
        console.log('❌ Sessão não vinculada a competição diária');
        return;
      }

      // Corrigir chamada - remover o primeiro parâmetro competition_id
      await competitionParticipationService.updateParticipationScore(sessionId, totalScore);
      console.log('✅ Pontuação atualizada na competição diária');
      
      await competitionParticipationService.updateCompetitionRankings(session.competition_id);
    } catch (error) {
      console.error('❌ Erro ao atualizar pontuação da competição:', error);
    }
  }
}

export const competitionAutoParticipationService = new CompetitionAutoParticipationService();
