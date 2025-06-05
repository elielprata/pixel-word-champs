
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const SecurityTab = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Segurança e Logs</h2>
      
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
