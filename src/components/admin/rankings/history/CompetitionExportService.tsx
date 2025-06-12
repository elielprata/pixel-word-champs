
import { supabase } from '@/integrations/supabase/client';
import { exportToCSV } from '@/utils/csvExport';
import { CompetitionHistoryItem } from './types';
import { formatDate } from './competitionUtils';
import { logger } from '@/utils/logger';

export const handleExportWinners = async (
  competition: CompetitionHistoryItem,
  toast: any,
  setExportingId: (id: string | null) => void
) => {
  setExportingId(competition.id);
  
  try {
    logger.info('Iniciando exportação de ganhadores', { competitionId: competition.id }, 'COMPETITION_EXPORT');

    // Buscar participações da competição com prêmios
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
      logger.warn('Nenhum ganhador encontrado para exportação', { competitionId: competition.id }, 'COMPETITION_EXPORT');
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
      .select('id, username')
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
        pixKey: '',
        holderName: '',
        consolidatedDate: formatDate(competition.end_date),
        prize: Number(participation.prize) || 0,
        paymentStatus: 'pending' as const
      };
    });

    // Exportar para CSV
    exportToCSV(winners, `${competition.title}_ganhadores`);
    
    logger.info('Exportação de ganhadores concluída', { 
      competitionId: competition.id, 
      winnersCount: winners.length 
    }, 'COMPETITION_EXPORT');

    toast({
      title: "Exportação concluída",
      description: `${winners.length} ganhadores exportados com sucesso.`,
    });

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
