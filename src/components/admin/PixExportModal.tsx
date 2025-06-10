
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download } from 'lucide-react';
import { usePixExportModal } from '@/hooks/usePixExportModal';
import { PixModalContent } from './pix/PixModalContent';

interface PixExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prizeLevel: string;
}

export const PixExportModal = ({ open, onOpenChange, prizeLevel }: PixExportModalProps) => {
  const pixExportData = usePixExportModal();

  // Convert Winner[] to PaymentRecord[] format for the modal
  const paymentRecords = pixExportData.displayWinners.map(winner => ({
    id: winner.id,
    user_id: winner.user_id,
    username: winner.username,
    position: winner.position,
    score: winner.score,
    prize_amount: winner.prize_amount,
    pix_key: winner.pix_key,
    pix_holder_name: winner.pix_holder_name,
    payment_status: winner.payment_status as 'pending' | 'paid' | 'cancelled',
    created_at: new Date().toISOString(), // Add missing property
    ranking_type: 'weekly' as const // Add missing property
  }));

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        pixExportData.handleClearFilter();
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[600px] overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Download className="h-4 w-4" />
            Exportar PIX - {prizeLevel}
          </DialogTitle>
        </DialogHeader>

        <PixModalContent
          startDate={pixExportData.startDate}
          endDate={pixExportData.endDate}
          isFiltered={pixExportData.isFiltered}
          displayWinners={paymentRecords}
          isLoading={pixExportData.isLoading}
          prizeLevel={prizeLevel}
          onStartDateChange={pixExportData.setStartDate}
          onEndDateChange={pixExportData.setEndDate}
          onFilter={pixExportData.handleFilter}
          onClear={pixExportData.handleClearFilter}
          onMarkAsPaid={pixExportData.handleMarkAsPaid}
          onMarkAllAsPaid={pixExportData.handleMarkAllAsPaid}
        />
      </DialogContent>
    </Dialog>
  );
};
