
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

export const usePixExportModal = (open: boolean, prizeLevel: string) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [displayWinners, setDisplayWinners] = useState<any[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchWinners = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('weekly_rankings')
        .select(`
          *,
          profiles!inner(username, pix_key, pix_holder_name)
        `);

      // Apply prize level filter
      if (prizeLevel === 'first') {
        query = query.eq('position', 1);
      } else if (prizeLevel === 'top3') {
        query = query.lte('position', 3);
      } else if (prizeLevel === 'top10') {
        query = query.lte('position', 10);
      }

      // Apply date filters if set
      if (startDate) {
        query = query.gte('week_start', startDate);
      }
      if (endDate) {
        query = query.lte('week_end', endDate);
      }

      const { data, error } = await query.order('week_start', { ascending: false });

      if (error) throw error;

      // Filter and validate data
      const validWinners = (data || [])
        .filter((winner: any) => {
          return winner && 
                 typeof winner === 'object' && 
                 !('error' in winner) &&
                 winner.user_id &&
                 winner.position;
        })
        .map((winner: any) => ({
          id: winner.id || '',
          user_id: winner.user_id,
          position: winner.position,
          week_start: winner.week_start,
          week_end: winner.week_end,
          total_score: winner.total_score || 0,
          prize_amount: winner.prize_amount || 0,
          payment_status: winner.payment_status || 'pending',
          username: winner.profiles?.[0]?.username || 'Usuário não encontrado',
          pix_key: winner.profiles?.[0]?.pix_key || '',
          pix_holder_name: winner.profiles?.[0]?.pix_holder_name || ''
        }));

      setDisplayWinners(validWinners);
    } catch (error) {
      console.error('Error fetching winners:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos vencedores",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    setIsFiltered(true);
    fetchWinners();
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setIsFiltered(false);
    setDisplayWinners([]);
  };

  const handleMarkAsPaid = async (winnerId: string) => {
    try {
      const { error } = await supabase
        .from('weekly_rankings')
        .update({ 
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', winnerId as any);

      if (error) throw error;

      // Update local state
      setDisplayWinners(prev => 
        prev.map(winner => 
          winner.id === winnerId 
            ? { ...winner, payment_status: 'paid' }
            : winner
        )
      );

      toast({
        title: "Sucesso",
        description: "Status atualizado para 'Pago'"
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
  };

  const handleMarkAllAsPaid = async () => {
    try {
      const pendingWinners = displayWinners.filter(w => w.payment_status === 'pending');
      
      if (pendingWinners.length === 0) {
        toast({
          title: "Aviso",
          description: "Não há vencedores pendentes para marcar como pagos"
        });
        return;
      }

      const { error } = await supabase
        .from('weekly_rankings')
        .update({ 
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        } as any)
        .in('id', pendingWinners.map(w => w.id) as any[]);

      if (error) throw error;

      // Update local state
      setDisplayWinners(prev => 
        prev.map(winner => ({ ...winner, payment_status: 'paid' }))
      );

      toast({
        title: "Sucesso",
        description: `${pendingWinners.length} vencedores marcados como pagos`
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os status",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (open && !isFiltered) {
      fetchWinners();
    }
  }, [open, prizeLevel]);

  return {
    startDate,
    endDate,
    isFiltered,
    isLoading,
    displayWinners,
    setStartDate,
    setEndDate,
    handleFilter,
    handleMarkAsPaid,
    handleMarkAllAsPaid,
    handleClearFilter
  };
};
