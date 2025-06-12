
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from 'lucide-react';
import { logger } from '@/utils/logger';

interface PaymentStatusProps {
  pendingCount: number;
  paidCount: number;
  onMarkAllAsPaid: () => void;
}

export const PaymentStatus = ({ pendingCount, paidCount, onMarkAllAsPaid }: PaymentStatusProps) => {
  logger.debug('Renderizando status de pagamentos', { 
    pendingCount, 
    paidCount 
  }, 'PAYMENT_STATUS');

  const handleMarkAllAsPaid = () => {
    logger.info('Marcando todos os pagamentos como pagos', { 
      pendingCount 
    }, 'PAYMENT_STATUS');
    onMarkAllAsPaid();
  };

  return (
    <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
        <h3 className="font-medium text-sm">Status dos Pagamentos</h3>
        <Button 
          onClick={handleMarkAllAsPaid} 
          disabled={pendingCount === 0}
          className="h-8 text-xs"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Marcar Todos como Pagos
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-500" />
          <span className="text-xs">Pendentes: <strong>{pendingCount}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-xs">Pagos: <strong>{paidCount}</strong></span>
        </div>
      </div>
    </div>
  );
};
