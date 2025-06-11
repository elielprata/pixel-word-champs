
import { supabase } from '@/integrations/supabase/client';

export class DailyCompetitionParticipationService {
  async joinCompetitionAutomatically(sessionId: string, competitions: any[]): Promise<void> {
    try {
      console.log('🎯 Inscrevendo automaticamente em competições diárias vinculadas...');

      if (!competitions || competitions.length === 0) {
        console.log('📅 Nenhuma competição diária ativa encontrada');
        return;
      }

      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        console.error('❌ Erro ao buscar sessão:', sessionError);
        return;
      }

      if (session.competition_id) {
        console.log('✅ Sessão já vinculada à competição:', session.competition_id);
        return;
      }

      const targetCompetition = competitions[0];
      
      console.log('🎯 Vinculando sessão à competição diária:', targetCompetition.id);

      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({ competition_id: targetCompetition.id })
        .eq('id', sessionId);

      if (updateError) {
        console.error('❌ Erro ao vincular sessão à competição:', updateError);
        return;
      }

      if (targetCompetition.weekly_tournament_id) {
        await this.ensureWeeklyParticipation(session.user_id, targetCompetition.weekly_tournament_id);
      } else {
        console.error('❌ Competição diária não está vinculada a uma competição semanal');
        return;
      }

      console.log('✅ Usuário inscrito automaticamente na competição semanal vinculada (PARTICIPAÇÃO LIVRE)');
    } catch (error) {
      console.error('❌ Erro ao inscrever automaticamente:', error);
    }
  }

  private async ensureWeeklyParticipation(userId: string, weeklyCompetitionId: string): Promise<void> {
    try {
      console.log('🏆 Verificando participação na competição semanal...');

      const { data: existingWeeklyParticipation, error: checkWeeklyError } = await supabase
        .from('competition_participations')
        .select('id')
        .eq('competition_id', weeklyCompetitionId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkWeeklyError && checkWeeklyError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar participação semanal:', checkWeeklyError);
        return;
      }

      if (!existingWeeklyParticipation) {
        // Participação livre - sem verificação de limites
        const { error: insertWeeklyError } = await supabase
          .from('competition_participations')
          .insert({
            competition_id: weeklyCompetitionId,
            user_id: userId,
            user_score: 0
          });

        if (insertWeeklyError) {
          console.error('❌ Erro ao criar participação na competição semanal:', insertWeeklyError);
          return;
        }

        console.log('✅ Participação criada na competição semanal - PARTICIPAÇÃO LIVRE');
      } else {
        console.log('✅ Usuário já participa da competição semanal');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar/criar participação semanal:', error);
    }
  }

  async updateParticipationScore(sessionId: string, totalScore: number): Promise<void> {
    try {
      console.log('📊 Atualizando pontuação da sessão e transferindo diretamente para competição semanal...');

      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id, total_score')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        console.error('❌ Erro ao buscar sessão:', sessionError);
        return;
      }

      const previousScore = session.total_score || 0;
      const scoreDifference = totalScore - previousScore;

      const { error: updateSessionError } = await supabase
        .from('game_sessions')
        .update({ total_score: totalScore })
        .eq('id', sessionId);

      if (updateSessionError) {
        console.error('❌ Erro ao atualizar pontuação da sessão:', updateSessionError);
        return;
      }

      if (session.competition_id && scoreDifference > 0) {
        const { data: dailyCompetition, error: dailyCompError } = await supabase
          .from('custom_competitions')
          .select('weekly_tournament_id')
          .eq('id', session.competition_id)
          .single();

        if (!dailyCompError && dailyCompetition?.weekly_tournament_id) {
          await this.updateCompetitionScore(
            dailyCompetition.weekly_tournament_id, 
            session.user_id, 
            scoreDifference
          );
          console.log('✅ Pontos transferidos diretamente para competição semanal');
        } else {
          console.error('❌ Competição diária não vinculada a uma competição semanal');
        }
      }

      console.log('✅ Pontuação atualizada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar pontuação:', error);
    }
  }

  private async updateCompetitionScore(competitionId: string, userId: string, scoreIncrease: number): Promise<void> {
    try {
      const { data: participation, error: getError } = await supabase
        .from('competition_participations')
        .select('id, user_score')
        .eq('competition_id', competitionId)
        .eq('user_id', userId)
        .single();

      if (getError) {
        console.error('❌ Erro ao buscar participação:', getError);
        return;
      }

      const newScore = (participation.user_score || 0) + scoreIncrease;

      const { error: updateError } = await supabase
        .from('competition_participations')
        .update({ user_score: newScore })
        .eq('id', participation.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar pontuação da competição:', updateError);
        return;
      }

      console.log(`✅ Pontuação atualizada na competição ${competitionId}: +${scoreIncrease} pontos (total: ${newScore})`);
    } catch (error) {
      console.error('❌ Erro ao atualizar pontuação da competição:', error);
    }
  }

  async checkUserParticipation(userId: string, competitionId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('competition_participations')
        .select('id')
        .eq('user_id', userId)
        .eq('competition_id', competitionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking user participation:', error);
      return false;
    }
  }

  async createParticipation(userId: string, competitionId: string, score: number = 0): Promise<{ success: boolean; error?: string }> {
    try {
      // Participação livre - sem verificação de limite de participantes
      const { error } = await supabase
        .from('competition_participations')
        .insert({
          user_id: userId,
          competition_id: competitionId,
          user_score: score
        });

      if (error) throw error;

      console.log('✅ Participação criada - PARTICIPAÇÃO LIVRE');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao criar participação:', error);
      return {
        success: false,
        error: 'Erro ao criar participação'
      };
    }
  }

  async updateCompetitionRankings(competitionId: string): Promise<void> {
    try {
      console.log('🔄 Atualizando rankings da competição:', competitionId);

      const { data: participations, error: participationsError } = await supabase
        .from('competition_participations')
        .select('id, user_score')
        .eq('competition_id', competitionId)
        .order('user_score', { ascending: false });

      if (participationsError) {
        console.error('❌ Erro ao buscar participações:', participationsError);
        return;
      }

      const updates = (participations || []).map((participation, index) => ({
        id: participation.id,
        user_position: index + 1
      }));

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('competition_participations')
          .update({ user_position: update.user_position })
          .eq('id', update.id);

        if (updateError) {
          console.error('❌ Erro ao atualizar posição:', updateError);
        }
      }

      console.log('✅ Rankings atualizados para', updates.length, 'participantes - PARTICIPAÇÃO LIVRE');
    } catch (error) {
      console.error('❌ Erro ao atualizar rankings:', error);
    }
  }
}

export const dailyCompetitionParticipationService = new DailyCompetitionParticipationService();
