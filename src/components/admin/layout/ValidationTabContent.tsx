
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RefreshCw, Clock, Shield } from 'lucide-react';
import { TimeValidationPanel } from '../validation/TimeValidationPanel';
import { EndToEndTestPanel } from '../validation/EndToEndTestPanel';
import { useTimeSystemValidation } from '@/hooks/useTimeSystemValidation';
import { getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';

export const ValidationTabContent: React.FC = () => {
  const { 
    checks, 
    isValidating, 
    systemHealthy, 
    runValidation 
  } = useTimeSystemValidation();

  const passedChecks = checks.filter(check => check.status === 'pass').length;
  const totalChecks = checks.length;

  return (
    <div className="space-y-6">
      {/* Header de Status */}
      <Card className={`border-2 ${
        systemHealthy === true ? 'border-green-200 bg-green-50' : 
        systemHealthy === false ? 'border-red-200 bg-red-50' : 
        'border-yellow-200 bg-yellow-50'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Status do Sistema de Tempo Unificado - VERSÃO FINAL
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runValidation}
              disabled={isValidating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
              {isValidating ? 'Validando...' : 'Revalidar'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge 
                variant={
                  systemHealthy === true ? 'default' : 
                  systemHealthy === false ? 'destructive' : 
                  'secondary'
                }
                className="text-sm"
              >
                {systemHealthy === true ? '✅ Sistema 100% Alinhado' : 
                 systemHealthy === false ? '❌ Correções Necessárias' : 
                 '⏳ Validando Sistema...'}
              </Badge>
              <span className="text-sm text-gray-600">
                {passedChecks}/{totalChecks} verificações passaram
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Última verificação: {getCurrentBrasiliaTime()}
            </div>
          </div>

          {/* Lista de Verificações */}
          <div className="space-y-2">
            {checks.map((check, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg bg-white border"
              >
                {check.status === 'pass' ? (
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : check.status === 'fail' ? (
                  <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{check.name}</p>
                  <p className="text-xs text-gray-600 truncate">{check.message}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>🎯 SISTEMA FINAL:</strong> Input = Preview = Lista = Detalhes (todos em Brasília)
            </p>
            <p className="text-xs text-blue-600 mt-1">
              ✅ UTC usado apenas para storage interno - Usuário nunca vê conversões
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Teste End-to-End */}
      <EndToEndTestPanel />

      {/* Painel de Validação Completa */}
      <TimeValidationPanel />
    </div>
  );
};
