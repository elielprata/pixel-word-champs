
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from 'lucide-react';
import { useDailyCompetitionFinalization } from "@/hooks/useDailyCompetitionFinalization";
import { useCompetitionStatusChecker } from '@/hooks/useCompetitionStatusChecker';
import { useDailyCompetitionsManagement } from '@/hooks/useDailyCompetitionsManagement';
import { useDailyCompetitionForm } from '@/hooks/useDailyCompetitionForm';
import { DailyCompetitionForm } from './daily/DailyCompetitionForm';
import { DailyCompetitionStats } from './daily/DailyCompetitionStats';
import { DailyCompetitionTable } from './daily/DailyCompetitionTable';
import { DailyCompetitionsHeader } from './daily/DailyCompetitionsHeader';

export const DailyCompetitionsManagement = () => {
  // Usar o hook de finalização automática
  useDailyCompetitionFinalization();

  // Adicionar verificação automática de status
  useCompetitionStatusChecker();

  const {
    competitions,
    loading,
    fetchCompetitions,
    deleteCompetition
  } = useDailyCompetitionsManagement();

  const {
    isAddModalOpen,
    setIsAddModalOpen,
    editingCompetition,
    setEditingCompetition,
    newCompetition,
    setNewCompetition,
    handleStartDateChange,
    addCompetition,
    updateCompetition,
    handleEdit
  } = useDailyCompetitionForm(fetchCompetitions);

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <DailyCompetitionsHeader />
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
