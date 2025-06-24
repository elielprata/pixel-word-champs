
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from 'lucide-react';
import { UnifiedCompetitionsList } from './UnifiedCompetitionsList';
import { UnifiedCompetitionModal } from './UnifiedCompetitionModal';
import { UnifiedCompetition } from '@/types/competition';

interface DailyCompetitionsViewProps {
  competitions: UnifiedCompetition[];
  isLoading: boolean;
}

export const DailyCompetitionsView = ({ competitions, isLoading }: DailyCompetitionsViewProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleEdit = (competition: UnifiedCompetition) => {
    console.log('Editar competição:', competition);
  };

  const handleDelete = (competition: UnifiedCompetition) => {
    console.log('Deletar competição:', competition);
  };

  const handleCompetitionCreated = () => {
    setShowCreateModal(false);
    // A lista será atualizada automaticamente pelo hook
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">Competições Diárias</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Gerencie competições diárias focadas no engajamento dos usuários
                </p>
              </div>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Competição
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Competições */}
      <UnifiedCompetitionsList
        competitions={competitions}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Criação */}
      <UnifiedCompetitionModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCompetitionCreated={handleCompetitionCreated}
        competitionTypeFilter="daily"
      />
    </div>
  );
};
