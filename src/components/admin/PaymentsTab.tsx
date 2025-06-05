
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from 'lucide-react';

export const PaymentsTab = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sistema de Premiação</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sistema de pagamentos via Pix</p>
            <p className="text-sm">Em desenvolvimento</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
