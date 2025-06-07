
import React from 'react';
import { PaymentRecord } from '@/services/paymentService';
import { PixFilters } from './PixFilters';
import { PaymentStatus } from './PaymentStatus';
import { PixExportActions } from './PixExportActions';
import { WinnersTable } from './WinnersTable';

interface PixModalContentProps {
  startDate: string;
  endDate: string;
  isFiltered: boolean;
  displayWinners: PaymentRecord[];
  isLoading: boolean;
  prizeLevel: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onFilter: () => void;
  onClear: () => void;
  onMarkAsPaid: (winnerId: string) => void;
  onMarkAllAsPaid: () => void;
}

export const PixModalContent = ({
  startDate,
  endDate,
  isFiltered,
  displayWinners,
  isLoading,
  prizeLevel,
  onStartDateChange,
  onEndDateChange,
  onFilter,
  onClear,
  onMarkAsPaid,
  onMarkAllAsPaid
}: PixModalContentProps) => {
  const pendingCount = displayWinners.filter(w => w.payment_status === 'pending').length;
  const paidCount = displayWinners.filter(w => w.payment_status === 'paid').length;

  const tableWinners = displayWinners.map(winner => ({
    id: winner.id,
    username: winner.username || 'Usuário',
    position: winner.position || 0,
    pixKey: winner.pix_key || 'Não informado',
    holderName: winner.pix_holder_name || 'Não informado',
    consolidatedDate: winner.created_at,
    prize: winner.prize_amount,
    paymentStatus: winner.payment_status as 'pending' | 'paid' | 'cancelled'
  }));

  return (
    <div className="space-y-3">
      <PixFilters
        startDate={startDate}
        endDate={endDate}
        isFiltered={isFiltered}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onFilter={onFilter}
        onClear={onClear}
      />

      <PaymentStatus
        pendingCount={pendingCount}
        paidCount={paidCount}
        onMarkAllAsPaid={onMarkAllAsPaid}
      />

      <PixExportActions
        displayWinners={displayWinners}
        isFiltered={isFiltered}
        startDate={startDate}
        endDate={endDate}
        prizeLevel={prizeLevel}
      />

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Carregando ganhadores...</p>
        </div>
      ) : (
        <WinnersTable
          winners={tableWinners}
          onMarkAsPaid={onMarkAsPaid}
          prizeLevel={prizeLevel}
          isFiltered={isFiltered}
        />
      )}
    </div>
  );
};
