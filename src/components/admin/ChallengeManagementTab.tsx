
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useChallenges } from '@/hooks/useChallenges';
import { ChallengeHeader } from './challenges/ChallengeHeader';
import { ChallengeForm } from './challenges/ChallengeForm';
import { ChallengeCard } from './challenges/ChallengeCard';
import { useChallengeActions } from './challenges/useChallengeActions';

export const ChallengeManagementTab = () => {
  const { challenges, isLoading, refetch } = useChallenges({ activeOnly: false });
  const {
    isCreating,
    setIsCreating,
    editingChallenge,
    formData,
    handleCreate,
    handleUpdate,
    handleEdit,
    handleDelete,
    handleCancel,
    updateFormData
  } = useChallengeActions(challenges, refetch);

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <ChallengeHeader />

      {/* Create/Edit Form */}
      {(isCreating || editingChallenge) && (
        <ChallengeForm
          formData={formData}
          editingChallenge={editingChallenge}
          onFormDataChange={updateFormData}
          onSubmit={editingChallenge ? handleUpdate : handleCreate}
          onCancel={handleCancel}
        />
      )}

      {/* Create Button */}
      {!isCreating && !editingChallenge && (
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Desafio
        </Button>
      )}

      {/* Challenges List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};
