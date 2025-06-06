
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Shield, Zap, Database } from 'lucide-react';

export const SecuritySettings = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          Configurações de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Sistema Antifraude
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Detecção automática</span>
                <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Alertas em tempo real</span>
                <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Validação de pontuação</span>
                <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-600" />
              Monitoramento
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Análise comportamental</span>
                <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Detecção de padrões</span>
                <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Logs de auditoria</span>
                <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-600" />
              Ações Rápidas
            </h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                Exportar Logs
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Relatório Semanal
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Configurações Avançadas
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
