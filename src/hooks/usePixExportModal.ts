
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export interface PaymentRecord {
  id: string;
  user_id: string;
  ranking_type: string;
  ranking_id?: string;
  prize_amount: number;
  payment_status: string;
  payment_date?: string;
  pix_key?: string;
  pix_holder_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  username?: string;
  position?: number;
}

export const usePixExportModal = (open: boolean, prizeLevel: string) => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredWinners, setFilteredWinners] = useState<PaymentRecord[]>([]);
  const [allWinners, setAllWinners] = useState<PaymentRecord[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadWinners();
    }
  }, [open, prizeLevel]);

  const loadWinners = async () => {
    setIsLoading(true);
    try {
      console.log('🏆 Buscando vencedores para:', prizeLevel);
      
      // Buscar registros de pagamento do banco
      const { data: paymentRecords, error } = await supabase
        .from('payment_history')
        .select(`
          id,
          user_id,
          ranking_type,
          ranking_id,
          prize_amount,
          payment_status,
          payment_date,
          pix_key,
          pix_holder_name,
          notes,
          created_at,
          updated_at,
          profiles!inner(username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar posições dos rankings para cada usuário
      const { data: dailyRankings, error: rankingError } = await supabase
        .from('daily_rankings')
        .select('user_id, position, date')
        .order('date', { ascending: false });

      if (rankingError) {
        console.warn('⚠️ Erro ao buscar rankings:', rankingError);
      }

      // Mapear registros com posições
      const winnersWithPositions: PaymentRecord[] = (paymentRecords || []).map(record => {
        const ranking = dailyRankings?.find(r => r.user_id === record.user_id);
        
        return {
          id: record.id,
          user_id: record.user_id,
          ranking_type: record.ranking_type,
          ranking_id: record.ranking_id || undefined,
          prize_amount: Number(record.prize_amount) || 0,
          payment_status: record.payment_status,
          payment_date: record.payment_date || undefined,
          pix_key: record.pix_key || undefined,
          pix_holder_name: record.pix_holder_name || undefined,
          notes: record.notes || undefined,
          created_at: record.created_at,
          updated_at: record.updated_at,
          username: record.profiles?.username || 'Usuário',
          position: ranking?.position || 0
        };
      });

      // Filtrar por nível de prêmio
      let filteredByPrizeLevel = winnersWithPositions;
      if (prizeLevel.includes('1º ao 3º')) {
        filteredByPrizeLevel = winnersWithPositions.filter(w => w.position >= 1 && w.position <= 3);
      } else if (prizeLevel.includes('4º ao 10º')) {
        filteredByPrizeLevel = winnersWithPositions.filter(w => w.position >= 4 && w.position <= 10);
      } else if (prizeLevel.includes('11º ao 50º')) {
        filteredByPrizeLevel = winnersWithPositions.filter(w => w.position >= 11 && w.position <= 50);
      } else if (prizeLevel.includes('51º ao 100º')) {
        filteredByPrizeLevel = winnersWithPositions.filter(w => w.position >= 51 && w.position <= 100);
      }

      console.log('🎯 Vencedores encontrados:', filteredByPrizeLevel.length);
      setAllWinners(filteredByPrizeLevel);
      setFilteredWinners([]);
      setIsFiltered(false);
    } catch (error) {
      console.error('❌ Erro ao buscar vencedores:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os vencedores.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Datas obrigatórias",
        description: "Selecione as datas de início e fim para filtrar.",
        variant: "destructive",
      });
      return;
    }

    const filtered = allWinners.filter(winner => {
      const consolidatedDate = new Date(winner.created_at);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return consolidatedDate >= start && consolidatedDate <= end;
    });

    setFilteredWinners(filtered);
    setIsFiltered(true);

    toast({
      title: "Filtro aplicado",
      description: `${filtered.length} ganhadores encontrados no período selecionado.`,
    });
  };

  const handleMarkAsPaid = async (winnerId: string) => {
    try {
      const { error } = await supabase
        .from('payment_history')
        .update({
          payment_status: 'paid',
          payment_date: new Date().toISOString()
        })
        .eq('id', winnerId);

      if (error) throw error;

      const updateWinners = (winners: PaymentRecord[]) =>
        winners.map(winner => 
          winner.id === winnerId 
            ? { ...winner, payment_status: 'paid', payment_date: new Date().toISOString() }
            : winner
        );

      setAllWinners(updateWinners);
      if (isFiltered) {
        setFilteredWinners(updateWinners);
      }

      toast({
        title: "Pagamento confirmado",
        description: "O pagamento foi marcado como realizado.",
      });
    } catch (error) {
      console.error('❌ Erro ao confirmar pagamento:', error);
      toast({
        title: "Erro ao confirmar pagamento",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsPaid = async () => {
    const winnersToUpdate = isFiltered ? filteredWinners : allWinners;
    const pendingWinners = winnersToUpdate.filter(w => w.payment_status === 'pending');

    if (pendingWinners.length === 0) {
      toast({
        title: "Todos já foram pagos",
        description: "Todos os ganhadores já foram marcados como pagos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const promises = pendingWinners.map(winner => 
        supabase
          .from('payment_history')
          .update({
            payment_status: 'paid',
            payment_date: new Date().toISOString()
          })
          .eq('id', winner.id)
      );
      
      await Promise.all(promises);

      const updateWinners = (winners: PaymentRecord[]) =>
        winners.map(winner => 
          pendingWinners.some(w => w.id === winner.id)
            ? { ...winner, payment_status: 'paid', payment_date: new Date().toISOString() }
            : winner
        );

      setAllWinners(updateWinners);
      if (isFiltered) {
        setFilteredWinners(updateWinners);
      }

      toast({
        title: "Pagamentos confirmados",
        description: `${pendingWinners.length} pagamentos foram marcados como realizados.`,
      });
    } catch (error) {
      console.error('❌ Erro ao confirmar pagamentos:', error);
      toast({
        title: "Erro ao confirmar pagamentos",
        description: "Ocorreu um erro ao processar os pagamentos.",
        variant: "destructive",
      });
    }
  };

  const handleClearFilter = () => {
    setFilteredWinners([]);
    setIsFiltered(false);
    setStartDate('');
    setEndDate('');
    
    toast({
      title: "Filtros limpos",
      description: "Todos os filtros foram removidos.",
    });
  };

  const displayWinners = isFiltered ? filteredWinners : allWinners;

  return {
    startDate,
    endDate,
    filteredWinners,
    allWinners,
    isFiltered,
    isLoading,
    displayWinners,
    setStartDate,
    setEndDate,
    handleFilter,
    handleMarkAsPaid,
    handleMarkAllAsPaid,
    handleClearFilter,
    loadWinners
  };
};
