
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from 'lucide-react';

export const UserGrowthMetrics = () => {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="bg-slate-100 p-2 rounded-lg">
            <TrendingUp className="h-4 w-4 text-slate-600" />
          </div>
          <span className="text-lg">Crescimento Mensal</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Janeiro</span>
            <span className="font-semibold text-green-600">+8.2%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Fevereiro</span>
            <span className="font-semibold text-green-600">+12.4%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Março</span>
            <span className="font-semibold text-green-600">+15.1%</span>
          </div>
          <div className="pt-2 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Média Trimestral</span>
              <span className="font-bold text-blue-600">+11.9%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
