
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Target, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDailyCompetitionFinalization } from "@/hooks/useDailyCompetitionFinalization";
import { DailyCompetitionForm } from './daily/DailyCompetitionForm';
import { DailyCompetitionStats } from './daily/DailyCompetitionStats';
import { DailyCompetitionTable } from './daily/DailyCompetitionTable';

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

export const DailyCompetitionsManagement = () => {
  // Usar o hook de finalização automática
  useDailyCompetitionFinalization();

  const [competitions, setCompetitions] = useState<DailyCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<DailyCompetition | null>(null);
  const [newCompetition, setNewCompetition] = useState({
    title: '',
    description: '',
    theme: '',
    start_date: '',
    end_date: '',
    max_participants: 500
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  // Função para garantir que a data de fim seja sempre 23:59:59.999 do mesmo dia
  const ensureEndOfDay = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    // Definir como final do dia (23:59:59.999)
    date.setHours(23, 59, 59, 999);
    
    // Retornar no formato ISO
    return date.toISOString();
  };

  // Função para definir o início do dia como 00:00:00.000
  const ensureStartOfDay = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    // Definir como início do dia (00:00:00.000)
    date.setHours(0, 0, 0, 0);
    
    // Retornar no formato ISO
    return date.toISOString();
  };

  const handleStartDateChange = (value: string) => {
    const adjustedStartDate = ensureStartOfDay(value);
    const adjustedEndDate = ensureEndOfDay(value);
    
    if (editingCompetition) {
      setEditingCompetition({
        ...editingCompetition, 
        start_date: adjustedStartDate,
        end_date: adjustedEndDate
      });
    } else {
      setNewCompetition({
        ...newCompetition, 
        start_date: adjustedStartDate,
        end_date: adjustedEndDate
      });
    }
  };

  const fetchCompetitions = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to match our interface
      const mappedCompetitions: DailyCompetition[] = (data || []).map(comp => ({
        id: comp.id,
        title: comp.title,
        description: comp.description || '',
        theme: comp.theme || 'Geral',
        start_date: comp.start_date,
        end_date: comp.end_date,
        max_participants: comp.max_participants || 500,
        status: comp.status || 'draft',
        created_at: comp.created_at
      }));
      
      setCompetitions(mappedCompetitions);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as competições diárias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addCompetition = async () => {
    try {
      // SEMPRE garantir que termine às 23:59:59.999 do mesmo dia
      const adjustedCompetition = {
        ...newCompetition,
        start_date: ensureStartOfDay(newCompetition.start_date),
        end_date: ensureEndOfDay(newCompetition.start_date), // Usar start_date para garantir mesmo dia
        competition_type: 'challenge',
        status: 'active' // Ativar automaticamente
      };

      console.log('🎯 Criando competição diária com horários padronizados:', {
        start: adjustedCompetition.start_date,
        end: adjustedCompetition.end_date
      });

      const { error } = await supabase
        .from('custom_competitions')
        .insert([adjustedCompetition]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Competição diária criada (00:00:00 às 23:59:59 do mesmo dia)"
      });

      setNewCompetition({
        title: '',
        description: '',
        theme: '',
        start_date: '',
        end_date: '',
        max_participants: 500
      });
      setIsAddModalOpen(false);
      fetchCompetitions();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a competição diária",
        variant: "destructive"
      });
    }
  };

  const updateCompetition = async () => {
    if (!editingCompetition) return;

    try {
      // Para competições diárias, SEMPRE garantir que seja o dia completo
      const updateData = {
        title: editingCompetition.title,
        description: editingCompetition.description,
        theme: editingCompetition.theme,
        start_date: ensureStartOfDay(editingCompetition.start_date),
        end_date: ensureEndOfDay(editingCompetition.start_date), // Garantir 23:59:59 do mesmo dia
        max_participants: editingCompetition.max_participants,
        status: editingCompetition.status
      };

      console.log('🔧 Atualizando competição diária com horários padronizados:', {
        start: updateData.start_date,
        end: updateData.end_date
      });

      const { error } = await supabase
        .from('custom_competitions')
        .update(updateData)
        .eq('id', editingCompetition.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Competição diária atualizada (horário padronizado: 00:00:00 às 23:59:59)"
      });

      setEditingCompetition(null);
      fetchCompetitions();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a competição diária",
        variant: "destructive"
      });
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
      toast({
        title: "Erro",
        description: "Não foi possível remover a competição diária",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (competition: DailyCompetition) => {
    setEditingCompetition(competition);
  };

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Competições Diárias
            </CardTitle>
            <p className="text-sm text-slate-600">
              Gerencie competições diárias com temas específicos.
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              <Clock className="h-3 w-3" />
              ✅ PADRÃO: Todas as competições duram 00:00:00 às 23:59:59 do mesmo dia
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              <Target className="h-3 w-3" />
              Pontos são automaticamente transferidos para a competição semanal
            </div>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Competição Diária
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Estatísticas */}
        <DailyCompetitionStats competitions={competitions} />

        {/* Tabela de competições */}
        <DailyCompetitionTable
          competitions={competitions}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteCompetition}
        />

        {/* Modals */}
        <DailyCompetitionForm
          isOpen={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          competition={null}
          newCompetition={newCompetition}
          onNewCompetitionChange={setNewCompetition}
          onSubmit={addCompetition}
          isEditing={false}
          handleStartDateChange={handleStartDateChange}
        />

        <DailyCompetitionForm
          isOpen={!!editingCompetition}
          onOpenChange={() => setEditingCompetition(null)}
          competition={editingCompetition}
          newCompetition={newCompetition}
          onNewCompetitionChange={setEditingCompetition}
          onSubmit={updateCompetition}
          isEditing={true}
          handleStartDateChange={handleStartDateChange}
        />
      </CardContent>
    </Card>
  );
};
