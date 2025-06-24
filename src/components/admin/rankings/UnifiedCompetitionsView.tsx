
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from 'lucide-react';
import { UnifiedCompetitionModal } from './UnifiedCompetitionModal';
import { UnifiedCompetitionsList } from './UnifiedCompetitionsList';
import { useUnifiedCompetitions } from '@/hooks/useUnifiedCompetitions';
import { useUnifiedCompetitionModal } from '@/hooks/useUnifiedCompetitionModal';

export const UnifiedCompetitionsView = () => {
  const { 
    competitions, 
    isLoading, 
    error, 
    refetch 
  } = useUnifiedCompetitions();
  
  const { 
    isOpen, 
    openModal, 
    closeModal 
  } = useUnifiedCompetitionModal();

  const handleCompetitionCreated = () => {
    refetch();
    closeModal();
  };

  const handleEdit = (competition: any) => {
    // TODO: Implementar edição na Etapa 3
    console.log('Editar competição:', competition.id);
  };

  const handleDelete = (competition: any) => {
    // TODO: Implementar exclusão na Etapa 3
    console.log('Excluir competição:', competition.id);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Competições</h2>
          <p className="text-slate-600">Gerencie todas as competições do sistema</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={openModal}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Competição
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Lista de Competições */}
      <UnifiedCompetitionsList
        competitions={competitions}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <UnifiedCompetitionModal
        open={isOpen}
        onOpenChange={closeModal}
        onCompetitionCreated={handleCompetitionCreated}
      />
    </div>
  );
};
