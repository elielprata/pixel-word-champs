
import React from 'react';
import { SecurityOverview } from './SecurityOverview';
import { SecurityMetrics } from './SecurityMetrics';
import { SecurityAlerts } from './SecurityAlerts';
import { SecuritySettings } from './SecuritySettings';

interface FraudAlert {
  id: number;
  user: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  status: 'pending' | 'resolved' | 'investigating';
}

export const SecurityTab = () => {
  const mockFraudAlerts: FraudAlert[] = [
    { 
      id: 1, 
      user: "user_123", 
      reason: "Pontuação suspeita detectada", 
      severity: "high",
      timestamp: "2024-06-06 14:30",
      status: "pending"
    },
    { 
      id: 2, 
      user: "user_456", 
      reason: "Tempo de jogo inconsistente", 
      severity: "medium",
      timestamp: "2024-06-06 13:15",
      status: "investigating"
    },
    { 
      id: 3, 
      user: "user_789", 
      reason: "Múltiplos dispositivos detectados", 
      severity: "low",
      timestamp: "2024-06-06 12:45",
      status: "resolved"
    }
  ];

  return (
    <div className="space-y-6">
      <SecurityOverview />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SecurityAlerts alerts={mockFraudAlerts} />
        </div>
        <div>
          <SecurityMetrics />
        </div>
      </div>
      
      <SecuritySettings />
    </div>
  );
};
