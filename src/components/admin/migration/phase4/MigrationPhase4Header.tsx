
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Shield,
  Target
} from 'lucide-react';

interface ValidationStatus {
  validationPassed: boolean;
  issues: string[];
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface MigrationPhase4HeaderProps {
  validationStatus: ValidationStatus;
  isLoading: boolean;
  onRefresh: () => void;
}

export const MigrationPhase4Header = ({ 
  validationStatus, 
  isLoading, 
  onRefresh 
}: MigrationPhase4HeaderProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          Fase 4: Validação Final - Sistema Migrado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Validação completa do sistema após migração e limpeza
            </p>
            <div className="flex items-center gap-4">
              {validationStatus.validationPassed ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Sistema Validado
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Problemas Detectados
                </Badge>
              )}
              <Badge variant="outline" className={
                validationStatus.systemHealth === 'healthy' ? 'bg-green-50 text-green-700 border-green-200' :
                validationStatus.systemHealth === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                'bg-red-50 text-red-700 border-red-200'
              }>
                <Shield className="h-3 w-3 mr-1" />
                {validationStatus.systemHealth === 'healthy' ? 'Saudável' : 
                 validationStatus.systemHealth === 'warning' ? 'Atenção' : 'Crítico'}
              </Badge>
            </div>
          </div>
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Validar Novamente
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
