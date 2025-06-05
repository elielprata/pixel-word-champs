
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricsTabProps {
  retention: { d1: number; d3: number; d7: number };
}

export const MetricsTab = ({ retention }: MetricsTabProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Métricas e Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Retenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>D1</span>
                <span className="font-bold">{retention.d1}%</span>
              </div>
              <div className="flex justify-between">
                <span>D3</span>
                <span className="font-bold">{retention.d3}%</span>
              </div>
              <div className="flex justify-between">
                <span>D7</span>
                <span className="font-bold">{retention.d7}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Uso de Anúncios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Dicas</span>
                <span className="font-bold">450/dia</span>
              </div>
              <div className="flex justify-between">
                <span>Revives</span>
                <span className="font-bold">320/dia</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Convites</span>
                <span className="font-bold">12.5%</span>
              </div>
              <div className="flex justify-between">
                <span>Retenção D3</span>
                <span className="font-bold">68%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
