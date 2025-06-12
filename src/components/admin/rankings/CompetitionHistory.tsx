
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CompetitionFilters } from './history/CompetitionFilters';
import { CompetitionStats } from './history/CompetitionStats';
import { CompetitionTable } from './history/CompetitionTable';

interface CompetitionHistoryItem {
  id: string;
  title: string;
  competition_type: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
  created_at: string;
}

export const CompetitionHistory = () => {
  const [competitions, setCompetitions] = useState<CompetitionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchCompetitionHistory();
  }, []);

  const fetchCompetitionHistory = async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando histórico de competições no banco...');
      
      // Buscar competições customizadas finalizadas
      const { data: customCompetitions, error: customError } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('status', 'completed' as any)
        .order('end_date', { ascending: false });

      if (customError) {
        console.error('❌ Erro ao buscar competições customizadas:', customError);
      }

      // Buscar competições do sistema finalizadas
      const { data: systemCompetitions, error: systemError } = await supabase
        .from('competitions')
        .select('*')
        .eq('is_active', false as any)
        .order('week_end', { ascending: false });

      if (systemError) {
        console.error('❌ Erro ao buscar competições do sistema:', systemError);
      }

      // Combinar e formatar os dados reais do banco
      const formattedCompetitions: CompetitionHistoryItem[] = [
        ...(customCompetitions || [])
          .filter((comp: any) => comp && typeof comp === 'object' && !('error' in comp))
          .map((comp: any) => ({
            id: comp.id,
            title: comp.title,
            competition_type: comp.competition_type,
            start_date: comp.start_date,
            end_date: comp.end_date,
            status: comp.status,
            prize_pool: Number(comp.prize_pool) || 0,
            max_participants: comp.max_participants || 0,
            total_participants: 0, // TODO: calcular participantes reais baseado em game_sessions
            created_at: comp.created_at
          })),
        ...(systemCompetitions || [])
          .filter((comp: any) => comp && typeof comp === 'object' && !('error' in comp))
          .map((comp: any) => ({
            id: comp.id,
            title: comp.title,
            competition_type: comp.type,
            start_date: comp.week_start || '',
            end_date: comp.week_end || '',
            status: 'completed',
            prize_pool: Number(comp.prize_pool) || 0,
            max_participants: 0,
            total_participants: comp.total_participants || 0,
            created_at: comp.created_at
          }))
      ];

      console.log('📊 Competições do banco carregadas:', formattedCompetitions.length);
      setCompetitions(formattedCompetitions);
      
      if (formattedCompetitions.length === 0) {
        toast({
          title: "Nenhuma competição encontrada",
          description: "Não há competições finalizadas no histórico.",
        });
      } else {
        toast({
          title: "Histórico carregado",
          description: `${formattedCompetitions.length} competição(ões) encontrada(s) no banco de dados.`,
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de competições",
        variant: "destructive"
      });
      setCompetitions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompetitions = competitions.filter(comp => {
    const matchesSearch = comp.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || comp.status === statusFilter;
    const matchesType = typeFilter === 'all' || comp.competition_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-orange-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando histórico do banco de dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CompetitionFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
      />

      <CompetitionStats competitions={competitions} />

      <CompetitionTable 
        competitions={filteredCompetitions}
        onReload={fetchCompetitionHistory}
      />
    </div>
  );
};
