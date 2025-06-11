
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Activity, BookOpen, Folder } from 'lucide-react';
import { useRealGameMetrics } from '@/hooks/useRealGameMetrics';
import { WordsCount } from '../WordsCount';

export const GameContentTabMetrics = () => {
  const { metrics, isLoading } = useRealGameMetrics();

  const quickStats = [
    { 
      label: 'Palavras Ativas', 
      value: isLoading ? '...' : (metrics?.activeWords || 0).toLocaleString(), 
      icon: BookOpen, 
      color: 'text-blue-600' 
    },
    { 
      label: 'Categorias Ativas', 
      value: isLoading ? '...' : (metrics?.activeCategories || 0).toString(), 
      icon: Folder, 
      color: 'text-green-600' 
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Métricas do Sistema</h2>
        </div>
      </div>
      
      {/* Componente de contagem detalhada */}
      <WordsCount />
      
      <div className="grid grid-cols-2 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-slate-600 text-sm">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
