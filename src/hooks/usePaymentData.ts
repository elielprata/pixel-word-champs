
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { IndividualPrize, GroupPrize } from '@/types/payment';

export const usePaymentData = () => {
  const [individualPrizes, setIndividualPrizes] = useState<IndividualPrize[]>([]);
  const [groupPrizes, setGroupPrizes] = useState<GroupPrize[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const { data, error } = await supabase
          .from('prize_configurations')
          .select('*');

        if (error) throw error;

        const validData = (data || [])
          .filter((item: any) => item && typeof item === 'object' && !('error' in item));

        const individual: IndividualPrize[] = [];
        const group: GroupPrize[] = [];

        validData.forEach((item: any) => {
          if (item.type === 'individual' && item.position) {
            individual.push({
              position: item.position,
              prize: item.prize_amount || 0,
              id: item.id || ''
            });
          } else if (item.type === 'group' && item.position_range) {
            group.push({
              id: item.id || '',
              name: item.group_name || '',
              range: item.position_range || '',
              totalWinners: item.total_winners || 0,
              prizePerWinner: item.prize_per_winner || 0,
              active: item.is_active || false
            });
          }
        });

        setIndividualPrizes(individual);
        setGroupPrizes(group);
      } catch (error) {
        console.error('Erro ao carregar dados de pagamento:', error);
        setIndividualPrizes([]);
        setGroupPrizes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  return {
    individualPrizes,
    groupPrizes,
    isLoading
  };
};
