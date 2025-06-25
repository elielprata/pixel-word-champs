
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from 'lucide-react';
import { UnifiedCompetitionsList } from './UnifiedCompetitionsList';
import { UnifiedCompetitionModal } from './UnifiedCompetitionModal';
import { EditCompetitionModal } from './EditCompetitionModal';
import { UnifiedCompetition } from '@/types/competition';
import { useToast } from "@/hooks/use-toast";

interface DailyCompetitionsViewProps {
  competitions: UnifiedCompetition[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export const DailyCompetitionsView = ({ competitions, isLoading, onRefresh }: DailyCompetitionsViewProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<UnifiedCompetition | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [localCompetitions, setLocalCompetitions] = useState<UnifiedCompetition[]>([]);
  const { toast } = useToast();

  // Use local competitions if available, otherwise use props
  const displayedCompetitions = localCompetitions.length > 0 ? localCompetitions : competitions;

  // Update local competitions when props change
  React.useEffect(() => {
    setLocalCompetitions(competitions);
  }, [competitions]);

  const handleEdit = (competition: UnifiedCompetition) => {
    console.log('🔧 Abrindo modal de edição para:', competition.id);
    setEditingCompetition(competition);
    setShowEditModal(true);
  };

  const handleDelete = (competition: UnifiedCompetition) => {
    console.log('✅ Competição excluída:', competition.id);
    
    // Optimistic update: remove immediately from local state
    setLocalCompetitions(prev => prev.filter(comp => comp.id !== competition.id));
    
    toast({
      title: "Competição removida",
      description: "A competição foi excluída com sucesso.",
    });

    // Optionally refresh from server to ensure consistency
    if (onRefresh) {
      // Small delay to allow user to see the immediate update
      setTimeout(() => {
        onRefresh();
      }, 1000);
    }
  };

  const handleCompetitionCreated = () => {
    setShowCreateModal(false);
    toast({
      title: "Competição criada",
      description: "A nova competição foi criada com sucesso.",
    });
    
    // Refresh data after creation
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleCompetitionUpdated = () => {
    setShowEditModal(false);
    setEditingCompetition(null);
    toast({
      title: "Competição atualizada",
      description: "A competição foi atualizada com sucesso.",
    });
    
    // Refresh data after update
    if (onRefresh) {
      onRefresh();
    }
  };

  // Convert UnifiedCompetition para BaseCompetition
  const mapToBaseCompetition = (unified: UnifiedCompetition) => {
    return {
      id: unified.id,
      title: unified.title,
      description: unified.description,
      start_date: unified.startDate,
      end_date: unified.endDate,
      status: unified.status,
      prize_pool: 0, // Competições diárias não têm prêmios
      max_participants: unified.maxParticipants,
      total_participants: unified.totalParticipants,
      competition_type: 'challenge',
      theme: unified.theme,
      rules: null
    };
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
        competitions={displayedCompetitions}
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

      {/* Modal de Edição */}
      <EditCompetitionModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        competition={editingCompetition ? mapToBaseCompetition(editingCompetition) : null}
        onCompetitionUpdated={handleCompetitionUpdated}
      />
    </div>
  );
};
