
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePaymentData } from '@/hooks/usePaymentData';
import { IndividualPrizesSection } from '../payments/IndividualPrizesSection';
import { GroupPrizesSection } from '../payments/GroupPrizesSection';
import { PaymentStatsCards } from '../payments/PaymentStatsCards';

interface PrizeConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrizeConfigModal = ({ open, onOpenChange }: PrizeConfigModalProps) => {
  const paymentData = usePaymentData();

  const handleExportPix = (prizeLevel: string) => {
    console.log('Exporting PIX for:', prizeLevel);
    // TODO: Implement PIX export functionality
  };

  if (paymentData.isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurações de Prêmios</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Configurações de Prêmios</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Stats Cards */}
          <PaymentStatsCards 
            totalPrize={paymentData.calculateTotalPrize()}
            totalWinners={paymentData.calculateTotalWinners()}
            individualPrizes={paymentData.individualPrizes}
            groupPrizes={paymentData.groupPrizes}
          />

          {/* Individual Prizes */}
          <IndividualPrizesSection 
            individualPrizes={paymentData.individualPrizes}
            editingRow={paymentData.editingRow}
            editIndividualValue={paymentData.editIndividualValue}
            setEditIndividualValue={paymentData.setEditIndividualValue}
            onEditIndividual={paymentData.handleEditIndividual}
            onSaveIndividual={paymentData.handleSaveIndividual}
            onCancel={paymentData.handleCancel}
            onExportPix={handleExportPix}
          />

          {/* Group Prizes */}
          <GroupPrizesSection 
            groupPrizes={paymentData.groupPrizes}
            editingGroup={paymentData.editingGroup}
            editGroupPrize={paymentData.editGroupPrize}
            setEditGroupPrize={paymentData.setEditGroupPrize}
            onEditGroup={paymentData.handleEditGroup}
            onSaveGroup={paymentData.handleSaveGroup}
            onToggleGroup={paymentData.handleToggleGroup}
            onCancel={paymentData.handleCancel}
            onExportPix={handleExportPix}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
