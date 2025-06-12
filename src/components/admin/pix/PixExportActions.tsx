
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { PaymentRecord } from '@/services/paymentService';
import { exportToCSV } from '@/utils/csvExport';
import { logger } from '@/utils/logger';

interface PixExportActionsProps {
  displayWinners: PaymentRecord[];
  isFiltered: boolean;
  startDate: string;
  endDate: string;
  prizeLevel: string;
}

export const PixExportActions = ({ 
  displayWinners, 
  isFiltered, 
  startDate, 
  endDate, 
  prizeLevel 
}: PixExportActionsProps) => {
  const { toast } = useToast();

  const handleExport = () => {
    logger.info('Iniciando exportação de chaves PIX', { 
      winnersCount: displayWinners.length,
      prizeLevel,
      isFiltered,
      dateRange: isFiltered ? `${startDate} - ${endDate}` : 'all'
    }, 'PIX_EXPORT_ACTIONS');

    if (displayWinners.length === 0) {
      logger.warn('Tentativa de exportação sem ganhadores', undefined, 'PIX_EXPORT_ACTIONS');
      toast({
        title: "Nenhum ganhador",
        description: "Não há ganhadores para exportar no período selecionado.",
        variant: "destructive",
      });
      return;
    }

    const exportData = displayWinners.map(winner => ({
      id: winner.id,
      username: winner.username || 'Usuário',
      position: winner.position || 0,
      pixKey: winner.pix_key || 'Não informado',
      holderName: winner.pix_holder_name || 'Não informado',
      consolidatedDate: winner.created_at,
      prize: winner.prize_amount,
      paymentStatus: winner.payment_status as 'pending' | 'paid' | 'cancelled'
    }));

    exportToCSV(exportData, prizeLevel);

    logger.info('Exportação concluída com sucesso', { 
      exportedCount: displayWinners.length 
    }, 'PIX_EXPORT_ACTIONS');

    toast({
      title: "Exportação concluída",
      description: `${displayWinners.length} chaves PIX exportadas com sucesso.`,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div>
        <p className="text-xs text-gray-600">
          {isFiltered ? 'Filtrados:' : 'Total:'} 
          <span className="font-bold ml-1">{displayWinners.length}</span>
        </p>
        {isFiltered && startDate && endDate && (
          <p className="text-xs text-blue-600">
            {new Date(startDate).toLocaleDateString('pt-BR')} - {new Date(endDate).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
      <Button onClick={handleExport} disabled={displayWinners.length === 0} className="h-8 text-xs">
        <Download className="h-3 w-3 mr-1" />
        Exportar CSV
      </Button>
    </div>
  );
};
