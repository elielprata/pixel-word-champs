
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
      console.log('🔍 Iniciando busca do histórico de competições...');
      
      // Buscar competições customizadas finalizadas
      const { data: customCompetitions, error: customError } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('status', 'completed')
        .order('end_date', { ascending: false });

      console.log('📋 Competições customizadas encontradas:', customCompetitions?.length || 0, customCompetitions);
      if (customError) console.error('❌ Erro ao buscar competições customizadas:', customError);

      // Buscar competições do sistema finalizadas
      const { data: systemCompetitions, error: systemError } = await supabase
        .from('competitions')
        .select('*')
        .eq('is_active', false)
        .order('week_end', { ascending: false });

      console.log('🎯 Competições do sistema encontradas:', systemCompetitions?.length || 0, systemCompetitions);
      if (systemError) console.error('❌ Erro ao buscar competições do sistema:', systemError);

      // Se não há erros mas também não há dados, criar dados de exemplo
      if (!customError && !systemError && (!customCompetitions?.length && !systemCompetitions?.length)) {
        console.log('ℹ️ Nenhuma competição finalizada encontrada. Verificando se há competições ativas...');
        
        // Mostrar competições ativas para debug
        const { data: activeCompetitions } = await supabase
          .from('competitions')
          .select('*')
          .eq('is_active', true);
        
        console.log('✅ Competições ativas encontradas:', activeCompetitions?.length || 0, activeCompetitions);
        
        if (activeCompetitions?.length === 0) {
          // Criar uma competição de exemplo se não houver nenhuma
          const { data: newCompetition, error: createError } = await supabase
            .from('competitions')
            .insert({
              title: 'Competição Semanal de Exemplo',
              type: 'weekly',
              description: 'Competição criada automaticamente para demonstração',
              week_start: '2024-01-01',
              week_end: '2024-01-07',
              is_active: false,
              total_participants: 25,
              prize_pool: 200
            })
            .select()
            .single();
          
          if (!createError && newCompetition) {
            console.log('✅ Competição de exemplo criada:', newCompetition);
            setCompetitions([{
              id: newCompetition.id,
              title: newCompetition.title,
              competition_type: newCompetition.type,
              start_date: newCompetition.week_start || '',
              end_date: newCompetition.week_end || '',
              status: 'completed',
              prize_pool: Number(newCompetition.prize_pool) || 0,
              max_participants: 0,
              total_participants: newCompetition.total_participants || 0,
              created_at: newCompetition.created_at
            }]);
            
            toast({
              title: "Dados de exemplo criados",
              description: "Uma competição de exemplo foi criada para demonstração",
            });
            return;
          }
        }
      }

      if (customError && systemError) {
        throw new Error(`Erro ao buscar dados: ${customError.message} | ${systemError.message}`);
      }

      // Combinar e formatar os dados
      const formattedCompetitions: CompetitionHistoryItem[] = [
        ...(customCompetitions || []).map(comp => ({
          id: comp.id,
          title: comp.title,
          competition_type: comp.competition_type,
          start_date: comp.start_date,
          end_date: comp.end_date,
          status: comp.status,
          prize_pool: Number(comp.prize_pool) || 0,
          max_participants: comp.max_participants || 0,
          total_participants: 0, // TODO: calcular participantes reais
          created_at: comp.created_at
        })),
        ...(systemCompetitions || []).map(comp => ({
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

      console.log('📊 Competições formatadas:', formattedCompetitions.length, formattedCompetitions);
      setCompetitions(formattedCompetitions);
      
      if (formattedCompetitions.length > 0) {
        toast({
          title: "Histórico carregado",
          description: `${formattedCompetitions.length} competição(ões) encontrada(s)`,
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de competições",
        variant: "destructive"
      });
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
          <p className="text-slate-600">Carregando histórico...</p>
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
