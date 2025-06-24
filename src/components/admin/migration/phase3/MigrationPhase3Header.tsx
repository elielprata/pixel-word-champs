
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  AlertTriangle, 
  RefreshCw,
  Shield
} from 'lucide-react';

interface CleanupStatus {
  cleanupSafe: boolean;
  blockers: string[];
}

interface MigrationPhase3HeaderProps {
  cleanupStatus: CleanupStatus;
  isLoading: boolean;
  onRefresh: () => void;
}

export const MigrationPhase3Header = ({ 
  cleanupStatus, 
  isLoading, 
  onRefresh 
}: MigrationPhase3HeaderProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-600" />
          Fase 3: Limpeza Final - Remoção de Componentes Legados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Remoção segura de dados redundantes e componentes não utilizados
            </p>
            <div className="flex items-center gap-4">
              {cleanupStatus.cleanupSafe ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Limpeza Segura
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Bloqueadores Detectados
                </Badge>
              )}
            </div>
          </div>
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
