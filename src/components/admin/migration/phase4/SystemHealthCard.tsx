
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface SystemHealthMetrics {
  users_with_completed_sessions: number;
  users_with_scores: number;
  users_in_current_ranking: number;
  orphaned_sessions: number;
  total_completed_sessions: number;
  orphaned_sessions_percentage: number;
  current_week_start: string;
  validation_passed: boolean;
  system_health: 'healthy' | 'warning' | 'critical';
}

interface SystemHealthCardProps {
  metrics: SystemHealthMetrics;
}

export const SystemHealthCard = ({ metrics }: SystemHealthCardProps) => {
  const getHealthIcon = () => {
    switch (metrics.system_health) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getHealthColor = () => {
    switch (metrics.system_health) {
      case 'healthy':
        return 'text-green-700';
      case 'warning':
        return 'text-yellow-700';
      case 'critical':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${getHealthColor()}`}>
          {getHealthIcon()}
          Saúde do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.users_with_completed_sessions}
            </div>
            <div className="text-sm text-gray-600">Usuários Ativos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {metrics.users_with_scores}
            </div>
            <div className="text-sm text-gray-600">Com Pontuação</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.users_in_current_ranking}
            </div>
            <div className="text-sm text-gray-600">No Ranking</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${metrics.orphaned_sessions > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {metrics.orphaned_sessions}
            </div>
            <div className="text-sm text-gray-600">Sessões Órfãs</div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span>Total de Sessões Completadas:</span>
            <span className="font-medium">{metrics.total_completed_sessions}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span>Percentual de Sessões Órfãs:</span>
            <span className={`font-medium ${metrics.orphaned_sessions_percentage > 5 ? 'text-red-600' : 'text-green-600'}`}>
              {metrics.orphaned_sessions_percentage.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span>Semana Atual:</span>
            <span className="font-medium">{metrics.current_week_start}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
