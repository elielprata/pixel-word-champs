
import React from 'react';
import { Target } from 'lucide-react';

export const ChallengeHeader = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-xl">
          <Target className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Gestão de Desafios</h1>
          <p className="text-blue-100 text-sm">Configure e monitore todos os desafios da plataforma</p>
        </div>
      </div>
    </div>
  );
};
