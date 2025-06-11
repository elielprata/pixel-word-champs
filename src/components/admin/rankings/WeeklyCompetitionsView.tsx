import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { customCompetitionService } from '@/services/customCompetitionService';
import { EditCompetitionModal } from './EditCompetitionModal';
import { WeeklyRankingModal } from './WeeklyRankingModal';
import { useCompetitionStatusUpdater } from '@/hooks/useCompetitionStatusUpdater';
import { WeeklyCompetitionHeader } from './weekly/WeeklyCompetitionHeader';
import { ActiveCompetitionCard } from './weekly/ActiveCompetitionCard';
import { WeeklyCompetitionCard } from './weekly/WeeklyCompetitionCard';
import { WeeklyCompetitionsEmpty } from './weekly/WeeklyCompetitionsEmpty';
import { CompetitionStatusService } from '@/services/competitionStatusService';

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

  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCompetition, setEditingCompetition] = useState<WeeklyCompetition | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>('');

  // Usar o serviço centralizado para calcular o status de cada competição
  const calculateActualStatus = (competition: WeeklyCompetition) => {
    return CompetitionStatusService.calculateCorrectStatus(
      competition.start_date, 
      competition.end_date
    );
  };

  // Filtrar apenas competições não finalizadas (ativas ou aguardando)
  const activeCompetitions = competitions.filter(comp => {
    const actualStatus = calculateActualStatus(comp);
    return actualStatus === 'active' || actualStatus === 'scheduled';
  });

  // Encontrar a competição realmente ativa (dentro do período)
  const currentActiveCompetition = activeCompetitions.find(comp => {
    const actualStatus = calculateActualStatus(comp);
    return actualStatus === 'active';
  });

  // Outras competições (aguardando início)
  const otherActiveCompetitions = activeCompetitions.filter(comp => {
    const actualStatus = calculateActualStatus(comp);
    return actualStatus === 'scheduled' || (actualStatus === 'active' && comp.id !== currentActiveCompetition?.id);
  });

  const handleViewRanking = (competition: WeeklyCompetition) => {
    console.log('👁️ Abrindo modal de ranking da competição semanal:', competition.id);
    setSelectedCompetitionId(competition.id);
    setIsRankingModalOpen(true);
  };

  const handleEdit = (competition: WeeklyCompetition) => {
    console.log('🔧 Editando competição:', competition.id);
    setEditingCompetition(competition);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (competition: WeeklyCompetition) => {
    console.log('🗑️ Tentando excluir competição:', competition.id);
    
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
    console.log('🔄 Competição atualizada, recarregando lista...');
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

      {currentActiveCompetition && (
        <ActiveCompetitionCard
          competition={currentActiveCompetition}
          onViewRanking={handleViewRanking}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}

      {otherActiveCompetitions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            {currentActiveCompetition ? 'Outras Competições Semanais' : 'Competições Semanais Aguardando Início'}
          </h3>
          
          <div className="grid gap-4">
            {otherActiveCompetitions.map((competition) => (
              <WeeklyCompetitionCard
                key={competition.id}
                competition={competition}
                onViewRanking={handleViewRanking}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            ))}
          </div>
        </div>
      )}

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
