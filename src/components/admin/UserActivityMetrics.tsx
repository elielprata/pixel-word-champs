
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from 'lucide-react';

export const UserActivityMetrics = () => {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="bg-slate-100 p-2 rounded-lg">
            <Activity className="h-4 w-4 text-slate-600" />
          </div>
          <span className="text-lg">Atividade Recente</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-slate-700">350 usuários online</p>
              <p className="text-xs text-slate-500">Agora mesmo</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-slate-700">23 novos registros</p>
              <p className="text-xs text-slate-500">Últimas 6 horas</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-slate-700">1,2k sessões ativas</p>
              <p className="text-xs text-slate-500">Hoje</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
