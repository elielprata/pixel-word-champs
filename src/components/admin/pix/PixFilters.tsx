
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter } from 'lucide-react';

interface PixFiltersProps {
  startDate: string;
  endDate: string;
  isFiltered: boolean;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onFilter: () => void;
  onClear: () => void;
}

export const PixFilters = ({
  startDate,
  endDate,
  isFiltered,
  onStartDateChange,
  onEndDateChange,
  onFilter,
  onClear
}: PixFiltersProps) => {
  return (
    <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
      <h3 className="font-medium mb-2 flex items-center gap-2 text-sm">
        <Filter className="h-3 w-3" />
        Filtrar por Data
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <Label htmlFor="startDate" className="text-xs">Início</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div>
          <Label htmlFor="endDate" className="text-xs">Fim</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div className="flex items-end gap-1">
          <Button onClick={onFilter} className="flex-1 h-8 text-xs">
            <Filter className="h-3 w-3 mr-1" />
            Filtrar
          </Button>
          {isFiltered && (
            <Button variant="outline" onClick={onClear} className="h-8 px-2 text-xs">
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
