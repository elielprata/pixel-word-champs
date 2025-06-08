
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from 'lucide-react';
import { DebugInfo } from './types';

interface EmptyStateProps {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  debugInfo: DebugInfo | null;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchTerm,
  statusFilter,
  typeFilter,
  debugInfo
}) => {
  return (
    <Card className="border-slate-200">
      <CardContent className="text-center py-12">
        <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Nenhuma competição encontrada
        </h3>
        <p className="text-slate-600 mb-4">
          {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
            ? 'Não há competições que correspondem aos filtros selecionados.'
            : 'Ainda não há competições finalizadas no sistema.'}
        </p>
        <div className="text-sm text-slate-500">
          <p>Total de competições no sistema: {debugInfo?.totalCompetitions || 0}</p>
          <p>Total de competições customizadas: {debugInfo?.totalCustom || 0}</p>
        </div>
      </CardContent>
    </Card>
  );
};
