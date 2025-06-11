
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DailyCompetition {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  status: string;
  created_at: string;
}

export const useDailyCompetitionsManagement = () => {
  const [competitions, setCompetitions] = useState<DailyCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCompetitions = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedCompetitions: DailyCompetition[] = (data || []).map(comp => ({
        id: comp.id,
        title: comp.title,
        description: comp.description || '',
        theme: comp.theme || 'Geral',
        start_date: comp.start_date,
        end_date: comp.end_date,
        max_participants: comp.max_participants || 0,
        status: comp.status || 'draft',
        created_at: comp.created_at
      }));
      
      setCompetitions(mappedCompetitions);
    } catch (error) {
      console.error('Erro ao carregar competições:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCompetition = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_competitions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Competição diária removida com sucesso"
      });

      fetchCompetitions();
    } catch (error) {
      console.error('Erro ao deletar competição:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a competição diária",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  return {
    competitions,
    loading,
    fetchCompetitions,
    deleteCompetition
  };
};
