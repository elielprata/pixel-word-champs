
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateForDisplay } from '@/utils/dateFormatters';

interface EditCompetitionDateFieldsProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  isActive: boolean;
  isLoading: boolean;
}

export const EditCompetitionDateFields: React.FC<EditCompetitionDateFieldsProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  isActive,
  isLoading
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="start-date">Data de Início</Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          disabled={isActive || isLoading}
          className={isActive ? "bg-gray-100" : ""}
        />
        {isActive && (
          <p className="text-xs text-gray-500">
            Data atual: {formatDateForDisplay(startDate)}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="end-date">Data de Fim</Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          disabled={isLoading}
          className="w-full"
        />
      </div>
    </>
  );
};
