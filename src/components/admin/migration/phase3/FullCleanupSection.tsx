
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

interface CleanupStatus {
  orphanedSessions: number;
  legacyCompetitions: number;
  unusedWeeklyTournaments: number;
  cleanupSafe: boolean;
}

interface FullCleanupSectionProps {
  cleanupStatus: CleanupStatus;
  isExecuting: boolean;
  onFullCleanup: () => void;
}

export const FullCleanupSection = ({ 
  cleanupStatus, 
  isExecuting, 
  onFullCleanup 
}: FullCleanupSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-red-700">⚡ Limpeza Completa do Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Ação Irreversível</h4>
            <p className="text-sm text-red-700 mb-3">
              Esta ação irá remover todos os componentes legados identificados. 
              Certifique-se de que o sistema independente está funcionando corretamente.
            </p>
            <div className="space-y-2 text-sm text-red-700">
              <p>• Remover {cleanupStatus.orphanedSessions} sessões órfãs</p>
              <p>• Remover {cleanupStatus.legacyCompetitions} competições legadas</p>
              <p>• Remover {cleanupStatus.unusedWeeklyTournaments} torneios antigos</p>
            </div>
          </div>

          <Button 
            onClick={onFullCleanup}
            disabled={isExecuting || !cleanupStatus.cleanupSafe}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isExecuting ? 'Executando Limpeza...' : 'Executar Limpeza Completa'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
