
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
  const {
    startDate,
    endDate,
    isFiltered,
    isLoading,
    displayWinners,
    setStartDate,
    setEndDate,
    handleFilter,
    handleMarkAsPaid,
    handleMarkAllAsPaid,
    handleClearFilter
  } = usePixExportModal(open, prizeLevel);

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        handleClearFilter();
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
          startDate={startDate}
          endDate={endDate}
          isFiltered={isFiltered}
          displayWinners={displayWinners}
          isLoading={isLoading}
          prizeLevel={prizeLevel}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onFilter={handleFilter}
          onClear={handleClearFilter}
          onMarkAsPaid={handleMarkAsPaid}
          onMarkAllAsPaid={handleMarkAllAsPaid}
        />
      </DialogContent>
    </Dialog>
  );
};
