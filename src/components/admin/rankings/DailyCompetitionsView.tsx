
import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { customCompetitionService } from '@/services/customCompetitionService';
import { EditCompetitionModal } from './EditCompetitionModal';
import { CompetitionTimeInfo } from './daily/CompetitionTimeInfo';
import { DailyCompetitionCard } from './daily/DailyCompetitionCard';
import { DailyCompetitionsEmpty } from './daily/DailyCompetitionsEmpty';

interface DailyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
  theme: string;
  rules: any;
}

interface DailyCompetitionsViewProps {
  competitions: DailyCompetition[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export const DailyCompetitionsView: React.FC<DailyCompetitionsViewProps> = ({
  competitions,
  isLoading,
  onRefresh
}) => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCompetition, setEditingCompetition] = useState<DailyCompetition | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filtrar apenas competições diárias ativas (excluir finalizadas e canceladas)
  const activeCompetitions = competitions.filter(comp => 
    comp.status !== 'completed' && comp.status !== 'cancelled'
  );

  const handleEdit = (competition: DailyCompetition) => {
    console.log('🔧 Editando competição diária:', competition.id);
    setEditingCompetition(competition);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (competition: DailyCompetition) => {
    console.log('🗑️ Tentando excluir competição diária:', competition.id);
    
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
    console.log('🔄 Competição diária atualizada, recarregando lista...');
    if (onRefresh) {
      onRefresh();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando competições diárias...</p>
        </div>
      </div>
    );
  }

  if (activeCompetitions.length === 0) {
    return <DailyCompetitionsEmpty />;
  }

  return (
    <div className="space-y-6">
      <CompetitionTimeInfo />

      {/* Lista de Competições Diárias Ativas */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Competições Diárias Ativas ({activeCompetitions.length})
        </h3>
        
        <div className="grid gap-4">
          {activeCompetitions.map((competition) => (
            <DailyCompetitionCard
              key={competition.id}
              competition={competition}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deletingId === competition.id}
            />
          ))}
        </div>
      </div>

      {/* Modal de Edição */}
      <EditCompetitionModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        competition={editingCompetition}
        onCompetitionUpdated={handleCompetitionUpdated}
      />
    </div>
  );
};
