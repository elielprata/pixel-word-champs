
import React from 'react';
import { Info, Calendar, Clock } from 'lucide-react';

interface CompetitionFinalizationInfoProps {
  nextResetDate?: string;
  isCustomDates?: boolean;
}

export const CompetitionFinalizationInfo: React.FC<CompetitionFinalizationInfoProps> = ({ 
  nextResetDate,
  isCustomDates 
}) => {
  const formatNextReset = () => {
    if (!nextResetDate) return 'Verificação diária às 00:00:00';
    
    const resetDate = new Date(nextResetDate);
    const today = new Date();
    const diffTime = resetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return 'Reset deve ser executado agora';
    }
    
    return `Próximo reset em ${diffDays} dia(s) - ${resetDate.toLocaleDateString('pt-BR')} às 00:00:00`;
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 text-blue-800 mb-2">
        <Info className="h-4 w-4" />
        <span className="font-medium">Sistema de Reset Baseado em Tempo</span>
      </div>
      <div className="text-sm text-blue-700 space-y-2">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>Verificação: Diariamente às 00:00:00</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          <span>{formatNextReset()}</span>
        </div>
        <p className="text-xs">
          Tipo: {isCustomDates ? 'Baseado em datas customizadas' : 'Baseado em configuração padrão (domingo a sábado)'}
        </p>
        <p className="text-xs">
          O reset é executado automaticamente quando a data atual ultrapassa a data de fim do ranking semanal.
        </p>
      </div>
    </div>
  );
};
