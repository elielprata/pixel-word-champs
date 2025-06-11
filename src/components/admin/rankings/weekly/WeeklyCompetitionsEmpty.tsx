
import React from 'react';
import { Trophy } from 'lucide-react';

export const WeeklyCompetitionsEmpty = () => {
  return (
    <div className="text-center py-12 text-slate-500">
      <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-300" />
      <p className="font-medium mb-2">Nenhuma competição semanal ativa ou aguardando</p>
      <p className="text-sm">As competições semanais ativas aparecerão aqui quando criadas.</p>
      <p className="text-xs text-slate-400 mt-2">
        Competições finalizadas podem ser vistas na aba "Histórico"
      </p>
    </div>
  );
};
