
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3 } from 'lucide-react';

export const RankingsTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rankings</h2>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking Global Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Rankings são somente leitura</p>
            <p className="text-sm">Dados atualizados em tempo real via API</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
