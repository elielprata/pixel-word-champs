
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SecurityAlerts } from "./SecurityAlerts";

interface FraudAlert {
  id: number;
  user: string;
  reason: string;
  severity: 'high' | 'medium';
}

export const SecurityTab = () => {
  const mockFraudAlerts: FraudAlert[] = [
    { id: 1, user: "user_123", reason: "Pontuação suspeita", severity: "high" as const },
    { id: 2, user: "user_456", reason: "Tempo inconsistente", severity: "medium" as const }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Segurança e Logs</h2>
      
      {/* Alertas de Segurança */}
      <SecurityAlerts alerts={mockFraudAlerts} />
      
      {/* Sistema Antifraude */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema Antifraude</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Detecção automática ativa</span>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Alertas em tempo real</span>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Validação de pontuação</span>
              <Badge variant="default">Ativo</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
