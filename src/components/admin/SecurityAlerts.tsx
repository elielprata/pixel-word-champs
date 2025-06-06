
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from 'lucide-react';

interface FraudAlert {
  id: number;
  user: string;
  reason: string;
  severity: 'high' | 'medium';
}

interface SecurityAlertsProps {
  alerts: FraudAlert[];
}

export const SecurityAlerts = ({ alerts }: SecurityAlertsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-500" />
          Alertas de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alerts.map(alert => (
            <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <span className="font-medium">{alert.user}</span>
                <p className="text-sm text-gray-600">{alert.reason}</p>
              </div>
              <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                {alert.severity === 'high' ? 'Alto' : 'Médio'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
