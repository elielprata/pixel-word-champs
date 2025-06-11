import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Target, Clock, Users } from 'lucide-react';
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
    start_time: '00:00',
    max_participants: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const createDateTimeFromDateAndTime = (date: string, time: string): string => {
    if (!date || !time) return '';
    
    const [hours, minutes] = time.split(':').map(Number);
    const dateTime = new Date(date + 'T00:00:00.000Z');
    dateTime.setUTCHours(hours, minutes, 0, 0);
    
    return dateTime.toISOString();
  };

  const createEndOfDayDateTime = (date: string): string => {
    if (!date) return '';
    
    const dateTime = new Date(date + 'T00:00:00.000Z');
    dateTime.setUTCHours(23, 59, 59, 999);
    
    return dateTime.toISOString();
  };

  const handleStartDateChange = (value: string) => {
    const adjustedStartDate = createDateTimeFromDateAndTime(value, newCompetition.start_time);
    const adjustedEndDate = createEndOfDayDateTime(value);
    
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

  const handleStartTimeChange = (time: string) => {
    const currentDate = editingCompetition 
      ? editingCompetition.start_date.split('T')[0]
      : newCompetition.start_date.split('T')[0];
    
    const adjustedStartDate = createDateTimeFromDateAndTime(currentDate, time);
    
    if (editingCompetition) {
      setEditingCompetition({
        ...editingCompetition, 
        start_date: adjustedStartDate
      });
    } else {
      setNewCompetition({
        ...newCompetition, 
        start_date: adjustedStartDate,
        start_time: time
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
      const adjustedCompetition = {
        ...newCompetition,
        start_date: newCompetition.start_date,
        end_date: newCompetition.end_date,
        competition_type: 'challenge',
        status: 'active',
        max_participants: 0
      };

      console.log('🎯 Criando competição diária:', {
        start: adjustedCompetition.start_date,
        end: adjustedCompetition.end_date,
        start_time: newCompetition.start_time
      });

      const { error } = await supabase
        .from('custom_competitions')
        .insert([adjustedCompetition]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Competição diária criada com participação livre"
      });

      setNewCompetition({
        title: '',
        description: '',
        theme: '',
        start_date: '',
        end_date: '',
        start_time: '00:00',
        max_participants: 0
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
      const updateData = {
        title: editingCompetition.title,
        description: editingCompetition.description,
        theme: editingCompetition.theme,
        start_date: editingCompetition.start_date,
        end_date: editingCompetition.end_date,
        max_participants: 0,
        status: editingCompetition.status
      };

      console.log('🔧 Atualizando competição diária:', updateData);

      const { error } = await supabase
        .from('custom_competitions')
        .update(updateData)
        .eq('id', editingCompetition.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Competição diária atualizada"
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
              Gerencie competições diárias com temas específicos e horários personalizados.
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              <Clock className="h-3 w-3" />
              ✅ Horários personalizáveis para início e fim automático às 23:59:59
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              <Users className="h-3 w-3" />
              🎉 PARTICIPAÇÃO LIVRE: Sem limite de participantes!
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
        <DailyCompetitionStats competitions={competitions} />

        <DailyCompetitionTable
          competitions={competitions}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteCompetition}
        />

        <DailyCompetitionForm
          isOpen={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          competition={null}
          newCompetition={newCompetition}
          onNewCompetitionChange={setNewCompetition}
          onSubmit={addCompetition}
          isEditing={false}
          handleStartDateChange={handleStartDateChange}
          handleStartTimeChange={handleStartTimeChange}
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
          handleStartTimeChange={handleStartTimeChange}
        />
      </CardContent>
    </Card>
  );
};
