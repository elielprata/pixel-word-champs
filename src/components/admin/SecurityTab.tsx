
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SecurityDashboard } from "./SecurityDashboard";
import { SecurityMetrics } from "./SecurityMetrics";
import { SecurityAlerts } from "./SecurityAlerts";
import { Separator } from "@/components/ui/separator";

interface FraudAlert {
  id: number;
  user: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
}

export const SecurityTab = () => {
  const mockFraudAlerts: FraudAlert[] = [
    { 
      id: 1, 
      user: "user_123", 
      reason: "Pontuação suspeita detectada", 
      severity: "high" as const,
      timestamp: "2025-06-06 14:30"
    },
    { 
      id: 2, 
      user: "user_456", 
      reason: "Tempo de jogo inconsistente", 
      severity: "medium" as const,
      timestamp: "2025-06-06 13:15"
    },
    { 
      id: 3, 
      user: "user_789", 
      reason: "Padrão de cliques suspeito", 
      severity: "low" as const,
      timestamp: "2025-06-06 12:45"
    }
  ];

  const securityLevel = 92; // Nível de segurança atual
  const securityScore = 4.6; // Pontuação de 1-5

  return (
    <div className="space-y-6">
      {/* Header com Level de Segurança */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Centro de Segurança
          </h2>
          <Badge variant="outline" className="text-lg px-3 py-1 bg-green-50 border-green-200">
            Nível {Math.floor(securityLevel / 20)} ⭐
          </Badge>
        </div>
        
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Nível de Proteção</span>
            <span className="font-semibold">{securityLevel}%</span>
          </div>
          <Progress value={securityLevel} className="h-3" />
          <p className="text-sm text-gray-500">
            {securityLevel >= 90 ? "🛡️ Proteção Máxima" : 
             securityLevel >= 70 ? "🔒 Boa Proteção" : 
             "⚠️ Proteção Básica"}
          </p>
        </div>
      </div>

      <Separator />

      {/* Dashboard Principal */}
      <SecurityDashboard 
        securityScore={securityScore}
        totalAlerts={mockFraudAlerts.length}
        activeThreats={mockFraudAlerts.filter(a => a.severity === 'high').length}
      />

      {/* Métricas de Segurança */}
      <SecurityMetrics />

      <Separator />

      {/* Alertas de Segurança */}
      <SecurityAlerts alerts={mockFraudAlerts} />
    </div>
  );
};
