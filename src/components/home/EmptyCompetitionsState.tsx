
import React from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyCompetitionsStateProps {
  onRefresh: () => void;
}

const EmptyCompetitionsState = ({ onRefresh }: EmptyCompetitionsStateProps) => {
  return (
    <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400" />
      <p className="text-gray-600 font-medium mb-2">Nenhuma batalha disponível agora</p>
      <p className="text-sm text-gray-500 mb-4">
        As batalhas diárias são criadas automaticamente. Aguarde ou verifique novamente em instantes.
      </p>
      <Button onClick={onRefresh} variant="outline" size="sm">
        <RefreshCw className="w-4 h-4 mr-2" />
        Verificar novamente
      </Button>
    </div>
  );
};

export default EmptyCompetitionsState;
