
import { supabase } from '@/integrations/supabase/client';
import { exportToCSV } from '@/utils/csvExport';
import { CompetitionHistoryItem } from './types';
import { formatDate } from './competitionUtils';

export const handleExportWinners = async (
  competition: CompetitionHistoryItem,
  toast: any,
  setExportingId: (id: string | null) => void
) => {
  setExportingId(competition.id);
  
  try {
    console.log('📊 Exportando ganhadores da competição:', competition.id);

    // Buscar participações da competição com prêmios
    const { data: participations, error: participationsError } = await supabase
      .from('competition_participations')
      .select('user_id, user_position, user_score, prize')
      .eq('competition_id', competition.id as any)
      .gt('prize', 0)
      .order('user_position', { ascending: true });

    if (participationsError) {
      console.error('❌ Erro ao buscar participações:', participationsError);
      throw participationsError;
    }

    if (!participations || participations.length === 0) {
      toast({
        title: "Nenhum ganhador encontrado",
        description: "Esta competição não possui ganhadores com prêmios.",
        variant: "destructive",
      });
      return;
    }

    // Filtrar e validar dados das participações
    const validParticipations = participations
      .filter((item: any) => item && typeof item === 'object' && !('error' in item) && item.user_id);

    // Buscar perfis dos usuários separadamente
    const userIds = validParticipations.map((p: any) => p.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds);

    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError);
      throw profilesError;
    }

    // Filtrar e validar perfis
    const validProfiles = (profiles || [])
      .filter((profile: any) => profile && typeof profile === 'object' && !('error' in profile));

    // Combinar dados das participações com perfis
    const winners = validParticipations.map((participation: any) => {
      const profile = validProfiles.find((p: any) => p.id === participation.user_id);
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

    toast({
      title: "Exportação concluída",
      description: `${winners.length} ganhadores exportados com sucesso.`,
    });

  } catch (error) {
    console.error('❌ Erro ao exportar ganhadores:', error);
    toast({
      title: "Erro na exportação",
      description: "Não foi possível exportar os dados dos ganhadores.",
      variant: "destructive",
    });
  } finally {
    setExportingId(null);
  }
};
