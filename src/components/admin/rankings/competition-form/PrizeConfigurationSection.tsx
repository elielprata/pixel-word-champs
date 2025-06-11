
import React from 'react';
import { PaymentStatsCards } from '../../payments/PaymentStatsCards';
import { IndividualPrizesSection } from '../../payments/IndividualPrizesSection';
import { GroupPrizesSection } from '../../payments/GroupPrizesSection';

interface PrizeConfigurationSectionProps {
  paymentData: any;
}

export const PrizeConfigurationSection = ({ paymentData }: PrizeConfigurationSectionProps) => {
  return (
    <div className="space-y-4 border-t border-slate-200 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
        <h3 className="text-sm font-medium text-slate-700">Configuração Detalhada de Prêmios</h3>
      </div>

      {paymentData.isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
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
      )}
    </div>
  );
};
