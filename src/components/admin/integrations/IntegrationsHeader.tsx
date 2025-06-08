
import React from 'react';
import { Badge } from "@/components/ui/badge";

export const IntegrationsHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-slate-900">Integrações</h2>
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        2 Integrações Disponíveis
      </Badge>
    </div>
  );
};
