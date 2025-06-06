
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const SecurityMetrics = () => {
  const metrics = [
    {
      label: "Taxa de Detecção",
      value: 94,
      change: +2.3,
      trend: "up",
      description: "Precisão na identificação de fraudes"
    },
    {
      label: "Falsos Positivos",
      value: 8,
      change: -1.2,
      trend: "down",
      description: "Alertas incorretos reduzidos"
    },
    {
      label: "Tempo de Resposta",
      value: 98,
      change: 0,
      trend: "stable",
      description: "Velocidade de processamento"
    },
    {
      label: "Cobertura de Usuários",
      value: 100,
      change: 0,
      trend: "stable",
      description: "Usuários sob monitoramento"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Métricas de Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{metric.label}</h4>
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-gray-900">{metric.value}%</span>
                    {metric.change !== 0 && (
                      <div className={`flex items-center gap-1 ${getTrendColor(metric.trend)}`}>
                        {getTrendIcon(metric.trend)}
                        <span className="text-sm font-medium">
                          {Math.abs(metric.change)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Progress 
                value={metric.value} 
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
