
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { secureLogger } from '@/utils/secureLogger';
import { MigrationPhase4Header } from './phase4/MigrationPhase4Header';
import { ValidationIssuesAlert } from './phase4/ValidationIssuesAlert';
import { SystemHealthCard } from './phase4/SystemHealthCard';
import { MigrationSuccessStatus } from './phase4/MigrationSuccessStatus';

interface SystemHealthMetrics {
  users_with_completed_sessions: number;
  users_with_scores: number;
  users_in_current_ranking: number;
  orphaned_sessions: number;
  total_completed_sessions: number;
  orphaned_sessions_percentage: number;
  current_week_start: string;
  validation_passed: boolean;
  issues: string[];
  system_health: 'healthy' | 'warning' | 'critical';
}

interface ValidationStatus {
  validationPassed: boolean;
  issues: string[];
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export const MigrationPhase4Dashboard = () => {
  const { toast } = useToast();
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
    validationPassed: false,
    issues: [],
    systemHealth: 'warning'
  });
  const [systemMetrics, setSystemMetrics] = useState<SystemHealthMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateSystem = async () => {
    setIsLoading(true);
    try {
      secureLogger.info('Iniciando validação final do sistema', undefined, 'MIGRATION_PHASE4');
      
      // Chamar edge function de validação
      const response = await fetch('/functions/v1/validate-scoring-integrity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha na validação do sistema');
      }

      const metrics: SystemHealthMetrics = await response.json();
      
      const status: ValidationStatus = {
        validationPassed: metrics.validation_passed,
        issues: metrics.issues || [],
        systemHealth: metrics.system_health
      };

      setValidationStatus(status);
      setSystemMetrics(metrics);
      
      if (metrics.validation_passed) {
        toast({
          title: "✅ Validação Aprovada",
          description: "Sistema migrado com sucesso e funcionando corretamente!",
        });
      } else {
        toast({
          title: "⚠️ Problemas Detectados",
          description: `${metrics.issues?.length || 0} problema(s) encontrado(s) na validação`,
          variant: "destructive",
        });
      }

      secureLogger.info('Validação final concluída', { 
        validationPassed: metrics.validation_passed,
        issuesCount: metrics.issues?.length || 0,
        systemHealth: metrics.system_health
      }, 'MIGRATION_PHASE4');

    } catch (error) {
      secureLogger.error('Erro na validação final', { error }, 'MIGRATION_PHASE4');
      toast({
        title: "Erro na Validação",
        description: "Falha ao validar integridade do sistema",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    validateSystem();
  }, []);

  if (isLoading && !systemMetrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Validando sistema migrado...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <MigrationPhase4Header 
        validationStatus={validationStatus}
        isLoading={isLoading}
        onRefresh={validateSystem}
      />

      <ValidationIssuesAlert issues={validationStatus.issues} />

      {systemMetrics && (
        <SystemHealthCard metrics={systemMetrics} />
      )}

      <MigrationSuccessStatus validationPassed={validationStatus.validationPassed} />

      {/* Botão de re-validação adicional */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="font-medium">Validar Sistema Novamente</h3>
            <p className="text-sm text-gray-600">
              Execute uma nova validação completa para verificar a integridade atual do sistema
            </p>
            <Button 
              onClick={validateSystem}
              disabled={isLoading}
              className="w-full max-w-md"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isLoading ? 'Validando...' : 'Executar Validação Completa'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
