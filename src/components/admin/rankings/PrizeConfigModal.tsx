
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePaymentData } from '@/hooks/usePaymentData';
import { IndividualPrizesSection } from '../payments/IndividualPrizesSection';
import { GroupPrizesSection } from '../payments/GroupPrizesSection';
import { PaymentStatsCards } from '../payments/PaymentStatsCards';
import { PrizeConfigModalErrorBoundary } from './PrizeConfigModalErrorBoundary';
import { RefreshCw } from 'lucide-react';

interface PrizeConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrizeConfigModal = ({ open, onOpenChange }: PrizeConfigModalProps) => {
  console.log('PrizeConfigModal renderizando:', { open });

  const paymentData = usePaymentData();

  console.log('PaymentData estado:', {
    isLoading: paymentData.isLoading,
    hasIndividualPrizes: paymentData.individualPrizes?.length || 0,
    hasGroupPrizes: paymentData.groupPrizes?.length || 0
  });

  if (paymentData.isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurações de Prêmios</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Carregando configurações de prêmios...</p>
            </div>
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
        
        <PrizeConfigModalErrorBoundary>
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
            />
          </div>
        </PrizeConfigModalErrorBoundary>
      </DialogContent>
    </Dialog>
  );
};
