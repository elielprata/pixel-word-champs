
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Activity } from 'lucide-react';

export const SecurityMetrics = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Métricas de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taxa de Detecção</span>
              <Badge variant="default" className="bg-green-100 text-green-800">98.5%</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Falsos Positivos</span>
              <Badge variant="secondary">2.1%</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tempo de Resposta</span>
              <Badge variant="outline">&lt; 5min</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Tendências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">↓ 15%</div>
              <p className="text-xs text-gray-600">Alertas vs semana passada</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">↑ 23%</div>
              <p className="text-xs text-gray-600">Precisão das detecções</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
