
import React, { useState } from 'react';
import { usePaymentData } from '@/hooks/usePaymentData';
import { PaymentHeader } from './payments/PaymentHeader';
import { PaymentStatsCards } from './payments/PaymentStatsCards';
import { IndividualPrizesSection } from './payments/IndividualPrizesSection';
import { GroupPrizesSection } from './payments/GroupPrizesSection';
import { PixExportModal } from "./PixExportModal";

export const PaymentsTab = () => {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedPrizeLevel, setSelectedPrizeLevel] = useState<string>('');
  
  const {
    individualPrizes,
    groupPrizes,
    editingRow,
    editingGroup,
    editIndividualValue,
    editGroupPrize,
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

  const handleExportPix = (prizeLevel: string) => {
    setSelectedPrizeLevel(prizeLevel);
    setExportModalOpen(true);
  };

  const totalPrize = calculateTotalPrize();
  const totalWinners = calculateTotalWinners();

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
        onExportPix={handleExportPix}
      />

      <GroupPrizesSection
        groupPrizes={groupPrizes}
        editingGroup={editingGroup}
        editGroupPrize={editGroupPrize}
        setEditGroupPrize={setEditGroupPrize}
        onEditGroup={handleEditGroup}
        onSaveGroup={handleSaveGroup}
        onToggleGroup={handleToggleGroup}
        onCancel={handleCancel}
        onExportPix={handleExportPix}
      />

      <PixExportModal 
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        prizeLevel={selectedPrizeLevel}
      />
    </div>
  );
};
