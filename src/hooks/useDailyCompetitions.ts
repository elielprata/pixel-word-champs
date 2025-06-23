
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/utils/logger';

interface DailyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
  theme: string;
  rules: any;
}

export const useDailyCompetitions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: competitions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['dailyCompetitions'],
    queryFn: async (): Promise<DailyCompetition[]> => {
      logger.debug('Buscando competições diárias', undefined, 'DAILY_COMPETITIONS');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar competições diárias', { error: error.message }, 'DAILY_COMPETITIONS');
        throw error;
      }

      // Mapear os dados para garantir que tenham todas as propriedades necessárias
      const mappedData = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        start_date: item.start_date,
        end_date: item.end_date,
        status: item.status,
        prize_pool: item.prize_pool || 0,
        max_participants: item.max_participants || 0,
        total_participants: 0, // Calcular depois se necessário
        theme: item.theme || '',
        rules: item.rules || {}
      }));

      logger.info('Competições diárias carregadas', { count: mappedData.length }, 'DAILY_COMPETITIONS');
      return mappedData;
    },
    staleTime: 5 * 60 * 1000,
  });

  const createCompetitionMutation = useMutation({
    mutationFn: async (competitionData: Partial<DailyCompetition>) => {
      logger.info('Criando competição diária', { title: competitionData.title }, 'DAILY_COMPETITIONS');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .insert({
          ...competitionData,
          competition_type: 'challenge',
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar competição diária', { error: error.message }, 'DAILY_COMPETITIONS');
        throw error;
      }

      logger.info('Competição diária criada com sucesso', { id: data.id }, 'DAILY_COMPETITIONS');
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Competição diária criada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['dailyCompetitions'] });
    },
    onError: (error: any) => {
      logger.error('Erro na criação de competição diária', { error: error.message }, 'DAILY_COMPETITIONS');
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar competição",
        variant: "destructive",
      });
    },
  });

  const updateCompetitionMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DailyCompetition> & { id: string }) => {
      logger.info('Atualizando competição diária', { id, updates }, 'DAILY_COMPETITIONS');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar competição diária', { error: error.message }, 'DAILY_COMPETITIONS');
        throw error;
      }

      logger.info('Competição diária atualizada com sucesso', { id }, 'DAILY_COMPETITIONS');
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Competição atualizada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['dailyCompetitions'] });
    },
    onError: (error: any) => {
      logger.error('Erro na atualização de competição diária', { error: error.message }, 'DAILY_COMPETITIONS');
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar competição",
        variant: "destructive",
      });
    },
  });

  const deleteCompetitionMutation = useMutation({
    mutationFn: async (id: string) => {
      logger.warn('Excluindo competição diária', { id }, 'DAILY_COMPETITIONS');
      
      const { error } = await supabase
        .from('custom_competitions')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Erro ao excluir competição diária', { error: error.message }, 'DAILY_COMPETITIONS');
        throw error;
      }

      logger.info('Competição diária excluída com sucesso', { id }, 'DAILY_COMPETITIONS');
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Competição excluída com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['dailyCompetitions'] });
    },
    onError: (error: any) => {
      logger.error('Erro na exclusão de competição diária', { error: error.message }, 'DAILY_COMPETITIONS');
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir competição",
        variant: "destructive",
      });
    },
  });

  return {
    competitions,
    isLoading,
    error,
    refetch,
    createCompetition: createCompetitionMutation.mutate,
    updateCompetition: updateCompetitionMutation.mutate,
    deleteCompetition: deleteCompetitionMutation.mutate,
    isCreating: createCompetitionMutation.isPending,
    isUpdating: updateCompetitionMutation.isPending,
    isDeleting: deleteCompetitionMutation.isPending,
  };
};
