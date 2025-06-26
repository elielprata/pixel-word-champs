
import React from 'react';
import { UnifiedCompetition } from '@/types/competition';
import { useCompetitionStatusUpdater } from '@/hooks/useCompetitionStatusUpdater';
import { DeleteCompetitionModal } from './DeleteCompetitionModal';
import { CompetitionCard } from './unified-list/CompetitionCard';
import { EmptyState } from './unified-list/EmptyState';
import { LoadingState } from './unified-list/LoadingState';
import { useCompetitionActions } from './unified-list/useCompetitionActions';

interface UnifiedCompetitionsListProps {
  competitions: UnifiedCompetition[];
  isLoading: boolean;
  onDelete: (competition: UnifiedCompetition) => void;
}

export const UnifiedCompetitionsList: React.FC<UnifiedCompetitionsListProps> = ({
  competitions,
  isLoading,
  onDelete
}) => {
  // Atualizar status automaticamente
  useCompetitionStatusUpdater(competitions);

  const {
    deleteModalOpen,
    setDeleteModalOpen,
    competitionToDelete,
    isDeletingId,
    handleDeleteClick,
    handleConfirmDelete
  } = useCompetitionActions(onDelete);

  if (isLoading) {
    return <LoadingState />;
  }

  if (competitions.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="space-y-4">
        {competitions.map((competition) => (
          <CompetitionCard
            key={competition.id}
            competition={competition}
            onDelete={handleDeleteClick}
            isDeleting={isDeletingId === competition.id}
          />
        ))}
      </div>

      <DeleteCompetitionModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        competition={competitionToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingId === competitionToDelete?.id}
      />
    </>
  );
};
