
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, CheckCircle2, Eye } from 'lucide-react';

interface FraudAlert {
  id: number;
  user: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  status: 'pending' | 'resolved' | 'investigating';
}

interface SecurityAlertsProps {
  alerts: FraudAlert[];
}

export const SecurityAlerts = ({ alerts }: SecurityAlertsProps) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'investigating' | 'resolved'>('all');

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.status === filter
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'investigating': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'resolved': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'investigating': return 'Investigando';
      case 'resolved': return 'Resolvido';
      default: return status;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertas de Segurança
          </div>
          <Badge variant="outline">{filteredAlerts.length}</Badge>
        </CardTitle>
        
        <div className="flex flex-wrap gap-1 mt-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="h-7 px-2 text-xs"
          >
            Todos
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
            className="h-7 px-2 text-xs"
          >
            Pendentes
          </Button>
          <Button
            variant={filter === 'investigating' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('investigating')}
            className="h-7 px-2 text-xs"
          >
            Investigando
          </Button>
          <Button
            variant={filter === 'resolved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('resolved')}
            className="h-7 px-2 text-xs"
          >
            Resolvidos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map(alert => (
              <div key={alert.id} className="flex flex-col sm:flex-row items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {getStatusIcon(alert.status)}
                    <span className="font-medium text-gray-900">{alert.user}</span>
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity === 'high' ? 'Alto' : 
                       alert.severity === 'medium' ? 'Médio' : 'Baixo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{alert.reason}</p>
                  <p className="text-xs text-gray-400">
                    {alert.timestamp} • Status: {getStatusLabel(alert.status)}
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    Detalhes
                  </Button>
                  {alert.status === 'pending' && (
                    <Button variant="default" size="sm" className="flex-1 sm:flex-none">
                      Investigar
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Nenhum alerta encontrado para o filtro selecionado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
