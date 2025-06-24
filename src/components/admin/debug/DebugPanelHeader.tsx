
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Bug } from 'lucide-react';

export const DebugPanelHeader = () => {
  return (
    <CardHeader className="pb-3">
      <CardTitle className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
        <Bug className="w-5 h-5" />
        Debug do Ranking & Proteção Anti-Órfãs
      </CardTitle>
      <p className="text-sm text-yellow-700">
        Ferramentas para diagnóstico e correção de problemas no ranking e validação do sistema de prevenção de sessões órfãs
      </p>
    </CardHeader>
  );
};
