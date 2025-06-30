
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Settings } from 'lucide-react';

export const WeeklyAutomationStatus = () => {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Sistema de Finalização Automática
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700">Status do Sistema</span>
            <Badge variant="outline" className="border-green-300 text-green-700 bg-green-100">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700">Execução Diária</span>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Clock className="h-3 w-3" />
              00:05 (Brasília)
            </div>
          </div>
          
          <div className="bg-green-100 p-2 rounded-md">
            <p className="text-xs text-green-700">
              <Settings className="h-3 w-3 inline mr-1" />
              O sistema verifica automaticamente competições vencidas e executa a finalização, 
              criando snapshots e ativando a próxima competição agendada. Executa diariamente 
              às 00:05 no horário de Brasília.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
