
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from 'lucide-react';

interface CleanupSuccessStatusProps {
  cleanupSafe: boolean;
}

export const CleanupSuccessStatus = ({ cleanupSafe }: CleanupSuccessStatusProps) => {
  if (!cleanupSafe) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <CheckCircle className="h-5 w-5" />
          Sistema Pronto para Limpeza
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-green-50 p-4 rounded-lg space-y-2">
          <p className="text-green-800 font-medium">✅ Todos os pré-requisitos atendidos</p>
          <p className="text-sm text-green-700">
            O sistema está seguro para a remoção dos componentes legados. 
            Após a limpeza, o sistema funcionará exclusivamente com o novo modelo independente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
