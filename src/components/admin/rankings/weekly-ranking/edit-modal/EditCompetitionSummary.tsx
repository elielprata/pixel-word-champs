
import React from 'react';
import { formatDateForDisplay } from '@/utils/dateFormatters';

interface EditCompetitionSummaryProps {
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export const EditCompetitionSummary: React.FC<EditCompetitionSummaryProps> = ({
  startDate,
  endDate,
  isActive
}) => {
  return (
    <div className="p-3 bg-blue-50 rounded-lg">
      <p className="text-sm text-blue-700">
        <strong>Período:</strong><br />
        {formatDateForDisplay(startDate)} até {formatDateForDisplay(endDate)}
      </p>
      {isActive && (
        <p className="text-xs text-blue-600 mt-1">
          ⚠️ Competição ativa - apenas data de fim pode ser alterada
        </p>
      )}
    </div>
  );
};
