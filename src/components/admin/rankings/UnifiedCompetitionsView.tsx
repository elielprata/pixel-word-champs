
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from 'lucide-react';
import { UnifiedCompetitionModal } from './UnifiedCompetitionModal';
import { UnifiedCompetitionsList } from './UnifiedCompetitionsList';
import { EditCompetitionModal } from './EditCompetitionModal';
import { useUnifiedCompetitions } from '@/hooks/useUnifiedCompetitions';
import { useUnifiedCompetitionModal } from '@/hooks/useUnifiedCompetitionModal';
import { unifiedCompetitionService } from '@/services/unifiedCompetitionService';
import { useToast } from "@/hooks/use-toast";
import { UnifiedCompetition } from '@/types/competition';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const UnifiedCompetitionsView = () => {
  const { toast } = useToast();
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

  const [editingCompetition, setEditingCompetition] = useState<UnifiedCompetition | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingCompetition, setDeletingCompetition] = useState<UnifiedCompetition | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCompetitionCreated = () => {
    refetch();
    closeModal();
  };

  const handleEdit = (competition: UnifiedCompetition) => {
    setEditingCompetition(competition);
    setIsEditModalOpen(true);
  };

  const handleCompetitionUpdated = () => {
    refetch();
    setIsEditModalOpen(false);
    setEditingCompetition(null);
    toast({
      title: "Sucesso",
      description: "Competição atualizada com sucesso!",
    });
  };

  const handleDelete = (competition: UnifiedCompetition) => {
    setDeletingCompetition(competition);
  };

  const confirmDelete = async () => {
    if (!deletingCompetition) return;
    
    setIsDeleting(true);
    try {
      const result = await unifiedCompetitionService.deleteCompetition(deletingCompetition.id);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Competição excluída com sucesso!",
        });
        refetch();
      } else {
        throw new Error(result.error || 'Erro ao excluir competição');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao excluir competição",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletingCompetition(null);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  // Convert UnifiedCompetition to BaseCompetition format for EditCompetitionModal
  const convertToBaseCompetition = (competition: UnifiedCompetition) => {
    return {
      id: competition.id,
      title: competition.title,
      description: competition.description,
      start_date: competition.startDate,
      end_date: competition.endDate,
      status: competition.status,
      prize_pool: competition.prizePool,
      max_participants: competition.maxParticipants,
      total_participants: competition.totalParticipants || 0,
      competition_type: competition.type === 'daily' ? 'challenge' : 'tournament',
      theme: competition.theme
    };
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

      {/* Modal de Criação */}
      <UnifiedCompetitionModal
        open={isOpen}
        onOpenChange={closeModal}
        onCompetitionCreated={handleCompetitionCreated}
      />

      {/* Modal de Edição */}
      {editingCompetition && (
        <EditCompetitionModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          competition={convertToBaseCompetition(editingCompetition)}
          onCompetitionUpdated={handleCompetitionUpdated}
        />
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deletingCompetition} onOpenChange={() => setDeletingCompetition(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a competição "{deletingCompetition?.title}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
