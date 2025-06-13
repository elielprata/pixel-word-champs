
import { supabase } from '@/integrations/supabase/client';
import { exportToCSV } from '@/utils/csvExport';
import { CompetitionHistoryItem } from './types';
import { formatDate } from './competitionUtils';
import { logger } from '@/utils/logger';
import { rankingQueryService } from '@/services/rankingQueryService';

export const handleExportWinners = async (
  competition: CompetitionHistoryItem,
  toast: any,
  setExportingId: (id: string | null) => void
) => {
  setExportingId(competition.id);
  
  try {
    logger.info('Iniciando exportação de ganhadores do ranking simplificado', { competitionId: competition.id }, 'COMPETITION_EXPORT');

    // Para competições semanais, usar o ranking simplificado baseado na pontuação total
    if (competition.competition_type === 'tournament') {
      // Buscar ranking atual simplificado
      const rankings = await rankingQueryService.getWeeklyRanking();
      
      if (!rankings || rankings.length === 0) {
        logger.warn('Nenhum participante encontrado no ranking simplificado', { competitionId: competition.id }, 'COMPETITION_EXPORT');
        toast({
          title: "Nenhum participante encontrado",
          description: "Esta competição não possui participantes no ranking.",
          variant: "destructive",
        });
        return;
      }

      // Filtrar apenas os ganhadores (com prêmio > 0)
      const winnersData = rankings.filter(player => {
        const prizeAmount = calculatePrizeAmount(player.pos);
        return prizeAmount > 0;
      });

      if (winnersData.length === 0) {
        logger.warn('Nenhum ganhador com prêmio encontrado', { competitionId: competition.id }, 'COMPETITION_EXPORT');
        toast({
          title: "Nenhum ganhador encontrado",
          description: "Esta competição não possui ganhadores com prêmios.",
          variant: "destructive",
        });
        return;
      }

      // Buscar dados PIX dos ganhadores
      const userIds = winnersData.map(player => player.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, pix_key, pix_holder_name')
        .in('id', userIds);

      if (profilesError) {
        logger.error('Erro ao buscar dados PIX dos ganhadores', { competitionId: competition.id, error: profilesError }, 'COMPETITION_EXPORT');
        // Continuar sem dados PIX se houver erro
      }

      // Mapear dados para exportação
      const winners = winnersData.map(player => {
        const profile = profiles?.find(p => p.id === player.user_id);
        const prizeAmount = calculatePrizeAmount(player.pos);
        
        return {
          id: `${competition.id}-${player.pos}`,
          username: player.name,
          position: player.pos,
          pixKey: profile?.pix_key || '',
          holderName: profile?.pix_holder_name || '',
          consolidatedDate: formatDate(competition.end_date),
          prize: prizeAmount,
          paymentStatus: 'pending' as const
        };
      });

      // Exportar para CSV
      exportToCSV(winners, `${competition.title}_ranking_semanal_ganhadores`);
      
      logger.info('Exportação de ganhadores do ranking semanal concluída', { 
        competitionId: competition.id, 
        winnersCount: winners.length 
      }, 'COMPETITION_EXPORT');

      toast({
        title: "Exportação concluída",
        description: `${winners.length} ganhadores do ranking semanal exportados com sucesso.`,
      });

    } else {
      // Para competições diárias, tentar buscar da tabela de participações (método original)
      const { data: participations, error: participationsError } = await supabase
        .from('competition_participations')
        .select('user_id, user_position, user_score, prize')
        .eq('competition_id', competition.id)
        .gt('prize', 0)
        .order('user_position', { ascending: true });

      if (participationsError) {
        logger.error('Erro ao buscar participações', { competitionId: competition.id, error: participationsError }, 'COMPETITION_EXPORT');
        throw participationsError;
      }

      if (!participations || participations.length === 0) {
        logger.warn('Nenhum ganhador encontrado para competição diária', { competitionId: competition.id }, 'COMPETITION_EXPORT');
        toast({
          title: "Nenhum ganhador encontrado",
          description: "Esta competição não possui ganhadores com prêmios.",
          variant: "destructive",
        });
        return;
      }

      // Buscar perfis dos usuários separadamente
      const userIds = participations.map(p => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, pix_key, pix_holder_name')
        .in('id', userIds);

      if (profilesError) {
        logger.error('Erro ao buscar perfis dos ganhadores', { competitionId: competition.id, error: profilesError }, 'COMPETITION_EXPORT');
        throw profilesError;
      }

      // Combinar dados das participações com perfis
      const winners = participations.map(participation => {
        const profile = profiles?.find(p => p.id === participation.user_id);
        return {
          id: `${competition.id}-${participation.user_position}`,
          username: profile?.username || 'Usuário',
          position: participation.user_position || 0,
          pixKey: profile?.pix_key || '',
          holderName: profile?.pix_holder_name || '',
          consolidatedDate: formatDate(competition.end_date),
          prize: Number(participation.prize) || 0,
          paymentStatus: 'pending' as const
        };
      });

      // Exportar para CSV
      exportToCSV(winners, `${competition.title}_ganhadores`);
      
      logger.info('Exportação de ganhadores de competição diária concluída', { 
        competitionId: competition.id, 
        winnersCount: winners.length 
      }, 'COMPETITION_EXPORT');

      toast({
        title: "Exportação concluída",
        description: `${winners.length} ganhadores exportados com sucesso.`,
      });
    }

  } catch (error) {
    logger.error('Erro ao exportar ganhadores', { competitionId: competition.id, error }, 'COMPETITION_EXPORT');
    toast({
      title: "Erro na exportação",
      description: "Não foi possível exportar os dados dos ganhadores.",
      variant: "destructive",
    });
  } finally {
    setExportingId(null);
  }
};

// Função para calcular prêmio baseado na posição (mesma lógica do ranking)
const calculatePrizeAmount = (position: number): number => {
  switch (position) {
    case 1: return 100.00;
    case 2: return 50.00;
    case 3: return 25.00;
    default: return position <= 10 ? 10.00 : 0;
  }
};
