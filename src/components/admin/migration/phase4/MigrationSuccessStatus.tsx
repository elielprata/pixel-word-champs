
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Trophy } from 'lucide-react';

interface MigrationSuccessStatusProps {
  validationPassed: boolean;
}

export const MigrationSuccessStatus = ({ validationPassed }: MigrationSuccessStatusProps) => {
  if (!validationPassed) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Trophy className="h-5 w-5" />
          Migração Concluída com Sucesso
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-green-50 p-6 rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-green-800 font-semibold text-lg">
                Sistema Totalmente Migrado
              </h3>
              <p className="text-green-700">
                A migração do sistema híbrido para o modelo independente foi concluída com sucesso!
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white p-4 rounded border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">✅ Concluído</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Sistema independente implementado</li>
                <li>• Competições diárias autônomas</li>
                <li>• Ranking semanal funcionando</li>
                <li>• Componentes legados removidos</li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">🎯 Benefícios</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Sistema mais simples e eficiente</li>
                <li>• Menor complexidade de manutenção</li>
                <li>• Melhor performance</li>
                <li>• Dados mais consistentes</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
