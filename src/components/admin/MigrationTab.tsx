
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Database, 
  ArrowRight, 
  AlertTriangle,
  CheckCircle,
  Zap,
  Trash2,
  Target
} from 'lucide-react';
import { MigrationImpactDashboard } from './migration/MigrationImpactDashboard';
import { MigrationPhase2Dashboard } from './migration/MigrationPhase2Dashboard';
import { MigrationPhase3Dashboard } from './migration/MigrationPhase3Dashboard';
import { MigrationPhase4Dashboard } from './migration/MigrationPhase4Dashboard';
import { logger } from '@/utils/logger';

export const MigrationTab = () => {
  logger.debug('Renderizando aba de migração', undefined, 'MIGRATION_TAB');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-purple-600" />
            Sistema de Migração - Competições Semanais → Ranking Semanal
          </CardTitle>
          <p className="text-sm text-gray-600">
            Migração segura do sistema híbrido para sistema simplificado
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-yellow-700">Sistema Híbrido Atual</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-700">Sistema Simplificado</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processo de Migração */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Fases da Migração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="font-medium text-green-800">Fase 1</div>
              <div className="text-sm text-green-700">Análise de Impacto</div>
              <div className="text-xs text-green-600 mt-1">✅ Concluída</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="font-medium text-green-800 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Fase 2
              </div>
              <div className="text-sm text-green-700">Migração Gradual</div>
              <div className="text-xs text-green-600 mt-1">✅ Concluída</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="font-medium text-green-800 flex items-center gap-1">
                <Trash2 className="h-3 w-3" />
                Fase 3
              </div>
              <div className="text-sm text-green-700">Limpeza Final</div>
              <div className="text-xs text-green-600 mt-1">✅ Concluída</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="font-medium text-blue-800 flex items-center gap-1">
                <Target className="h-3 w-3" />
                Fase 4
              </div>
              <div className="text-sm text-blue-700">Validação Final</div>
              <div className="text-xs text-blue-600 mt-1">🔄 Em Andamento</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard da Fase 4 - Validação Final */}
      <MigrationPhase4Dashboard />

      {/* Dashboard da Fase 3 - Limpeza Final */}
      <MigrationPhase3Dashboard />

      {/* Dashboard da Fase 2 - Sistema Independente */}
      <MigrationPhase2Dashboard />

      {/* Dashboard de Análise - Fase 1 */}
      <MigrationImpactDashboard />
    </div>
  );
};
