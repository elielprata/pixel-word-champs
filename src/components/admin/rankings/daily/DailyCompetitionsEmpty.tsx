
import React from 'react';
import { Calendar } from 'lucide-react';

export const DailyCompetitionsEmpty: React.FC = () => {
  return (
    <div className="text-center py-12 text-slate-500">
      <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
      <p className="font-medium mb-2">Nenhuma competição diária ativa</p>
      <p className="text-sm">Use o botão "Criar Competição" para adicionar uma nova competição diária.</p>
      <p className="text-xs text-slate-400 mt-2">
        Competições diárias transferem pontos automaticamente para competições semanais
      </p>
      <p className="text-xs text-slate-400 mt-1">
        Competições finalizadas podem ser vistas na aba "Histórico"
      </p>
    </div>
  );
};
