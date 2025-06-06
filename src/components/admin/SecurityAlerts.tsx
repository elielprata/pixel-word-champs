
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, User, ChevronRight } from 'lucide-react';

interface FraudAlert {
  id: number;
  user: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  timestamp?: string;
}

interface SecurityAlertsProps {
  alerts: FraudAlert[];
}

export const SecurityAlerts = ({ alerts }: SecurityAlertsProps) => {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badgeVariant: 'destructive' as const,
          label: 'Alto Risco',
          icon: '🚨'
        };
      case 'medium':
        return {
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          badgeVariant: 'secondary' as const,
          label: 'Médio Risco',
          icon: '⚠️'
        };
      case 'low':
        return {
          color: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badgeVariant: 'outline' as const,
          label: 'Baixo Risco',
          icon: 'ℹ️'
        };
      default:
        return {
          color: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          badgeVariant: 'outline' as const,
          label: 'Indefinido',
          icon: '❓'
        };
    }
  };

  const priorityAlerts = alerts.filter(alert => alert.severity === 'high');
  const otherAlerts = alerts.filter(alert => alert.severity !== 'high');

  return (
    <div className="space-y-6">
      {/* Alertas de Alta Prioridade */}
      {priorityAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Alertas Críticos ({priorityAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorityAlerts.map(alert => {
              const config = getSeverityConfig(alert.severity);
              return (
                <div 
                  key={alert.id} 
                  className={`p-4 rounded-lg border-2 ${config.borderColor} ${config.bgColor} hover:shadow-sm transition-all cursor-pointer group`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-lg">{config.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold text-gray-900">{alert.user}</span>
                          <Badge variant={config.badgeVariant} className="text-xs">
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{alert.reason}</p>
                        {alert.timestamp && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{alert.timestamp}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Outros Alertas */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            Todos os Alertas ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🛡️</div>
              <h3 className="font-semibold text-gray-900 mb-1">Tudo Seguro!</h3>
              <p className="text-sm text-gray-600">Nenhum alerta de segurança registrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => {
                const config = getSeverityConfig(alert.severity);
                return (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-lg border ${config.borderColor} ${config.bgColor} hover:shadow-sm transition-all cursor-pointer group`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-base">{config.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">{alert.user}</span>
                            <Badge variant={config.badgeVariant} className="text-xs">
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{alert.reason}</p>
                          {alert.timestamp && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{alert.timestamp}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
