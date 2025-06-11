
import React from 'react';
import { useCompetitionStatusUpdater } from '@/hooks/useCompetitionStatusUpdater';
import { EditCompetitionModal } from './EditCompetitionModal';
import { WeeklyRankingModal } from './WeeklyRankingModal';
import { WeeklyCompetitionHeader } from './weekly/WeeklyCompetitionHeader';
import { WeeklyCompetitionsEmpty } from './weekly/WeeklyCompetitionsEmpty';
import { WeeklyCompetitionsContainer } from './weekly/WeeklyCompetitionsContainer';
import { useWeeklyCompetitionsLogic } from '@/hooks/useWeeklyCompetitionsLogic';
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { customCompetitionService } from '@/services/customCompetitionService';

interface WeeklyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
}

interface WeeklyCompetitionsViewProps {
  competitions: WeeklyCompetition[];
  activeCompetition: WeeklyCompetition | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

export const WeeklyCompetitionsView: React.FC<WeeklyCompetitionsViewProps> = ({
  competitions,
  activeCompetition,
  isLoading,
  onRefresh
}) => {
  // Adicionar hook para atualização automática de status
  useCompetitionStatusUpdater(competitions);

  const { activeCompetitions } = useWeeklyCompetitionsLogic(competitions);
  
  // Estado centralizado para edição
  const [editingCompetition, setEditingCompetition] = useState<WeeklyCompetition | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  console.log('🔍 WeeklyCompetitionsView - Estado centralizado:', {
    editingCompetition: editingCompetition?.id,
    isEditModalOpen,
    isRankingModalOpen,
    selectedCompetitionId,
    deletingId
  });

  const handleViewRanking = (competition: WeeklyCompetition) => {
    console.log('👁️ WeeklyCompetitionsView - Ver ranking:', competition.id);
    setSelectedCompetitionId(competition.id);
    setIsRankingModalOpen(true);
  };

  const handleEdit = (competition: WeeklyCompetition) => {
    console.log('✏️ WeeklyCompetitionsView - Editando competição:', competition.id);
    setEditingCompetition(competition);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (competition: WeeklyCompetition) => {
    console.log('🗑️ WeeklyCompetitionsView - Excluindo competição:', competition.id);
    
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir a competição "${competition.title}"?`);
    if (!confirmDelete) {
      console.log('❌ Exclusão cancelada pelo usuário');
      return;
    }

    setDeletingId(competition.id);
    
    try {
      console.log('📤 Chamando serviço de exclusão...');
      const response = await customCompetitionService.deleteCompetition(competition.id);
      
      if (response.success) {
        console.log('✅ Competição excluída com sucesso');
        toast({
          title: "Competição excluída",
          description: `A competição "${competition.title}" foi excluída com sucesso.`,
        });
        
        if (onRefresh) {
          console.log('🔄 Atualizando lista de competições...');
          onRefresh();
        }
      } else {
        console.error('❌ Erro no serviço:', response.error);
        throw new Error(response.error || 'Erro ao excluir competição');
      }
    } catch (error) {
      console.error('❌ Erro ao excluir competição:', error);
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Não foi possível excluir a competição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCompetitionUpdated = () => {
    console.log('🔄 Competição semanal atualizada, fechando modal e recarregando lista...');
    setIsEditModalOpen(false);
    setEditingCompetition(null);
    if (onRefresh) {
      onRefresh();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando competições semanais...</p>
        </div>
      </div>
    );
  }

  if (activeCompetitions.length === 0) {
    return <WeeklyCompetitionsEmpty />;
  }

  return (
    <div className="space-y-6">
      <WeeklyCompetitionHeader />

      <WeeklyCompetitionsContainer 
        competitions={competitions}
        onRefresh={onRefresh}
        onViewRanking={handleViewRanking}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deletingId={deletingId}
      />

      <EditCompetitionModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        competition={editingCompetition}
        onCompetitionUpdated={handleCompetitionUpdated}
      />

      <WeeklyRankingModal
        open={isRankingModalOpen}
        onOpenChange={setIsRankingModalOpen}
        competitionId={selectedCompetitionId}
      />
    </div>
  );
};
