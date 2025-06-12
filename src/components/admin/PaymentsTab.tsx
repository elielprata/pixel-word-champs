
import React, { useState } from 'react';
import { usePaymentData } from '@/hooks/usePaymentData';
import { PaymentHeader } from './payments/PaymentHeader';
import { PaymentStatsCards } from './payments/PaymentStatsCards';
import { IndividualPrizesSection } from './payments/IndividualPrizesSection';
import { GroupPrizesSection } from './payments/GroupPrizesSection';

export const PaymentsTab = () => {
  const {
    individualPrizes,
    groupPrizes,
    editingRow,
    editingGroup,
    editIndividualValue,
    editGroupPrize,
    isLoading,
    setEditIndividualValue,
    setEditGroupPrize,
    handleEditIndividual,
    handleSaveIndividual,
    handleEditGroup,
    handleSaveGroup,
    handleToggleGroup,
    handleCancel,
    calculateTotalPrize,
    calculateTotalWinners
  } = usePaymentData();

  const totalPrize = calculateTotalPrize();
  const totalWinners = calculateTotalWinners();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-3">Carregando configurações de premiação...</span>
          </div>
        </div>
      </div>
    );
  }

  const handleEditGroupWrapper = (group: any) => {
    handleEditGroup(group.id);
  };

  const handleSaveGroupWrapper = () => {
    if (editingGroup) {
      handleSaveGroup(editingGroup);
    }
  };

  const handleToggleGroupWrapper = (groupId: string) => {
    handleToggleGroup(groupId);
  };

  return (
    <div className="space-y-6">
      <PaymentHeader totalPrize={totalPrize} totalWinners={totalWinners} />

      <PaymentStatsCards 
        individualPrizes={individualPrizes}
        groupPrizes={groupPrizes}
        totalPrize={totalPrize}
        totalWinners={totalWinners}
      />

      <IndividualPrizesSection
        individualPrizes={individualPrizes}
        editingRow={editingRow}
        editIndividualValue={editIndividualValue}
        setEditIndividualValue={setEditIndividualValue}
        onEditIndividual={handleEditIndividual}
        onSaveIndividual={handleSaveIndividual}
        onCancel={handleCancel}
      />

      <GroupPrizesSection
        groupPrizes={groupPrizes}
        editingGroup={editingGroup}
        editGroupPrize={editGroupPrize}
        setEditGroupPrize={setEditGroupPrize}
        onEditGroup={handleEditGroupWrapper}
        onSaveGroup={handleSaveGroupWrapper}
        onToggleGroup={handleToggleGroupWrapper}
        onCancel={handleCancel}
      />
    </div>
  );
};
