import React from 'react';
import { Badge } from "@/components/ui/badge";
interface CompetitionStatusBadgeProps {
  status: 'scheduled' | 'active' | 'completed';
  isRealTime?: boolean;
  isStatusOutdated?: boolean; // Deprecated - sempre false agora
  calculatedStatus?: string; // Deprecated - não usado mais
}
export const CompetitionStatusBadge: React.FC<CompetitionStatusBadgeProps> = ({
  status,
  isRealTime = false
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          text: 'Ativo',
          className: 'bg-green-100 text-green-700 border-green-200 animate-pulse',
          indicator: '🟢'
        };
      case 'scheduled':
        return {
          text: 'Agendado',
          className: 'bg-blue-100 text-blue-700 border-blue-200',
          indicator: '⏰'
        };
      case 'completed':
        return {
          text: 'Finalizado',
          className: 'bg-gray-100 text-gray-700 border-gray-200',
          indicator: '🏁'
        };
      default:
        return {
          text: 'Rascunho',
          className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          indicator: '📝'
        };
    }
  };
  const config = getStatusConfig(status);
  return;
};