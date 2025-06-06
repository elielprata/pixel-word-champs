
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Shield, Zap, Database, Download, FileText, Cog } from 'lucide-react';

export const SecuritySettings = () => {
  return (
    <Card className="border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-200">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5 text-slate-600" />
          Configurações de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sistema Antifraude */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="font-semibold text-slate-900">Sistema Antifraude</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">Detecção automática</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">Ativo</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">Alertas em tempo real</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">Ativo</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">Validação de pontuação</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">Ativo</Badge>
              </div>
            </div>
          </div>

          {/* Monitoramento */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Zap className="h-4 w-4 text-orange-600" />
              </div>
              <h4 className="font-semibold text-slate-900">Monitoramento</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">Análise comportamental</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">Ativo</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">Detecção de padrões</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">Ativo</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">Logs de auditoria</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">Ativo</Badge>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Database className="h-4 w-4 text-purple-600" />
              </div>
              <h4 className="font-semibold text-slate-900">Ações Rápidas</h4>
            </div>
            <div className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start bg-white border-slate-200 hover:bg-slate-50">
                <Download className="h-4 w-4 mr-2" />
                Exportar Logs
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-white border-slate-200 hover:bg-slate-50">
                <FileText className="h-4 w-4 mr-2" />
                Relatório Semanal
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-white border-slate-200 hover:bg-slate-50">
                <Cog className="h-4 w-4 mr-2" />
                Configurações Avançadas
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
