
import { supabase } from '@/integrations/supabase/client';
import { RankingPlayer } from '@/types';

export class RankingQueryService {
  async getWeeklyRanking(): Promise<RankingPlayer[]> {
    try {
      console.log('📊 Buscando ranking semanal diretamente dos perfis...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, total_score')
        .gt('total_score', 0)
        .order('total_score', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Erro ao buscar ranking:', error);
        throw error;
      }

      const rankings = data?.map((profile, index) => ({
        pos: index + 1,
        name: profile.username || 'Usuário',
        score: profile.total_score || 0,
        avatar_url: profile.avatar_url || undefined,
        user_id: profile.id
      })) || [];

      console.log('✅ Ranking carregado:', rankings.length, 'jogadores');
      return rankings;
    } catch (error) {
      console.error('❌ Erro ao buscar ranking:', error);
      return [];
    }
  }

  async getHistoricalRanking(userId: string): Promise<any[]> {
    try {
      console.log('📊 Buscando histórico simplificado para usuário:', userId);
      
      // Para histórico, vamos retornar um mock simplificado baseado na pontuação atual
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('total_score')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        console.log('⚠️ Perfil não encontrado');
        return [];
      }

      // Criar histórico simplificado baseado na pontuação atual
      const currentScore = profile.total_score || 0;
      const historical = [];
      
      // Simular últimas 4 semanas
      for (let i = 0; i < 4; i++) {
        const weekScore = Math.max(0, currentScore - (i * 10)); // Simular evolução
        const position = weekScore > 50 ? 1 : weekScore > 30 ? 2 : weekScore > 10 ? 3 : 10;
        
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        historical.push({
          week: `Semana ${weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}-${weekEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`,
          position: position,
          score: weekScore,
          totalParticipants: 100,
          prize: position <= 3 ? [100, 50, 25][position - 1] : position <= 10 ? 10 : 0,
          paymentStatus: position <= 10 ? 'pending' : 'not_eligible'
        });
      }

      console.log('✅ Histórico simplificado gerado:', historical.length, 'entradas');
      return historical;
    } catch (error) {
      console.error('❌ Erro ao gerar histórico:', error);
      return [];
    }
  }

  async getUserPosition(userId: string): Promise<number | null> {
    try {
      // Buscar todos os perfis ordenados por pontuação
      const { data, error } = await supabase
        .from('profiles')
        .select('id, total_score')
        .gt('total_score', 0)
        .order('total_score', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar posição do usuário:', error);
        return null;
      }

      // Encontrar a posição do usuário
      const userIndex = data?.findIndex(profile => profile.id === userId);
      return userIndex !== -1 ? (userIndex || 0) + 1 : null;
    } catch (error) {
      console.error('❌ Erro ao buscar posição do usuário:', error);
      return null;
    }
  }
}

export const rankingQueryService = new RankingQueryService();
