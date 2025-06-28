
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';

interface AutomationHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export const AutomationHeader: React.FC<AutomationHeaderProps> = ({
  isLoading,
  onRefresh
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">Monitoramento de Automação</h3>
        <p className="text-sm text-gray-600">
          Acompanhe os resets automáticos e finalizações de competições
        </p>
      </div>
      <Button onClick={onRefresh} variant="outline" size="sm" disabled={isLoading}>
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Atualizar
      </Button>
    </div>
  );
};
