
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Activity, Target, Clock } from 'lucide-react';

export const SecurityMetrics = () => {
  return (
    <div className="space-y-4">
      {/* Métricas Principais */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <span>Métricas de Segurança</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm text-slate-700 font-medium">Taxa de Detecção</span>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">98.5%</Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-slate-700 font-medium">Falsos Positivos</span>
              </div>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">2.1%</Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-slate-700 font-medium">Tempo de Resposta</span>
              </div>
              <Badge variant="outline" className="border-slate-300">&lt; 5min</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tendências */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <span>Tendências</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                <TrendingUp className="h-5 w-5" />
                ↓ 15%
              </div>
              <p className="text-xs text-green-700 mt-1 font-medium">Alertas vs semana passada</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                <Target className="h-5 w-5" />
                ↑ 23%
              </div>
              <p className="text-xs text-blue-700 mt-1 font-medium">Precisão das detecções</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
